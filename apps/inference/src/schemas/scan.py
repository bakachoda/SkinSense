from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x: float = Field(..., ge=0.0, le=1.0, description="Normalized x coordinate [0, 1]")
    y: float = Field(..., ge=0.0, le=1.0, description="Normalized y coordinate [0, 1]")
    w: float = Field(..., ge=0.0, le=1.0, description="Normalized width [0, 1]")
    h: float = Field(..., ge=0.0, le=1.0, description="Normalized height [0, 1]")

class Finding(BaseModel):
    id: str
    type: str = Field(..., description="papule | pustule | comedone | dark_spot | redness_patch | texture_rough | dryness_patch")
    zone: str = Field(..., description="forehead | nose | left_cheek | right_cheek | chin | periorbital")
    severity: float = Field(..., ge=0.0, le=100.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    boundingBox: Optional[BoundingBox] = None
    description: Optional[str] = None

class ZoneScore(BaseModel):
    acne: float = Field(0.0, ge=0.0, le=100.0)
    redness: float = Field(0.0, ge=0.0, le=100.0)
    pigmentation: float = Field(0.0, ge=0.0, le=100.0)
    texture: float = Field(0.0, ge=0.0, le=100.0)
    dryness: float = Field(0.0, ge=0.0, le=100.0)
    oiliness: float = Field(0.0, ge=0.0, le=100.0)

class QualityGateResult(BaseModel):
    passed: bool
    blur_score: float
    is_blurry: bool
    exposure_score: float
    is_under_exposed: bool
    is_over_exposed: bool
    dimensions: List[int]
    message: str

class ScanMetadata(BaseModel):
    modelVersion: str
    processingTimeMs: float
    imageQualityScore: float
    faceDetected: bool = True
    landmarkCount: int = 468
    qualityGate: Optional[QualityGateResult] = None
    extra: Dict[str, Any] = Field(default_factory=dict)

class InferenceRequest(BaseModel):
    scanId: str
    userId: str
    imageBase64: Optional[str] = None
    imageKey: Optional[str] = "scans/sample.jpg"
    imageKeys: Optional[List[str]] = None
    questionnaire: Optional[Dict[str, Any]] = None
    physiologicalState: Optional[Dict[str, Any]] = None

class ScanResultResponse(BaseModel):
    version: int = 1
    skinHealthScore: int = Field(..., ge=0, le=100)
    zoneScores: Dict[str, ZoneScore]
    findings: List[Finding]
    metadata: Dict[str, Any]
