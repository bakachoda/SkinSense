# SkinSense Phase 7: Ecosystem & Scale

**Duration:** Weeks 52–61 (10 weeks)
**Goal:** Connect SkinSense to the health ecosystem. Dermatologist collaboration, health app data, predictive visualization, multi-profile support. The app becomes a platform.
**Depends on:** Phase 0-6 complete (full capture + smart engine + advanced hardware + engagement/output).
**Team:** Solo developer, LLM-assisted.

---

## 1. Dermatologist Clinical Export (PDF)

### 1.1 Content

Generate a clinical-grade PDF the user shares with their dermatologist. Saves 15+ minutes of intake.

| Section | Content |
|---------|---------|
| **Patient Summary** | Age, Fitzpatrick type, measured skin type, barrier score, skin age, current medications |
| **Concern Classification** | Findings mapped to ICD-10 codes (L70.0 Acne vulgaris, L71.9 Rosacea, L81.1 Chloasma, etc.) with GAGS/IGA grades |
| **Annotated Face Map** | 2D face diagram with all findings pinned, severity color-coded |
| **Measurement History** | Longitudinal charts: concern scores, lesion counts, real-world dimensions (mm) with confidence intervals |
| **Current Products** | Full INCI ingredient list from scanned products, comedogenic/irritant ingredients highlighted in red |
| **Medication Profile** | Active medications, recent professional treatments, flagged interactions |
| **Environmental Context** | Location-based UV exposure average, water hardness, AQI |
| **Treatment Response** | Per-ingredient efficacy log (which products improved which scores over how long) |
| **Photo Timeline** | Side-by-side comparison photos (with user consent toggle) |
| **AI Confidence Notes** | Where the system was uncertain: "Asymmetric pigmentation on left cheek — recommend dermoscopy" |
| **Flagged Lesions** | Any suspicious lesion safety flags with ABCDE scores and evolution timeline |

### 1.2 Implementation

```typescript
// apps/api/src/modules/export/export.service.ts
import { generatePDF } from '@react-pdf/renderer';

interface ClinicalExportData {
  user: UserProfile;
  latestResult: ScanResult;
  scanHistory: ScanResult[];
  products: UserProduct[];
  medications: Medication[];
  environmental: EnvironmentalContext;
  treatmentLog: TreatmentResponseEntry[];
  flaggedLesions: SafetyFlag[];
}

async function generateClinicalExport(data: ClinicalExportData): Promise<Buffer> {
  const doc = buildClinicalDocument(data); // React-PDF component tree
  return generatePDF(doc);
}
```

**Alternative:** Server-side Puppeteer rendering an HTML template to PDF — more flexible styling, but heavier dependency. React-PDF is lighter and runs in Node without a browser.

### 1.3 ICD-10 Mapping

```typescript
const ICD10_MAP: Record<string, string> = {
  'comedonal_acne': 'L70.0 — Acne vulgaris',
  'inflammatory_acne': 'L70.0 — Acne vulgaris',
  'cystic_acne': 'L70.1 — Acne conglobata',
  'rosacea': 'L71.9 — Rosacea, unspecified',
  'perioral_dermatitis': 'L71.0 — Perioral dermatitis',
  'hyperpigmentation': 'L81.1 — Chloasma',
  'pih': 'L81.0 — Postinflammatory hyperpigmentation',
  'eczema': 'L30.9 — Dermatitis, unspecified',
  'seborrheic_dermatitis': 'L21.9 — Seborrheic dermatitis',
};
```

---

## 2. Dermatologist Collaboration Portal

### 2.1 Architecture

Separate Next.js app in the monorepo: `apps/portal`. Shares `@skinsense/types` with mobile and API.

```
skinsense/
├── apps/
│   ├── mobile/     # Expo
│   ├── api/        # NestJS
│   ├── portal/     # Next.js — dermatologist dashboard
│   └── inference/  # FastAPI
├── packages/
│   ├── types/      # Shared across all apps
│   └── ...
```

### 2.2 Access Model

