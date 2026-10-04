# SkinSense Phase 3: Capture Quality

**Duration:** Weeks 18–25 (8 weeks)
**Goal:** Transform input from "phone selfie" to "diagnostic-grade capture." Biggest single impact on output quality.
**Depends on:** Phase 0-2 complete (foundation, MVP core loop, App Store launch).
**Team:** Solo developer, LLM-assisted.

---

## 1. Back Camera as Default

The back camera is 4–10x better than the front in every spec that matters: resolution, autofocus, sensor size, OIS. Phase 3 makes it the default.

### 1.1 Capture Modes

| Mode | How It Works | Best For |
|------|-------------|----------|
| **Audio-Guided Self-Scan** (default) | User holds phone with back camera at face. App detects face via back camera and gives voice + haptic guidance. User never sees screen. | Solo, visually impaired, best quality |
| **Mirror Mode** | User faces bathroom mirror, back camera aimed at reflection. App detects mirrored face, un-mirrors in processing. | Users wanting visual feedback |
| **Assisted Mode** | Another person holds the phone. On-screen framing targets guide photographer. | Highest quality, motor impairment |
| **Front Camera** (fallback) | Standard selfie. Retained for users who prefer it. | Simplicity, front-only devices |

### 1.2 CaptureService Abstraction

```typescript
// packages/types/src/capture.ts
interface ICaptureMode {
  readonly id: 'audio_guided' | 'mirror' | 'assisted' | 'front_camera';
  readonly camera: 'back' | 'front';
  readonly guidanceType: 'audio_haptic' | 'visual' | 'both';
  
  startCapture(config: CaptureConfig): Promise<void>;
  onPoseReady(callback: (pose: HeadPose) => void): Subscription;
  captureFrame(): Promise<CapturedFrame>;
  stopCapture(): Promise<void>;
}

interface CaptureConfig {
  targetPoses: HeadPose[];      // frontal, left45, right45
  framesPerPose: number;        // 5 (3 HDR + 2 flash)
  videoClipDuration: number;    // 2 seconds
  stabilityThreshold: number;   // accelerometer variance threshold
}
```

Build as a `CaptureService` class with mode implementations. When Phase 5 adds RAW/LiDAR/multi-camera, the service gets new capabilities without touching UI code.

### 1.3 Voice & Haptic Guidance

**Voice prompts (Text-to-Speech via expo-speech):**
- "Hold the phone at arm's length facing you"
- "Move the phone slightly left... good"
- "Tilt up a bit... perfect, hold still"
- "Photo taken! Now turn your head to the left"
- "Great! Turn your head to the right"
- "All done! Processing your photos"

**Haptic patterns (expo-haptics):**
- Short pulse: capture triggered
- Double pulse: change pose
- Long buzz: capture blocked (no face, bad lighting)
- Success pattern (3 quick pulses): scan complete

---

## 2. Multi-Angle Guided Capture

### 2.1 Three Poses

| Pose | Target Yaw | Zones Captured |
|------|-----------|----------------|
| Frontal | 0° ± 5° | Forehead, nose, central cheeks, chin |
| Left 45° | -45° ± 5° | Left jawline, left temple, left nostril fold |
| Right 45° | +45° ± 5° | Right jawline, right temple, right nostril fold |

### 2.2 Pose Detection

- MediaPipe Face Mesh runs on camera preview frames (468 landmarks)
- Head yaw calculated from landmark geometry (nose tip vs. ear positions)
- Auto-capture triggers when yaw is within ±5° of target AND stable for >0.5s
- On-screen: translucent silhouette turns green when aligned (visual modes)
- Audio: "Turn your head to the left... a little more... hold still... [capture pulse]"

### 2.3 Implementation

```typescript
function calculateHeadYaw(landmarks: FaceLandmark[]): number {
  const noseTip = landmarks[1];
  const leftEar = landmarks[234];
  const rightEar = landmarks[454];
  const midpoint = { x: (leftEar.x + rightEar.x) / 2 };
  const offset = noseTip.x - midpoint.x;
  const earDistance = Math.abs(rightEar.x - leftEar.x);
  return Math.atan2(offset, earDistance) * (180 / Math.PI);
}
```

