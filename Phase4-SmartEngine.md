# SkinSense Phase 4: Smart Engine

**Duration:** Weeks 26–35 (10 weeks)
**Goal:** Detection becomes diagnosis. Routine becomes personalized, phased, and safety-aware. The app starts knowing the user's skin better than they do.
**Depends on:** Phase 0-3 complete (foundation, MVP, launched, capture quality with multi-angle HDR preprocessing).
**Team:** Solo developer, LLM-assisted.

---

## 1. Fitzpatrick Skin Tone Adaptation

### 1.1 Classification

Train a lightweight classifier on diverse dermatological datasets to categorize Fitzpatrick I–VI from the preprocessed (white-balanced, specular-removed) facial composite. Store in user profile, refine with each scan.

```python
class FitzpatrickClassifier:
    def predict(self, face_composite: np.ndarray) -> int:
        """Returns Fitzpatrick category 1-6."""
        lab = cv2.cvtColor(face_composite, cv2.COLOR_BGR2LAB)
        l_mean = lab[:,:,0].mean()
        # Lightweight model: L* mean + a*/b* distribution → Fitzpatrick
        return self.model.predict(self._extract_features(lab))
```

### 1.2 Per-Tone Detection Thresholds

| Fitzpatrick | Erythema | Pigmentation | Texture |
|-------------|----------|-------------|---------|
| I–II | Standard HSV + LAB a* | Lower L* threshold (faint spots) | Standard Gabor |
| III–IV | Standard + green channel boost | Standard L* threshold | Standard Gabor |
| V–VI | Green channel narrow-band + a*b* chromaticity shifts | Relative L* (not absolute) | Adjusted for melanin density |

**Erythema on dark skin (V–VI):** Standard RGB redness detection fails. Switch to:
```python
def detect_erythema_dark_skin(zone: np.ndarray) -> float:
    green = zone[:,:,1].astype(float)  # hemoglobin absorbs green
    lab = cv2.cvtColor(zone, cv2.COLOR_BGR2LAB)
    a_star = lab[:,:,1].astype(float)  # red-green axis
    b_star = lab[:,:,2].astype(float)  # blue-yellow axis
    
    # Chromaticity shift detection
    a_deviation = np.std(a_star)
    green_absorption = 255 - green.mean()  # higher = more hemoglobin
    
    score = (a_deviation * 0.6 + green_absorption * 0.4)
    return normalize_to_100(score)
```

### 1.3 Training Data Requirements

- Balanced Fitzpatrick I–VI representation (minimum 10,000 annotated images)
- Per-category accuracy metrics (mAP, F1) reported per Fitzpatrick type
- **Deployment gate:** Any Fitzpatrick category accuracy >5% below overall average blocks deployment
- Sources: ISIC Archive, Fitzpatrick17k, DermNet, PAD-UFES-20

### 1.4 Self-Assessment Reference Photos

Dynamic filtering: show reference images on skin tones matching the user's Fitzpatrick category. This makes self-matching more accurate — a dark spot on Fitzpatrick II looks different from Fitzpatrick V.

---

## 2. Data-Driven Skin Type Reclassification

### 2.1 Measured vs. Self-Reported

```typescript
interface MeasuredSkinProfile {
  oiliness: number;          // from specular map (0-100)
  hydration: number;         // from dehydration texture detection (0-100, inverted)
  sensitivity: number;       // from barrier score + reaction history (0-100)
  measuredType: SkinType;    // computed
  selfReportedType: SkinType;
  discrepancy: boolean;
  explanation?: string;
}

function reclassifySkinType(measured: MeasuredSkinProfile): SkinType {
  if (measured.oiliness > 60 && measured.hydration < 40) {
    return 'DEHYDRATED_OILY'; // Most common misdiagnosis
  }
  if (measured.oiliness < 30 && measured.hydration > 60) {
    return 'NORMAL'; // Self-reported "dry" but actually normal
  }
  // ... other reclassification rules
}
```

### 2.2 Common Corrections

