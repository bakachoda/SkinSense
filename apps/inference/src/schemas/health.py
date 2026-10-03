from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "skinsense-inference"
    version: str
    model_version: str
    device: str
    torch_version: str
    active_models: list[str]