---

## 3. Best-Frame Video Selection

### 3.1 Capture

Record a 2-second video clip per pose at 30fps (~60 frames). Use `expo-camera` video recording or the custom Expo Module.

### 3.2 Frame Scoring

Each frame is scored on 4 criteria (all computed on-device before upload):

```typescript
interface FrameScore {
  sharpness: number;    // Laplacian variance (higher = sharper)
  stability: number;    // Inverse of landmark displacement from previous frame
  exposure: number;     // Histogram spread (wider = better tonal range)
  eyeOpen: boolean;     // Eye-aspect-ratio > threshold (reject blinks)
}

function scoreFrame(frame: Frame, prevFrame?: Frame): FrameScore {
  const gray = toGrayscale(frame);
  const sharpness = laplacianVariance(gray);
  const stability = prevFrame 
    ? 1 / landmarkDisplacement(frame.landmarks, prevFrame.landmarks) 
    : 1;
  const exposure = histogramSpread(gray);
  const eyeOpen = eyeAspectRatio(frame.landmarks) > 0.2;
  return { sharpness, stability, exposure, eyeOpen };
}

function selectBestFrame(frames: ScoredFrame[]): Frame {
  return frames
    .filter(f => f.score.eyeOpen)
    .sort((a, b) => compositeScore(b) - compositeScore(a))[0];
}
```

---

## 4. HDR 3-Bracket Exposure

### 4.1 Capture

Per angle, capture 3 frames at -1EV, 0EV, +1EV. Requires manual exposure control — `expo-camera` doesn't support this natively.

### 4.2 Custom Expo Module API

```typescript
// modules/skinsense-camera/src/SkinSenseCameraModule.ts
interface SkinSenseCameraModule {
  captureWithExposureBracket(
    brackets: number[] // [-1, 0, 1]
  ): Promise<CapturedFrame[]>;
  
  setTorch(enabled: boolean): Promise<void>;
  
  startVideoRecording(config: {
    duration: number;   // seconds
    fps: number;        // 30
  }): Promise<void>;
  
  stopVideoRecording(): Promise<VideoResult>;
  
  getHeadPose(): Promise<{ yaw: number; pitch: number; roll: number }>;
}
```

**iOS (Swift):** Wrap AVCaptureDevice exposure control — set `exposureTargetBias` for each bracket, capture via AVCapturePhotoOutput.

**Android (Kotlin):** Wrap Camera2 CaptureRequest — set `CONTROL_AE_EXPOSURE_COMPENSATION` for each bracket.

Build using Expo Modules API (`expo-modules-core`). The module lives in `modules/skinsense-camera/` at the monorepo root.

---

## 5. Flash / No-Flash Pair

Per angle, one frame with torch ON, one with torch OFF.

- **Back camera:** rear LED torch via `SkinSenseCameraModule.setTorch(true/false)`
- **Front camera fallback:** screen-as-fill-light — set screen brightness to max, display white, capture. Then display black, capture.

**Total frames per scan:** 3 angles × 5 frames (3 HDR + 2 flash) = 15 + 1 calibration = **16 frames**.

---

## 6. Color Calibration

### 6.1 Flow

Before the face capture, the app prompts: "Hold a white sheet of paper in front of the camera." Capture one frame of the white reference.

### 6.2 Backend Processing

```python
def normalize_white_balance(frame: np.ndarray, calibration: np.ndarray) -> np.ndarray:
    # Sample center region of calibration frame
    h, w = calibration.shape[:2]
    center = calibration[h//4:3*h//4, w//4:3*w//4]
    
    # Compute per-channel gain to reach D65 white point
    target_white = np.array([255, 255, 255], dtype=np.float32)
    measured_white = center.mean(axis=(0, 1)).astype(np.float32)
    gain = target_white / (measured_white + 1e-6)
    gain = np.clip(gain, 0.5, 2.0)  # safety clamp
    
    # Apply to frame
    corrected = (frame.astype(np.float32) * gain).clip(0, 255).astype(np.uint8)
    return corrected
```

