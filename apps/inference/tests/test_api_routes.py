import pytest
from httpx import AsyncClient, ASGITransport
import numpy as np
from PIL import Image
import io
import base64

from src.main import app

@pytest.fixture
def anyio_backend():
    return "asyncio"

def create_base64_test_image() -> str:
    img = Image.new("RGB", (300, 300), color=(215, 175, 145))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

@pytest.mark.asyncio
async def test_root_and_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Root endpoint
        resp = await client.get("/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "online"

        # Health endpoint
        resp = await client.get("/health")
        assert resp.status_code == 200
        health = resp.json()
        assert health["status"] == "healthy"
        assert health["service"] == "skinsense-inference"
        assert len(health["active_models"]) >= 4

@pytest.mark.asyncio
async def test_quality_gate_route():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        b64 = create_base64_test_image()
        payload = {
            "scanId": "scan-test-1",
            "userId": "user-test-1",
            "imageBase64": b64,
        }
        resp = await client.post("/api/v1/inference/quality-gate", json=payload)
        assert resp.status_code == 200
        result = resp.json()
        assert "passed" in result
        assert "blur_score" in result
        assert "exposure_score" in result

@pytest.mark.asyncio
async def test_analyze_route():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        b64 = create_base64_test_image()
        payload = {
            "scanId": "scan-test-999",
            "userId": "user-test-1",
            "imageBase64": b64,
            "questionnaire": {
                "skinType": "COMBINATION",
                "concerns": ["ACNE", "REDNESS"],
                "ageRange": "TWENTIES",
            },
            "physiologicalState": {
                "exercised": False,
                "hotShower": False,
            }
        }
        resp = await client.post("/api/v1/inference/analyze", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        
        # Verify schema contracts
        assert data["version"] == 1
        assert 0 <= data["skinHealthScore"] <= 100
        assert "zoneScores" in data
        assert "forehead" in data["zoneScores"]
        assert "left_cheek" in data["zoneScores"]
        assert "findings" in data
        assert isinstance(data["findings"], list)
        assert len(data["findings"]) > 0

        # Check metadata
        assert "metadata" in data
        assert data["metadata"]["faceDetected"] is True
        assert data["metadata"]["landmarkCount"] == 468
        assert data["metadata"]["processingTimeMs"] > 0
