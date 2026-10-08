from fastapi import APIRouter, HTTPException, status
from PIL import Image
import numpy as np
import time
from typing import Dict

from ..schemas.scan import (
    InferenceRequest,
    ScanResultResponse,
    QualityGateResult,
    ZoneScore,
    Finding,
)
from ..models.quality_gate import QualityGate
from ..models.face_alignment import FaceAlignment
from ..models.lesion_classifier import LesionClassifier
from ..models.severity_scorer import SeverityScorer
from ..config import settings

router = APIRouter(prefix="/api/v1/inference", tags=["Inference Pipeline"])

quality_gate = QualityGate()
face_alignment = FaceAlignment()
lesion_classifier = LesionClassifier()
severity_scorer = SeverityScorer()

@router.post("/quality-gate", response_model=QualityGateResult)
async def check_image_quality(req: InferenceRequest):
    try:
        if not req.imageBase64:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="imageBase64 is required",
            )
        q_res, _ = quality_gate.validate(req.imageBase64)
        return q_res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Quality gate error: {str(e)}"
        )

@router.post("/analyze", response_model=ScanResultResponse)
async def run_inference(req: InferenceRequest):
    """
    Full diagnostic pipeline on real image data:
    1. Quality Gate (blur + exposure)
    2. OpenCV face detection & 6-zone extraction
    3. Per-zone colorimetric lesion detection
    4. Per-zone severity scoring
    5. Composite Skin Health Score
    """
    t_start = time.perf_counter()

    try:
        if not req.imageBase64:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No image data provided. imageBase64 is required for analysis.",
            )

        q_res, img = quality_gate.validate(req.imageBase64)

        if not q_res.passed:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Image quality check failed: {q_res.message}",
            )

        alignment = face_alignment.extract_landmarks(img)

        if not alignment["face_detected"]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No face detected in the image. Please retake with your face clearly visible.",
            )

        zones = alignment["zones"]

        concerns = req.questionnaire.get("concerns", []) if req.questionnaire else []
        all_findings: list[Finding] = []
        for zone_name, zone_data in zones.items():
            findings = lesion_classifier.detect_findings_in_zone(
                zone_name=zone_name,
                zone_data=zone_data,
                scan_id=req.scanId,
                questionnaire_concerns=concerns,
            )
            all_findings.extend(findings)

        zone_scores: Dict[str, ZoneScore] = {}
        for zone_name, zone_data in zones.items():
            score = severity_scorer.score_zone(
                zone_name=zone_name,
                crop=zone_data["crop"],
                findings=all_findings,
                questionnaire=req.questionnaire,
            )
            zone_scores[zone_name] = score

        skin_health_score = severity_scorer.compute_composite_health_score(zone_scores)

        # Compute mean LAB for Fitzpatrick classification on the server side
        img_arr = np.array(img)
        lab = severity_scorer.compute_rgb_to_lab_approx(img_arr)
        mean_l = float(np.mean(lab[..., 0]))
        mean_a = float(np.mean(lab[..., 1]))
        mean_b = float(np.mean(lab[..., 2]))

        t_elapsed_ms = round((time.perf_counter() - t_start) * 1000, 2)

        return ScanResultResponse(
            version=1,
            skinHealthScore=skin_health_score,
            zoneScores=zone_scores,
            findings=all_findings,
            metadata={
                "modelVersion": settings.model_version,
                "processingTimeMs": t_elapsed_ms,
                "imageQualityScore": q_res.exposure_score,
                "faceDetected": alignment["face_detected"],
                "faceConfidence": alignment["confidence"],
                "landmarkCount": alignment.get("landmarks_count", 0),
                "qualityGate": q_res.model_dump(),
                "meanL": round(mean_l, 2),
                "meanA": round(mean_a, 2),
                "meanB": round(mean_b, 2),
                "device": settings.device,
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution failed: {str(e)}"
        )
