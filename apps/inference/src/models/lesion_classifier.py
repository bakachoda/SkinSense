import numpy as np
from PIL import Image
from typing import List, Dict, Any, Optional

from ..schemas.scan import Finding, BoundingBox


class LesionClassifier:
    """
    Pixel-driven lesion detection using colorimetric analysis.
    Detects redness, pigmentation, oiliness, texture, and dryness signals
    directly from zone crop pixel data.
    """

    REDNESS_A_THRESHOLD = 16.0
    PIGMENT_L_STD_THRESHOLD = 8.0
    OILINESS_HIGHLIGHT_THRESHOLD = 5.0
    TEXTURE_ENERGY_THRESHOLD = 12.0

    def _rgb_to_lab(self, img_arr: np.ndarray) -> np.ndarray:
        rgb = img_arr.astype(np.float32) / 255.0
        mask = rgb > 0.04045
        rgb[mask] = np.power((rgb[mask] + 0.055) / 1.055, 2.4)
        rgb[~mask] = rgb[~mask] / 12.92

        x = rgb[..., 0] * 0.4124564 + rgb[..., 1] * 0.3575761 + rgb[..., 2] * 0.1804375
        y = rgb[..., 0] * 0.2126729 + rgb[..., 1] * 0.7151522 + rgb[..., 2] * 0.0721750
        z = rgb[..., 0] * 0.0193339 + rgb[..., 1] * 0.1191920 + rgb[..., 2] * 0.9503041

        x /= 0.95047
        z /= 1.08883

        def f(t):
            delta = 6.0 / 29.0
            return np.where(t > delta ** 3, np.cbrt(t), (t / (3.0 * delta ** 2)) + (4.0 / 29.0))

        return np.stack([116.0 * f(y) - 16.0, 500.0 * (f(x) - f(y)), 200.0 * (f(y) - f(z))], axis=-1)

    def _texture_energy(self, gray: np.ndarray) -> float:
        gy, gx = np.gradient(gray.astype(np.float32))
        return float(np.mean(np.sqrt(gx ** 2 + gy ** 2)))

    def detect_findings_in_zone(
        self,
        zone_name: str,
        zone_data: Dict[str, Any],
        scan_id: str,
        questionnaire_concerns: Optional[List[str]] = None,
    ) -> List[Finding]:
        crop: Image.Image = zone_data["crop"]
        norm_bbox = zone_data["normalized_bbox"]
        img_arr = np.array(crop)
        gray = np.array(crop.convert("L"), dtype=np.float32)

        if img_arr.size == 0 or gray.size == 0:
            return []

        lab = self._rgb_to_lab(img_arr)
        l_channel = lab[..., 0]
        a_channel = lab[..., 1]

        findings: List[Finding] = []
        concerns = [c.upper() for c in (questionnaire_concerns or [])]

        mean_a = float(np.mean(a_channel))
        l_std = float(np.std(l_channel))
        high_lum_pct = float(np.sum(gray > 220) / gray.size) * 100.0
        tex_energy = self._texture_energy(gray)

        # Redness detection: high a* channel indicates microvascular flushing
        if mean_a > self.REDNESS_A_THRESHOLD:
            severity = min(90.0, max(25.0, (mean_a - 10.0) * 4.0))
            confidence = min(0.95, max(0.5, (mean_a - self.REDNESS_A_THRESHOLD) / 20.0 + 0.6))
            findings.append(Finding(
                id=f"f-{scan_id}-{zone_name}-redness",
                type="redness_patch",
                zone=zone_name,
                severity=round(severity, 1),
                confidence=round(confidence, 2),
                boundingBox=BoundingBox(
                    x=round(norm_bbox["x"] + norm_bbox["w"] * 0.15, 3),
                    y=round(norm_bbox["y"] + norm_bbox["h"] * 0.15, 3),
                    w=round(norm_bbox["w"] * 0.7, 3),
                    h=round(norm_bbox["h"] * 0.7, 3),
                ),
                description=f"Erythema detected in {zone_name.replace('_', ' ')} (a*={mean_a:.1f})",
            ))

        # Pigmentation detection: high L* standard deviation indicates uneven tone
        if l_std > self.PIGMENT_L_STD_THRESHOLD:
            severity = min(85.0, max(20.0, l_std * 4.5))
            confidence = min(0.92, max(0.5, (l_std - self.PIGMENT_L_STD_THRESHOLD) / 15.0 + 0.55))
            findings.append(Finding(
                id=f"f-{scan_id}-{zone_name}-pigment",
                type="dark_spot",
                zone=zone_name,
                severity=round(severity, 1),
                confidence=round(confidence, 2),
                boundingBox=BoundingBox(
                    x=round(norm_bbox["x"] + norm_bbox["w"] * 0.25, 3),
                    y=round(norm_bbox["y"] + norm_bbox["h"] * 0.3, 3),
                    w=round(norm_bbox["w"] * 0.5, 3),
                    h=round(norm_bbox["h"] * 0.4, 3),
                ),
                description=f"Uneven pigmentation in {zone_name.replace('_', ' ')} (L* std={l_std:.1f})",
            ))

        # Oiliness detection: specular highlights (T-zone emphasis)
        if zone_name in ["forehead", "nose"] and high_lum_pct > self.OILINESS_HIGHLIGHT_THRESHOLD:
            severity = min(80.0, max(20.0, high_lum_pct * 6.0 + 20.0))
            findings.append(Finding(
                id=f"f-{scan_id}-{zone_name}-oiliness",
                type="comedone",
                zone=zone_name,
                severity=round(severity, 1),
                confidence=round(min(0.85, 0.5 + high_lum_pct / 30.0), 2),
                boundingBox=BoundingBox(
                    x=round(norm_bbox["x"] + norm_bbox["w"] * 0.2, 3),
                    y=round(norm_bbox["y"] + norm_bbox["h"] * 0.2, 3),
                    w=round(norm_bbox["w"] * 0.6, 3),
                    h=round(norm_bbox["h"] * 0.6, 3),
                ),
                description=f"Sebaceous activity in {zone_name.replace('_', ' ')} ({high_lum_pct:.1f}% specular)",
            ))

        # Texture roughness: high gradient energy indicates pore visibility or roughness
        if tex_energy > self.TEXTURE_ENERGY_THRESHOLD:
            severity = min(75.0, max(15.0, tex_energy * 2.5))
            findings.append(Finding(
                id=f"f-{scan_id}-{zone_name}-texture",
                type="texture_rough",
                zone=zone_name,
                severity=round(severity, 1),
                confidence=round(min(0.80, 0.45 + tex_energy / 40.0), 2),
                boundingBox=BoundingBox(
                    x=round(norm_bbox["x"], 3),
                    y=round(norm_bbox["y"], 3),
                    w=round(norm_bbox["w"], 3),
                    h=round(norm_bbox["h"], 3),
                ),
                description=f"Surface roughness in {zone_name.replace('_', ' ')} (energy={tex_energy:.1f})",
            ))

        # Dryness detection: low oiliness + low luminance variance
        mean_l = float(np.mean(l_channel))
        if high_lum_pct < 2.0 and mean_l < 55.0:
            severity = min(70.0, max(15.0, (55.0 - mean_l) * 2.0 + 20.0))
            findings.append(Finding(
                id=f"f-{scan_id}-{zone_name}-dryness",
                type="dryness_patch",
                zone=zone_name,
                severity=round(severity, 1),
                confidence=0.6,
                boundingBox=BoundingBox(
                    x=round(norm_bbox["x"], 3),
                    y=round(norm_bbox["y"], 3),
                    w=round(norm_bbox["w"], 3),
                    h=round(norm_bbox["h"], 3),
                ),
                description=f"Dehydration indicators in {zone_name.replace('_', ' ')}",
            ))

        return findings
