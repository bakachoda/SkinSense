# Phase 5: Advanced Capture & Hardware

**SkinSense Project**  
**Solo Developer, LLM-Assisted**  
**Duration:** Weeks 36–43 (8 weeks)  
**Goal:** Exploit every phone sensor for comprehensive skin analysis

---

## Overview

Phase 5 transforms SkinSense from a standard camera app into a mobile dermatology lab. All features are hardware-dependent and optional—the app must gracefully degrade across device tiers while unlocking advanced capabilities on flagship hardware.

**Key Principles:**
- Check capabilities, not device models
- Graceful degradation for missing sensors
- Battery and thermal awareness
- Cross-device progress tracking
- Background upload for large files
- On-device ML for instant feedback

---

## 1. Device Capability Detection

### 1.1 DeviceCapabilities Interface

```typescript
interface DeviceCapabilities {
  // Camera sensors
  hasRAW: boolean;
  hasLiDAR: boolean;
  hasTrueDepth: boolean;
  hasMacro: boolean;
  hasTelephoto: boolean;
  hasUltrawide: boolean;
  hasMultiCam: boolean;
  
  // Video capabilities
  has240fps: boolean;
  has120fps: boolean;
  has60fps: boolean;
  
  // Stabilization
  hasOIS: boolean;
  hasEIS: boolean;
  
  // Resolution
  maxPhotoResolution: { width: number; height: number };
  maxVideoResolution: { width: number; height: number };
  nativeSensorResolution: { width: number; height: number };
  
  // Other sensors
  hasGyroscope: boolean;
  hasAccelerometer: boolean;
  hasBarometer: boolean;
  
  // ML capabilities
  hasNeuralEngine: boolean; // iOS
  hasNNAPI: boolean; // Android
  coreMLVersion?: string;
  tfLiteVersion?: string;
  
  // Display
  maxDisplayBrightness: number; // nits
  supportsWideColor: boolean;
}
```

### 1.2 Detection Implementation

**Expo Module API:**
```typescript
// modules/device-caps/index.ts
import * as DeviceCaps from 'expo-device-capabilities';

const caps = await DeviceCaps.detectCapabilities();
// Cache result in AsyncStorage, re-detect on major OS updates
```

**iOS Native (Swift):**
```swift
// Check specific camera features
let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back)
let hasRAW = device?.activeFormat.supportedRawPhotoPixelFormatTypes.count > 0
let hasLiDAR = ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh)
```

**Android Native (Kotlin):**
```kotlin
// Camera2 characteristics
val cameraManager = context.getSystemService(CameraManager::class.java)
val characteristics = cameraManager.getCameraCharacteristics(cameraId)
val capabilities = characteristics.get(CameraCharacteristics.REQUEST_AVAILABLE_CAPABILITIES)
val hasRAW = capabilities?.contains(CameraMetadata.REQUEST_AVAILABLE_CAPABILITIES_RAW) == true
```

### 1.3 Graceful Degradation Table

| Feature | Tier 1 (Flagship) | Tier 2 (Mid-Range) | Tier 3 (Budget) |
|---------|-------------------|---------------------|-----------------|
| **Base Analysis** | Full precision | Standard precision | Standard precision |
| **RAW Capture** | ProRAW/DNG | JPEG only | JPEG only |
| **Resolution** | 48-200MP native | 12MP binned | 12MP binned |
| **LiDAR Depth** | Full 3D mesh | TrueDepth (front) | Photometric stereo |
| **Macro** | Dedicated lens | Digital zoom | Digital zoom |
| **Telephoto** | 3-5x optical | 2x digital | 2x digital |
| **Multi-Cam** | Simultaneous | Sequential | Sequential |
| **240fps Video** | 240fps 1080p | 120fps 720p | 60fps 720p |
| **Multispectral** | Full sequence | RGB only | RGB only |
| **On-Device ML** | Neural Engine | GPU | CPU (slow) |
| **Photometric Stereo** | GPU-accelerated | GPU-accelerated | GPU-accelerated |
| **rPPG** | Full resolution | Downsampled | Downsampled |

### 1.4 Feature Availability UI

```typescript
// Show which advanced features are available on this device
<FeatureCard 
  title="3D Skin Topology"
  available={caps.hasLiDAR}
  fallback="Using photometric stereo instead"
  learnMoreUrl="/features/3d-analysis"
/>
```

---

## 2. Device Camera Profiling

### 2.1 First-Launch Calibration

On first app launch, capture a calibration sequence:
1. **White balance reference:** User photographs white paper under current lighting
2. **Noise floor measurement:** 5 dark frames with lens cap simulation
3. **Resolution test:** Capture test pattern if available
4. **Color accuracy:** Standard color checker if detected
5. **Distortion mapping:** Checkerboard pattern for lens distortion

**Calibration data stored per-device:**
```typescript
interface DeviceProfile {
  deviceId: string; // Anonymized hardware hash
  osVersion: string;
  
  // Color calibration
  whiteBalanceMatrix: number[][]; // 3x3 transform
  colorAccuracyDeltaE: number; // Average error vs reference
  
  // Noise characteristics
  noiseFloorRGB: [number, number, number]; // Per-channel noise at ISO 100
  readNoiseElectrons: number;
  darkCurrentRate: number; // e-/pixel/second
  
  // Optical properties
  geometricDistortion: number[]; // Polynomial coefficients
  chromaticAberration: number; // Pixels of CA at edges
  vignettingProfile: number[][]; // 2D falloff map
  
  // Dynamic range
  measuredDynamicRange: number; // stops
  clippingThreshold: number; // 0-255 value where sensor clips
  
  // Performance
  thermalThrottleTemp: number; // Celsius
  batteryDrainRate: number; // mAh per minute of capture
  
  calibrationDate: string;
  calibrationLightingLux: number;
}
```

### 2.2 Adaptive Thresholds

Use device profile to adjust analysis thresholds:
```typescript
// Example: Acne detection threshold varies by camera noise
const baseThreshold = 0.7;
const noisePenalty = profile.noiseFloorRGB[0] * 0.1; // Higher noise = higher threshold
const adaptiveThreshold = baseThreshold + noisePenalty;
```

### 2.3 Minimum Hardware Gate

Block core features on devices below minimum spec:
```typescript
const MINIMUM_REQUIREMENTS = {
  cameraResolution: { width: 1920, height: 1080 },
  osVersion: { ios: '15.0', android: '10.0' },
  ram: 3 * 1024 * 1024 * 1024, // 3GB
  storageAvailable: 500 * 1024 * 1024, // 500MB
};

if (!meetsMinimumRequirements(caps)) {
  showIncompatibleDeviceMessage();
}
```

### 2.4 Cross-Device Bridging

User switches from iPhone 13 Pro to iPhone 16 Pro:
- **Progress tracking:** Scan count, body map, trends preserved
- **Recalibration required:** New device profile created
- **Threshold migration:** Apply adjustment factor to historical thresholds
- **Notification:** "We've detected a new device. Your analysis may be more accurate now!"

---

## 3. RAW Capture

### 3.1 Platform APIs

**iOS ProRAW (12-bit or 14-bit DNG):**
```swift
let photoSettings = AVCapturePhotoSettings(rawPixelFormatType: kCVPixelFormatType_14Bayer_RGGB)
photoSettings.processedFileType = .dng
photoOutput.capturePhoto(with: photoSettings, delegate: self)
```