- User generates a **secure invite link** in the mobile app (Settings → Share with Dermatologist)
- Link contains a scoped, expiring access token
- Dermatologist opens the link in a browser → read-only dashboard
- **No account creation required** for the dermatologist (zero friction)
- User can revoke access at any time
- Access expires after 90 days (renewable)

### 2.3 Portal Features

| Feature | Implementation |
|---------|---------------|
| **Scan History** | Timeline of all scans with scores, face maps, findings |
| **Score Trends** | Interactive charts (Recharts) of concern scores over time |
| **Current Routine** | AM/PM products with ingredient lists |
| **Product History** | When products were added/removed, efficacy data |
| **Diary & Notes** | User's diary entries alongside scan data |
| **In-App Notes** | Dermatologist types a note → appears in user's mobile app as a notification |
| **Photo Request** | Dermatologist requests a specific close-up → user receives prompt in the app |
| **Export Download** | Download the clinical PDF from the portal |

### 2.4 Security & Compliance

- **View-only:** Portal cannot modify user data. No writes except dermatologist notes.
- **No PHI storage in portal:** The portal is a thin client. All data is fetched from the main API on each page load via scoped JWT. Nothing cached server-side.
- **Audit log:** Every portal access logged (who, when, what was viewed)
- **HIPAA note:** Full HIPAA compliance requires a BAA (Business Associate Agreement) with hosting provider. For solo dev MVP, scope the portal as a "patient-directed data sharing tool" (patient controls access), which falls under HIPAA's personal health record exception. Consult a healthcare attorney before marketing to clinics.

### 2.5 API Endpoints (Portal-Specific)

```
// Scoped to portal access token
GET /api/portal/patient/:accessToken/summary
GET /api/portal/patient/:accessToken/scans
GET /api/portal/patient/:accessToken/scans/:scanId
GET /api/portal/patient/:accessToken/products
GET /api/portal/patient/:accessToken/medications
GET /api/portal/patient/:accessToken/export (PDF download)

POST /api/portal/patient/:accessToken/notes
Request: { message: string }
// Creates a notification visible in the user's mobile app
```

---

## 3. Dermatologist Feedback Loop

### 3.1 Diagnosis Capture

After a dermatologist visit, the app prompts (or user initiates from Settings):

```
Did your dermatologist give you a diagnosis?

[ Acne vulgaris ]
[ Rosacea ]
[ Fungal folliculitis ]
[ Perioral dermatitis ]
[ Eczema / Dermatitis ]
[ Contact dermatitis ]
[ Seborrheic dermatitis ]
[ Other: _________ ]

Did they prescribe anything?
[ Tretinoin ]
[ Adapalene ]
[ Metronidazole ]
[ Doxycycline ]
[ Spironolactone ]
[ Other: _________ ]
```

### 3.2 Treatment Reconciliation

When a prescription is entered:
1. Add to medication list (auto-applies restrictions)
2. Routine engine re-runs: prescription takes priority, OTC adjusts around it
3. Phased introduction pauses until prescription stabilizes (2–4 weeks)
4. Example: dermatologist prescribes tretinoin → OTC retinol removed from routine, niacinamide and moisturizer emphasized for tolerance support

### 3.3 Model Correction

If the system's top differential was "comedonal acne" but the dermatologist diagnosed "fungal folliculitis":
- Flag the discrepancy in the user's profile
- With explicit user consent: queue the anonymized scan data + professional correction for the training pipeline
- Over time: closes the gap on conditions the model struggles with
- Track system accuracy per condition across all consenting users

```typescript
interface DiagnosticCorrection {
  scanId: string;
  systemDifferential: string;    // what the AI said
  professionalDiagnosis: string; // what the dermatologist said
  agreed: boolean;
  consentToTraining: boolean;
  timestamp: string;
}
```

---

## 4. Health App Integration

### 4.1 Expo Module

Custom Expo Module wrapping platform-native APIs:

```typescript
// modules/skinsense-health/src/SkinSenseHealthModule.ts
interface SkinSenseHealthModule {
  requestPermissions(): Promise<HealthPermissionResult>;
  isAvailable(): Promise<boolean>;
  
  getRecentSleep(days: number): Promise<SleepData[]>;
  getHRV(days: number): Promise<HRVData[]>;
  getSteps(days: number): Promise<StepData[]>;
  getMenstrualCycle(): Promise<CycleData | null>;
  
  writeSkinHealthScore(score: number, date: string): Promise<void>;
}

interface SleepData {
  date: string;
  durationHours: number;
  quality: 'poor' | 'fair' | 'good';  // derived from stages
}

interface HRVData {
  date: string;
  avgMs: number;  // average HRV in milliseconds
  trend: 'decreasing' | 'stable' | 'increasing';
}
```

**iOS:** HealthKit via `HKHealthStore`. Read: sleep analysis, heart rate variability, step count, menstrual flow. Write: custom `HKQuantityType` for Skin Health Score.

**Android:** Health Connect via `HealthConnectClient`. Same data types with different API surface.

### 4.2 Data Usage

| Health Data | Skin Impact | How It's Used |
|------------|------------|---------------|
| Sleep (<6h avg) | Reduced cell turnover, dullness, dark circles | Contextualize dullness: "Your poor sleep this week may be contributing" |
| HRV (low) | Chronic stress → cortisol → sebum → breakouts | Correlate with acne flares: "Breakouts tend to spike during your low-HRV weeks" |
| Activity (low) | Reduced circulation | Long-term correlation factor |
| Menstrual cycle | Hormonal acne patterns | Auto-sync phase, overlay on timeline, breakout prediction input |

### 4.3 Privacy

- All health data stays on-device (read from HealthKit/Health Connect, stored locally in MMKV)
- Only derived signals (sleep quality: poor/fair/good, HRV trend: low/normal) are sent to the backend as scan metadata — never raw health data
- User can revoke health access at any time from Settings
- Health integration is fully optional, never prompted aggressively

---

## 5. Historical Photo Import

### 5.1 Flow

Settings → Progress → "Import past photos"

1. User selects selfies from camera roll (`expo-image-picker` multi-select)
2. Photos sorted by EXIF date
3. Each photo processed through a **relaxed pipeline:**
   - No calibration (unknown lighting)
   - No multi-angle (single frontal only)
   - Basic face detection + zone segmentation
   - Detection models run at reduced confidence thresholds
   - Scoring with "APPROXIMATE" confidence flag
4. Results added to the timeline with a visual indicator: "Estimated from imported photo"

### 5.2 Value

Even at low per-photo confidence, a trend across 20+ selfies over 6 months is statistically meaningful. "Your acne appears to have improved ~30% over the past 6 months." Provides a "before I started" reference.

### 5.3 Warnings