| Self-Reported | Measured | Actual | Impact |
|--------------|---------|--------|--------|
| Oily | High oiliness + low hydration | Dehydrated-oily | Stop stripping products, add hydration → oiliness decreases |
| Dry | Normal hydration + low oiliness | Normal | Lighter moisturizer, can tolerate actives |
| Sensitive | Normal barrier + reactions to specific products | Product-caused reactivity | Identify the irritant product, not "sensitive skin" protocol |

### 2.3 Seasonal Drift

Track measured skin type across scans. If it shifts (e.g., combination → dry over 3 winter scans), notify: "Your skin has shifted drier over the past 2 months, consistent with the humidity drop in your area. Routine adjusted."

---

## 3. Ensemble Model Consensus

### 3.1 Architecture

Each detection category runs through 3 independent models:

| Category | Model A | Model B | Model C |
|----------|---------|---------|---------|
| Acne | YOLOv8-nano | EfficientDet-D0 | U-Net segmentation |
| Pigmentation | LAB threshold | Histogram-based | CNN classifier |
| Erythema | HSV + green channel | LAB a* analysis | CNN classifier |
| Texture | Gabor filter bank | Wavelet decomposition | CNN regressor |

### 3.2 Consensus Scoring

```python
def ensemble_consensus(model_results: list[DetectionResult]) -> ConsensusFinding:
    agreements = sum(1 for r in model_results if r.detected)
    confidence = {
        3: 'HIGH',      # All models agree
        2: 'MEDIUM',    # Majority agree
        1: 'LOW',       # Only one detected — present cautiously
        0: None,        # Not detected
    }[agreements]
    
    if confidence == 'LOW':
        return ConsensusFinding(detected=True, confidence='LOW', 
                               label='Possible finding — low confidence')
    return ConsensusFinding(detected=agreements > 0, confidence=confidence)
```

---

## 4. Cross-Zone Differential Diagnosis

### 4.1 Spatial Pattern Analysis

After per-zone detection, analyze the full-face distribution:

```python
DIFFERENTIAL_PATTERNS = {
    'sebaceous_acne': {
        'pattern': 'T-zone predominant (forehead + nose + chin)',
        'check': lambda zones: zones['forehead'].acne > 40 and zones['nose'].acne > 30,
        'treatment': 'Oil control, salicylic acid, niacinamide',
    },
    'hormonal_acne': {
        'pattern': 'U-zone predominant (jawline + chin)',
        'check': lambda zones: zones['chin'].acne > 50 and zones['cheeks'].acne < 20,
        'treatment': 'Azelaic acid, cycle-aware timing, consider spironolactone referral',
    },
    'rosacea': {
        'pattern': 'Symmetrical bilateral cheek redness',
        'check': lambda zones: abs(zones['left_cheek'].redness - zones['right_cheek'].redness) < 15 
                               and zones['left_cheek'].redness > 40,
        'treatment': 'Anti-redness, barrier repair, trigger avoidance',
    },
    'external_irritation': {
        'pattern': 'Asymmetrical redness (one cheek significantly worse)',
        'check': lambda zones: abs(zones['left_cheek'].redness - zones['right_cheek'].redness) > 25,
        'treatment': 'Identify external cause (phone, sleeping side, hand resting)',
        'follow_up_question': 'Do you hold your phone to your [worse_side] ear?',
    },
    'fungal_folliculitis': {
        'pattern': 'Forehead-only uniform small bumps',
        'check': lambda zones: zones['forehead'].acne > 50 and zones['chin'].acne < 15 
                               and zones['cheeks'].acne < 15,
        'treatment': 'Antifungal (ketoconazole), NOT antibacterial',
    },
    'perioral_dermatitis': {
        'pattern': 'Concentrated around mouth, sparing lip border',
        'check': lambda zones: zones['chin'].redness > 50 and zones['forehead'].redness < 20,
        'treatment': 'Avoid steroids, zero therapy (stop all actives), possible prescription',
    },
}
```

### 4.2 Ranked Differential Output

```typescript
interface DifferentialDiagnosis {
  primary: { condition: string; confidence: number; treatment: string };
  alternatives: { condition: string; confidence: number; note: string }[];
  followUpQuestion?: string;
}

// Example output:
{
  primary: { condition: 'Comedonal acne', confidence: 0.85, treatment: 'Salicylic acid 2%, retinol' },
  alternatives: [
    { condition: 'Fungal folliculitis', confidence: 0.12, 
      note: 'If no improvement in 4 weeks, consult a dermatologist for a KOH test' },
  ],
}
```

