from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .config import settings
from .routes.health import router as health_router
from .routes.inference import router as inference_router

logging.basicConfig(
    level=settings.log_level,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("skinsense.inference")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SkinSense AI Inference Engine...")
    logger.info("Model: %s on device: %s", settings.model_version, settings.device)
    yield
    logger.info("Shutting down SkinSense AI Inference Engine.")

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Diagnostic-grade dermatology inference microservice for SkinSense HealthOS.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(inference_router)

@app.get("/")
async def root():
    return {
        "service": settings.app_name,
        "version": settings.version,
        "status": "online",
        "docs": "/docs",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