**Android DNG (Camera2 RAW_SENSOR):**
```kotlin
val characteristics = cameraManager.getCameraCharacteristics(cameraId)
val dngCreator = DngCreator(characteristics, captureResult)
dngCreator.writeImage(outputStream, rawImage)
```

### 3.2 Expo Module API

```typescript
// JS interface
import * as RawCamera from './modules/raw-camera';

const result = await RawCamera.captureRAW({
  exposure: 'auto',
  iso: 100,
  whiteBalance: 'daylight',
  includeJPEG: true, // Also capture processed JPEG for comparison
});

// Returns: { rawUri: string, jpegUri: string, metadata: ExifData }
```

### 3.3 Upload Strategy

RAW files are 20-50MB. Upload both RAW and JPEG:
```typescript
const upload = await FileUpload.create({
  files: [
    { uri: result.rawUri, type: 'image/dng', purpose: 'analysis' },
    { uri: result.jpegUri, type: 'image/jpeg', purpose: 'preview' },
  ],
  priority: 'high',
  wifi_only: true, // Default for RAW
});
```

### 3.4 Backend RAW Processing

**Custom demosaicing pipeline (Python):**
```python
import rawpy
import numpy as np

def process_raw_for_skin(dng_path):
    with rawpy.imread(dng_path) as raw:
        # Disable noise reduction and sharpening
        rgb = raw.postprocess(
            demosaic_algorithm=rawpy.DemosaicAlgorithm.AHD,
            use_camera_wb=True,
            no_auto_bright=True,
            output_bps=16,
            gamma=(1, 1),  # Linear tone curve
            noise_reduction=0,
            sharpness=0,
        )
    
    # Custom tone mapping preserving skin detail
    rgb = apply_skin_tone_map(rgb)
    return rgb
```

**Benefits:**
- No in-camera beauty mode artifacts
- Minimal noise reduction preserves texture
- Linear gamma reveals subtle redness variations
- Higher bit depth for better threshold tuning

### 3.5 RAW Feature Gate

```typescript
// Only show RAW option on compatible devices
{caps.hasRAW && (
  <Toggle
    label="RAW Capture (Most Accurate)"
    sublabel="Requires WiFi upload, 25-50MB per scan"
    value={settings.useRAW}
    onChange={setUseRAW}
  />
)}
```

---

## 4. Full Resolution Capture (48-200MP)

### 4.1 Native Sensor Access

Many phones pixel-bin to 12MP by default. Access full sensor:

**iOS (48MP on iPhone 14/15 Pro):**
```swift
// AVCaptureDevice.Format with maximum dimensions
if let format = device.formats.first(where: { 
    CMVideoFormatDescriptionGetDimensions($0.formatDescription).width >= 8064 
}) {
    try device.lockForConfiguration()
    device.activeFormat = format
    device.unlockForConfiguration()
}
```

**Android (50-200MP on Samsung S21+, Xiaomi 12T):**
```kotlin
val streamConfigurationMap = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP)
val maxSize = streamConfigurationMap.getOutputSizes(ImageFormat.JPEG).maxByOrNull { it.width * it.height }
```

### 4.2 Use Cases

- **Pore-level detail:** 48MP captures individual pore walls at 20cm distance
- **Body scans:** Large moles/birthmarks at high resolution for edge detail
- **Clinical archival:** Maximum detail for dermatologist review

### 4.3 Performance Considerations

```typescript
// High-res capture is slow and memory-intensive
const HIGH_RES_CONFIG = {
  maxMemoryMB: 500, // Decoded bitmap size
  captureTimeoutMs: 5000,
  requireTripod: true, // Warn user to stabilize
  thermalCheck: true, // Abort if device is hot
};
```

### 4.4 Downsampling Strategy

Backend downsamples to multiple resolutions:
- **12MP:** Standard analysis, fast processing
- **24MP:** Pore-level analysis
- **48MP+:** Clinical archive only, not analyzed by default

---

## 5. LiDAR Depth

### 5.1 iOS ARKit Point Cloud

```swift
import ARKit

let arConfig = ARWorldTrackingConfiguration()
arConfig.sceneReconstruction = .meshWithClassification
arConfig.frameSemantics = .sceneDepth

let arSession = ARSession()
arSession.run(arConfig)

// In delegate callback
func session(_ session: ARSession, didUpdate frame: ARFrame) {
    guard let depthMap = frame.sceneDepth?.depthMap else { return }
    // depthMap is CVPixelBuffer of kCVPixelFormatType_DepthFloat32
}
```

### 5.2 Expo Module API

```typescript
import * as DepthCamera from './modules/depth-camera';

const result = await DepthCamera.captureLiDAR({
  duration: 2, // seconds, collect multiple frames
  requireStability: true,
});

// Returns: { 
//   depthMapUri: string,  // 16-bit PNG
//   confidenceMapUri: string, 
//   pointCloudUri: string,  // PLY file
//   rgbUri: string,
// }
```

### 5.3 16-bit Depth Map Format

```typescript
// Depth encoded as 16-bit PNG (0-65535 maps to 0-5 meters)
// Upload alongside RGB frame
const upload = await FileUpload.create({
  files: [
    { uri: result.rgbUri, type: 'image/jpeg', purpose: 'rgb' },
    { uri: result.depthMapUri, type: 'image/png', purpose: 'depth' },
    { uri: result.pointCloudUri, type: 'application/octet-stream', purpose: 'pointcloud' },
  ],
  scanId: scan.id,
});
```

### 5.4 Backend Analysis

**Raised vs Flat Lesion Classification:**
```python
def classify_lesion_topology(rgb, depth, mask):
    lesion_depth = depth[mask > 0]
    surrounding_depth = depth[dilate(mask, 10) & ~mask]
    
    height_diff = np.mean(surrounding_depth) - np.mean(lesion_depth)
    
    if height_diff > 0.5:  # mm
        return 'raised'
    elif height_diff < -0.5:
        return 'depressed'
    else:
        return 'flat'
```

**Height Measurement:**
```python
def measure_lesion_height(depth, mask):
    # Fit plane to surrounding skin
    surrounding_points = depth[dilate(mask, 15) & ~mask]
    baseline_plane = fit_plane(surrounding_points)
    
    # Measure max deviation from plane
    lesion_points = depth[mask > 0]
    height_mm = np.max(lesion_points - baseline_plane)
    return height_mm
```

**3D Mesh Generation (ICP Alignment):**
```python
import open3d as o3d

def create_3d_mesh(point_clouds_over_time):
    """Align multiple LiDAR captures for higher resolution mesh"""
    meshes = []
    for i, pcd in enumerate(point_clouds_over_time):
        if i == 0:
            aligned = pcd
        else:
            # ICP alignment to first capture
            reg = o3d.pipelines.registration.registration_icp(
                pcd, meshes[0], max_correspondence_distance=0.002
            )
            aligned = pcd.transform(reg.transformation)
        meshes.append(aligned)
    
    # Merge and reconstruct surface
    combined = o3d.geometry.PointCloud()
    for mesh in meshes:
        combined += mesh
    
    # Poisson surface reconstruction
    mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(
        combined, depth=9
    )
    return mesh
```

