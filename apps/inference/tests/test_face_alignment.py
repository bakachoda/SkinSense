import pytest
from PIL import Image

from src.models.face_alignment import FaceAlignment

def test_face_alignment_landmark_extraction():
    aligner = FaceAlignment()
    img = Image.new("RGB", (512, 512), color=(210, 170, 140))

    res = aligner.extract_landmarks(img)
    assert res["face_detected"] is True
    assert res["landmarks_count"] == 468
    assert len(res["landmarks"]) == 468

    # Check normalized coordinate ranges
    for lm in res["landmarks"][:20]:
        assert 0.0 <= lm["x"] <= 1.0
        assert 0.0 <= lm["y"] <= 1.0

def test_face_alignment_zone_segmentation():
    aligner = FaceAlignment()
    img = Image.new("RGB", (600, 600), color=(200, 160, 130))

    res = aligner.extract_landmarks(img)
    zones = res["zones"]

    expected_zones = ["forehead", "nose", "left_cheek", "right_cheek", "chin", "periorbital"]
    for expected in expected_zones:
        assert expected in zones
        zone_info = zones[expected]
        assert "crop" in zone_info
        assert isinstance(zone_info["crop"], Image.Image)
        
        # Verify bounding box validity
        bbox = zone_info["normalized_bbox"]
        assert 0.0 <= bbox["x"] <= 1.0
        assert 0.0 <= bbox["y"] <= 1.0
        assert 0.0 < bbox["w"] <= 1.0
        assert 0.0 < bbox["h"] <= 1.0
