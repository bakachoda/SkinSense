import pytest
import numpy as np
from PIL import Image

from src.models.severity_scorer import SeverityScorer
from src.schemas.scan import ZoneScore

def test_rgb_to_lab_conversion():
    scorer = SeverityScorer()
    arr = np.array([[[255, 0, 0], [0, 255, 0], [0, 0, 255]]], dtype=np.uint8)
    lab = scorer.compute_rgb_to_lab_approx(arr)

    assert lab.shape == (1, 3, 3)
    # Pure red has high positive a*
    assert lab[0, 0, 1] > 20.0
    # Pure green has negative a*
    assert lab[0, 1, 1] < -20.0

def test_texture_energy():
    scorer = SeverityScorer()
    
    # Smooth flat array
    smooth = np.full((100, 100), 128, dtype=np.uint8)
    energy_smooth = scorer.compute_texture_energy(smooth)
    assert energy_smooth == 0.0

    # Rough noisy array
    rough = np.random.randint(0, 255, (100, 100), dtype=np.uint8)
    energy_rough = scorer.compute_texture_energy(rough)
    assert energy_rough > 10.0

def test_composite_health_score_calculation():
    scorer = SeverityScorer()

    # Mild zone scores (good skin health)
    mild_zones = {
        "forehead": ZoneScore(acne=10, redness=15, pigmentation=10, texture=15, dryness=10, oiliness=20),
        "nose": ZoneScore(acne=15, redness=10, pigmentation=10, texture=20, dryness=10, oiliness=30),
        "left_cheek": ZoneScore(acne=10, redness=12, pigmentation=15, texture=10, dryness=15, oiliness=15),
    }
    score_mild = scorer.compute_composite_health_score(mild_zones)
    assert 75 <= score_mild <= 95

    # Severe zone scores (impaired skin)
    severe_zones = {
        "forehead": ZoneScore(acne=75, redness=65, pigmentation=70, texture=60, dryness=50, oiliness=80),
        "nose": ZoneScore(acne=70, redness=60, pigmentation=65, texture=65, dryness=55, oiliness=85),
        "left_cheek": ZoneScore(acne=80, redness=70, pigmentation=60, texture=55, dryness=60, oiliness=75),
    }
    score_severe = scorer.compute_composite_health_score(severe_zones)
    assert 20 <= score_severe <= 45
    assert score_severe < score_mild