- "Comparisons between imported photos and formal scans have lower reliability"
- "Imported results are approximations — formal scans are more accurate"
- Photos without EXIF dates are rejected (can't place on timeline)

---

## 6. Multi-Profile / Family Support

### 6.1 Profile Architecture

```typescript
interface AppProfile {
  id: string;
  userId: string;          // Supabase auth user
  displayName: string;
  avatarUri?: string;
  isDefault: boolean;
  createdAt: string;
}
```

Each profile has completely separate:
- Scan history & results
- Questionnaire responses & skin type
- Product library & routine
- Medication list
- Diary entries
- Notification preferences
- Device calibration & Fitzpatrick classification

### 6.2 Profile Switching

Avatar row at the top of the home screen. Tap to switch. Each profile optionally requires biometric auth (Face ID / fingerprint) to access — prevents kids from accidentally viewing a parent's results or vice versa.

### 6.3 Family Dashboard (Optional)

A parent profile can "link" a child's profile (child must accept). Parent sees a simplified view: adherence percentage, scan reminder status, any safety flags. NOT full scan results — those are the child's private data.

---

## 7. Predictive Visualization ("What-If")

### 7.1 Technology

Diffusion model (Stable Diffusion fine-tuned on skin transformation pairs) or GAN (pix2pix trained on before/after skincare results).

The model takes:
- Current face photo
- Predicted improvement delta per concern (from similar-user outcomes)
- Direction: positive (follow routine) or negative (no SPF)

And generates a realistic preview of the predicted outcome.

### 7.2 Outputs

- **3-month positive:** "If you follow this routine consistently..." → shows predicted improvement
- **5-year UV risk:** "If you continue without SPF..." → shows projected sun damage (based on cumulative UV model + Fitzpatrick + current sub-clinical damage)
- **Before/after motivation:** Once user has 2+ scans showing improvement, smooth interpolation between first scan and best scan

### 7.3 Ethical Guardrails

```typescript
const VISUALIZATION_RULES = {
  watermark: 'AI Prediction — Not a Guarantee',
  maxImprovement: 0.4,  // never show more than 40% improvement
  neverShowPerfectSkin: true,
  boundedByPopulationData: true,  // predictions stay within similar-user outcome distribution
  optInOnly: true,
  disableableInSettings: true,
  neverForMedicalConditions: true,  // only cosmetic concerns
};
```

### 7.4 Implementation Note

This is the most ML-heavy feature in the entire app. For solo dev: START with simple side-by-side score projections (text + charts), NOT generated images. Add generative visualization later when you have training data from user outcomes. Mark as: `// TODO: Generative viz when user base > 5k with consent`.

---

## 8. Personalized Learning

### 8.1 Per-Ingredient Efficacy Tracking

```typescript
interface IngredientEfficacy {
  ingredient: string;
  targetConcern: SkinConcern;
  startDate: string;         // when product containing this was added
  startScore: number;        // concern score at start
  currentScore: number;      // latest concern score
  weeksActive: number;
  delta: number;             // currentScore - startScore (negative = improvement)
  verdict: 'EFFECTIVE' | 'NO_CHANGE' | 'WORSENED' | 'TOO_EARLY';
}

function evaluateEfficacy(entry: IngredientEfficacy): string {
  if (entry.weeksActive < 6) return 'TOO_EARLY';
  if (entry.delta < -15) return 'EFFECTIVE';
  if (entry.delta > 10) return 'WORSENED';
  return 'NO_CHANGE';
}
```

### 8.2 Personal Ingredient Profile

Over multiple scans: "Niacinamide works well for your pigmentation. Salicylic acid didn't help your comedones — trying azelaic acid next."

### 8.3 Federated Learning

**Deferred until 10k+ users.** Until then, use clinical literature defaults for similar-user predictions. Mark in code:

```typescript
function getSimilarUserOutcome(profile: UserProfile, ingredient: string): Prediction {
  // TODO: Phase 7b — federated learning when user base > 10k
  // For now, use clinical literature defaults
  return LITERATURE_DEFAULTS[ingredient][profile.concernType];
}
```

---

## 9. Causal Inference Engine

### 9.1 Problem

The correlation engine (Phase 6) finds "breakouts correlate with product X." But the user also started a new job (stress) at the same time. Correlation ≠ causation.

### 9.2 Approaches

```typescript
function assessCausality(
  event: string,        // "started Product X"
  metric: string,       // "chin acne score"
  timeline: DataPoint[],
  confounds: string[],  // ["seasonal change", "new job started"]
): CausalAssessment {
  
  // 1. Temporal ordering
  const eventDate = getEventDate(event, timeline);
  const metricChangeDate = findSignificantChange(metric, timeline);
  const lagWeeks = weeksBetween(eventDate, metricChangeDate);
  
  // Does the lag match expected onset for this type of event?
  const expectedLag = EXPECTED_ONSET[event]; // e.g., product = 4-8 weeks
  const temporalMatch = lagWeeks >= expectedLag.min && lagWeeks <= expectedLag.max;
  
  // 2. Natural experiment detection
  // Did the user stop and restart the product? (gap analysis)
  const gaps = findProductGaps(event, timeline);
  const gapCorrelation = gaps.map(g => ({
    duringGap: getMetricDuring(metric, g),
    afterResume: getMetricAfter(metric, g),
  }));
  // If metric worsened during gap and improved after resume → strong causal evidence
  
  // 3. Confound assessment
  const simultaneousChanges = confounds.filter(c => 
    Math.abs(weeksBetween(getEventDate(c, timeline), eventDate)) < 2
  );
  
  if (simultaneousChanges.length > 0 && gapCorrelation.length === 0) {
    return { 
      verdict: 'UNCERTAIN',
      message: `Your ${metric} changed after starting ${event}, but this also coincided with ${simultaneousChanges.join(', ')}. We'll have stronger evidence after more scans.`
    };
  }
  
  if (temporalMatch && gapCorrelation.length > 0) {
    return { verdict: 'LIKELY_CAUSAL', message: `${event} appears to be helping your ${metric}.` };
  }
  
  return { verdict: 'CORRELATED', message: `${event} correlates with changes in ${metric}, but we can't confirm causation yet.` };
}
```

---

## 10. Life-Stage Adaptation

### 10.1 Pregnancy

**Detection:** User sets pregnancy status in profile, OR health app syncs pregnancy data.

**Adaptations:**
- Melasma pattern recognition: bilateral symmetrical pigmentation on cheeks + forehead + upper lip → classified as pregnancy-related, not generic PIH
- ALL ingredients locked to pregnancy-safe list:

```typescript
const PREGNANCY_SAFE: string[] = [
  'Azelaic Acid', 'Niacinamide', 'Vitamin C', 'Hyaluronic Acid',
  'Glycerin', 'Ceramides', 'Centella Asiatica', 'Zinc Oxide', 'Titanium Dioxide',
  'Squalane', 'Shea Butter', 'Aloe Vera',
];