### 4.3 Prior-Scan Informed Detection

If a lesion was detected at position (x, y) in the previous scan, apply enhanced sensitivity at that location in the current scan (lower confidence threshold). Previous scans are informative priors.

### 4.4 Comorbidity Awareness

| If Detected | Also Check (Increased Sensitivity) |
|------------|-----------------------------------|
| Acne | Post-inflammatory hyperpigmentation |
| Rosacea | Dehydration, barrier compromise |
| Eczema | Barrier damage, sensitization |
| Barrier damage | All concerns (damaged barrier worsens everything) |

---

## 5. Scar Type Classification

Using 3D data from photometric stereo (Phase 3) and LiDAR (Phase 5 when available):

| Type | 3D Signature | Depth/Height | Treatment | Routing |
|------|-------------|-------------|-----------|---------|
| Ice pick | Deep, narrow V-shape | -1 to -3mm | TCA cross, punch excision | → Dermatologist |
| Boxcar | Broad, flat bottom, sharp edges | -0.5 to -1.5mm | Laser, subcision | → Dermatologist |
| Rolling | Shallow undulation, no sharp edges | -0.2 to -0.5mm | Microneedling, subcision | → Dermatologist |
| Hypertrophic/Keloid | Raised above surface | +0.5 to +3mm | Silicone, steroid injection | → Dermatologist |
| PIE | Flat, red, no depth change | 0mm | Azelaic acid, centella | → Topical pipeline |
| PIH | Flat, dark, no depth change | 0mm | Niacinamide, vitamin C | → Topical pipeline |

Only PIE and PIH enter the routine engine. The first four generate: "This type of scarring responds best to professional treatment. We recommend consulting a dermatologist."

---

## 6. Suspicious Lesion Safety Screening

### 6.1 ABCDE Criteria

For every pigmented lesion detected, score automatically:

```python
def screen_lesion(lesion: PigmentedLesion, history: list[PigmentedLesion]) -> SafetyFlag:
    score = 0
    if asymmetry_ratio(lesion.mask) > 0.3: score += 1           # A: Asymmetry
    if border_irregularity(lesion.mask) > 0.5: score += 1        # B: Border
    if color_variance(lesion.patch) > threshold: score += 1      # C: Color variation
    if lesion.diameter_mm > 6.0: score += 1                      # D: Diameter
    if has_evolved(lesion, history): score += 1                   # E: Evolution
    
    if score >= 3 or has_evolved(lesion, history):
        return SafetyFlag(level='RECOMMEND_CHECKUP', lesion_id=lesion.id)
    return SafetyFlag(level='NORMAL')
```

### 6.2 Evolution Tracking

Compare each pigmented lesion across scans (register position using 3D mesh or zone coordinates). Flag: new lesion appeared, existing lesion changed shape/color/size.

### 6.3 Presentation

NEVER: "This may be melanoma."
ALWAYS: "We noticed a spot on your left cheek that has changed since your last scan. We recommend having a dermatologist take a look — they can do a definitive evaluation."

Gated by onboarding consent checkbox.

---

## 7. Skin of Color Specific Conditions

| Condition | Risk | Mitigation |
|-----------|------|-----------|
| Dermatosis papulosa nigra | Misclassified as suspicious moles | Train model to recognize + exclude from ABCDE screening |
| Pseudofolliculitis barbae | Misclassified as acne | Different detection pattern (jawline, ingrown hair morphology), different treatment |
| Keloid risk on Fitzpatrick IV–VI | Generic scar advice is insufficient | Elevate referral urgency, warn against DIY treatments |
| PIH on dark skin | Timeline underestimated | 6–12 months (not 3–6), reflect in timeline estimation |

---

## 8. Barrier Health Composite Score

