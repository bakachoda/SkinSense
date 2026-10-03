import pytest
import numpy as np
from PIL import Image

from src.models.quality_gate import QualityGate

def test_quality_gate_dimension_validation():
    qg = QualityGate(min_dim=256, max_dim=4096)
    
    # Image below minimum
    small_img = Image.new("RGB", (128, 128), color=(200, 160, 140))
    res, _ = qg.validate(small_img)
    assert not res.passed
    assert "below minimum" in res.message

def test_quality_gate_blur_detection():
    qg = QualityGate(blur_threshold=30.0)
    
    # Sharp image with high-frequency pattern
    x = np.arange(300)
    y = np.arange(300)
    xx, yy = np.meshgrid(x, y)
    sharp_arr = (np.sin(xx / 4.0) * np.cos(yy / 4.0) * 127 + 128).astype(np.uint8)
    sharp_img = Image.fromarray(sharp_arr).convert("RGB")

    res_sharp, _ = qg.validate(sharp_img)
    assert res_sharp.blur_score > 30.0
    assert not res_sharp.is_blurry

    # Uniform flat image (zero variance = severe blur)
    flat_img = Image.new("RGB", (300, 300), color=(180, 150, 120))
    res_flat, _ = qg.validate(flat_img)
    assert res_flat.blur_score < 30.0
    assert res_flat.is_blurry

def test_quality_gate_exposure_detection():
    qg = QualityGate()

    # Extreme dark / underexposed
    dark_img = Image.new("RGB", (300, 300), color=(5, 5, 5))
    res_dark, _ = qg.validate(dark_img)
    assert res_dark.is_under_exposed
    assert not res_dark.passed

    # Extreme washed out / overexposed
    bright_img = Image.new("RGB", (300, 300), color=(252, 252, 252))
    res_bright, _ = qg.validate(bright_img)
    assert res_bright.is_over_exposed
    assert not res_bright.passed

    # Balanced exposure
    balanced_arr = np.random.randint(90, 160, size=(300, 300, 3), dtype=np.uint8)
    balanced_img = Image.fromarray(balanced_arr)
    res_bal, _ = qg.validate(balanced_img)
    assert not res_bal.is_under_exposed
    assert not res_bal.is_over_exposed