const PREGNANCY_BANNED: string[] = [
  'Retinol', 'Retinaldehyde', 'Tretinoin', 'Adapalene', 'Tazarotene',
  'Salicylic Acid >2%', 'Hydroquinone', 'Benzoyl Peroxide',
  'Chemical SPF (Oxybenzone, Avobenzone)', 'Formaldehyde',
];
```

- Timeline adjustment: "Pregnancy melasma typically fades postpartum. We'll use safe brightening agents in the meantime."
- **Postpartum transition:** When pregnancy status is cleared, the system tracks recovery — melasma fading, hormonal rebalancing. Previously restricted ingredients re-enabled on phased schedule.

### 10.2 Perimenopause / Menopause

**Detection:** Across 3+ scans in a user aged 40–55: sudden onset of dryness + elasticity loss + possible hormonal acne.

**Adaptations:**
- Heavier barrier support (ceramide-rich moisturizers, occlusives)
- Collagen-stimulating peptides prioritized
- Retinol recommended earlier in the dependency graph (skin can tolerate it for anti-aging when barrier is supported)
- Phytoestrogen-containing products flagged as beneficial

### 10.3 Puberty

**Detection:** User age range TEENS + rapid onset of T-zone oiliness + inflammatory acne.

**Adaptations:**
- Default to Essential (3-step) routine tier
- Gentler concentrations (salicylic acid 0.5% not 2%, benzoyl peroxide 2.5% not 5%)
- Simpler language in reports
- Educational focus: "What is acne and why does it happen?"

---

## 11. Medication Side-Effect Attribution

### 11.1 Side-Effect Database

```typescript
const MEDICATION_SIDE_EFFECTS: Record<string, SideEffect[]> = {
  'Corticosteroids': [
    { finding: 'skin_thinning', confidence: 'HIGH', 
      message: 'Skin thinning can occur with prolonged corticosteroid use. Discuss with your prescribing doctor.' },
    { finding: 'telangiectasia', confidence: 'HIGH',
      message: 'Visible capillaries may be related to your corticosteroid use.' },
  ],
  'Lithium': [
    { finding: 'acne_onset', confidence: 'MEDIUM',
      message: 'Acne is a known side effect of lithium. Topical treatment can manage symptoms.' },
  ],
  'Doxycycline': [
    { finding: 'photosensitivity_pattern', confidence: 'HIGH',
      message: 'Your antibiotic increases sun sensitivity. Upgrade to SPF 50+ and reapply every 2 hours outdoors.' },
  ],
  'Hormonal birth control': [
    { finding: 'skin_change_within_4_weeks', confidence: 'MEDIUM',
      message: 'Skin changes shortly after starting/changing birth control are likely hormonal adjustment. Allow 2-3 months to stabilize.' },
  ],
  'Isotretinoin': [
    { finding: 'extreme_dryness', confidence: 'HIGH',
      message: 'Dryness and chapped lips are expected on isotretinoin. Maximum barrier support applied.' },
  ],
};
```

### 11.2 Attribution Logic

When a finding matches a known side effect of a current medication: attribute it in the report and route to "discuss with your doctor" rather than recommending topical solutions.

---

## 12. Seasonal Auto-Adjustment

### 12.1 Detection

Using GPS + weather API, detect upcoming seasonal transitions 2 weeks in advance.

### 12.2 Adjustment Recommendations

| Transition | Changes | Notification |
|-----------|---------|-------------|
| **Fall → Winter** | Heavier moisturizer, reduce AHA frequency, add humectant layer, maintain SPF | "Winter is coming to your area — here's how to adjust" |
| **Winter → Spring** | Gradually lighten moisturizer, resume AHA, add antioxidant | "Spring transition — easing back to lighter products" |
| **Spring → Summer** | Lightweight gel moisturizer, increase SPF to 50+, reduce retinol if sun exposure increases | "Summer protection mode — SPF is your #1 priority" |
| **Summer → Fall** | Resume retinol at full frequency, slightly heavier moisturizer | "Great time to restart active treatments" |

### 12.3 Implementation

```typescript
function detectSeasonalTransition(
  location: { lat: number; lon: number },
  weatherHistory: WeatherDay[],
  weatherForecast: WeatherDay[],
): SeasonalTransition | null {
  const currentHumidity = mean(weatherHistory.slice(-7).map(d => d.humidity));
  const forecastHumidity = mean(weatherForecast.slice(0, 14).map(d => d.humidity));
  const humidityDrop = currentHumidity - forecastHumidity;
  
  if (humidityDrop > 20) return { type: 'DRYING', severity: humidityDrop };
  if (humidityDrop < -20) return { type: 'HUMIDIFYING', severity: Math.abs(humidityDrop) };
  
  // Also check temperature swings, UV index trends
  return null;
}
```

Adjustments are RECOMMENDATIONS shown as a notification card — user confirms or dismisses.

---

## 13. Voice Input with NLP

### 13.1 Capture

After structured questionnaire, optional: "Anything else? Just say it." (30-second recording limit)

### 13.2 Processing

- **On-device transcription:** `expo-speech` (platform-native speech recognition) or Whisper (on-device via CoreML/TFLite). No audio uploaded to server — only the transcript.
- **NLP extraction (backend):** Send transcript to Claude API with structured extraction prompt:

```typescript
const NLP_PROMPT = `Extract structured signals from this user's skin description:
- product_changes: [{ product, action: 'started'|'stopped'|'changed', timeframe }]
- concerns: [{ description, zone?, severity? }]
- triggers: [{ trigger, correlation }]
- timeline: [{ event, when }]
- sensations: [{ feeling, zone? }]

User said: "${transcript}"

Return JSON only.`;
```

### 13.3 Usage

Extracted signals attach to the scan as metadata. The correlation engine and routine engine both read them. Example: "I switched moisturizers last week and my chin started breaking out" → `{ product_changes: [{ product: 'moisturizer', action: 'changed', timeframe: '1 week ago' }], concerns: [{ description: 'breakout', zone: 'chin' }] }` → correlates with chin acne score increase.

---

## 14. Routine Version History

### 14.1 Schema

```prisma
model RoutineVersion {
  id          String   @id @default(cuid())
  userId      String
  routineId   String
  version     Int
  amSteps     Json
  pmSteps     Json
  changeReason String   // "Phase 2 — retinol introduced", "Seasonal adjustment", "Dermatologist prescription"
  changedAt   DateTime @default(now())
  
  @@index([userId, routineId])
}
```

### 14.2 Tracking

Every routine change creates a new version entry. Changes logged automatically:
- "Oct 1: Retinol added — Phase 2 active introduction"
- "Oct 15: AHA reduced to 2x/week — seasonal adjustment (winter dryness)"
- "Nov 3: Metronidazole added — dermatologist prescription"
- "Nov 20: Vitamin C swapped for azelaic acid — no improvement after 8 weeks"

### 14.3 Viewing

Settings → Routine → History. User can view any past version: "What was my routine 3 months ago?" Also included in the clinical export.

---

## 15. Data Portability & Privacy

### 15.1 Full Data Export

```
Settings → Privacy → Export My Data
```

Generates a ZIP containing:
- `profile.json` — user profile, questionnaire, skin type, Fitzpatrick
- `scans/` — scan metadata + results as JSON (one file per scan)
- `images/` — original scan images (downloaded from S3)
- `products.json` — scanned product library
- `medications.json` — medication history
- `routines.json` — all routine versions
- `diary.json` — all diary entries
- `adherence.json` — adherence log
- `environmental.json` — environmental context per scan

GDPR Article 20 compliant: machine-readable, structured format.

### 15.2 Account Deletion

```
Settings → Privacy → Delete My Account
```

- Confirmation: "This will permanently delete all your data. This cannot be undone."
- Double confirmation: re-enter password
- Actions:
  1. Delete all S3 objects (scan images, exports)
  2. Hard-delete all database records (not soft-delete)
  3. Revoke all access tokens (portal, API)
  4. Delete Supabase auth user
  5. Send confirmation email
- Federated learning contributions cannot be reversed (aggregated, anonymous) but no new data is retained

### 15.3 Data Residency

During onboarding (or Settings → Privacy): select storage region.

| Region | S3 Bucket | Database | Justification |
|--------|-----------|----------|---------------|
| EU | eu-west-1 | Supabase EU | GDPR compliance |
| US | us-east-1 | Supabase US | Default |
| APAC | ap-southeast-1 | Supabase APAC | Regional compliance |

All personal data stored exclusively in selected region. Cross-region replication disabled.

### 15.4 Encryption

- All data encrypted at rest: AES-256
- Tenant-isolated keys: each user's images encrypted with a user-specific key derived from their auth credentials. A database breach cannot decrypt User A's images using User B's key.
- In transit: TLS 1.3 mandatory for all API traffic

---

## 16. Database Schema Changes

```prisma
// New models
model PortalAccess {
  id          String   @id @default(cuid())
  userId      String
  accessToken String   @unique
  expiresAt   DateTime
  revokedAt   DateTime?
  createdAt   DateTime @default(now())
  @@index([accessToken])
}

