import numpy as np
from PIL import Image
from typing import Dict, List, Optional

from ..schemas.scan import ZoneScore, Finding

class SeverityScorer:
    """
    Computes objective colorimetric (HSV/LAB), texture (frequency energy),
    and composite clinical severity scores [0..100].
    """

    WEIGHTS = {
        "acne": 0.25,
        "redness": 0.20,
        "pigmentation": 0.20,
        "texture": 0.15,
        "dryness": 0.10,
        "oiliness": 0.10,
    }

    def compute_rgb_to_lab_approx(self, img_arr: np.ndarray) -> np.ndarray:
        """
        Calculates perceptual CIE LAB approximation from RGB array.
        L*: [0..100] (Lightness)
        a*: [-128..127] (Green to Magenta/Red)
        b*: [-128..127] (Blue to Yellow)
        """
        rgb = img_arr.astype(np.float32) / 255.0
        # sRGB to linear RGB
        mask = rgb > 0.04045
        rgb[mask] = np.power((rgb[mask] + 0.055) / 1.055, 2.4)
        rgb[~mask] = rgb[~mask] / 12.92

        # Convert to XYZ with standard D65 illuminant matrix
        x = rgb[..., 0] * 0.4124564 + rgb[..., 1] * 0.3575761 + rgb[..., 2] * 0.1804375
        y = rgb[..., 0] * 0.2126729 + rgb[..., 1] * 0.7151522 + rgb[..., 2] * 0.0721750
        z = rgb[..., 0] * 0.0193339 + rgb[..., 1] * 0.1191920 + rgb[..., 2] * 0.9503041

        # Normalize to D65 reference white point
        x /= 0.95047
        y /= 1.00000
        z /= 1.08883

        def f(t):
            delta = 6.0 / 29.0
            return np.where(t > delta**3, np.cbrt(t), (t / (3.0 * delta**2)) + (4.0 / 29.0))

        fx = f(x)
        fy = f(y)
        fz = f(z)

        l_star = 116.0 * fy - 16.0
        a_star = 500.0 * (fx - fy)
        b_star = 200.0 * (fy - fz)

        return np.stack([l_star, a_star, b_star], axis=-1)

    def compute_texture_energy(self, gray: np.ndarray) -> float:
        """Computes directional spatial gradient energy proxy for pore and roughness visibility."""
        gy, gx = np.gradient(gray.astype(np.float32))
        energy = np.mean(np.sqrt(gx**2 + gy**2))
        return float(energy)

    def score_zone(
        self,
        zone_name: str,
        crop: Image.Image,
        findings: List[Finding],
        questionnaire: Optional[Dict] = None,
    ) -> ZoneScore:
        """Computes multi-dimensional clinical metric scores for an anatomical zone."""
        img_arr = np.array(crop)
        gray = np.array(crop.convert("L"))

        lab = self.compute_rgb_to_lab_approx(img_arr)
        l_channel = lab[..., 0]
        a_channel = lab[..., 1]

        # 1. Redness / Erythema from positive a* deviation
        # Neutral facial skin typically has a* around 10-14. Values > 18 indicate microvascular flushing.
        mean_a = float(np.mean(a_channel))
        redness_raw = max(0.0, (mean_a - 10.0) * 4.5)
        redness_score = min(100.0, max(5.0, redness_raw))

        # 2. Pigmentation from standard deviation of lightness L*
        # Homogeneous skin has low std dev in L*; hyperpigmentation / spots increase std dev.
        l_std = float(np.std(l_channel))
        pigmentation_score = min(100.0, max(5.0, l_std * 5.0))

        # 3. Texture / Pores from spatial gradient energy
        texture_energy = self.compute_texture_energy(gray)
        texture_score = min(100.0, max(10.0, texture_energy * 3.5))

        # 4. Acne score weighted by findings in this zone
        zone_findings = [f for f in findings if f.zone == zone_name]
        acne_findings = [f for f in zone_findings if f.type in ["papule", "pustule", "comedone"]]
        if acne_findings:
            acne_score = float(np.mean([f.severity for f in acne_findings]))
        else:
            # Baseline background score
            acne_score = 12.0

        # 5. Oiliness from specular highlight (high luminance reflections on T-zone)
        high_lum_pct = float(np.sum(gray > 220) / gray.size) * 100.0
        if zone_name in ["forehead", "nose"]:
            oiliness_score = min(100.0, max(25.0, high_lum_pct * 8.0 + 35.0))
        else:
            oiliness_score = min(100.0, max(10.0, high_lum_pct * 4.0 + 15.0))

        # 6. Dryness (inverse of oiliness modulated by low luminance variance)
        l_range = float(np.ptp(l_channel))
        dryness_raw = (100.0 - oiliness_score) * 0.35 + max(0, (30.0 - l_range)) * 0.5
        dryness_score = min(100.0, max(5.0, dryness_raw))

        return ZoneScore(
            acne=round(acne_score, 1),
            redness=round(redness_score, 1),
            pigmentation=round(pigmentation_score, 1),
            texture=round(texture_score, 1),
            dryness=round(dryness_score, 1),
            oiliness=round(oiliness_score, 1),
        )

    def compute_composite_health_score(self, zone_scores: Dict[str, ZoneScore]) -> int:
        """
        Computes composite Skin Health Score [0..100].
        Calculates weighted average severity across all zones and inverts.
        """
        if not zone_scores:
            return 75

        avg_severity: Dict[str, float] = {}
        for concern in self.WEIGHTS:
            scores = [getattr(zone, concern) for zone in zone_scores.values()]
            avg_severity[concern] = float(np.mean(scores))

        weighted_sev = sum(avg_severity[c] * self.WEIGHTS[c] for c in self.WEIGHTS)
        health_score = int(round(100.0 - weighted_sev))
        return max(0, min(100, health_score))