**Pore Depth Measurement:**
```python
def analyze_pore_depth(depth, pore_mask):
    """Measure depth of individual pores"""
    labeled_pores = label(pore_mask)
    pore_depths = []
    
    for region in regionprops(labeled_pores):
        pore_pixels = depth[labeled_pores == region.label]
        surrounding = depth[dilate(labeled_pores == region.label, 5) & (labeled_pores == 0)]
        depth_mm = np.mean(surrounding) - np.mean(pore_pixels)
        pore_depths.append(depth_mm)
    
    return {
        'mean_depth_mm': np.mean(pore_depths),
        'max_depth_mm': np.max(pore_depths),
        'pore_count': len(pore_depths),
    }
```

### 5.5 Clinical Insights

- **Raised moles:** Melanoma risk factor (asymmetric elevation)
- **Atrophic scars:** Depth measurement for treatment tracking
- **Active acne:** Papule height vs surrounding skin
- **Pore congestion:** Visible depth change when clogged

---

## 6. TrueDepth Front Camera

### 6.1 ARKit Face Tracking

```swift
let arConfig = ARFaceTrackingConfiguration()
arConfig.isWorldTrackingEnabled = false

func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
    guard let faceAnchor = anchors.first as? ARFaceAnchor else { return }
    
    // Access depth map
    let geometry = faceAnchor.geometry
    let vertices = geometry.vertices  // 3D positions of ~30,000 points
    let textureCoordinates = geometry.textureCoordinates
}
```

### 6.2 Use Cases

- **Facial topology:** Forehead lines, nasolabial folds
- **Symmetry analysis:** Left vs right cheek depth
- **Acne tracking:** Papule height on face
- **Expression lines:** Depth changes during animation

### 6.3 Resolution vs LiDAR

- **TrueDepth:** ~30,000 IR dots, structured light
- **LiDAR:** ~100,000+ points, time-of-flight
- **Accuracy:** TrueDepth 1-2mm, LiDAR 0.5-1mm

Both use same backend analysis pipeline.

---

## 7. Macro Lens

### 7.1 Lens Detection

```swift
// iOS: Detect macro-capable cameras
let macroDevice = AVCaptureDevice.default(.builtInDualWideCamera, for: .video, position: .back)
if macroDevice?.isGeometricDistortionCorrectionSupported == true {
    // iPhone 13 Pro+ macro mode
}
```

```kotlin
// Android: Check for macro lens in multi-camera setup
val lensInfo = characteristics.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS)
// Macro typically has focal length < 2.5mm
```

### 7.2 Auto-Switch Logic

```typescript
// Switch to macro when user gets very close
const distance = estimateDistanceFromFocusPosition(focusMetadata);

if (distance < 10 && caps.hasMacro) {
  await switchToMacroLens();
  showToast('Macro mode: 2-4cm optimal distance');
}
```

### 7.3 Focus Range

**Standard lens:** 10cm - infinity  
**Macro lens:** 2-4cm optimal, resolves features down to ~50 microns

**Use cases:**
- Individual pore walls visible
- Sebaceous filaments in pores
- Fine wrinkle texture
- Hair follicle detail

---

## 8. Telephoto Lens

### 8.1 Optical Zoom

```swift
// Switch to telephoto (3x on iPhone 15 Pro)
let telephotoDevice = AVCaptureDevice.default(.builtInTelephotoCamera, for: .video, position: .back)
```

### 8.2 Use Case: Close-Up from Distance

Problem: Users too close to skin causes harsh lighting and distortion.

Solution: Use 3x telephoto from 25-30cm distance:
- More flattering lighting angle
- Reduced lens distortion
- Better depth of field
- Natural perspective

### 8.3 Recommendation Logic

```typescript
// Suggest telephoto for facial scans
if (scanRegion === 'face' && caps.hasTelephoto) {
  return {
    lens: 'telephoto',
    distance: 28, // cm
    reasoning: 'Telephoto from 28cm provides more flattering lighting',
  };
}
```

---

## 9. Multi-Camera Simultaneous Capture

### 9.1 iOS AVCaptureMultiCamSession

```swift
// Capture from wide + telephoto simultaneously
let multiCamSession = AVCaptureMultiCamSession()

let wideDevice = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back)
let telephotoDevice = AVCaptureDevice.default(.builtInTelephotoCamera, for: .video, position: .back)

// Add both to session (iOS 13+)
```

### 9.2 Android Camera2 Multi-Cam

```kotlin
// Android 10+ supports simultaneous multi-camera
val cameraManager = context.getSystemService(CameraManager::class.java)
val concurrentCameras = cameraManager.concurrentCameraIds

if (concurrentCameras.size >= 2) {
    // Open both cameras and sync frames
}
```

### 9.3 Use Cases

**Stereo depth (wide + ultrawide):**
- Compute disparity for depth without LiDAR
- Fallback on Android devices

**Multi-scale capture (wide + telephoto):**
- Context shot + detail shot in single press
- Backend stitches for body map

**Front + back (selfie mode):**
- Capture user's face + screen reflection simultaneously
- Verify multispectral lighting conditions

### 9.4 Fallback: Sequential Capture

```typescript
// If simultaneous not supported, capture in rapid sequence
const captures = await Promise.all([
  CameraAPI.capture({ lens: 'wide' }),
  CameraAPI.capture({ lens: 'telephoto' }),
]);

// Warn user if moved between shots
if (detectMotion(captures)) {
  showWarning('Movement detected. Please retake.');
}
```

---

## 10. 240fps Elasticity Video

### 10.1 Capture Flow

1. User selects facial scan
2. Prompt: "We'll record a 5-second video. Follow the instructions on screen."
3. Countdown: 3...2...1
4. Instructions appear:
   - 0-1s: Raise eyebrows
   - 1-2s: Hold neutral
   - 2-3s: Smile wide
   - 3-4s: Hold neutral
   - 4-5s: Relax

5. Record at 240fps (fallback 120fps on older devices)

### 10.2 Platform APIs

**iOS (240fps at 1080p):**
```swift
let format = device.formats.first(where: { format in
    format.videoSupportedFrameRateRanges.contains(where: { $0.maxFrameRate >= 240 })
})
device.activeFormat = format
device.activeVideoMinFrameDuration = CMTime(value: 1, timescale: 240)
```

**Android (high-speed video):**
```kotlin
val highSpeedConfigs = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP)
    ?.highSpeedVideoSizes

// Request 240fps
```

### 10.3 Backend Analysis

**Optical Flow Per Zone:**
```python
import cv2

def analyze_skin_elasticity(video_path):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    # Define facial zones
    zones = {
        'forehead': [(x1, y1), (x2, y2)],
        'cheeks': [(x1, y1), (x2, y2)],
        'under_eye': [(x1, y1), (x2, y2)],
    }
    
    results = {}
    for zone_name, coords in zones.items():
        # Track motion in zone during smile (frames 2s-3s)
        smile_start = int(fps * 2)
        smile_end = int(fps * 3)
        
        # Extract frames and compute optical flow
        flow_vectors = []
        prev_frame = None
        
        for frame_idx in range(smile_start, smile_end):
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = cap.read()
            if prev_frame is not None:
                flow = cv2.calcOpticalFlowFarneback(
                    cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY),
                    cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY),
                    None, 0.5, 3, 15, 3, 5, 1.2, 0
                )
                zone_flow = crop_flow(flow, coords)
                flow_vectors.append(np.mean(np.abs(zone_flow)))
            prev_frame = frame
        
        # Analyze recovery phase (frames 3s-5s)
        recovery_start = int(fps * 3)
        recovery_end = int(fps * 5)
        
        displacement_over_time = []
        for frame_idx in range(recovery_start, recovery_end):
            # Measure return to baseline
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = cap.read()
            displacement = compute_displacement_from_baseline(frame, baseline_frame, coords)
            displacement_over_time.append(displacement)
        
        # Fit exponential decay: y = A * exp(-t / tau)
        time_points = np.linspace(0, 2, len(displacement_over_time))
        tau, A = fit_exponential_decay(time_points, displacement_over_time)
        
        results[zone_name] = {
            'recovery_time_constant_ms': tau * 1000,
            'peak_displacement_mm': A,
            'elasticity_score': compute_score(tau, A),
        }
    
    return results
```