model DermatologistNote {
  id          String   @id @default(cuid())
  userId      String
  portalAccessId String
  message     String
  readAt      DateTime?
  createdAt   DateTime @default(now())
}

model DiagnosticCorrection {
  id                    String   @id @default(cuid())
  userId                String
  scanId                String
  systemDifferential    String
  professionalDiagnosis String
  consentToTraining     Boolean
  createdAt             DateTime @default(now())
}

model RoutineVersion {
  id           String   @id @default(cuid())
  userId       String
  routineId    String
  version      Int
  amSteps      Json
  pmSteps      Json
  changeReason String
  changedAt    DateTime @default(now())
}

model AppProfile {
  id          String   @id @default(cuid())
  userId      String
  displayName String
  avatarUri   String?
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
}

// Add to User
model User {
  // ... existing
  dataRegion    String   @default("US")  // EU, US, APAC
  voiceTranscripts Json? // extracted NLP signals
}
```

---

## 17. API Contract Updates

```
// Portal
POST /api/portal/access (create invite link)
DELETE /api/portal/access/:id (revoke)
GET /api/portal/access (list active links)

// Dermatologist feedback
POST /api/feedback/diagnosis
Request: { scanId, diagnosis, prescription?, consentToTraining }

// Health app
POST /api/health/sync
Request: { sleep: SleepData[], hrv: HRVData[], steps: StepData[], cycle?: CycleData }