```typescript
function computeBarrierScore(data: BarrierInputs): number {
  const weights = {
    dehydrationTexture: 0.25,    // from wavelet analysis
    oilDehydrationRatio: 0.15,   // from specular map (patchy = dehydrated-oily)
    sensitivityReport: 0.10,      // from questionnaire
    waterHardness: 0.10,          // from environmental API
    productStrippingRisk: 0.15,   // SLS, high-conc AHA in current products
    weatherStress: 0.10,          // recent humidity drop >30%
    rPPGIrritation: 0.15,         // diffuse perfusion elevation (Phase 5, 0 until then)
  };
  
  const raw = Object.entries(weights).reduce(
    (sum, [key, weight]) => sum + (data[key] ?? 0) * weight, 0
  );
  
  return Math.round(100 - raw); // 0 = destroyed, 100 = perfect
}
```

**Gatekeeping:** Score < 40 → routine engine LOCKS OUT actives (retinoids, AHAs, BHAs, high-conc vitamin C). Barrier repair only: ceramides, hyaluronic acid, centella, gentle cleanser, heavy occlusive. Explains to user: "Your skin barrier needs repair before we can treat your other concerns."

---

## 9. Skin Age / Biological Aging

```typescript
function computeSkinAge(data: AgingInputs, chronologicalAge: number, fitzpatrick: number): SkinAge {
  const components = {
    elasticity: data.elasticityScore,       // from Phase 5 (0 until then)
    fineLines: data.staticLineCount,
    poreVisibility: data.poreScore,
    pigmentationIrregularity: data.pigmentationVariance,
    textureRoughness: data.gaborEnergy,
    firmness: data.firmnesScore,            // from Phase 5 (0 until then)
  };
  
  const biologicalAge = lookupPopulationNorm(components, fitzpatrick);
  const delta = biologicalAge - chronologicalAge;
  
  return { biologicalAge, chronologicalAge, delta, zoneAges: computePerZone(components) };
}
```

---

## 10. Treatment Dependency Graph

```typescript
enum TreatmentPhase {
  BARRIER_REPAIR = 0,
  ANTI_INFLAMMATION = 1,
  POST_INFLAMMATORY = 2,
  TEXTURE_AGING = 3,
  MAINTENANCE = 4,
}

function resolveCurrentPhase(scanResult: ScanResult, barrierScore: number): TreatmentPhase {
  if (barrierScore < 40) return TreatmentPhase.BARRIER_REPAIR;
  if (hasActiveInflammation(scanResult)) return TreatmentPhase.ANTI_INFLAMMATION;
  if (hasPostInflammatoryMarks(scanResult)) return TreatmentPhase.POST_INFLAMMATORY;
  if (hasTextureOrAgingConcerns(scanResult)) return TreatmentPhase.TEXTURE_AGING;
  return TreatmentPhase.MAINTENANCE;
}
```

The routine engine refuses downstream recommendations: if the user is in BARRIER_REPAIR, no retinol/AHA even if they have fine lines. Explains why to the user.

---

## 11. Standardized Clinical Grading

### GAGS (Global Acne Grading System)

```python
GAGS_LOCATION_FACTOR = {
    'forehead': 2, 'right_cheek': 2, 'left_cheek': 2,
    'nose': 1, 'chin': 1,
}
GAGS_LESION_SCORE = {
    'comedone': 1, 'papule': 2, 'pustule': 3, 'nodule': 4,
}

def compute_gags(findings: list[Finding]) -> int:
    total = 0
    for zone, factor in GAGS_LOCATION_FACTOR.items():
        zone_findings = [f for f in findings if f.zone == zone and f.type in GAGS_LESION_SCORE]
        if zone_findings:
            worst = max(GAGS_LESION_SCORE[f.type] for f in zone_findings)
            total += factor * worst
    return total  # 1-44: mild 1-18, moderate 19-30, severe 31-38, very severe 39-44
```

### IGA (Investigator's Global Assessment)

Map overall acne severity to 0–4 scale used in clinical trials.

---

## 12. Result Self-Audit

