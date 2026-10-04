# SkinSense Phase 1: MVP — Core Loop

**Duration:** Weeks 4–11 (8 weeks)
**Goal:** The smallest thing that delivers value. A user takes a photo, the backend analyzes it, and they get a personalized skincare routine. Nothing fancy — but the code is clean, typed, tested, and deployable.
**Depends on:** Phase 0 (Foundation) fully complete — monorepo, CI/CD, database, auth, S3, BullMQ, Sentry all operational.
**Team:** Solo developer, LLM-assisted.

---

## 1. Capture Flow

### 1.1 Camera Screen

- **Camera:** Front camera only (back camera is Phase 3). Use `expo-camera` with `CameraView`.
- **Face Detection Guide:** Translucent oval overlay centered on screen. Face detection runs on the camera preview (expo-camera's built-in `onFacesDetected`). The capture button is **disabled** until a face is detected within the guide oval (check face bounds intersect with guide bounds).
- **Framing Feedback:** Text above the oval updates in real-time:
  - No face: "Position your face in the oval"
  - Face too far: "Move closer"
  - Face too close: "Move back a bit"
  - Face off-center: "Center your face"
  - Ready: "Hold still..." → auto-capture after 1 second of stable positioning, OR enable manual capture button

### 1.2 Client-Side Quality Check

Before uploading, validate the captured frame:

- **Blur Detection:** Compute Laplacian variance on a downscaled grayscale version of the image. If variance < threshold (empirically ~100 on a 512px image), reject: "Photo is blurry — hold your phone steady and try again."
- **Exposure Check:** Compute histogram of the image. If >50% of pixels are in the bottom 10% (underexposed) or top 10% (overexposed), reject: "Lighting is too dark/bright — try a different spot."
- **Implementation:** These checks run in the inference worker as a pre-validation step, OR on-device using `expo-image-manipulator` to get pixel data. For MVP, do it server-side (simpler) — send the image, worker rejects bad images before running full analysis.

### 1.3 Image Compression & Upload

- Compress with `expo-image-manipulator`: JPEG quality 0.9, max dimension 2048px (resize if larger)
- Request presigned S3 URL: `POST /api/upload/presign` → `{ uploadUrl, key, expiresAt }`
- Upload directly to S3 via the presigned URL (PUT request with image binary)
- On upload success, send analysis request to backend with the S3 key

### 1.4 Upload UX

- Progress indicator during upload (indeterminate spinner — presigned PUT doesn't report progress reliably on all platforms)
- States: "Uploading your photo..." → "Analyzing your skin..." → "Building your routine..." → Results
- If upload fails: retry button with "Upload failed — check your connection and try again"
- Timeout: if no result within 30 seconds, show error with retry option

---

## 2. Questionnaire Flow

### 2.1 Screen Structure

Four screens, presented sequentially on first launch. Responses stored locally (Zustand + MMKV persistence) and sent with every scan request.

**Screen 1 — Skin Type**

```
What's your skin type?

[ Oily ]       — Shiny by midday, enlarged pores
[ Dry ]        — Tight, flaky, sometimes rough
[ Combination ]— Oily T-zone, dry cheeks
[ Normal ]     — Balanced, few issues
[ Sensitive ]  — Reacts easily, often red or irritated

[ Not sure? ] → link to a 3-question mini-quiz that infers type
```

Single-select. Store as `SkinType` enum.

**Screen 2 — Top Concerns**

```
What are your main skin concerns? (Select up to 3)

[ ] Acne & breakouts
[ ] Redness & irritation
[ ] Dark spots & uneven tone
[ ] Dryness & dehydration
[ ] Fine lines & wrinkles
[ ] Oiliness & shine
[ ] Rough texture
[ ] Sensitivity
```

Multi-select, max 3. Store as `SkinConcern[]`.

**Screen 3 — Allergies & Sensitivities**

```
Any ingredient sensitivities? (Select all that apply)

[ ] Fragrance / Parfum
[ ] Essential oils
[ ] Salicylic acid
[ ] Benzoyl peroxide
[ ] Retinol / Retinoids
[ ] AHA (Glycolic, Lactic acid)
[ ] Niacinamide
[ ] Vitamin C (L-Ascorbic Acid)
[ ] None that I know of

+ Add custom: [____________]
```

Multi-select. Store as `string[]`. Custom entries added to the array.

**Screen 4 — Demographics**

```
About you:

Age range:  [ Teens ] [ 20s ] [ 30s ] [ 40s ] [ 50s+ ]

[ ] I am pregnant or breastfeeding
```

Single-select age + boolean toggle. Store as `{ ageRange: string, isPregnant: boolean }`.

### 2.2 Edit Later

All questionnaire responses are editable from Settings → Skin Profile. Changes apply to the next scan, not retroactively.

### 2.3 Data Shape

```typescript
// packages/types/src/questionnaire.ts
import { z } from 'zod';

export const SkinTypeSchema = z.enum(['OILY', 'DRY', 'COMBINATION', 'NORMAL', 'SENSITIVE']);
export const SkinConcernSchema = z.enum(['ACNE', 'REDNESS', 'PIGMENTATION', 'DRYNESS', 'FINE_LINES', 'OILINESS', 'TEXTURE', 'SENSITIVITY']);
export const AgeRangeSchema = z.enum(['TEENS', 'TWENTIES', 'THIRTIES', 'FORTIES', 'FIFTIES_PLUS']);

export const QuestionnaireSchema = z.object({
  skinType: SkinTypeSchema,
  concerns: z.array(SkinConcernSchema).min(1).max(3),
  allergies: z.array(z.string()),
  ageRange: AgeRangeSchema,
  isPregnant: z.boolean(),
});

export type Questionnaire = z.infer<typeof QuestionnaireSchema>;
```

---

## 3. Backend Analysis Pipeline

### 3.1 Scan Creation & Job Dispatch

**Endpoint:** `POST /api/scans`

```typescript
// Request
const CreateScanRequestSchema = z.object({
  imageKey: z.string(),         // S3 key from presign
  questionnaire: QuestionnaireSchema,
});

// Response (HTTP 202 Accepted)
const CreateScanResponseSchema = z.object({
  scanId: z.string(),
  status: z.literal('PENDING'),
});
```

**Logic:**
1. Create `Scan` record in PostgreSQL (status: PENDING)
2. Enqueue BullMQ job with `ScanJobPayload`:

```typescript
export const ScanJobPayloadSchema = z.object({
  scanId: z.string(),
  userId: z.string(),
  imageKey: z.string(),
  questionnaire: QuestionnaireSchema,
  modelVersion: z.string().default('v1.0'),
});
```

3. Return `scanId` immediately

### 3.2 WebSocket for Progressive Updates

**Protocol:** Socket.IO on NestJS (or plain WebSocket gateway)

Client connects with `scanId` after receiving 202 response:

```typescript
// Client
socket.emit('subscribe', { scanId });

// Server pushes events:
socket.emit('scan:progress', {
  scanId,
  stage: 'segmentation' | 'detection' | 'scoring' | 'routine',
  progress: 0.0–1.0,
  data?: Partial<ScanResult>,
});

socket.emit('scan:complete', {
  scanId,
  result: ScanResult,
});

socket.emit('scan:error', {
  scanId,
  error: string,
  retryable: boolean,
});
```

Timeout: if server sends no event for 30 seconds, client shows error with retry.

### 3.3 Inference Worker (FastAPI)

The inference worker is a Python FastAPI service that consumes BullMQ jobs (via a Redis bridge — a small Node.js process that dequeues BullMQ jobs and POSTs them to FastAPI, or the FastAPI worker reads directly from Redis).

**Pipeline Steps:**

#### Step 1: Image Download & Validation
- Download image from S3 using the key
- Decode JPEG
- Validate dimensions (minimum 512×512, maximum 4096×4096)
- **Quality gate:** Laplacian variance for blur, histogram for exposure. If below threshold, return error to client: "Photo quality too low — please retake."

#### Step 2: Face Detection & Landmark Extraction
- **MediaPipe Face Mesh:** 468 landmarks
- If no face detected: return error "No face detected"
- If multiple faces: use the largest (closest) face
- Extract key landmarks for zone segmentation

#### Step 3: Zone Segmentation
Partition face into 5 zones using landmark coordinates:

| Zone | Landmarks | Description |
|------|-----------|-------------|
| Forehead | Top of face above eyebrows | Landmarks 10, 67, 109, 151, 338, 297 boundary |
| Nose | Nose bridge to tip | Landmarks 6, 197, 195, 5, 4 region |
| Left Cheek | Left of nose to ear | Landmarks between nose and left ear |
| Right Cheek | Right of nose to ear | Landmarks between nose and right ear |
| Chin | Below lower lip | Landmarks 152, 377, 400, 176, 148 region |
| Periorbital | Under-eye area | Landmarks around each eye socket |

Create binary masks for each zone. Crop zone regions from the full image for per-zone analysis.

#### Step 4: Per-Zone Detection

**Acne Detection:**
- Model: YOLOv8-nano fine-tuned on acne detection (ISIC + DermNet + custom dataset)
- Input: zone crop, 640×640 resized
- Output: bounding boxes with class (papule, pustule, comedone) and confidence
- Scoring: count lesions weighted by severity (comedone=1, papule=2, pustule=3), normalize to 0–100

**Redness / Erythema:**
- Convert zone to HSV: measure H channel in red range (0–10° and 170–180°), compute mean saturation in red pixels
- Convert to LAB: measure a* channel mean and variance (higher a* = more red)
- Combined score: weighted average of HSV red-pixel percentage and LAB a* deviation from neutral, normalized to 0–100

**Pigmentation / Hyperpigmentation:**
- Convert zone to LAB
- Compute L* channel statistics: mean, std dev
- Detect dark spots: pixels where L* is >2 standard deviations below zone mean
- Score: percentage of zone area that is dark-spot × intensity of deviation, normalized to 0–100

**Texture / Pore Visibility:**
- Convert zone to grayscale
- Apply Gabor filter bank: 4 orientations (0°, 45°, 90°, 135°) × 3 frequencies (low, mid, high)
- Compute mean energy response across all filter outputs
- Higher energy = more visible texture features (pores, roughness, fine lines)
- Normalize to 0–100

**Dryness:**
- Analyze texture patterns specific to dryness: fine crosshatch lines, flaking patterns
- Combined with questionnaire self-report (sensitivity + dryness concern)
- Score: weighted combination of texture dryness indicators + self-report, normalized to 0–100

#### Step 5: Severity Scoring

Per zone, compute scores for each concern (0–100, higher = more severe).

**Skin Health Score (composite):**
```python
weights = {
    'acne': 0.25,
    'redness': 0.20,
    'pigmentation': 0.20,
    'texture': 0.15,
    'dryness': 0.10,
    'oiliness': 0.10,
}

# Average severity across all zones per concern
avg_severity = {}
for concern in weights:
    avg_severity[concern] = mean(zone_scores[zone][concern] for zone in zones)

# Weighted severity (0-100, higher = worse)
weighted_severity = sum(avg_severity[c] * weights[c] for c in weights)

# Invert to health score (0-100, higher = better)
skin_health_score = round(100 - weighted_severity)
```

#### Step 6: Push Progressive Updates

After each step, push a WebSocket event so the client can render partial results:

1. After segmentation: `{ stage: 'segmentation', data: { zones: ['forehead', ...] } }`
2. After detection: `{ stage: 'detection', data: { zoneScores: {...} } }`
3. After scoring: `{ stage: 'scoring', data: { skinHealthScore: 72 } }`
4. After routine generation: `{ stage: 'complete', data: fullScanResult }`

### 3.4 Result Schema

```typescript
// packages/types/src/scan-result.ts
export const FindingSchema = z.object({
  id: z.string(),
  type: z.enum(['papule', 'pustule', 'comedone', 'dark_spot', 'redness_patch', 'texture_rough', 'dryness_patch']),
  zone: z.enum(['forehead', 'nose', 'left_cheek', 'right_cheek', 'chin', 'periorbital']),
  severity: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  boundingBox: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }).optional(),
});

export const ZoneScoreSchema = z.object({
  acne: z.number().min(0).max(100),
  redness: z.number().min(0).max(100),
  pigmentation: z.number().min(0).max(100),
  texture: z.number().min(0).max(100),
  dryness: z.number().min(0).max(100),
  oiliness: z.number().min(0).max(100),
});

export const ScanResultSchema = z.object({
  version: z.number().default(1),
  skinHealthScore: z.number().min(0).max(100),
  zoneScores: z.record(z.string(), ZoneScoreSchema),
  findings: z.array(FindingSchema),
  metadata: z.object({
    modelVersion: z.string(),
    processingTimeMs: z.number(),
    imageQualityScore: z.number().optional(),
    // Extensible: future phases add barrierScore, skinAge, differential, etc.
  }).passthrough(),
});

export type ScanResult = z.infer<typeof ScanResultSchema>;
```

---

## 4. Routine Engine

### 4.1 Architecture

The routine engine is a **pure function** with zero side effects:

```typescript
function generateRoutine(
  scanResult: ScanResult,
  userProfile: UserProfile,
  products: Product[],
): Routine
```

Fully unit-testable. This function will grow through Phases 3–7. Build it right from the start.

### 4.2 Concern-to-Ingredient Mapping

```typescript
// packages/types/src/routine-engine.ts
export const CONCERN_INGREDIENT_MAP: Record<SkinConcern, IngredientRecommendation[]> = {
  ACNE: [
    { ingredient: 'Salicylic Acid', concentration: '2%', step: 'TREATMENT', priority: 1 },
    { ingredient: 'Niacinamide', concentration: '5-10%', step: 'SERUM', priority: 2 },
    { ingredient: 'Benzoyl Peroxide', concentration: '2.5%', step: 'TREATMENT', priority: 3 },
  ],
  REDNESS: [
    { ingredient: 'Niacinamide', concentration: '5-10%', step: 'SERUM', priority: 1 },
    { ingredient: 'Centella Asiatica', concentration: null, step: 'SERUM', priority: 2 },
    { ingredient: 'Azelaic Acid', concentration: '10%', step: 'TREATMENT', priority: 3 },
  ],
  PIGMENTATION: [
    { ingredient: 'Vitamin C', concentration: '10-15%', step: 'SERUM', priority: 1 },
    { ingredient: 'Niacinamide', concentration: '5%', step: 'SERUM', priority: 2 },
    { ingredient: 'Alpha Arbutin', concentration: '2%', step: 'SERUM', priority: 3 },
  ],
  DRYNESS: [
    { ingredient: 'Hyaluronic Acid', concentration: null, step: 'SERUM', priority: 1 },
    { ingredient: 'Ceramides', concentration: null, step: 'MOISTURIZER', priority: 2 },
    { ingredient: 'Squalane', concentration: null, step: 'MOISTURIZER', priority: 3 },
  ],
  FINE_LINES: [
    { ingredient: 'Retinol', concentration: '0.025-0.05%', step: 'TREATMENT', priority: 1 },
    { ingredient: 'Peptides', concentration: null, step: 'SERUM', priority: 2 },
    { ingredient: 'Vitamin C', concentration: '15%', step: 'SERUM', priority: 3 },
  ],
  OILINESS: [
    { ingredient: 'Niacinamide', concentration: '10%', step: 'SERUM', priority: 1 },
    { ingredient: 'Salicylic Acid', concentration: '0.5-2%', step: 'TREATMENT', priority: 2 },
    { ingredient: 'Zinc PCA', concentration: null, step: 'SERUM', priority: 3 },
  ],
  TEXTURE: [
    { ingredient: 'Glycolic Acid', concentration: '5-8%', step: 'TREATMENT', priority: 1 },
    { ingredient: 'Retinol', concentration: '0.025%', step: 'TREATMENT', priority: 2 },
    { ingredient: 'Niacinamide', concentration: '5%', step: 'SERUM', priority: 3 },
  ],
  SENSITIVITY: [
    { ingredient: 'Centella Asiatica', concentration: null, step: 'SERUM', priority: 1 },
    { ingredient: 'Ceramides', concentration: null, step: 'MOISTURIZER', priority: 2 },
    { ingredient: 'Aloe Vera', concentration: null, step: 'MOISTURIZER', priority: 3 },
  ],
};
```

### 4.3 Conflict Rules

```typescript
export const CONFLICT_RULES: ConflictRule[] = [
  {
    ingredientA: 'Retinol',
    ingredientB: 'Glycolic Acid',
    resolution: 'SEPARATE_AM_PM', // Retinol PM, AHA AM
    reason: 'Both are exfoliating — combined use causes irritation',
  },
  {
    ingredientA: 'Retinol',
    ingredientB: 'Salicylic Acid',
    resolution: 'SEPARATE_AM_PM',
    reason: 'Can cause excessive dryness when layered',
  },
  {
    ingredientA: 'Benzoyl Peroxide',
    ingredientB: 'Retinol',
    resolution: 'ALTERNATE_NIGHTS',
    reason: 'BP degrades retinol molecules on contact',
  },
  {
    ingredientA: 'Vitamin C',
    ingredientB: 'Niacinamide',
    resolution: 'SEPARATE_AM_PM',
    reason: 'Low-pH vitamin C may cause flushing with niacinamide (debated but cautious)',
  },
  {
    ingredientA: 'Vitamin C',
    ingredientB: 'Retinol',
    resolution: 'SEPARATE_AM_PM',
    reason: 'Different optimal pH — vitamin C AM (photoprotection), retinol PM',
  },
  {
    ingredientA: 'Glycolic Acid',
    ingredientB: 'Salicylic Acid',
    resolution: 'NEVER_SAME_ROUTINE',
    reason: 'Double acid exfoliation destroys barrier',
  },
];
```

### 4.4 Routine Generation Algorithm

```
1. RANK concerns by average severity across zones (highest first)
2. SELECT top 3 concerns for active treatment
3. MAP each concern to target ingredients (from CONCERN_INGREDIENT_MAP)
4. DEDUPLICATE ingredients (Niacinamide appears for multiple concerns — include once)
5. CHECK conflicts:
   a. For each pair of selected ingredients, check CONFLICT_RULES
   b. Apply resolution: SEPARATE_AM_PM → assign one to AM, other to PM
   c. ALTERNATE_NIGHTS → mark in routine calendar (Phase 4, for now just note it)
   d. NEVER_SAME_ROUTINE → drop the lower-priority ingredient, pick next alternative
6. FILTER allergens: remove any ingredient in user's allergies list
7. PREGNANCY CHECK: if isPregnant, remove Retinol, high-concentration Salicylic Acid (>2%), Benzoyl Peroxide
8. BUILD step arrays:
   AM: Cleanser → [Toner] → [Serum/Treatment] → Moisturizer → SPF
   PM: Cleanser → [Toner] → [Serum/Treatment] → Moisturizer
   (Steps in brackets are optional — only included if a target ingredient maps to that step)
9. MATCH products: for each step + target ingredient, query product catalog:
   - Filter by: category matches step, ingredients contain target active, skinType matches user
   - Exclude products containing user allergens
   - Sort by: match score (how many target ingredients the product covers)
   - Select top match
10. RETURN Routine { amSteps, pmSteps }
```

### 4.5 Routine Data Shape

```typescript
export const RoutineStepSchema = z.object({
  order: z.number(),
  stepType: z.enum(['CLEANSER', 'TONER', 'SERUM', 'TREATMENT', 'MOISTURIZER', 'SPF', 'EYE_CREAM']),
  productId: z.string(),
  productName: z.string(),
  productBrand: z.string(),
  productImageUrl: z.string().optional(),
  targetIngredients: z.array(z.string()),
  whyChosen: z.string(), // One sentence: "Targets your acne with Salicylic Acid 2%"
  applicationNote: z.string().optional(), // "Apply pea-sized amount"
});

export const RoutineSchema = z.object({
  id: z.string(),
  scanResultId: z.string(),
  version: z.number().default(1),
  amSteps: z.array(RoutineStepSchema),
  pmSteps: z.array(RoutineStepSchema),
  conflicts: z.array(z.object({
    ingredientA: z.string(),
    ingredientB: z.string(),
    resolution: z.string(),
  })).optional(),
});
```

---

## 5. Product Catalog

### 5.1 Seed Data Requirements

200+ products across all categories and price tiers. Each product must have:
- Accurate INCI ingredient list (not made up)
- Active ingredient identification with concentration where known
- Correct skin type suitability
- Accurate price tier
- Real product image URL (or placeholder)

**Distribution:**

| Category | Count | Budget | Mid | Premium |
|----------|-------|--------|-----|---------|
| Cleanser | 30 | 10 | 10 | 10 |
| Toner | 20 | 7 | 7 | 6 |
| Serum | 40 | 13 | 14 | 13 |
| Treatment | 30 | 10 | 10 | 10 |
| Moisturizer | 35 | 12 | 12 | 11 |
| SPF | 25 | 8 | 9 | 8 |
| Eye Cream | 10 | 3 | 4 | 3 |
| Mask | 10 | 3 | 4 | 3 |

### 5.2 Product Filtering API

**Endpoint:** `GET /api/products`

```typescript
const ProductFilterSchema = z.object({
  skinType: SkinTypeSchema.optional(),
  concerns: z.array(SkinConcernSchema).optional(),
  priceTier: z.enum(['BUDGET', 'MID', 'PREMIUM']).optional(),
  category: z.enum(['CLEANSER', 'TONER', 'SERUM', 'TREATMENT', 'MOISTURIZER', 'SPF', 'EYE_CREAM', 'MASK']).optional(),
  excludeIngredients: z.array(z.string()).optional(),
  search: z.string().optional(),
  limit: z.number().default(20),
  offset: z.number().default(0),
});
```

**Database query:** Compound WHERE with GIN index on `ingredients` array for efficient allergen exclusion:

```sql
CREATE INDEX idx_products_ingredients ON products USING GIN (ingredients);
CREATE INDEX idx_products_skin_types ON products USING GIN ("skinTypes");
CREATE INDEX idx_products_concerns ON products USING GIN (concerns);
```

---

## 6. Results Screen

### 6.1 Layout

```
┌──────────────────────────────┐
│  Skin Health Score: 72       │  ← Large number, color-coded
│  ↑ +5 from last scan        │  ← Trend (if previous scan exists)
├──────────────────────────────┤
│                              │
│     [  Face Zone Map  ]      │  ← 2D illustration, zones colored
│                              │
├──────────────────────────────┤
│  Top Concerns                │
│  🔴 Acne (T-zone): 65/100   │  ← Severity bars
│  🟡 Redness (cheeks): 40    │
│  🟢 Texture: 25             │
├──────────────────────────────┤
│  [AM Routine]  [PM Routine]  │  ← Tab switcher
│                              │
│  1. Cleanser                 │
│     CeraVe Foaming Cleanser  │  ← Product card
│     "Gentle clean without..  │
│                              │
│  2. Serum                    │
│     The Ordinary Niacin...   │
│     "Targets oiliness and.." │
│  ...                         │
└──────────────────────────────┘
```

### 6.2 Zone Map Component

- 2D face illustration (SVG) with 5 tappable zones
- Each zone filled with severity color: green (0–25), yellow (26–50), orange (51–75), red (76–100)
- Severity = worst concern score in that zone
- Tap zone → bottom sheet with per-concern breakdown:

```
┌── Forehead ──────────────────┐
│  Acne:          ████████░░ 78│
│  Redness:       ███░░░░░░░ 30│
│  Pigmentation:  ██░░░░░░░░ 22│
│  Texture:       █████░░░░░ 45│
│  Dryness:       █░░░░░░░░░ 12│
└──────────────────────────────┘
```

### 6.3 Product Cards

Each product card shows:
- Product image (or category icon placeholder)
- Product name + brand
- Price tier badge (💰 Budget / 💎 Mid / ✨ Premium)
- "Why this product?" expandable: "Contains Salicylic Acid 2% which targets your acne (severity: 65)"
- Tap card → full product detail screen with ingredient list

### 6.4 Routine Step Display

AM and PM routines in separate tabs. Each step shows:
1. Step number and type (e.g., "1. Cleanser")
2. Product card (see above)
3. Brief application note (e.g., "Use morning and evening")

---

## 7. Progress Tracking (Basic)

### 7.1 Scan History

- **Home screen:** List of past scans, most recent first
- Each card shows: date, thumbnail, Skin Health Score, score delta from previous scan
- Tap → view full results for that scan

### 7.2 Comparison

- "Compare" button on any scan → select another scan → side-by-side view
- Two scan thumbnails aligned vertically
- Per-zone score delta table below: "Forehead acne: 78 → 65 (-13)"
- Simple numeric comparison (no image alignment, no normalization — that's Phase 3)

---

## 8. API Contracts (Complete)

### 8.1 Upload

```
POST /api/upload/presign
Request: { contentType: 'image/jpeg', fileSize: number }
Response: { uploadUrl: string, key: string, expiresAt: string }
Errors: 401 Unauthorized, 413 File too large (>5MB)
```

### 8.2 Scans

```
POST /api/scans
Request: { imageKey: string, questionnaire: Questionnaire }
Response: { scanId: string, status: 'PENDING' } (HTTP 202)
Errors: 400 Validation, 401 Unauthorized

GET /api/scans
Response: { scans: Scan[], total: number }
Errors: 401 Unauthorized

GET /api/scans/:id
Response: { scan: Scan, result?: ScanResult }
Errors: 401, 404

GET /api/scans/:id/result
Response: { result: ScanResult }
Errors: 401, 404, 409 (scan not complete)
```

### 8.3 Products

```
GET /api/products
Query: ProductFilter (see Section 5.2)
Response: { products: Product[], total: number }

GET /api/products/:id
Response: { product: Product }
Errors: 404
```

### 8.4 Routines

```
GET /api/routines/latest
Response: { routine: Routine }
Errors: 401, 404 (no routine yet)

GET /api/routines/:id
Response: { routine: Routine }
Errors: 401, 404
```

### 8.5 User Profile

```
GET /api/profile
Response: { user: UserProfile }

PATCH /api/profile
Request: Partial<Questionnaire>
Response: { user: UserProfile }
```

### 8.6 Adherence

```
POST /api/adherence
Request: { routineId: string, date: string, amCompleted: boolean, pmCompleted: boolean }
Response: { log: AdherenceLog }

GET /api/adherence?from=date&to=date
Response: { logs: AdherenceLog[] }
```

---

## 9. Database Schema Additions

Phase 0 schema is the baseline. Phase 1 additions:

```prisma
// Add to User model:
model User {
  // ... existing fields
  ageRange    String?   // TEENS, TWENTIES, etc.
  concerns    String[]  // top 3 concerns
}
```

No new tables needed — Phase 0 schema covers Phase 1 requirements.

---

## 10. Testing Requirements

### 10.1 Unit Tests (must-have)

- **Routine engine:**
  - `generateRoutine()` returns valid AM/PM steps for every concern combination
  - Conflict rules correctly separate retinol + AHA to AM/PM
  - Pregnancy mode excludes retinol, high-conc salicylic acid, benzoyl peroxide
  - Allergen filtering excludes products with user-listed ingredients
  - Product matching selects products covering the most target ingredients
- **Severity scoring:**
  - `computeSkinHealthScore()` returns 0–100
  - Empty zone scores → health score of 100
  - Maximum severity → health score near 0
- **Zod schemas:**
  - Valid payloads pass validation
  - Invalid payloads (missing fields, wrong types) fail with specific errors

### 10.2 Integration Tests (must-have)

- `POST /api/scans` with valid payload → creates Scan record, enqueues job, returns 202
- `GET /api/products?skinType=OILY&excludeIngredients=fragrance` → returns filtered products, none containing fragrance
- `POST /api/upload/presign` → returns valid presigned URL
- `PATCH /api/profile` → updates user, rejects invalid skin types

### 10.3 E2E Smoke Test (one flow)

Using Maestro or manual testing:
1. Open app → onboarding → complete questionnaire
2. Navigate to scan tab → capture photo
3. See upload progress → analysis progress → results screen
4. Results show Skin Health Score + zone map + routine
5. Tap zone → see breakdown
6. View AM/PM routine with product cards

---

## 11. What's NOT in Phase 1

These features exist in the full spec but are explicitly deferred:

- ❌ Back camera / multi-angle / HDR / flash capture (Phase 3)
- ❌ Color calibration / environment quality gate (Phase 3)
- ❌ Self-assessment / touch-to-mark (Phase 3)
- ❌ Fitzpatrick adaptation / differential diagnosis (Phase 4)
- ❌ Barrier health / skin age / treatment dependency graph (Phase 4)
- ❌ Product scanning / phased introduction / personalized learning (Phase 4)
- ❌ RAW / LiDAR / multispectral / rPPG / elasticity (Phase 5)
- ❌ Gamification / achievements / diary / AR overlay (Phase 6)
- ❌ Natural language reports / dermatologist export (Phase 6)
- ❌ Health app integration / multi-profile / predictive viz (Phase 7)
- ❌ Onboarding flow (Phase 2 — Phase 1 goes straight to questionnaire)
- ❌ Error state polish / loading state polish (Phase 2)
- ❌ Settings screen (Phase 2)
- ❌ Medical disclaimers (Phase 2)

Do NOT build these. If the LLM suggests adding any of these, stop and defer to the appropriate phase spec.

---

## 12. Deliverable Checklist

- [ ] Front camera capture with face detection guide works on iOS and Android
- [ ] Client-side quality check rejects blurry/dark photos
- [ ] Image uploads to S3 via presigned URL
- [ ] Questionnaire flow stores responses locally and sends with scan
- [ ] Backend creates Scan record and enqueues BullMQ job
- [ ] Inference worker downloads image, runs zone segmentation + detection, returns results
- [ ] WebSocket pushes progressive updates (segmentation → detection → scoring → complete)
- [ ] Results screen shows Skin Health Score + zone map + AM/PM routine
- [ ] Zone tap shows per-concern breakdown
- [ ] Routine engine generates valid routines with conflict resolution
- [ ] Product catalog has 200+ seeded products, filterable by skin type/concern/budget/allergens
- [ ] Scan history lists past scans with scores
- [ ] Basic comparison: select two scans, see score deltas
- [ ] All Zod schemas validate correctly (unit tests pass)
- [ ] Routine engine unit tests pass (all concern combos, conflicts, pregnancy, allergens)
- [ ] Integration tests pass (scan creation, product filtering, profile update)
- [ ] CI pipeline green (lint + typecheck + test)
- [ ] Internal TestFlight / preview build deployed
- [ ] Sentry capturing errors from both client and backend
