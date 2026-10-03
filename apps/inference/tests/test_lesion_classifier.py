import pytest
import torch
from PIL import Image

from src.models.lesion_classifier import SkinLesionNet, LesionClassifier

def test_lesion_net_forward_pass():
    model = SkinLesionNet(num_classes=7)
    model.eval()

    # Synthetic batch of 2 RGB images (2, 3, 224, 224)
    x = torch.randn(2, 3, 224, 224)
    with torch.no_grad():
        logits, severity = model(x)

    assert logits.shape == (2, 7)
    assert severity.shape == (2, 1)
    assert 0.0 <= severity[0].item() <= 100.0

def test_lesion_classifier_zone_detection():
    classifier = LesionClassifier(device="cpu")
    crop = Image.new("RGB", (150, 150), color=(210, 165, 135))
    zone_data = {
        "crop": crop,
        "normalized_bbox": {"x": 0.2, "y": 0.4, "w": 0.2, "h": 0.3},
    }

    findings = classifier.detect_findings_in_zone(
        zone_name="left_cheek",
        zone_data=zone_data,
        scan_id="test-scan-123",
        questionnaire_concerns=["ACNE"],
    )

    assert len(findings) > 0
    f = findings[0]
    assert f.zone == "left_cheek"
    assert f.type in classifier.CLASSES
    assert 0.0 <= f.severity <= 100.0
    assert 0.0 <= f.confidence <= 1.0
    assert f.boundingBox is not None
    assert 0.0 <= f.boundingBox.x <= 1.0