```typescript
function auditResult(current: ScanResult, previous?: ScanResult): AuditResult {
  const issues: AuditIssue[] = [];
  
  // Score jump validation
  if (previous) {
    for (const zone of Object.keys(current.zoneScores)) {
      for (const concern of Object.keys(current.zoneScores[zone])) {
        const delta = Math.abs(current.zoneScores[zone][concern] - previous.zoneScores[zone][concern]);
        if (delta > 40) {
          issues.push({ type: 'SCORE_JUMP', zone, concern, delta,
            action: 'Check scan quality grade for this zone' });
        }
      }
    }
  }
  
  // Cross-signal consistency
  if (current.zoneScores.nose.acne > 70 && current.metadata.oilinessMap?.nose < 20) {
    issues.push({ type: 'CROSS_SIGNAL', zone: 'nose',
      note: 'High acne but low oiliness — possible false positive' });
  }
  
  // Recommendation sanity cap
  // (enforced in routine engine, not here)
  
  return { issues, confidence: issues.length === 0 ? 'HIGH' : 'REDUCED' };
}
```

**Temporal hysteresis:** Barrier score must sustain above 60 for 2 consecutive scans before unlocking actives. Prevents oscillating at the threshold.

---

## 13. Product Barcode / OCR Scanning

### 13.1 Barcode Flow

1. User points back camera at product barcode
2. `expo-barcode-scanner` reads UPC/EAN code
3. Query Open Beauty Facts API: `GET https://world.openfoodfacts.org/api/v2/product/{barcode}`
4. If found: extract product name, brand, INCI ingredients
5. If not found: prompt OCR fallback

### 13.2 OCR Fallback

1. User photographs ingredient list on product back
2. On-device OCR (expo-camera + ML Kit text recognition or Apple Vision)
3. Parse INCI names from raw text (comma-separated, standardized naming)
4. Store in user's product library

### 13.3 Current Routine Profile

```typescript
interface UserProduct {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  ingredients: string[];        // full INCI list
  activeIngredients: { name: string; concentration?: string }[];
  routineSlot: 'AM' | 'PM' | 'BOTH';
  stepOrder: number;
  addedDate: string;
  scannedVia: 'barcode' | 'ocr' | 'manual';
}
```

### 13.4 Conflict Detection

Check user's existing products against new recommendations AND against each other:

```typescript
function detectCurrentRoutineConflicts(products: UserProduct[]): Conflict[] {
  const conflicts: Conflict[] = [];
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      for (const rule of CONFLICT_RULES) {
        if (containsIngredient(products[i], rule.ingredientA) && 
            containsIngredient(products[j], rule.ingredientB) &&
            products[i].routineSlot === products[j].routineSlot) {
          conflicts.push({ productA: products[i], productB: products[j], rule });
        }
      }
    }
  }
  return conflicts;
}
```

### 13.5 Product Removal Recommendations

If a current product contains comedogenic ingredients correlated with detected concerns: "Your moisturizer contains isopropyl myristate (comedogenicity rating: 5). This may be contributing to the clogged pores on your chin. Consider switching to [alternative]."

---

## 14. Medication & Treatment History

### 14.1 Medication Input

```typescript
const TRACKED_MEDICATIONS = [
  { name: 'Isotretinoin (Accutane)', restriction: 'MINIMAL_ROUTINE', 
    note: 'Extreme sensitivity — gentle cleanser + heavy moisturizer + SPF only' },
  { name: 'Tretinoin (prescription)', restriction: 'NO_OTC_RETINOL',
    note: 'Already on prescription retinoid — no additional retinol/retinaldehyde' },
  { name: 'Hormonal birth control', restriction: 'NONE', 
    note: 'May affect sebum production — track across scans for correlation' },
  { name: 'Oral antibiotics', restriction: 'NOTE_PHOTOSENSITIVITY',
    note: 'Some antibiotics increase sun sensitivity — ensure adequate SPF' },
  { name: 'Corticosteroids', restriction: 'MONITOR_THINNING',
    note: 'Long-term use can cause skin thinning — monitor in scan results' },
];
```

### 14.2 Recent Treatments

Chemical peel, laser, microneedling within the last 2 weeks → flag as "recovery state." Recovery redness/sensitivity is expected, not pathological. Don't recommend actives during recovery.

### 14.3 Side-Effect Attribution

If corticosteroid use + detected telangiectasia → "The visible capillaries may be related to your corticosteroid use. Discuss with your prescribing doctor."

---

## 15. Phased Introduction Protocol

### 15.1 Four Phases