---

## 7. Environment Quality Gate

### 7.1 Real-Time Analysis on Preview

- **Light source classification:** From calibration frame, analyze color temperature — daylight ~5500K (neutral), fluorescent ~4000K (green spike), incandescent ~2700K (warm), mixed (multiple peaks).
- **Shadow detection:** On face preview, compute gradient magnitude across facial contours. Hard edges with >2x intensity difference indicate directional shadows.
- **Light direction:** From shadow analysis, estimate dominant light direction. Guide user: "Step forward so the light is above you" with a directional arrow on screen.

### 7.2 Traffic Light Indicator

| Color | Condition | Action |
|-------|-----------|--------|
| Green | Even, diffuse, overhead-forward lighting | Proceed to capture |
| Yellow | Slightly uneven or warm light | Proceed with accuracy note |
| Red | Direct sunlight, very dim, backlighting | Block capture, show advice |

---

## 8. Skin Prep & Physiological State

### 8.1 Pre-Scan Checklist (First Scan Only, Dismissable)

```
For the most accurate results:
✓ Cleanse your face (remove makeup, SPF)
✓ Wait 15 minutes after washing
✓ Pin hair back from your face
✓ Pat skin dry

[ Got it, let's scan ]
```

### 8.2 Quick State Questions

```
Two quick questions:

Have you exercised in the last 30 minutes?  [ Yes ] [ No ]
Hot shower in the last 20 minutes?          [ Yes ] [ No ]
```

If yes to either: metadata flag attached to scan. Redness scores receive a low-confidence modifier in the analysis.

### 8.3 Makeup Detection

Lightweight on-device classifier (TFLite/CoreML). Foundation has distinctive uniform smoothness + hue shift vs. natural skin. Runs on the FIRST captured frame (not live preview — too expensive). If detected: "We think you may be wearing makeup — results will be more accurate on bare skin. Continue anyway?"

### 8.4 Glasses Detection

MediaPipe face landmarks detect frames occluding periorbital zone (landmarks around eyes show occlusion pattern). Prompt: "Remove your glasses for better under-eye analysis."

---

## 9. Self-Assessment (Dual Validation)

### 9.1 When It Appears

After upload completes and segmentation is done (~1.5s), while detection models are still running.

### 9.2 Zone-Level Reference Photo Matching

The app shows the user's face divided into zones. For each zone, a grid of reference photos:

- **Categories:** pore visibility, blackheads, active acne, redness, dark spots, dryness, fine lines, oiliness
- **Severities:** mild, moderate, severe (3 images per category)
- **Fitzpatrick:** filtered to match user's skin tone (from Phase 4 — for now, show all)
- **User action:** tap the images that match what they see in the mirror

### 9.3 Touch-to-Mark

After the reference grid, show the user's captured face photo. They tap directly on specific spots they're concerned about. Each tap stores pixel coordinates:

```typescript
interface SpotMarker {
  x: number;           // normalized 0-1
  y: number;           // normalized 0-1
  zone: string;        // auto-determined from face landmarks
  userNote?: string;    // optional: "this bump won't go away"
}
```

### 9.4 Cross-Referencing Logic

```typescript
function crossReference(
  aiFindings: Finding[],
  userSelections: UserSelection[],
  spotMarkers: SpotMarker[],
): CalibratedFinding[] {
  return aiFindings.map(finding => {
    const userSelected = userSelections.some(
      s => s.zone === finding.zone && s.concern === finding.type
    );
    
    if (userSelected && finding.confidence > 0.5) {
      return { ...finding, confidence: 'HIGH', source: 'ai_and_user' };
    } else if (!userSelected && finding.confidence > 0.7) {
      return { ...finding, confidence: 'MODERATE', source: 'ai_only', label: 'We also noticed...' };
    } else if (userSelected && finding.confidence <= 0.5) {
      return { ...finding, confidence: 'LOW', source: 'user_only', reanalyze: true };
    }
    return null; // Neither detected nor selected
  }).filter(Boolean);
}
```

