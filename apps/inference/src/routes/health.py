from fastapi import APIRouter
import torch
import sys

from ..schemas.health import HealthResponse
from ..config import settings

router = APIRouter(tags=["Health & Telemetry"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        service="skinsense-inference",
        version=settings.version,
        model_version=settings.model_version,
        device=str(torch.device(settings.device if torch.cuda.is_available() and settings.device == "cuda" else "cpu")),
        torch_version=torch.__version__,
        active_models=[
            "QualityGate-v1",
            "FaceAlignment-468Mesh",
            "SkinLesionNet-ResNetEnsemble",
            "ColorimetrySeverityScorer-D65",
        ],
    )

@router.get("/metrics")
async def get_metrics():
    return {
        "service": "skinsense-inference",
        "python_version": sys.version,
        "cuda_available": torch.cuda.is_available(),
        "device_count": torch.cuda.device_count() if torch.cuda.is_available() else 0,
        "allocated_memory_mb": round(torch.cuda.memory_allocated() / (1024 * 1024), 2) if torch.cuda.is_available() else 0.0,
    }