**Firmness Scoring:**
```python
def compute_elasticity_score(tau_ms, peak_displacement_mm):
    """
    Younger skin: tau ~200ms, low displacement
    Aged skin: tau ~600ms, high displacement
    """
    if tau_ms < 250 and peak_displacement_mm < 2:
        return 'Excellent'
    elif tau_ms < 400 and peak_displacement_mm < 4:
        return 'Good'
    elif tau_ms < 550:
        return 'Fair'
    else:
        return 'Poor'
```

### 10.4 Clinical Relevance

- **Collagen degradation:** Slower recovery = less collagen
- **Sun damage:** Cheek elasticity correlates with cumulative UV
- **Hydration:** Dehydrated skin has delayed snap-back
- **Dynamic vs static lines:** Lines that appear during expression vs rest

---

## 11. Front-Camera Multispectral

### 11.1 Lighting Sequence

User in dim environment (<200 lux):

1. **Red (625nm):** Screen flashes red at max brightness
2. **Green (530nm):** Screen flashes green
3. **Blue (470nm):** Screen flashes blue
4. **Violet (410nm):** Screen flashes violet (if OLED supports)

Front camera captures one frame per color (~3s total).

### 11.2 Implementation

```typescript
// Check ambient light
const lux = await LightSensor.getCurrentLux();

if (lux > 200) {
  showError('Please move to a darker room for multispectral analysis');
  return;
}

// Capture sequence
const captures = [];
for (const color of ['#FF0000', '#00FF00', '#0000FF', '#9400D3']) {
  await Screen.setBrightness(1.0);
  await Screen.setBackgroundColor(color);
  await wait(100); // Let screen settle
  
  const frame = await FrontCamera.capture({ iso: 100, shutterSpeed: '1/60' });
  captures.push({ color, frame });
  
  await Screen.setBackgroundColor('#000000');
  await wait(100);
}

return captures;
```

### 11.3 Spectral Analysis

**Red (625nm) - Subsurface Vascular:**
```python
red_penetration = 1.5  # mm
# Highlights veins, rosacea, inflammation beneath epidermis
vascular_map = red_channel - (green_channel * 0.5)
```

**Green (530nm) - Peak Hemoglobin Absorption:**
```python
# Active blood vessels, post-inflammatory erythema
hemoglobin_map = green_channel - (red_channel + blue_channel) / 2
```

**Blue (470nm) - Melanin & Superficial:**
```python
# Hyperpigmentation, age spots, shallow vessels
melanin_map = blue_channel - red_channel
```

**Violet (410nm) - P. acnes Porphyrin Fluorescence:**
```python
# P. acnes bacteria fluoresce under violet light
acne_bacteria_map = violet_channel - (blue_channel * 0.7)
# High signal = active bacterial infection
```

### 11.4 LCD Polarization Analysis

LCD screens emit polarized light. Skin reflects/depolarizes differently:
```python
# Capture with vertical polarization (natural LCD), then rotate phone 90°
depolarization_ratio = intensity_vertical / intensity_horizontal

# Oily skin depolarizes more (higher ratio)
# Dry skin depolarizes less (ratio ~1)
```

### 11.5 Safety & Limitations

- **Brightness warning:** "This will flash bright colors. Do not use if sensitive to light."
- **Not clinical grade:** Fun feature, not diagnostic
- **Works best:** OLED screens (purer colors), dark environments

---

## 12. On-Device ML Models

### 12.1 Model Inventory

| Model | Task | Size | Platform | Latency |
|-------|------|------|----------|---------|
| **BiSeNet** | Hair segmentation | 4.2MB | CoreML / TFLite | 120ms |
| **MakeupClassifier** | Detect makeup regions | 1.8MB | CoreML / TFLite | 50ms |
| **SkinToneEstimator** | Fitzpatrick scale | 0.9MB | CoreML / TFLite | 30ms |
| **FaceLandmarks** | 68-point detection | 2.1MB | CoreML / TFLite | 40ms |
| **IlluminationNet** | Lighting quality | 1.5MB | CoreML / TFLite | 60ms |

**Total on-device model size:** ~10MB

### 12.2 CoreML (iOS)

```swift
import CoreML

let model = try! BiSeNetModel(configuration: .init())

func segmentHair(frame: CVPixelBuffer) -> CVPixelBuffer {
    let input = BiSeNetModelInput(image: frame)
    let output = try! model.prediction(input: input)
    return output.mask  // CVPixelBuffer, 1 = hair, 0 = not hair
}
```

### 12.3 TensorFlow Lite (Android)

```kotlin
import org.tensorflow.lite.Interpreter

val interpreter = Interpreter(loadModelFile("bisenet.tflite"))

fun segmentHair(frame: Bitmap): Bitmap {
    val input = preprocessFrame(frame)  // 224x224x3
    val output = Array(1) { Array(224) { IntArray(224) } }
    
    interpreter.run(input, output)
    return postprocessMask(output)
}
```

### 12.4 Expo Module API

```typescript
import * as OnDeviceML from './modules/on-device-ml';

// JS interface abstracts platform differences
const mask = await OnDeviceML.segmentHair(frameUri);
// Returns: { maskUri: string, confidence: number }

const hasMakeup = await OnDeviceML.detectMakeup(frameUri);
// Returns: { hasMakeup: boolean, regions: Array<{ type: 'foundation' | 'blush' | 'eyeshadow', confidence: number }> }
```

### 12.5 Use Cases

**Hair Segmentation:**
- Exclude hair regions from facial skin analysis
- Auto-crop to face boundary
- Detect if hair is covering scan area

**Makeup Detection:**
- Warn user: "Makeup detected. For best results, scan clean skin."
- Adjust analysis thresholds (foundation hides redness/pigmentation)

**Skin Tone Estimation:**
- Fitzpatrick scale I-VI classification
- Auto-adjust exposure and white balance
- Personalize thresholds (e.g., hyperpigmentation detection varies by skin tone)

**Face Landmarks:**
- Auto-frame facial regions (forehead, cheeks, jawline)
- Track alignment across scans

**Illumination Quality:**
- Detect harsh shadows, overexposure, color casts
- Prompt user to adjust lighting before capture

### 12.6 Model Download Strategy

Models bundled in app binary to avoid first-launch download. Update via EAS Update if models change.

---

## 13. Photometric Stereo

### 13.1 Principle

Recover surface normals from shading variations as light source moves. Works on ALL devices (no special hardware).

**Capture:** Record 2-second video while user slowly rotates phone. Gyroscope logs orientation.

**Analysis:** Backend reconstructs 3D surface from how shading changes with light angle.

### 13.2 Capture Flow