// Historical import
POST /api/import/photos
Request: { imageKeys: string[] }
Response: { importedScans: ImportedScan[] }

// Profiles
POST /api/profiles
GET /api/profiles
PUT /api/profiles/:id
DELETE /api/profiles/:id
POST /api/profiles/:id/switch

// Data export
POST /api/export (generates ZIP, returns download URL)
DELETE /api/account (hard delete)

// Voice
POST /api/voice/extract
Request: { transcript: string }
Response: { signals: ExtractedSignals }

// Routine history
GET /api/routines/:id/history
Response: { versions: RoutineVersion[] }
```

---

## 18. Testing Requirements

### Unit Tests
- Clinical export PDF generation (verify all sections present)
- ICD-10 mapping for all detectable conditions
- Portal access token generation/validation/revocation
- Diagnostic correction storage and training pipeline flag
- Health data signal derivation (raw → sleep quality, HRV trend)
- Historical photo relaxed pipeline (lower confidence thresholds applied)
- Profile isolation (scan from Profile A not visible in Profile B)
- Causal inference logic (temporal ordering, gap analysis, confound detection)
- Pregnancy safe/banned ingredient filtering
- Medication side-effect attribution matching
- Seasonal transition detection
- NLP extraction parsing
- Routine version creation on each change
- Data export completeness (all tables included)
- Account deletion cascade (all related records removed)

### Integration Tests
- Portal access flow: generate link → access dashboard → view scan → leave note → note appears in mobile
- Health app sync → data attached to next scan → correlation engine reads it
- Historical photo import → results on timeline with APPROXIMATE flag
- Profile switching → correct data isolation
- Full data export → ZIP contains all expected files
- Account deletion → verify all S3 objects and DB records removed

---

## 19. What's NOT in Phase 7

- ❌ Federated learning (deferred until 10k+ users — use literature defaults)
- ❌ Generative "what-if" images (start with text/chart projections — add generation when training data exists)
- ❌ Telemedicine video integration (portal is async view-only for now)
- ❌ Smart home integration (reminders on Nest Hub, etc. — nice-to-have, not priority)
- ❌ Community features (forums, shared routines — separate product decision)

---

## 20. Deliverable Checklist

- [ ] Clinical export generates complete PDF with all sections
- [ ] ICD-10 codes, GAGS, IGA scores included in export
- [ ] Dermatologist portal (Next.js) deployed, accessible via invite link
- [ ] Portal shows scan history, scores, routine, diary, products
- [ ] Dermatologist can leave notes visible in mobile app
- [ ] Photo request from portal triggers notification in mobile app
- [ ] Portal access is revocable, expires after 90 days
- [ ] Diagnosis capture flow works (structured + free text)
- [ ] Prescription entry triggers routine reconciliation
- [ ] Health app integration reads sleep, HRV, steps, cycle (iOS + Android)
- [ ] Skin Health Score written to Apple Health / Google Health Connect
- [ ] Health data correlations appear in longitudinal analysis
- [ ] Historical photo import processes camera roll selfies with relaxed pipeline
- [ ] Imported results appear on timeline with "approximate" flag
- [ ] Multi-profile: create, switch, delete profiles with data isolation
- [ ] Biometric lock per profile works
- [ ] Causal inference distinguishes correlation from causation in reports
- [ ] Pregnancy mode locks to safe ingredients, recognizes melasma pattern
- [ ] Medication side-effects attributed in report
- [ ] Seasonal notifications fire 2 weeks before transition
- [ ] Voice input transcribes and extracts structured signals
- [ ] Routine version history tracks all changes with reasons
- [ ] Full data export (ZIP) includes all user data
- [ ] Account deletion removes all data from DB and S3
- [ ] Data residency selection works (EU/US/APAC)
- [ ] CI green, all tests passing