```typescript
interface IntroductionPlan {
  phases: {
    phase: number;
    weekRange: [number, number];
    products: { product: Product; frequency: string; concentration?: string }[];
    checkpoint: string; // "Re-scan to assess tolerance"
  }[];
}

// Example:
{
  phases: [
    { phase: 1, weekRange: [1, 2], 
      products: [cleanser, moisturizer, spf],
      checkpoint: "Establishing baseline with gentle products" },
    { phase: 2, weekRange: [3, 4],
      products: [cleanser, retinol_025_every3rd_night, moisturizer, spf],
      checkpoint: "Re-scan at week 4 to check for irritation" },
    { phase: 3, weekRange: [5, 6],
      products: [cleanser, retinol_025_every_other_night, moisturizer, spf],
      checkpoint: "Re-scan: if tolerated, increase frequency" },
    { phase: 4, weekRange: [7, 8],
      products: [cleanser, niacinamide_am, retinol_025_nightly, moisturizer, spf],
      checkpoint: "Second active introduced. Re-scan at week 8." },
  ]
}
```

### 15.2 Purging vs. Adverse Reaction

```typescript
function classifyWorsening(
  currentFindings: Finding[],
  previousFindings: Finding[],
  newProduct: UserProduct,
): 'PURGING' | 'ADVERSE_REACTION' | 'UNCLEAR' {
  const newBreakoutZones = findNewBreakoutZones(currentFindings, previousFindings);
  const previousCongestionZones = findCongestedZones(previousFindings);
  
  // Purging: breakouts in zones that ALREADY had congestion
  if (newBreakoutZones.every(z => previousCongestionZones.includes(z))) {
    return 'PURGING'; // "Existing clogged pores surfacing faster — should resolve by week 4-6"
  }
  
  // Reaction: breakouts in zones that were CLEAR
  if (newBreakoutZones.some(z => !previousCongestionZones.includes(z))) {
    return 'ADVERSE_REACTION'; // "New breakouts in previously clear areas — consider stopping [product]"
  }
  
  return 'UNCLEAR';
}
```

---

## 16. Ingredient Synergy Optimization

### 16.1 Known Synergies

```typescript
const SYNERGIES: Synergy[] = [
  { ingredients: ['Vitamin C', 'Vitamin E', 'Ferulic Acid'], 
    effect: '8x photoprotection vs. vitamin C alone', prefer: 'COMBINE' },
  { ingredients: ['Niacinamide', 'Zinc PCA'], 
    effect: 'Enhanced sebum reduction', prefer: 'COMBINE' },
  { ingredients: ['Retinol', 'Peptides'], 
    effect: 'Enhanced collagen + reduced irritation', prefer: 'COMBINE' },
  { ingredients: ['Hyaluronic Acid', 'Ceramides', 'Cholesterol'], 
    effect: 'Optimal barrier repair (mimics natural lipid ratio)', prefer: 'COMBINE' },
];
```

### 16.2 Multi-Concern Efficiency

When the user has 3+ concerns, prioritize ingredients that address multiple: niacinamide (oiliness + pigmentation + barrier), retinol (texture + fine lines + acne + pigmentation), azelaic acid (acne + redness + pigmentation).

---

## 17. Treatment Timeline Estimation

| Concern | Timeline | Milestone Message |
|---------|----------|-------------------|
| Dehydration | 1–2 weeks | "You should notice improvement within days" |
| Barrier damage | 2–4 weeks | "Tightness and stinging should reduce gradually" |
| Active acne | 4–8 weeks | "Week 2-3: possible purging. Week 6+: clearing" |
| Comedonal acne | 6–12 weeks | "Slow and gradual — comedones take longest" |
| PIE (red marks) | 2–4 months | "Patience — fading is gradual but steady" |
| PIH (dark spots) | 3–6 months (I-III) / 6–12 months (IV-VI) | "Dark spots take the longest. Stay consistent." |
| Fine lines | 3–6 months with retinol | "Subtle improvement — most visible on expression lines" |
| Structural pores | 8–12 weeks | "Modest reduction through collagen remodeling" |

---

## 18. Routine Complexity Modes