```typescript
const { uri, gyroData } = await PhotometricStereo.capture({
  duration: 2,
  fps: 60,
  flashMode: 'on',  // Phone's LED torch
  instructions: 'Slowly rotate the camera in a circle',
});

// gyroData: [{ timestamp, roll, pitch, yaw }, ...]
```

### 13.3 Backend Reconstruction

```python
import numpy as np

def photometric_stereo(images, light_directions):
    """
    images: List of frames (H, W, 3)
    light_directions: List of (x, y, z) unit vectors
    
    Returns: normal_map (H, W, 3), albedo_map (H, W)
    """
    n_images = len(images)
    height, width = images[0].shape[:2]
    
    # Reshape to (H*W, n_images)
    I = np.array([img.reshape(-1, 3).mean(axis=1) for img in images]).T
    
    # Light matrix (n_images, 3)
    L = np.array(light_directions)
    
    # Solve I = albedo * (N . L) for each pixel
    # N = (L^T L)^-1 L^T I
    normals = np.linalg.lstsq(L, I.T, rcond=None)[0].T
    
    # Normalize and compute albedo
    albedo = np.linalg.norm(normals, axis=1)
    normals = normals / (albedo[:, None] + 1e-8)
    
    normal_map = normals.reshape(height, width, 3)
    albedo_map = albedo.reshape(height, width)
    
    return normal_map, albedo_map
```

### 13.4 Use Cases

**Early papules (acne):**
- Detect bumps before visible redness
- Surface normal deviation from smooth skin

**Shallow scarring:**
- Ice pick scars too shallow for LiDAR
- Normal map reveals fine texture changes

**Pore depth (no LiDAR):**
- Fallback for devices without depth sensor
- Shading in pores reveals depth

**Fine lines:**
- Subpixel wrinkle detection from shading

### 13.5 Advantages

- Works on 100% of devices
- No special hardware required
- Fast capture (2 seconds)
- Low data upload (60 frames ~5MB)

### 13.6 Limitations

- Requires stable hand rotation
- Less accurate than LiDAR (especially absolute depth)
- Shiny/oily skin causes specular highlights (need to filter)

---

## 14. rPPG Blood Flow Imaging

### 14.1 Principle

Photoplethysmography (PPG) detects blood volume changes from skin color. Heart pumps blood → capillaries expand → skin reddens slightly. Extract per-pixel cardiac signal from video.

### 14.2 Capture Requirements

- 30+ fps video
- 10+ second duration
- Stable camera (tripod or hand rest)
- Ambient or diffuse lighting (no direct sunlight)

### 14.3 Algorithm

```python
def compute_rppg_map(video_frames):
    """
    video_frames: (T, H, W, 3) RGB video
    Returns: perfusion_map (H, W), frequency_map (H, W)
    """
    T, H, W, C = video_frames.shape
    
    # Extract green channel (peak hemoglobin absorption)
    green = video_frames[:, :, :, 1]  # (T, H, W)
    
    # Detrend per-pixel (remove slow lighting changes)
    green_detrended = scipy.signal.detrend(green, axis=0)
    
    # Bandpass filter for cardiac frequencies (0.7-4 Hz = 42-240 bpm)
    fs = 30  # fps
    green_filtered = bandpass_filter(green_detrended, lowcut=0.7, highcut=4, fs=fs, axis=0)
    
    # Compute FFT per pixel
    fft = np.fft.rfft(green_filtered, axis=0)
    freqs = np.fft.rfftfreq(T, 1/fs)
    
    # Find peak frequency in cardiac range
    cardiac_band = (freqs >= 0.7) & (freqs <= 4)
    power = np.abs(fft) ** 2
    
    peak_freq_idx = np.argmax(power[cardiac_band, :, :], axis=0)
    peak_freq = freqs[cardiac_band][peak_freq_idx]  # (H, W)
    
    # Perfusion amplitude (SNR of cardiac signal)
    cardiac_power = power[cardiac_band, :, :].max(axis=0)
    noise_power = power[~cardiac_band, :, :].mean(axis=0)
    perfusion_snr = 10 * np.log10(cardiac_power / (noise_power + 1e-8))
    
    return perfusion_snr, peak_freq * 60  # Convert Hz to BPM
```

### 14.4 Clinical Applications

**Perfusion Map:**
- High perfusion = active inflammation (red signal)
- Low perfusion = poor circulation, old scars

**Active Inflammation Detection:**
```python
# Compare perfusion in lesion vs surrounding skin
lesion_perfusion = perfusion_map[mask > 0].mean()
healthy_perfusion = perfusion_map[dilate(mask, 20) & ~mask].mean()

if lesion_perfusion > healthy_perfusion * 1.5:
    inflammation_status = 'Active'
else:
    inflammation_status = 'Resolved'
```

**Vascular Rosacea:**
- Diffuse high perfusion on cheeks
- Visible capillary networks in perfusion map

**Sub-clinical Inflammation:**
- No visible redness, but elevated perfusion
- Early warning for breakouts

### 14.5 Limitations

- Requires stable capture (motion artifacts)
- Doesn't work on very dark skin (low light return)
- Affected by ambient light flicker (LED bulbs)

---

## 15. Focus Stacking

### 15.1 Principle

Merge multiple images at different focus distances to create all-in-focus composite. Useful for extreme close-ups where depth of field is shallow.

### 15.2 Capture

```typescript
// Record 1-second video while sweeping focus from near to far
const { uri } = await FocusStack.capture({
  duration: 1,
  focusStart: 0.0,  // Near
  focusEnd: 1.0,    // Far
  fps: 30,
});

// Extracts 30 frames at different focus distances
```

### 15.3 Backend Merging

```python
import cv2

def focus_stack(images):
    """
    images: List of frames at different focus distances
    Returns: all_in_focus composite
    """
    # Compute Laplacian (edge detection) for each image
    laplacians = [cv2.Laplacian(cv2.cvtColor(img, cv2.COLOR_RGB2GRAY), cv2.CV_64F) for img in images]
    
    # Build focus map: for each pixel, which image is sharpest?
    laplacians = np.array([np.abs(lap) for lap in laplacians])
    focus_map = np.argmax(laplacians, axis=0)  # (H, W)
    
    # Gaussian pyramid blending for smooth transitions
    composite = np.zeros_like(images[0])
    for i, img in enumerate(images):
        mask = (focus_map == i).astype(np.float32)
        mask_blurred = cv2.GaussianBlur(mask, (21, 21), 11)
        composite += img * mask_blurred[:, :, None]
    
    return composite.astype(np.uint8)
```

### 15.4 Use Cases

- **Macro close-ups:** Entire pore in focus despite shallow DOF
- **Uneven surfaces:** Nose, chin, cheekbones all sharp
- **Clinical archival:** Maximum detail for dermatologist review

---

## 16. Predictive Analytics

### 16.1 Breakout Prediction Model

Combine multiple signals to predict acne breakout 24-72 hours ahead:

```python
def predict_breakout(user_data):
    features = {
        'oiliness_trend': compute_7day_trend(user_data.oiliness_history),
        'congestion_score': user_data.latest_scan.congestion,
        'bacteria_level': user_data.latest_scan.multispectral_bacteria,
        'menstrual_cycle_day': user_data.cycle_day,  # If tracked
        'hrv_trend': compute_3day_trend(user_data.hrv_history),  # If integrated with health app
        'sleep_quality': user_data.sleep_hours,  # If tracked
        'stress_level': user_data.self_reported_stress,
    }
    
    # XGBoost model trained on historical data
    breakout_probability = model.predict_proba(features)[1]
    
    if breakout_probability > 0.7:
        return {
            'risk': 'High',
            'timeframe': '24-48 hours',
            'confidence': breakout_probability,
            'recommendation': 'Apply salicylic acid spot treatment tonight',
        }
    else:
        return {'risk': 'Low', 'confidence': 1 - breakout_probability}
```