For `reanalyze: true` findings: re-run detection at that zone with lower confidence threshold and enhanced CLAHE.

---

## 10. Backend Preprocessing Pipeline

Each step is a pure function. They compose into a pipeline:

```python
def preprocess_angle(
    frames: AngleFrameSet,
    calibration: np.ndarray,
    config: PreprocessConfig,
) -> PreprocessedComposite:
    
    corrected = [normalize_white_balance(f, calibration) for f in frames.all]
    hdr = merge_hdr(corrected[:3])                    # 10a
    composite = fuse_flash(hdr, corrected[3], corrected[4])  # 10b
    oiliness, specular_free = analyze_and_remove_specular(composite, corrected[4])  # 10c
    enhanced = apply_clahe(specular_free, zones)       # 10d
    scale = compute_scale(landmarks, exif_focal_length) # 10e
    return PreprocessedComposite(enhanced, oiliness, scale, zones)
```

### 10a. White Balance Normalization
- Input: frame + calibration frame
- Output: color-corrected frame
- (See Section 6.2 for implementation)

### 10b. HDR Exposure Merge
```python
def merge_hdr(brackets: list[np.ndarray]) -> np.ndarray:
    aligned = align_frames(brackets)  # ORB feature matching + warpAffine
    merger = cv2.createMergeMertens()
    merged = merger.process(aligned)
    return np.clip(merged * 255, 0, 255).astype(np.uint8)
```

### 10c. Flash/No-Flash Fusion
```python
def fuse_flash(hdr: np.ndarray, flash: np.ndarray, ambient: np.ndarray) -> np.ndarray:
    # Texture from flash (high-frequency via Gaussian difference)
    flash_gray = cv2.cvtColor(flash, cv2.COLOR_BGR2GRAY)
    flash_blur = cv2.GaussianBlur(flash_gray, (21, 21), 0)
    texture = flash_gray.astype(float) - flash_blur.astype(float)
    
    # Color from ambient (hdr already has good color)
    # Combine: hdr base + texture overlay
    composite = hdr.astype(float)
    for c in range(3):
        composite[:,:,c] += texture * 0.3  # blend factor
    return np.clip(composite, 0, 255).astype(np.uint8)
```

### 10d. Specular Map Analysis + Removal
```python
def analyze_and_remove_specular(
    composite: np.ndarray, 
    ambient: np.ndarray
) -> tuple[OilinessMap, np.ndarray]:
    # Isolate specular layer
    specular = cv2.subtract(composite, ambient)
    
    # ANALYZE before removing (specular IS the oiliness data)
    oiliness = compute_oiliness_per_zone(specular, zones)
    # oiliness: { forehead: 72, nose: 85, cheeks: 30, ... }
    
    # THEN remove
    specular_free = cv2.subtract(composite, specular)
    # Inpaint remaining glare spots
    mask = cv2.threshold(cv2.cvtColor(specular, cv2.COLOR_BGR2GRAY), 200, 255, cv2.THRESH_BINARY)[1]
    result = cv2.inpaint(specular_free, mask, 3, cv2.INPAINT_TELEA)
    return oiliness, result
```

### 10e. CLAHE Per Zone
```python
def apply_clahe(frame: np.ndarray, zones: dict[str, np.ndarray]) -> np.ndarray:
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    for zone_name, mask in zones.items():
        l_channel = lab[:,:,0]
        zone_region = cv2.bitwise_and(l_channel, l_channel, mask=mask)
        enhanced = clahe.apply(zone_region)
        lab[:,:,0] = np.where(mask > 0, enhanced, l_channel)
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
```

