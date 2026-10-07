import http.server
import json
import base64
import time
import numpy as np
import cv2

PORT = 5005

# Load OpenCV cascades for frontal, profile, and eyes
frontal_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")

print(f"[VisionBridge] Frontal cascade loaded: {not frontal_cascade.empty()}")
print(f"[VisionBridge] Profile cascade loaded: {not profile_cascade.empty()}")
print(f"[VisionBridge] Eye cascade loaded: {not eye_cascade.empty()}")

class VisionBridgeHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress noisy standard HTTP logs, keep custom logs clean
        pass

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "service": "SkinSense Vision Bridge"}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path != "/detect-face":
            self.send_response(404)
            self.end_headers()
            return

        start_time = time.time()
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            payload = json.loads(body.decode("utf-8"))
            img_b64 = payload.get("image", "")
            target_pose = payload.get("targetPose", "frontal")

            # Strip data URL prefix if present
            if "," in img_b64:
                img_b64 = img_b64.split(",", 1)[1]

            img_bytes = base64.b64decode(img_b64)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if img is None:
                raise ValueError("Could not decode image")

            orig_h, orig_w = img.shape[:2]

            # Downsample for sub-10ms processing
            target_w = 320
            scale = target_w / float(orig_w)
            target_h = int(orig_h * scale)
            small_img = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_LINEAR)
            gray = cv2.cvtColor(small_img, cv2.COLOR_BGR2GRAY)
            gray = cv2.equalizeHist(gray)

            yaw = 0
            detected = False
            best_face = None

            # Priority 1: Check target pose specific cascades first
            if target_pose == "right_45":
                # User turning to their right -> test profile on flipped & normal
                gray_flipped = cv2.flip(gray, 1)
                profiles_flipped = profile_cascade.detectMultiScale(
                    gray_flipped,
                    scaleFactor=1.12,
                    minNeighbors=3,
                    minSize=(int(target_w * 0.16), int(target_h * 0.16)),
                )
                profiles_normal = profile_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.12,
                    minNeighbors=3,
                    minSize=(int(target_w * 0.16), int(target_h * 0.16)),
                )
                if len(profiles_flipped) > 0:
                    detected = True
                    rf = max(profiles_flipped, key=lambda f: f[2] * f[3])
                    rfx = target_w - (rf[0] + rf[2])
                    best_face = (rfx, rf[1], rf[2], rf[3])
                    yaw = 45
                elif len(profiles_normal) > 0:
                    detected = True
                    best_face = max(profiles_normal, key=lambda f: f[2] * f[3])
                    yaw = 45
                else:
                    faces = frontal_cascade.detectMultiScale(
                        gray,
                        scaleFactor=1.12,
                        minNeighbors=3,
                        minSize=(int(target_w * 0.16), int(target_h * 0.16)),
                    )
                    if len(faces) > 0:
                        detected = True
                        best_face = max(faces, key=lambda f: f[2] * f[3])
                        fx, fy, fw, fh = best_face
                        face_roi = gray[fy : fy + int(fh * 0.65), fx : fx + fw]
                        eyes = eye_cascade.detectMultiScale(face_roi, scaleFactor=1.1, minNeighbors=3, minSize=(15, 15))
                        if len(eyes) >= 2:
                            sorted_eyes = sorted(eyes, key=lambda e: e[0])
                            e1_center = sorted_eyes[0][0] + sorted_eyes[0][2] / 2.0
                            e2_center = sorted_eyes[-1][0] + sorted_eyes[-1][2] / 2.0
                            eye_mid = (e1_center + e2_center) / 2.0
                            face_mid = fw / 2.0
                            offset_norm = (eye_mid - face_mid) / (fw / 2.0)
                            if abs(offset_norm) < 0.14:
                                yaw = 0  # Balanced eyes indicate facing forward!
                            else:
                                yaw = int(np.clip(offset_norm * 45.0, -45, 45))
                        elif len(eyes) == 1:
                            yaw = 45  # Single eye visible due to profile occlusion
                        else:
                            yaw = 0

            elif target_pose == "left_45":
                # User turning to their left -> test normal and flipped profile
                profiles_normal = profile_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.12,
                    minNeighbors=3,
                    minSize=(int(target_w * 0.16), int(target_h * 0.16)),
                )
                gray_flipped = cv2.flip(gray, 1)
                profiles_flipped = profile_cascade.detectMultiScale(
                    gray_flipped,
                    scaleFactor=1.12,
                    minNeighbors=3,
                    minSize=(int(target_w * 0.16), int(target_h * 0.16)),
                )
                if len(profiles_normal) > 0:
                    detected = True
                    best_face = max(profiles_normal, key=lambda f: f[2] * f[3])
                    yaw = -45
                elif len(profiles_flipped) > 0:
                    detected = True
                    rf = max(profiles_flipped, key=lambda f: f[2] * f[3])
                    rfx = target_w - (rf[0] + rf[2])
                    best_face = (rfx, rf[1], rf[2], rf[3])
                    yaw = -45
                else:
                    faces = frontal_cascade.detectMultiScale(
                        gray,
                        scaleFactor=1.12,
                        minNeighbors=3,
                        minSize=(int(target_w * 0.16), int(target_h * 0.16)),
                    )
                    if len(faces) > 0:
                        detected = True
                        best_face = max(faces, key=lambda f: f[2] * f[3])
                        fx, fy, fw, fh = best_face
                        face_roi = gray[fy : fy + int(fh * 0.65), fx : fx + fw]
                        eyes = eye_cascade.detectMultiScale(face_roi, scaleFactor=1.1, minNeighbors=3, minSize=(15, 15))
                        if len(eyes) >= 2:
                            sorted_eyes = sorted(eyes, key=lambda e: e[0])
                            e1_center = sorted_eyes[0][0] + sorted_eyes[0][2] / 2.0
                            e2_center = sorted_eyes[-1][0] + sorted_eyes[-1][2] / 2.0
                            eye_mid = (e1_center + e2_center) / 2.0
                            face_mid = fw / 2.0
                            offset_norm = (eye_mid - face_mid) / (fw / 2.0)
                            if abs(offset_norm) < 0.14:
                                yaw = 0  # Balanced eyes indicate facing forward!
                            else:
                                yaw = int(np.clip(offset_norm * 45.0, -45, 45))
                        elif len(eyes) == 1:
                            yaw = -45  # Single eye visible due to profile occlusion
                        else:
                            yaw = 0

            else:
                # Default / Frontal pose: prioritize frontal cascade
                faces = frontal_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.12,
                    minNeighbors=4,
                    minSize=(int(target_w * 0.2), int(target_h * 0.2)),
                )
                if len(faces) > 0:
                    detected = True
                    best_face = max(faces, key=lambda f: f[2] * f[3])
                    fx, fy, fw, fh = best_face
                    face_roi = gray[fy : fy + int(fh * 0.65), fx : fx + fw]
                    eyes = eye_cascade.detectMultiScale(face_roi, scaleFactor=1.1, minNeighbors=3, minSize=(15, 15))
                    if len(eyes) >= 2:
                        sorted_eyes = sorted(eyes, key=lambda e: e[0])
                        e1_center = sorted_eyes[0][0] + sorted_eyes[0][2] / 2.0
                        e2_center = sorted_eyes[-1][0] + sorted_eyes[-1][2] / 2.0
                        eye_mid = (e1_center + e2_center) / 2.0
                        face_mid = fw / 2.0
                        offset_norm = (eye_mid - face_mid) / (fw / 2.0)
                        yaw = int(np.clip(offset_norm * 35.0, -35, 35))
                    else:
                        yaw = 0
                else:
                    # Fallback check profile
                    profiles_left = profile_cascade.detectMultiScale(gray, scaleFactor=1.15, minNeighbors=3, minSize=(int(target_w * 0.2), int(target_h * 0.2)))
                    if len(profiles_left) > 0:
                        detected = True
                        best_face = max(profiles_left, key=lambda f: f[2] * f[3])
                        yaw = -45
                    else:
                        gray_flipped = cv2.flip(gray, 1)
                        profiles_right = profile_cascade.detectMultiScale(gray_flipped, scaleFactor=1.15, minNeighbors=3, minSize=(int(target_w * 0.2), int(target_h * 0.2)))
                        if len(profiles_right) > 0:
                            detected = True
                            rf = max(profiles_right, key=lambda f: f[2] * f[3])
                            rfx = target_w - (rf[0] + rf[2])
                            best_face = (rfx, rf[1], rf[2], rf[3])
                            yaw = 45

            proc_ms = int((time.time() - start_time) * 1000)

            if detected and best_face is not None:
                fx, fy, fw, fh = best_face
                center_x = round((fx + fw / 2.0) / float(target_w), 3)
                center_y = round((fy + fh / 2.0) / float(target_h), 3)
                box_width = round(fw / float(target_w), 3)
                box_height = round(fh / float(target_h), 3)

                response_data = {
                    "faceDetected": True,
                    "centerX": center_x,
                    "centerY": center_y,
                    "boxWidth": box_width,
                    "boxHeight": box_height,
                    "yaw": yaw,
                    "latencyMs": proc_ms,
                }
                print(f"[VisionBridge] Face DETECTED for {target_pose}: Center=({center_x}, {center_y}) Scale={box_height} Yaw={yaw}° ({proc_ms}ms)", flush=True)
            else:
                response_data = {
                    "faceDetected": False,
                    "centerX": 0.0,
                    "centerY": 0.0,
                    "boxWidth": 0.0,
                    "boxHeight": 0.0,
                    "yaw": 0,
                    "latencyMs": proc_ms,
                }
                print(f"[VisionBridge] NO FACE detected for {target_pose} ({proc_ms}ms)", flush=True)

            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())

        except Exception as err:
            self.send_response(500)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(err), "faceDetected": False}).encode())

def run_server():
    server = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), VisionBridgeHandler)
    print(f"=====================================================")
    print(f"  SkinSense Vision AI Bridge RUNNING on port {PORT}")
    print(f"  Endpoints: http://localhost:{PORT}/detect-face")
    print(f"             http://localhost:{PORT}/health")
    print(f"=====================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[VisionBridge] Shutting down...")
        server.server_close()

if __name__ == "__main__":
    run_server()
