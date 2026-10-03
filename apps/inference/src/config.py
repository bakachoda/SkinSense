import os
from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "SkinSense AI Inference Service"
    version: str = "1.0.0"
    environment: str = os.getenv("NODE_ENV", "development")
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))
    model_version: str = "v1.0-resnet-ensemble"
    device: str = os.getenv("TORCH_DEVICE", "cpu")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    min_image_dimension: int = 256
    max_image_dimension: int = 4096
    blur_threshold: float = 35.0  # Minimum Laplacian variance for non-blurry capture
    exposure_min_percent: float = 1.5  # Under-exposure clamp
    exposure_max_percent: float = 98.5 # Over-exposure clamp

settings = Settings()