### 10f. Distance & Scale Normalization
```python
def compute_scale(landmarks: list, focal_length_mm: float, sensor_width_mm: float, image_width_px: int) -> float:
    # IPD in pixels
    left_pupil = landmarks[468]   # MediaPipe iris landmarks
    right_pupil = landmarks[473]
    ipd_px = np.linalg.norm(np.array(left_pupil) - np.array(right_pupil))
    
    # Real-world IPD ~62mm
    REAL_IPD_MM = 62.0
    
    # Focal length in pixels
    focal_px = (focal_length_mm / sensor_width_mm) * image_width_px
    
    # Distance to face
    distance_mm = (REAL_IPD_MM * focal_px) / ipd_px
    
    # Scale: pixels per mm at face distance
    px_per_mm = focal_px / distance_mm
    
    # Normalize to target (10 px/mm)
    TARGET_PX_PER_MM = 10.0
    scale_factor = TARGET_PX_PER_MM / px_per_mm
    return scale_factor
```

### 10g. Multi-Angle Zone Stitching
```python
def stitch_zones(angles: list[PreprocessedComposite]) -> UnifiedZoneData:
    unified = {}
    for zone in ALL_ZONES:
        # Find which angle captured this zone best
        candidates = []
        for angle in angles:
            if zone in angle.zones:
                coverage = angle.zone_coverage[zone]  # 0-1
                resolution = angle.effective_resolution[zone]
                candidates.append((angle, coverage * resolution))
        
        best_angle = max(candidates, key=lambda x: x[1])[0]
        unified[zone] = best_angle.zone_data[zone]
    
    return UnifiedZoneData(unified)
```

### 10h. Multi-Channel Color Analysis
Upgrade from Phase 1's single-colorspace approach:
- **LAB:** L* for lightness/pigmentation, a* for redness, b* for yellowness
- **HSV:** H channel red range (0-10°, 170-180°) for erythema
- **Green channel isolation:** hemoglobin absorption peak — best for redness on darker skin
- **Blue channel isolation:** melanin absorption peak — best for pigmentation detection

### 10i. Gabor/Wavelet Texture
- Gabor bank: 4 orientations × 3 frequencies
- Wavelet: separate low-freq (tone gradients) from high-freq (pores, lines)
- All measurements expressed in mm using scale from 10f

---

## 11. Progress Tracking Upgrades

### 11.1 Ghost Silhouette

On follow-up scans, overlay the previous scan's face position/angle as a translucent guide. Lock capture to:
- ±10% of baseline IPD-derived distance
- ±5° of baseline head rotation per pose

### 11.2 Scale-Normalized Comparison

All deltas computed in mm, not pixels. A pore at 0.3mm in scan 1 compared to 0.3mm scale in scan 2 regardless of distance.

### 11.3 Spot Tracking

Touch-to-mark spots registered to zone coordinates. Tracked across scans: "The bump you marked on Oct 1 has reduced by 40%."

---

## 12. Progressive Onboarding

| Scan # | What's Enabled |
|--------|---------------|
| 1 | Frontal only, basic questionnaire (Phase 1 behavior) |
| 2 | Multi-angle unlocks: "Want more detailed results?" |
| 3 | Self-assessment unlocks |
| Any | Power users toggle all features ON in Settings |

---

## 13. Database Schema Changes

```prisma
// New fields on Scan model
model Scan {
  // ... existing
  captureMode       String?        // 'audio_guided', 'mirror', 'assisted', 'front_camera'
  calibrationKey    String?        // S3 key for white reference frame
  frameCount        Int?           // total frames uploaded
  environmentScore  String?        // 'green', 'yellow'
  physiologicalState Json?         // { exercised: bool, hotShower: bool }
}

// New model for self-assessment
model SelfAssessment {
  id          String   @id @default(cuid())
  scanId      String   @unique
  scan        Scan     @relation(fields: [scanId], references: [id])
  selections  Json     // { zone: string, concerns: string[] }[]
  spotMarkers Json     // SpotMarker[]
  createdAt   DateTime @default(now())
}

// Add to ScanResult
model ScanResult {
  // ... existing
  oilinessMap     Json?    // per-zone oiliness scores from specular analysis
  zoneCoverage    Json?    // per-zone coverage confidence 0-1
  scaleFactorMm   Float?  // pixels per mm at capture distance
}
```