### 16.2 Sun Damage Trajectory

```python
def project_sun_damage(scan_history):
    """Extrapolate sun damage accumulation"""
    ages = [scan.user_age_years for scan in scan_history]
    damage_scores = [scan.sun_damage_score for scan in scan_history]
    
    # Fit power law: damage = A * age^B
    from scipy.optimize import curve_fit
    params, _ = curve_fit(lambda t, a, b: a * t ** b, ages, damage_scores)
    
    # Project to age 50, 60, 70
    future_ages = [50, 60, 70]
    projections = [params[0] * age ** params[1] for age in future_ages]
    
    return {
        'current_age': ages[-1],
        'current_score': damage_scores[-1],
        'projected_age_50': projections[0],
        'projected_age_60': projections[1],
        'projected_age_70': projections[2],
        'message': f'At current rate, you will reach severe damage by age {compute_severe_age(params)}',
    }
```

### 16.3 Dehydration Forecast

```python
def forecast_dehydration(weather_api, user_location):
    """Predict skin dehydration based on weather"""
    forecast = weather_api.get_3day_forecast(user_location)
    
    risk_score = 0
    for day in forecast:
        if day.humidity < 30:
            risk_score += 2
        if day.temp_f > 90:
            risk_score += 1
        if day.wind_mph > 15:
            risk_score += 1
    
    if risk_score > 5:
        return {
            'risk': 'High',
            'recommendation': 'Increase moisturizer use. Consider a humidifier at night.',
        }
    else:
        return {'risk': 'Low'}
```

---

## 17. Background Upload Architecture

### 17.1 iOS NSURLSessionUploadTask

```swift
// Background-capable upload session
let config = URLSessionConfiguration.background(withIdentifier: "com.skinsense.uploads")
config.sessionSendsLaunchEvents = true
let session = URLSession(configuration: config, delegate: self, delegateQueue: nil)

// Queue upload
let task = session.uploadTask(with: request, fromFile: fileURL)
task.earliestBeginDate = Date().addingTimeInterval(60)  // Wait for WiFi
task.countOfBytesClientExpectsToSend = fileSize
task.countOfBytesClientExpectsToReceive = 500  // Response size
task.resume()
```

### 17.2 Android WorkManager

```kotlin
val uploadRequest = OneTimeWorkRequestBuilder<UploadWorker>()
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.UNMETERED)  // WiFi only
            .setRequiresBatteryNotLow(true)
            .build()
    )
    .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.MINUTES)
    .build()

WorkManager.getInstance(context).enqueue(uploadRequest)
```

### 17.3 Priority Queue

```typescript
interface UploadJob {
  id: string;
  scanId: string;
  files: Array<{ uri: string; type: string; sizeBytes: number }>;
  priority: 'high' | 'normal' | 'low';
  wifiOnly: boolean;
  createdAt: Date;
}

// High priority: RAW files, LiDAR scans
// Normal: Standard JPEG scans
// Low: Historical re-uploads for recalibration
```

### 17.4 Resumable Multipart Upload

```typescript
// S3 multipart upload for large files (>5MB)
const CHUNK_SIZE = 5 * 1024 * 1024;  // 5MB chunks

async function uploadLargeFile(fileUri: string, uploadId: string) {
  const fileSize = await getFileSize(fileUri);
  const numChunks = Math.ceil(fileSize / CHUNK_SIZE);
  
  const uploadedParts = await loadProgressFromDisk(uploadId);
  
  for (let i = uploadedParts.length; i < numChunks; i++) {
    const chunk = await readFileChunk(fileUri, i * CHUNK_SIZE, CHUNK_SIZE);
    const etag = await uploadChunk(uploadId, i + 1, chunk);
    uploadedParts.push({ partNumber: i + 1, etag });
    await saveProgressToDisk(uploadId, uploadedParts);
  }
  
  await completeMultipartUpload(uploadId, uploadedParts);
}
```

### 17.5 User Feedback

```typescript
// Show upload status in scan history
<ScanCard>
  <ScanThumbnail />
  {upload.status === 'uploading' && (
    <ProgressBar value={upload.progress} />
  )}
  {upload.status === 'queued' && (
    <Text>Waiting for WiFi...</Text>
  )}
</ScanCard>
```

---

## 18. Battery & Performance

### 18.1 Battery Pre-Check

```typescript
// Warn user before starting intensive capture
const batteryLevel = await Battery.getBatteryLevel();
const isPluggedIn = await Battery.isPluggedIn();

if (batteryLevel < 0.2 && !isPluggedIn) {
  showWarning('Battery low. Advanced capture may drain battery quickly. Consider plugging in.');
}
```

### 18.2 Thermal Throttling

```swift
// iOS: Monitor thermal state
NotificationCenter.default.addObserver(
    forName: ProcessInfo.thermalStateDidChangeNotification,
    object: nil,
    queue: nil
) { _ in
    let state = ProcessInfo.processInfo.thermalState
    if state == .serious || state == .critical {
        abortCapture()
        showWarning("Device is overheating. Please let it cool down.")
    }
}
```

```kotlin
// Android: Monitor temperature
val powerManager = context.getSystemService(PowerManager::class.java)
if (powerManager.currentThermalStatus >= PowerManager.THERMAL_STATUS_SEVERE) {
    abortCapture()
}
```

### 18.3 Incremental Memory Management

```typescript
// Don't load all frames into memory at once
async function processVideoInChunks(videoUri: string) {
  const frameCount = await getFrameCount(videoUri);
  const CHUNK_SIZE = 30;  // Process 30 frames at a time
  
  for (let offset = 0; offset < frameCount; offset += CHUNK_SIZE) {
    const frames = await extractFrames(videoUri, offset, CHUNK_SIZE);
    await processFrames(frames);
    // Frames deallocated after processing
  }
}
```

### 18.4 GPU / Neural Engine Delegation

```swift
// CoreML with Neural Engine
let config = MLModelConfiguration()
config.computeUnits = .all  // Use Neural Engine if available

let model = try! BiSeNetModel(configuration: config)
```

```kotlin
// TFLite with GPU delegate
val options = Interpreter.Options()
options.addDelegate(GpuDelegate())

val interpreter = Interpreter(modelFile, options)
```

### 18.5 Performance Targets

| Operation | Target Latency | Max Memory |
|-----------|----------------|------------|
| Standard capture | <2s | 200MB |
| RAW capture | <5s | 500MB |
| LiDAR capture | <3s | 300MB |
| 240fps video | <6s | 400MB |
| Multispectral | <10s | 250MB |
| On-device ML inference | <200ms | 100MB |

---

## 19. App Size & Model Download

### 19.1 Binary Size Target

**Goal:** <80MB app binary

**Breakdown:**
- React Native core: ~30MB
- Expo modules: ~15MB
- Native camera code: ~8MB
- On-device ML models: ~10MB
- Assets (UI, fonts): ~5MB
- Other dependencies: ~12MB