```typescript
type RoutineTier = 'ESSENTIAL' | 'STANDARD' | 'COMPREHENSIVE';

const TIER_LIMITS: Record<RoutineTier, { maxSteps: number; description: string }> = {
  ESSENTIAL: { maxSteps: 3, description: 'Cleanser + one active + SPF/moisturizer' },
  STANDARD: { maxSteps: 6, description: 'AM/PM differentiated, top 2-3 concerns' },
  COMPREHENSIVE: { maxSteps: 10, description: 'Full multi-concern with layering' },
};
```

Essential mode requires the hardest ingredient selection — one active that covers the most concerns.

---

## 19. Routine Calendar

```typescript
interface RoutineCalendar {
  days: {
    dayOfWeek: string;
    am: RoutineStep[];
    pm: RoutineStep[];
    notes?: string; // "Rest night — moisturizer only"
  }[];
  rampingSchedule?: {
    product: string;
    week1: string;  // "Monday only"
    week3: string;  // "Monday + Thursday"
    week5: string;  // "Mon/Wed/Fri"
  }[];
}
```

Circadian optimization: if HealthKit shows the user sleeps 8AM–4PM (night shift), "PM routine" is scheduled before their sleep period, not at arbitrary 10 PM.

---

## 20. Environmental Context

```typescript
interface EnvironmentalContext {
  uvIndex: number;                    // current
  uvAccumulation14Day: number;        // cumulative past 2 weeks
  aqi: number;                        // air quality index
  pm25: number;                       // particulate matter
  waterHardness: number;              // ppm, by postal code
  humidity7DayHistory: number[];      // past 7 days
  temperatureSwing: number;           // max - min over 7 days
  pollenCount: number;                // grains/m³
  season: 'winter' | 'spring' | 'summer' | 'fall';
}

// API sources:
// UV: OpenUV API
// AQI: WAQI/OpenAQ API
// Water hardness: USGS/local water authority
// Weather: OpenWeather API
// Pollen: Tomorrow.io or Ambee API
```

---

## 21. Adaptive Re-Scan Scheduling

```typescript
function computeNextScanDate(context: ScanContext): { date: Date; reason: string } {
  if (context.justIntroducedNewActive)
    return { date: addWeeks(now, 2), reason: 'Check tolerance of new active' };
  if (context.reactionDetected)
    return { date: addWeeks(now, 1), reason: 'Monitor reaction after stopping product' };
  if (context.recentProfessionalTreatment)
    return { date: addDays(now, 3), reason: 'Wait for treatment recovery' };
  if (context.predictiveAlertFired)
    return { date: now, reason: 'Predictive alert — scan for early detection' };
  if (context.seasonalTransitionDetected)
    return { date: now, reason: 'Seasonal baseline' };
  return { date: addWeeks(now, 4), reason: 'Monthly maintenance check-in' };
}
```

---

## 22. Routine Engine Refactor

The Phase 1 rule-based engine becomes a multi-stage pipeline:

```typescript
function generateRoutine(input: RoutineInput): Routine {
  const concerns = detectConcerns(input.scanResult);
  const differential = runDifferentialDiagnosis(concerns);
  const barrierCheck = checkBarrier(input.scanResult, input.barrierScore);
  const graph = buildDependencyGraph(concerns, barrierCheck);
  const currentPhase = resolvePhase(graph, input.previousRoutine);
  const ingredients = selectIngredients(currentPhase, differential, input.userProfile);
  const synergized = optimizeSynergies(ingredients);
  const conflictFree = resolveConflicts(synergized, input.currentProducts, input.medications);
  const products = filterProducts(conflictFree, input.catalog, input.userProfile);
  const calendar = generateCalendar(products, currentPhase, input.sleepSchedule);
  
  return { steps: products, calendar, phase: currentPhase, timeline: estimateTimelines(concerns) };
}
```

Each stage is a typed, tested, composable function. The pipeline is configured by state, not if-else branches.

---

## 23. Database Schema Changes

