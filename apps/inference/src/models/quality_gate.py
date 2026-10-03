import numpy as np
from PIL import Image
from typing import Tuple, Union
import io
import base64

from ..schemas.scan import QualityGateResult
from ..config import settings

class QualityGate:
    """Diagnostic image quality validation gate for clinical facial photography."""

    def __init__(
        self,
        blur_threshold: float = settings.blur_threshold,
        min_dim: int = settings.min_image_dimension,
        max_dim: int = settings.max_image_dimension,
    ):
        self.blur_threshold = blur_threshold
        self.min_dim = min_dim
        self.max_dim = max_dim

    def decode_image(self, image_input: Union[str, bytes, Image.Image, np.ndarray]) -> Image.Image:
        """Decodes raw bytes, base64 data URL, PIL image or NumPy array into PIL.Image."""
        if isinstance(image_input, Image.Image):
            return image_input.convert("RGB")
        
        if isinstance(image_input, np.ndarray):
            if image_input.dtype != np.uint8:
                image_input = (np.clip(image_input, 0, 1) * 255).astype(np.uint8)
            return Image.fromarray(image_input).convert("RGB")

        if isinstance(image_input, str):
            if image_input.startswith("data:image"):
                # Strip base64 header
                image_input = image_input.split(",", 1)[1]
            image_bytes = base64.b64decode(image_input)
            return Image.open(io.BytesIO(image_bytes)).convert("RGB")

        if isinstance(image_input, bytes):
            return Image.open(io.BytesIO(image_input)).convert("RGB")

        raise ValueError(f"Unsupported image input type: {type(image_input)}")

    def compute_laplacian_variance(self, gray: np.ndarray) -> float:
        """
        Computes blur metric via discrete Laplacian operator variance.
        Laplacian kernel:
        [ 0,  1,  0 ]
        [ 1, -4,  1 ]
        [ 0,  1,  0 ]
        """
        h, w = gray.shape
        if h < 3 or w < 3:
            return 0.0

        # Discrete 2D convolution with 3x3 Laplacian kernel
        padded = np.pad(gray, 1, mode="edge")
        laplacian = (
            padded[:-2, 1:-1]
            + padded[2:, 1:-1]
            + padded[1:-1, :-2]
            + padded[1:-1, 2:]
            - 4.0 * gray
        )
        return float(np.var(laplacian))

    def evaluate_exposure(self, gray: np.ndarray) -> Tuple[float, bool, bool]:
        """
        Analyzes exposure via mean luminance and histogram clipping.
        Returns: (exposure_score [0..100], is_under_exposed, is_over_exposed)
        """
        total_pixels = gray.size
        if total_pixels == 0:
            return 0.0, True, False

        mean_val = float(np.mean(gray))
        under_exposed_pixels = np.sum(gray < 15)
        over_exposed_pixels = np.sum(gray > 240)

        under_pct = (under_exposed_pixels / total_pixels) * 100.0
        over_pct = (over_exposed_pixels / total_pixels) * 100.0

        is_under = under_pct > 25.0 or mean_val < 35.0
        is_over = over_pct > 25.0 or mean_val > 220.0

        # Normalized exposure score centered at optimal 128 midtone
        distance_from_optimal = abs(mean_val - 128.0) / 128.0
        exposure_score = max(0.0, min(100.0, (1.0 - distance_from_optimal) * 100.0))

        return exposure_score, is_under, is_over

    def validate(self, image_input: Union[str, bytes, Image.Image, np.ndarray]) -> Tuple[QualityGateResult, Image.Image]:
        """Validates resolution, blurriness, and exposure."""
        img = self.decode_image(image_input)
        w, h = img.size

        # Convert to float grayscale [0..255]
        gray = np.array(img.convert("L"), dtype=np.float32)

        # Dimension checks
        if w < self.min_dim or h < self.min_dim:
            return QualityGateResult(
                passed=False,
                blur_score=0.0,
                is_blurry=False,
                exposure_score=0.0,
                is_under_exposed=False,
                is_over_exposed=False,
                dimensions=[w, h],
                message=f"Image resolution {w}x{h} is below minimum requirement of {self.min_dim}x{self.min_dim}."
            ), img

        # Compute blur
        blur_score = self.compute_laplacian_variance(gray)
        is_blurry = blur_score < self.blur_threshold

        # Compute exposure
        exposure_score, is_under, is_over = self.evaluate_exposure(gray)

        passed = not is_blurry and not is_under and not is_over

        if is_blurry:
            msg = f"Motion blur detected (score: {blur_score:.1f}, min: {self.blur_threshold:.1f}). Please steady camera."
        elif is_under:
            msg = "Underexposure detected. Please capture in a brightly lit environment."
        elif is_over:
            msg = "Overexposure / glare detected. Please diffuse harsh lighting or direct flash."
        else:
            msg = "Quality gate passed. Diagnostic lighting and sharpness verified."

        return QualityGateResult(
            passed=passed,
            blur_score=round(blur_score, 2),
            is_blurry=is_blurry,
            exposure_score=round(exposure_score, 2),
            is_under_exposed=is_under,
            is_over_exposed=is_over,
            dimensions=[w, h],
            message=msg,
        ), img
