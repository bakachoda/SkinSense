import numpy as np
import cv2
from PIL import Image
from typing import Dict, List, Tuple, Any

frontal_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")

class FaceZone:
    def __init__(self, name: str, bbox: Tuple[float, float, float, float]):
        self.name = name
        self.bbox = bbox

class FaceAlignment:
    ZONE_DEFINITIONS = {
        "forehead": FaceZone("forehead", (0.24, 0.10, 0.76, 0.32)),
        "nose": FaceZone("nose", (0.40, 0.32, 0.60, 0.58)),
        "left_cheek": FaceZone("left_cheek", (0.18, 0.42, 0.42, 0.70)),
        "right_cheek": FaceZone("right_cheek", (0.58, 0.42, 0.82, 0.70)),
        "chin": FaceZone("chin", (0.35, 0.70, 0.65, 0.90)),
        "periorbital": FaceZone("periorbital", (0.22, 0.28, 0.78, 0.45)),
    }

    def _detect_face(self, img_bgr: np.ndarray) -> Tuple[bool, Tuple[int, int, int, int]]:
        """Detect face using OpenCV Haar cascades. Returns (found, (x, y, w, h))."""
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)

        faces = frontal_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))
        if len(faces) == 0:
            faces = profile_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(80, 80))
        if len(faces) == 0:
            return False, (0, 0, 0, 0)

        largest = max(faces, key=lambda f: f[2] * f[3])
        return True, tuple(largest)

    def _estimate_yaw(self, face_crop_gray: np.ndarray) -> float:
        """Estimate head yaw from eye positions within the face crop."""
        eyes = eye_cascade.detectMultiScale(face_crop_gray, scaleFactor=1.1, minNeighbors=4, minSize=(15, 15))
        if len(eyes) < 2:
            return 0.0

        sorted_eyes = sorted(eyes, key=lambda e: e[0])
        left_eye = sorted_eyes[0]
        right_eye = sorted_eyes[-1]

        left_cx = left_eye[0] + left_eye[2] / 2
        right_cx = right_eye[0] + right_eye[2] / 2
        face_w = face_crop_gray.shape[1]
        mid = face_w / 2.0
        eye_mid = (left_cx + right_cx) / 2.0

        offset = (eye_mid - mid) / face_w
        yaw = offset * 60.0
        return float(np.clip(yaw, -45, 45))

    def extract_landmarks(self, img: Image.Image) -> Dict[str, Any]:
        w, h = img.size
        img_bgr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

        found, (fx, fy, fw, fh) = self._detect_face(img_bgr)

        if not found:
            return {
                "face_detected": False,
                "confidence": 0.0,
                "landmarks_count": 0,
                "landmarks": [],
                "zones": {},
            }

        face_gray = cv2.cvtColor(img_bgr[fy:fy+fh, fx:fx+fw], cv2.COLOR_BGR2GRAY)
        yaw = self._estimate_yaw(face_gray)

        # Expand face bounding box by 40% for full-head zone extraction
        expand = 0.4
        cx, cy = fx + fw / 2, fy + fh / 2
        ew = fw * (1 + expand)
        eh = fh * (1 + expand * 1.2)
        ex = int(max(0, cx - ew / 2))
        ey = int(max(0, cy - eh / 2))
        ex2 = int(min(w, cx + ew / 2))
        ey2 = int(min(h, cy + eh / 2))

        face_img = img.crop((ex, ey, ex2, ey2))

        zones: Dict[str, Dict[str, Any]] = {}
        face_w_px, face_h_px = face_img.size

        for name, zone_def in self.ZONE_DEFINITIONS.items():
            min_x, min_y, max_x, max_y = zone_def.bbox
            px_min_x = max(0, int(min_x * face_w_px))
            px_min_y = max(0, int(min_y * face_h_px))
            px_max_x = min(face_w_px, int(max_x * face_w_px))
            px_max_y = min(face_h_px, int(max_y * face_h_px))

            crop = face_img.crop((px_min_x, px_min_y, px_max_x, px_max_y))
            if crop.size[0] < 10 or crop.size[1] < 10:
                crop = face_img

            zones[name] = {
                "name": name,
                "normalized_bbox": {
                    "x": round(min_x, 4),
                    "y": round(min_y, 4),
                    "w": round(max_x - min_x, 4),
                    "h": round(max_y - min_y, 4),
                },
                "pixel_bbox": [px_min_x, px_min_y, px_max_x, px_max_y],
                "crop": crop,
            }

        confidence = 0.95 if yaw == 0.0 else max(0.6, 0.95 - abs(yaw) / 100)

        return {
            "face_detected": True,
            "confidence": round(confidence, 3),
            "landmarks_count": 0,
            "landmarks": [],
            "yaw": round(yaw, 1),
            "face_bbox": {"x": fx, "y": fy, "w": fw, "h": fh},
            "zones": zones,
        }