### 19.2 First-Launch Model Download

**Large models not bundled in binary:**
- Backend analysis models (not needed on device)
- Optional feature models (downloaded on demand)

**First-launch download:**
```typescript
// Download core models (~150MB) on first launch
async function downloadCoreModels() {
  const models = [
    { name: 'skin-segmentation', url: '...', size: 45 * 1024 * 1024 },
    { name: 'lesion-detector', url: '...', size: 62 * 1024 * 1024 },
    { name: 'quality-classifier', url: '...', size: 38 * 1024 * 1024 },
  ];
  
  for (const model of models) {
    await downloadWithProgress(model.url, model.name, (progress) => {
      setDownloadProgress(progress);
    });
  }
}
```

### 19.3 Per-Feature Lazy Download

```typescript
// Download advanced feature models only when user enables them
if (user.enabledFeatures.includes('rppg') && !isModelDownloaded('rppg')) {
  await downloadModel('rppg', { size: 12 * 1024 * 1024 });
}
```

### 19.4 EAS Update for Thresholds

**Don't bundle analysis thresholds in binary.** Deliver via EAS Update:
```typescript
// expo-updates will fetch latest thresholds JSON
import { updates } from 'expo-updates';

await updates.fetchUpdateAsync();
const thresholds = await fetch('https://cdn.skinsense.ai/thresholds-v2.json').then(r => r.json());
```

**Benefits:**
- Update thresholds without app store review
- A/B test different threshold values
- Hotfix false positive rates

---

## 20. Schema Changes

### 20.1 Scan Table

Add columns for advanced capture metadata:

```sql
ALTER TABLE scans ADD COLUMN capture_mode TEXT;  -- 'standard' | 'raw' | 'lidar' | 'multispectral' | '240fps'
ALTER TABLE scans ADD COLUMN device_capabilities JSONB;  -- Snapshot of DeviceCapabilities
ALTER TABLE scans ADD COLUMN raw_file_url TEXT;
ALTER TABLE scans ADD COLUMN depth_map_url TEXT;
ALTER TABLE scans ADD COLUMN point_cloud_url TEXT;
ALTER TABLE scans ADD COLUMN video_url TEXT;
ALTER TABLE scans ADD COLUMN gyro_data JSONB;  -- For photometric stereo
ALTER TABLE scans ADD COLUMN multispectral_urls JSONB;  -- { red, green, blue, violet }
```

### 20.2 AnalysisResults Table

Add fields for advanced analyses:

```sql
ALTER TABLE analysis_results ADD COLUMN topology_classification TEXT;  -- 'raised' | 'flat' | 'depressed'
ALTER TABLE analysis_results ADD COLUMN lesion_height_mm REAL;
ALTER TABLE analysis_results ADD COLUMN pore_depth_mm REAL;
ALTER TABLE analysis_results ADD COLUMN elasticity_score TEXT;  -- 'excellent' | 'good' | 'fair' | 'poor'
ALTER TABLE analysis_results ADD COLUMN elasticity_recovery_time_ms REAL;
ALTER TABLE analysis_results ADD COLUMN perfusion_score REAL;
ALTER TABLE analysis_results ADD COLUMN inflammation_status TEXT;  -- 'active' | 'resolved' | 'none'
ALTER TABLE analysis_results ADD COLUMN bacteria_level REAL;  -- From violet fluorescence
ALTER TABLE analysis_results ADD COLUMN has_makeup BOOLEAN;
ALTER TABLE analysis_results ADD COLUMN hair_coverage_percent REAL;
```

### 20.3 DeviceProfiles Table

New table for per-device calibration:

```sql
CREATE TABLE device_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,  -- Anonymized hardware hash
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  os_type TEXT NOT NULL,  -- 'ios' | 'android'
  os_version TEXT NOT NULL,
  device_model TEXT,  -- Optional, for analytics
  
  capabilities JSONB NOT NULL,  -- DeviceCapabilities object
  
  -- Calibration data
  white_balance_matrix REAL[][] CHECK (array_length(white_balance_matrix, 1) = 3),
  color_accuracy_delta_e REAL,
  noise_floor_rgb REAL[] CHECK (array_length(noise_floor_rgb, 1) = 3),
  dynamic_range_stops REAL,
  
  calibration_date TIMESTAMPTZ NOT NULL,
  calibration_lighting_lux REAL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_device_profiles_device_id ON device_profiles(device_id);
CREATE INDEX idx_device_profiles_user_id ON device_profiles(user_id);
```

### 20.4 Predictions Table

Store predictive analytics:

```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  prediction_type TEXT NOT NULL,  -- 'breakout' | 'sun_damage' | 'dehydration'
  risk_level TEXT NOT NULL,  -- 'low' | 'medium' | 'high'
  confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  
  timeframe TEXT,  -- '24-48 hours', 'by age 60', etc.
  recommendation TEXT,
  
  input_features JSONB,  -- What data was used for prediction
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,  -- When prediction was confirmed or invalidated
  was_accurate BOOLEAN  -- User feedback
);

CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_type ON predictions(prediction_type);
```

---

## 21. API Updates

### 21.1 POST /api/scans (Enhanced)

**Request:**
```json
{
  "userId": "uuid",
  "bodyRegion": "face_cheek_left",
  "captureMode": "lidar",
  "deviceCapabilities": { "hasLiDAR": true, "maxResolution": {...}, ... },
  "files": [
    { "key": "rgb", "type": "image/jpeg", "sizeBytes": 5242880 },
    { "key": "depth", "type": "image/png", "sizeBytes": 2097152 },
    { "key": "pointcloud", "type": "application/octet-stream", "sizeBytes": 8388608 }
  ],
  "metadata": {
    "gyroData": [...],  // If photometric stereo
    "multispectralColors": ["red", "green", "blue", "violet"]  // If multispectral
  }
}
```

**Response:**
```json
{
  "scanId": "uuid",
  "uploadUrls": {
    "rgb": "https://s3.../presigned-url",
    "depth": "https://s3.../presigned-url",
    "pointcloud": "https://s3.../presigned-url"
  },
  "estimatedProcessingTimeMs": 45000
}
```

### 21.2 GET /api/scans/:scanId/analysis (Enhanced)

**Response includes advanced metrics:**
```json
{
  "scanId": "uuid",
  "status": "complete",
  "metrics": {
    "acne": {...},
    "wrinkles": {...},
    
    // New fields
    "topology": {
      "classification": "raised",
      "heightMm": 1.8,
      "confidence": 0.92
    },
    "poreAnalysis": {
      "averageDepthMm": 0.3,
      "maxDepthMm": 0.7,
      "congestionScore": 6.2
    },
    "elasticity": {
      "score": "good",
      "recoveryTimeMs": 350,
      "firmness": 7.5
    },
    "perfusion": {
      "score": 8.2,
      "inflammationStatus": "active",
      "bacteriaLevel": 3.1
    },
    "makeup": {
      "detected": true,
      "regions": ["foundation", "blush"]
    }
  }
}
```

### 21.3 POST /api/predictions

**Request:**
```json
{
  "userId": "uuid",
  "predictionType": "breakout",
  "inputFeatures": {
    "oilinessTrend": 0.15,
    "congestionScore": 6.5,
    "bacteriaLevel": 4.2,
    "menstrualCycleDay": 23
  }
}
```