```prisma
model UserProduct {
  id                String    @id @default(cuid())
  userId            String
  name              String
  brand             String
  category          ProductCategory
  ingredients       String[]
  activeIngredients Json
  routineSlot       String    // AM, PM, BOTH
  stepOrder         Int
  scannedVia        String    // barcode, ocr, manual
  addedDate         DateTime  @default(now())
}

model Medication {
  id          String   @id @default(cuid())
  userId      String
  name        String
  restriction String
  startDate   DateTime
  isActive    Boolean  @default(true)
}

// Add to ScanResult:
model ScanResult {
  // ... existing
  barrierScore       Int?
  skinAge            Json?       // { biological, chronological, delta, zoneAges }
  differential       Json?       // ranked differential list
  fitzpatrick        Int?
  measuredSkinType   String?
  clinicalGrading    Json?       // { gags, iga }
  treatmentPhase     Int?        // dependency graph phase
  environmentalContext Json?
}
```

---

## 24. API Contract Updates

```
POST /api/products/scan-barcode
Request: { barcode: string }
Response: { product?: UserProduct, found: boolean }

POST /api/products/scan-ocr
Request: { imageKey: string }
Response: { extractedIngredients: string[], confidence: number }

POST /api/user-products
Request: UserProduct (without id)
Response: { product: UserProduct }

GET /api/user-products
Response: { products: UserProduct[] }

POST /api/medications
Request: { name: string, startDate: string }
Response: { medication: Medication }

GET /api/environmental-context
Response: EnvironmentalContext
```

---

## 25. Testing Requirements

### Unit Tests (must-have)
- Fitzpatrick classification accuracy on test set (per-category)
- Skin type reclassification logic (all correction paths)
- Ensemble consensus scoring (all agreement combinations)
- Differential diagnosis patterns (each spatial pattern)
- Barrier score computation (boundary cases: 39, 40, 41, 60, 61)
- Dependency graph phase resolution (each phase transition)
- Phased introduction plan generation
- Purging vs. reaction classification
- Conflict detection against current products
- GAGS and IGA scoring
- Self-audit (score jumps, cross-signal, hysteresis)
- Ingredient synergy selection
- Adaptive re-scan scheduling (each context)

### Integration Tests
- Product barcode scan → API lookup → storage
- Environmental context API aggregation
- Full routine generation pipeline end-to-end
- Medication restriction enforcement

---

## 26. What's NOT in Phase 4

- ❌ RAW, LiDAR, macro, multispectral, rPPG, photometric stereo, elasticity (Phase 5)
- ❌ Gamification, achievements, AR overlay, 3D face map, diary (Phase 6)
- ❌ Natural language reports, dermatologist portal, health app integration (Phase 6–7)
- ❌ Federated learning, predictive visualization, multi-profile (Phase 7)

---

## 27. Deliverable Checklist

- [ ] Fitzpatrick classifier integrated, per-tone thresholds active
- [ ] Skin type reclassification overrides self-report when discrepancy detected
- [ ] Ensemble models (3 per category) running, consensus scoring applied
- [ ] Differential diagnosis produces ranked list for test cases
- [ ] Scar classification routes ice pick/boxcar/rolling/keloid to dermatologist referral
- [ ] Suspicious lesion screening runs ABCDE on all pigmented lesions
- [ ] Barrier health score computed, gatekeeping locks actives below 40
- [ ] Skin age computed and displayed
- [ ] Treatment dependency graph controls routine phasing
- [ ] GAGS and IGA scores included in results
- [ ] Self-audit catches score jumps and cross-signal inconsistencies
- [ ] Product barcode scanning works (Open Beauty Facts integration)
- [ ] OCR fallback extracts ingredient lists from photos
- [ ] Current routine profile built from scanned products
- [ ] Conflict detection flags dangerous combinations in existing + recommended products
- [ ] Medication history captured, isotretinoin triggers minimal routine
- [ ] Phased introduction generates 4-phase timeline with concentration ramping
- [ ] Purging vs. reaction differentiation uses prior-scan location data
- [ ] Ingredient synergies optimized (C+E+ferulic preferred when both C and E are targets)
- [ ] Treatment timelines displayed per concern
- [ ] Routine complexity modes (Essential/Standard/Comprehensive) selectable
- [ ] Routine calendar generated with alternating nights and ramping
- [ ] Environmental context fetched from APIs and attached to scans
- [ ] Adaptive re-scan scheduling pushes contextual reminders
- [ ] Routine engine refactored to multi-stage typed pipeline
- [ ] All unit tests passing, CI green