---

## 14. API Updates

```
POST /api/scans (updated)
Request: {
  imageKeys: string[],         // array of S3 keys (16 frames)
  calibrationKey: string,      // S3 key for white reference
  questionnaire: Questionnaire,
  captureMode: string,
  environmentScore: string,
  physiologicalState: { exercised: boolean, hotShower: boolean },
}

POST /api/scans/:id/self-assessment
Request: {
  selections: { zone: string, concerns: string[] }[],
  spotMarkers: { x: number, y: number, zone: string, note?: string }[],
}

GET /api/scans/:id/result (updated response)
Response: {
  result: ScanResult,  // now includes oilinessMap, zoneCoverage, scaleFactor
  selfAssessment?: SelfAssessment,
}
```

---

## 15. Testing

### Unit Tests
- Each preprocessing function independently (white balance, HDR merge, flash fusion, specular, CLAHE, scale normalization, zone stitching)
- Self-assessment cross-referencing logic (all 4 agreement states)
- Scale normalization math (known IPD + focal length → expected px/mm)
- Frame scoring algorithm (known sharp vs. blurry inputs)

### Integration Tests
- Multi-frame upload flow (16 presigned URLs → 16 uploads → analysis request)
- WebSocket progressive delivery with new preprocessing stages
- Self-assessment submission + cross-referencing applied to results

### Device Testing
- Back camera audio guidance: iOS (iPhone 12+) and Android (Pixel 6+)
- Multi-angle completion rate (target: >80% complete all 3 poses)
- HDR capture via custom module on both platforms
- Flash/no-flash on back and front camera

---

## 16. What's NOT in Phase 3

- ❌ RAW capture, LiDAR, macro, telephoto, multi-camera (Phase 5)
- ❌ 240fps video, multispectral, rPPG, photometric stereo (Phase 5)
- ❌ On-device BiSeNet hair segmentation, makeup classifier ML model (Phase 5 — Phase 3 uses simpler heuristics)
- ❌ Fitzpatrick adaptation, differential diagnosis, barrier score (Phase 4)
- ❌ Product scanning, phased introduction, personalized learning (Phase 4)
- ❌ Gamification, achievements, AR overlay, diary (Phase 6)
- ❌ Dermatologist portal, health app integration (Phase 7)

---

## 17. Deliverable Checklist

- [ ] Back camera audio-guided capture works on iOS and Android
- [ ] Multi-angle capture (3 poses) with auto-trigger completes in <90 seconds
- [ ] Best-frame selection picks sharper frames (validated on test set)
- [ ] HDR 3-bracket capture via custom Expo Module on both platforms
- [ ] Flash/no-flash pair captures on back camera (torch) and front camera (screen flash)
- [ ] Color calibration: white reference capture + backend normalization verified
- [ ] Environment quality gate blocks capture in red conditions
- [ ] Skin prep checklist and physiological state questions implemented
- [ ] Self-assessment reference photo grid renders per zone
- [ ] Touch-to-mark stores pixel coordinates and appears in results
- [ ] Backend preprocessing pipeline: all 9 steps operational and unit-tested
- [ ] HDR merge produces visibly better dynamic range than single exposure
- [ ] Specular analysis produces per-zone oiliness scores
- [ ] Scale normalization computes correct px/mm (validated against known distances)
- [ ] Multi-angle zone stitching selects best angle per zone
- [ ] Progress tracking: ghost silhouette aligns follow-up scans
- [ ] Progressive onboarding: scan 1 = frontal, scan 2 = multi-angle, scan 3 = self-assessment
- [ ] CI pipeline green with all new tests
- [ ] EAS Build produces working preview + production builds