**Response:**
```json
{
  "predictionId": "uuid",
  "riskLevel": "high",
  "confidence": 0.78,
  "timeframe": "24-48 hours",
  "recommendation": "Apply salicylic acid spot treatment tonight."
}
```

---

## 22. Testing

### 22.1 Device Matrix

Test on representative devices:

| Device | OS | RAW | LiDAR | TrueDepth | Macro | Telephoto | 240fps |
|--------|----|----|-------|-----------|-------|-----------|--------|
| iPhone 16 Pro | iOS 18 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| iPhone 13 | iOS 17 | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ |
| iPhone X | iOS 16 | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Pixel 8 Pro | Android 14 | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Samsung S24 Ultra | Android 14 | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| OnePlus 11 | Android 13 | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Budget Android | Android 12 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

### 22.2 Capability Detection Tests

```typescript
describe('DeviceCapabilities', () => {
  it('should detect LiDAR on iPhone 15 Pro', async () => {
    const caps = await DeviceCaps.detectCapabilities();
    expect(caps.hasLiDAR).toBe(true);
  });
  
  it('should gracefully handle missing capabilities', async () => {
    // Mock device without LiDAR
    mockDevice({ hasLiDAR: false });
    const mode = selectCaptureMode(caps, 'depth');
    expect(mode).toBe('photometric_stereo');  // Fallback
  });
});
```

### 22.3 Calibration Tests

```typescript
it('should generate device profile from calibration sequence', async () => {
  const frames = await captureCalibrationSequence();
  const profile = await generateDeviceProfile(frames);
  
  expect(profile.whiteBalanceMatrix).toHaveLength(3);
  expect(profile.noiseFloorRGB).toHaveLength(3);
  expect(profile.dynamicRangeStops).toBeGreaterThan(8);
});
```

### 22.4 RAW Processing Tests

```python
def test_raw_demosaicing():
    """Verify custom demosaicing preserves skin detail"""
    raw_path = 'test_data/skin_sample.dng'
    rgb = process_raw_for_skin(raw_path)
    
    # Check no over-sharpening (frequency domain test)
    fft = np.fft.fft2(rgb[:, :, 0])
    high_freq_power = np.abs(fft[100:, 100:]).mean()
    assert high_freq_power < THRESHOLD  # No artificial sharpening
```

### 22.5 Backend Analysis Tests

```python
def test_photometric_stereo_normal_recovery():
    """Verify photometric stereo reconstructs known geometry"""
    # Render synthetic sphere with known normals
    images, light_dirs = render_sphere_sequence()
    
    normal_map, albedo = photometric_stereo(images, light_dirs)
    
    # Compare to ground truth
    error = angular_error(normal_map, ground_truth_normals)
    assert error < 5  # degrees
```

### 22.6 Upload Resilience Tests

```typescript
it('should resume upload after network failure', async () => {
  const fileUri = '/path/to/large_raw.dng';
  
  // Simulate network failure after 50% upload
  mockNetworkFailure({ afterBytes: 25 * 1024 * 1024 });
  
  await expect(uploadFile(fileUri)).rejects.toThrow();
  
  // Restore network and retry
  restoreNetwork();
  await uploadFile(fileUri);
  
  // Should not re-upload first 50%
  expect(getTotalBytesUploaded()).toBeLessThan(40 * 1024 * 1024);
});
```

---

## 23. Deliverables Checklist

### 23.1 Native Modules

- [ ] `expo-device-capabilities` (iOS + Android)
- [ ] `expo-raw-camera` (iOS + Android)
- [ ] `expo-depth-camera` (iOS only, graceful Android fallback)
- [ ] `expo-multi-camera` (iOS + Android)
- [ ] `expo-on-device-ml` (CoreML + TFLite)
- [ ] `expo-photometric-stereo` (gyroscope integration)

### 23.2 JS/TS Code

- [ ] `DeviceCapabilities` type definitions
- [ ] `DeviceProfile` calibration UI flow
- [ ] Capture mode selection logic
- [ ] Advanced capture UIs (LiDAR, multispectral, 240fps)
- [ ] Upload queue manager
- [ ] Background upload status UI

### 23.3 Backend

- [ ] RAW demosaicing pipeline (Python)
- [ ] LiDAR analysis (topology, height, pore depth)
- [ ] Photometric stereo reconstruction
- [ ] rPPG perfusion mapping
- [ ] Focus stacking merge
- [ ] Elasticity video analysis (optical flow)
- [ ] Multispectral analysis (bacteria, vascular, melanin)
- [ ] Predictive models (breakout, sun damage, dehydration)

### 23.4 ML Models

- [ ] BiSeNet (hair segmentation)
- [ ] Makeup classifier
- [ ] Skin tone estimator
- [ ] Face landmarks
- [ ] Illumination quality net

### 23.5 Database

- [ ] Schema migrations (scans, analysis_results, device_profiles, predictions)
- [ ] Indexes for performance

### 23.6 API

- [ ] Enhanced `/api/scans` endpoint (multi-file upload)
- [ ] Enhanced `/api/scans/:id/analysis` response
- [ ] `/api/predictions` endpoint

### 23.7 Testing

- [ ] Device capability detection tests
- [ ] Calibration tests
- [ ] RAW processing tests
- [ ] Backend analysis tests (photometric stereo, rPPG, etc.)
- [ ] Upload resilience tests
- [ ] Cross-device threshold migration tests

### 23.8 Documentation

- [ ] Device compatibility table (public-facing)
- [ ] Calibration guide for users
- [ ] Technical spec for advanced features (for dermatologists)
- [ ] API documentation updates

---

## 24. Timeline

**Week 36-37: Native Module Development**
- Implement device capability detection
- Build RAW capture module
- Build LiDAR depth module

**Week 38: Device Profiling**
- Calibration sequence UI
- Device profile generation
- Adaptive threshold system

**Week 39-40: Advanced Capture Modes**
- Multi-camera simultaneous
- 240fps elasticity video
- Multispectral front-camera
- Photometric stereo

**Week 41: On-Device ML**
- Integrate CoreML/TFLite models
- Hair segmentation
- Makeup detection

**Week 42: Backend Analysis**
- LiDAR topology analysis
- rPPG perfusion mapping
- Elasticity video analysis
- Photometric stereo reconstruction

**Week 43: Polish & Testing**
- Cross-device testing
- Upload resilience
- Performance optimization
- Documentation

---

## 25. Success Metrics

- **Device compatibility:** >95% of flagship devices (2021+) support advanced features
- **Calibration completion rate:** >80% of users complete first-launch calibration
- **RAW adoption:** >30% of users on compatible devices enable RAW capture
- **Upload reliability:** <2% failure rate for background uploads
- **Performance:** <5s capture time for all modes (excluding 240fps video)
- **Battery impact:** <10% battery drain per 10 scans with advanced features
- **Analysis accuracy:** LiDAR height measurements within ±0.5mm of clinical standard

---

## 26. Future Extensions (Post-Phase 5)

- **Hyperspectral camera support** (e.g., Samsung ISOCELL Slim 3T2)
- **Thermal imaging** (FLIR One attachment)
- **OCT integration** (optical coherence tomography for subsurface)
- **Confocal microscopy** (iPhone attachment)
- **AI-powered real-time coaching** ("Move 2cm closer", "Rotate left slightly")
- **Cloud GPU processing** for advanced models (too large for on-device)

---

**End of Phase 5 Specification**
