# Project Requirement: SkinSense

**Platform:** Expo (React Native) — iOS & Android

**Architecture:** Client-Server / Cloud-Backed

---

## 1. Executive Summary

SkinSense is an AI-powered skincare assessment and routine recommendation platform. The Expo mobile client acts as an intelligent capture interface, streaming pre-validated facial captures and questionnaire responses to a secure cloud backend. The backend executes advanced computer vision, lesion segmentation, and diagnostic rule engines to produce tailored AM/PM skincare routines and curated product catalogs.

---

## 2. Phased Project Plan

**Developer Context:** Solo developer building with LLM assistance (Claude, Cursor, etc.). This plan is structured for one person who can move fast but must build a foundation that doesn't collapse under feature weight. Every phase prioritizes engineering quality over feature quantity — you can always add features to a solid codebase, but you can't retroactively add a solid foundation under a pile of features.

### 2.0 Engineering Principles (Non-Negotiable)

Before any phase, these principles govern every line of code. They're what separates a real product from an "AI vibe-coded" prototype:

**1. Type Safety End-to-End**
- TypeScript `strict: true` everywhere — client, backend, shared types. No `any`. No `as` casts without a comment explaining why.
- Shared type package (`@skinsense/types`) used by both Expo client and NestJS backend. A scan result type defined once, used on both sides. If the API response shape changes, both sides break at compile time, not at runtime in production.
- Zod schemas at every system boundary (API request validation, S3 metadata, queue job payloads). Runtime validation where type erasure happens.

**2. Monorepo From Day One**
- Turborepo or Nx monorepo: `apps/mobile` (Expo), `apps/api` (NestJS), `apps/inference` (FastAPI), `packages/types` (shared), `packages/ui` (shared components), `packages/config` (shared ESLint/TSConfig/Prettier).
- One `pnpm install`. One CI pipeline. Shared linting rules. If the mobile app imports a type from `@skinsense/types` that the API also imports, they're guaranteed in sync.
- This prevents the #1 solo-dev failure mode: the frontend and backend slowly drifting apart until API calls break silently.

**3. Database Migrations, Not Mutations**
- Every schema change is a numbered, versioned migration (Prisma Migrate or Drizzle Kit). Never modify the database directly.
- Migrations are tested in CI against a test database before deploying. Rollback scripts for every migration.
- Seed scripts for development data (test users, sample products, mock scan results).

**4. Testing Strategy (Practical, Not Exhaustive)**
- **Unit tests** for pure logic: routine engine rules, ingredient conflict detection, severity scoring, dependency graph traversal. These are where bugs hide and where tests pay for themselves.
- **Integration tests** for API endpoints: send a request, get the right response, database state is correct. Use a real test database, not mocks.
- **No snapshot tests.** No testing library render tests for UI. Those break on every visual change and test nothing useful.
- **E2E smoke test** (Maestro or Detox): one flow — open app, take scan, see results. Runs on every release build. Catches catastrophic regressions.
- Target: ~70% coverage on backend logic, ~40% overall. Quality over quantity.

**5. CI/CD From Phase 1**
- GitHub Actions: lint + typecheck + test on every PR. No merging with failures.
- EAS Build: preview builds on every PR (internal distribution). Production builds on main branch merge.
- EAS Update: OTA updates for JS-only changes. Full rebuild only for native code changes.
- Database migrations run automatically on deploy (staging first, then production).

**6. Feature Flags (Not Git Branches)**
- Every major feature ships behind a flag (simple JSON config in the backend, not a paid feature flag service). Flags are checked at the API level, not sprinkled through UI code.
- This lets you deploy code to production without exposing unfinished features. Merge early, merge often. Long-lived branches are a solo-dev death trap.

**7. Error Handling & Observability From Day One**
- Sentry for crash reporting and error tracking on both client and backend. Set up in Phase 1, not "later."
- Structured JSON logging with request IDs. Every API request gets a `requestId` that propagates to the job queue and inference service.
- If something breaks in production, you need to know WHAT broke, for WHICH user, on WHICH scan, within minutes — not after a user emails you.

**8. LLM-Assisted Development Rules**
- LLMs write code, YOU review it. Never merge generated code you don't understand. If the LLM produces something clever that you can't explain, simplify it.
- Prompt the LLM with your type definitions and existing patterns. "Here's my Zod schema for ScanResult. Write the API endpoint that returns this." Constrained generation produces better code than open-ended "build me X."
- Use LLMs for: boilerplate, test generation, documentation, regex, SQL queries, complex TypeScript types. Don't use LLMs for: architecture decisions, security-critical code, database migration logic.
- Every file should be small enough that a LLM can read and modify it in one context window without losing track of the structure.

### 2.0b Phase Overview

| Phase | Name | Duration (Solo) | Focus | Ship Milestone |
|-------|------|----------------|-------|---------------|
| **0** | Foundation | 2–3 weeks | Monorepo, CI/CD, database, auth, deployment pipeline. Zero features. | Nothing user-facing. Infra only. |
| **1** | MVP — Core Loop | 6–8 weeks | Basic scan → analysis → routine. First TestFlight/internal build. | Internal beta v0.1 |
| **2** | Polish & Launch | 4–6 weeks | UI polish, onboarding, edge cases, App Store submission. | App Store v1.0 |
| **3** | Capture Quality | 6–8 weeks | Multi-angle, HDR, calibration, preprocessing, self-assessment. | v1.5 |
| **4** | Smart Engine | 8–10 weeks | Differential diagnosis, barrier health, Fitzpatrick, phased routines, product scanning. | v2.0 |
| **5** | Advanced Capture & Hardware | 6–8 weeks | RAW, LiDAR, multispectral, rPPG, elasticity. Custom Expo Modules. | v3.0 |
| **6** | Engagement & Growth | 6–8 weeks | Gamification, notifications, diary, AR overlay, reports. | v3.5 |
| **7** | Ecosystem | 8–10 weeks | Dermatologist portal, health app integration, predictive viz, multi-profile. | v4.0 |

**Total: ~46–61 weeks solo (~11–15 months).** Faster than the team estimate because solo devs don't have communication overhead, meetings, or merge conflicts. Slower because there's no parallelism.

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6 ──► Phase 7
  (infra)    (core)     (launch)    (capture)   (smart)     (hardware)  (engage)    (ecosystem)
```

**No parallelism. Sequential. Each phase must be SOLID before the next begins.** This is the discipline that keeps a solo codebase from becoming unmaintainable.

---

### 2.1 Phase 0 — Foundation (Weeks 1–3)

**Goal:** Set up the engineering infrastructure that every future phase depends on. Zero user-facing features. This phase is the difference between a codebase that scales to Phase 7 and one that collapses at Phase 3.

**Deliverables:**
1. Monorepo initialized (Turborepo + pnpm): `apps/mobile`, `apps/api`, `packages/types`, `packages/config`
2. Expo app scaffolded with Expo Router, TypeScript strict, ESLint, Prettier
3. NestJS API scaffolded with Prisma ORM, PostgreSQL, Redis connection, BullMQ
4. Database schema v1 (users, scans, scan_results, products, routines, adherence_logs) — migrated, not hand-created
5. Supabase Auth integrated (JWT issuance, refresh token rotation, middleware guard on NestJS)
6. S3 bucket with presigned URL generation endpoint
7. BullMQ job queue with a dummy "echo" job to verify the pipeline works end-to-end
8. CI pipeline: GitHub Actions running lint + typecheck + test on every push
9. EAS Build configured: development build + preview profile + production profile
10. Sentry integrated on both Expo client and NestJS backend
11. Deployment: API deployed to Railway/Render/Fly.io (start cheap, migrate to AWS later if needed). PostgreSQL on Supabase or Neon. Redis on Upstash.
12. Seed script: 50 test products with full ingredient lists

**Architecture Decisions Locked:**
- ORM: Prisma (type-safe, migration-based, great DX)
- State management (client): TanStack Query for server state, Zustand for client state. No Redux.
- Navigation: Expo Router (file-based)
- Styling: NativeWind (Tailwind for React Native) or StyleSheet — pick one, commit.
- API communication: tRPC (end-to-end type safety between NestJS and Expo client) OR REST with Zod-validated contracts. tRPC is strongly preferred for a solo TypeScript developer — it eliminates an entire class of API contract bugs.

**Why This Phase Exists:**
A solo developer's biggest risk is technical debt accumulation. Without this foundation, you'll spend Phase 3 rewriting Phase 1's shortcuts. Every hour invested here saves 5 hours later. The monorepo, type safety, and CI pipeline are load-bearing walls — you don't add them later.

---

### 2.2 Phase 1 — MVP: Core Loop (Weeks 4–11)

**Goal:** The smallest thing that delivers value. A user takes a photo, the backend analyzes it, and they get a routine. Nothing fancy. But the code is clean, typed, tested, and deployable.

**Features (Minimal):**
- Front camera capture with basic face detection guide (`expo-camera`)
- Client-side blur/exposure check (reject obviously bad photos before upload)
- Presigned S3 upload → BullMQ job → FastAPI inference worker
- Face segmentation into 5 zones (MediaPipe)
- Single-model detection: acne (YOLOv8), redness (HSV threshold), pigmentation (LAB), texture (Gabor) — using pre-trained models fine-tuned on public skin datasets
- Basic severity scoring (0–100 per zone per concern)
- Questionnaire: skin type, top concerns, allergies, age, pregnancy status
- Rule-based routine engine: concern → ingredient mapping, AM/PM generation, basic conflict check
- Results screen: Skin Health Score, zone map (2D, static), AM/PM routine with product cards
- Product catalog: 200+ products, filterable by skin type + concern + budget
- WebSocket for progressive result delivery (segmentation → scores → routine)
- Basic progress tracking: side-by-side comparison of any two scans

**Engineering Focus:**
- **Scan pipeline as a queue job with typed payload:** The scan job schema (`ScanJobPayload`) is a Zod-validated type shared between the API (enqueuer) and inference worker (consumer). If the payload shape changes, both sides fail at compile time.
- **Routine engine as a pure function:** `generateRoutine(scanResult, userProfile, productCatalog) → Routine`. No side effects. Fully unit-testable. This function will grow enormously through Phases 3–7, and it must be testable from day one.
- **Product catalog as a typed, versioned dataset:** Products are not user-generated content — they're curated data. Store as structured rows with full INCI ingredient arrays, not free-text blobs. Use a GIN index on the ingredients array for efficient filtering.
- **Result schema designed for extensibility:** The `ScanResult` type includes `version: number` and optional fields for every future feature (barrier score, skin age, differential, etc.). This way, older results render correctly alongside newer ones without migration.

**What's NOT in Phase 1:**
- No multi-angle. No HDR. No flash. No calibration. No back camera guidance.
- No self-assessment. No touch-to-mark. No voice input.
- No Fitzpatrick adaptation. No differential diagnosis. No barrier scoring.
- No gamification. No achievements. No diary.
- No product scanning. No phased introduction. No personalized learning.
- No RAW, no LiDAR, no multispectral, no rPPG.

These features are documented in Section 3 and will be built in later phases. Phase 1 is deliberately small.

---

### 2.3 Phase 2 — Polish & Launch (Weeks 12–17)

**Goal:** Make the MVP shippable. Handle edge cases. Polish the UI. Write the medical disclaimer. Submit to App Store and Play Store.

**Features:**
- Onboarding flow (3 screens: what the app does, medical disclaimer acknowledgment, permissions request)
- Error states for every failure mode (no internet, upload failed, inference timeout, no face detected, bad lighting)
- Loading states with progressive feedback ("Uploading... Analyzing... Generating routine...")
- Empty states (no scans yet, no products match filters)
- Settings screen (account, notification preferences, data export, delete account)
- Medical disclaimer on every results screen: "This is a cosmetic skincare tool, not a medical diagnosis."
- Privacy policy and terms of service
- App Store metadata, screenshots, description
- Crash-free rate target: 99.5%+ before submission
- Performance audit: app launch < 2s, results render < 500ms after data arrives
- Accessibility baseline: VoiceOver/TalkBack labels on all interactive elements, minimum tap target sizes

**Engineering Focus:**
- **Error boundary architecture:** Global error boundary wrapping the app. Per-screen error boundaries for graceful degradation. Errors logged to Sentry with scan context.
- **Offline handling:** TanStack Query's `persistQueryClient` for caching results locally. Questionnaire responses queued offline. Upload resumes on reconnect.
- **App Store compliance:** No medical claims in UI copy. "Analysis" not "diagnosis." "Recommendations" not "prescriptions." Legal review of every user-facing string.

---

### 2.4 Phase 3 — Capture Quality (Weeks 18–25)

**Goal:** The biggest impact phase. Transform input quality from "phone selfie" to "diagnostic-grade capture." This is where the output quality leap happens.

**Features:**
- Back camera as default with audio + haptic guidance *(Ref: Section 3.1.4)*
- Multi-angle capture (3 poses) *(Ref: Section 3.1.7)*
- Best-frame video selection *(Ref: Section 3.1.8)*
- HDR 3-bracket exposure *(Ref: Section 3.1.9)*
- Flash / no-flash pair *(Ref: Section 3.1.9)*
- Color calibration (white reference) *(Ref: Section 3.1.6)*
- Environment quality gate *(Ref: Section 3.1.3)*
- Skin prep checklist + physiological state questions *(Ref: Sections 3.1.1, 3.1.2)*
- Self-assessment with reference photo matching *(Ref: Section 3.3)*
- Touch-to-mark *(Ref: Section 3.3)*
- Backend: HDR merge, flash fusion, specular analysis + removal, CLAHE, white balance normalization, IPD-based scale normalization, multi-angle zone stitching, multi-channel color analysis *(Ref: Sections 3.4.1–3.4.10)*
- Progress tracking: ghost silhouette, scale-normalized comparison *(Ref: Section 3.6)*
- Progressive onboarding (features unlock across scans) *(Ref: Section 3.9.1)*

**Engineering Focus:**
- **Camera abstraction layer:** Don't build camera features directly into screens. Build a `CaptureService` that abstracts frame capture, exposure control, torch, and video recording behind a typed interface. When Phase 5 adds RAW/LiDAR/multi-camera, the service gets new implementations without touching the UI.
- **Preprocessing pipeline as composable steps:** Each preprocessing step (HDR merge, flash fusion, specular removal, CLAHE, etc.) is a pure function: `(image, config) → image`. They compose into a pipeline. Adding a new step in Phase 5 (RAW demosaicing, photometric stereo) means adding one function to the pipeline, not rewriting it.
- **Custom Expo Module (camera):** This phase requires manual exposure control that `expo-camera` doesn't support. Build the custom native module now using the Expo Modules API. Design the Swift/Kotlin bridge to be extensible — Phase 5 will add RAW, multi-cam, and 240fps through the same module.

---

### 2.5 Phase 4 — Smart Engine (Weeks 26–35)

**Goal:** The intelligence phase. Detection becomes diagnosis. Recommendations become personalized. The app starts knowing more about the user's skin than the user does.

**Features:**
- Fitzpatrick adaptation + skin of color conditions *(Ref: Sections 3.4.11, 3.4.12)*
- Ensemble model consensus *(Ref: Section 3.4.12)*
- Differential diagnosis (cross-zone patterns) *(Ref: Section 3.4.12d)*
- Barrier health composite score *(Ref: Section 3.4.14b)*
- Skin age *(Ref: Section 3.4.14c)*
- Treatment dependency graph *(Ref: Section 3.4.14e)*
- Data-driven skin type reclassification *(Ref: Section 3.4.11b)*
- Suspicious lesion safety screening *(Ref: Section 3.4.12c)*
- Scar classification *(Ref: Section 3.4.12)*
- Result self-audit *(Ref: Section 3.4.14h)*
- Standardized clinical grading (GAGS, IGA) *(Ref: Section 3.4.14)*
- Product barcode/OCR scanning *(Ref: Section 3.2.2)*
- Medication & treatment history *(Ref: Section 3.2.3)*
- Phased introduction protocol *(Ref: Section 3.5.2)*
- Ingredient synergy optimization *(Ref: Section 3.5.4)*
- Treatment timeline estimation *(Ref: Section 3.5.6)*
- Routine complexity modes *(Ref: Section 3.5.9)*
- Routine calendar *(Ref: Section 3.5.10)*
- Adaptive re-scan scheduling *(Ref: Section 3.5.7)*
- Environmental context (AQI, water hardness, weather, UV accumulation) *(Ref: Section 3.2.5)*

**Engineering Focus:**
- **Routine engine refactor:** The Phase 1 rule-based engine becomes a multi-stage pipeline: `detectConcerns → differentialDiagnosis → checkBarrier → buildDependencyGraph → resolvePhase → selectIngredients → checkSynergies → checkConflicts → filterProducts → generateCalendar`. Each stage is a typed, tested, composable function. The pipeline is configured by the phase/barrier/medication state, not by if-else branches.
- **Inference model versioning:** Multiple model versions coexist in Triton/ONNX Runtime. The scan job payload includes `modelVersion`. This lets you A/B test new models against the current production model without deploying a separate service.
- **Product scanning as a separate module:** Barcode → product lookup and OCR → ingredient extraction are isolated services. They fail independently (a barcode scan failure doesn't break the main scan flow). Use Open Food Facts / Open Beauty Facts API with a local cache.

---

### 2.6 Phase 5 — Advanced Capture & Hardware (Weeks 36–43)

**Goal:** Exploit every phone sensor. The features in this phase are all hardware-dependent and optional — they enhance results on capable devices but the app works without them.

**Features:**
- Device camera profiling *(Ref: Section 3.1.5)*
- RAW capture (ProRAW/DNG) *(Ref: Section 3.1.5)*
- Full-resolution capture (48–200MP) *(Ref: Section 3.1.5)*
- LiDAR / TrueDepth depth *(Ref: Sections 3.1.5, 3.1.12)*
- Macro + telephoto lens support *(Ref: Section 3.1.5)*
- Multi-camera simultaneous capture *(Ref: Section 3.1.10)*
- 240fps elasticity video *(Ref: Section 3.1.11)*
- Front-camera multispectral pass *(Ref: Section 3.1.13)*
- On-device hair/obstruction detection *(Ref: Section 3.1.16)*
- On-device makeup detection *(Ref: Section 3.1.1)*
- Backend: RAW demosaicing, LiDAR depth analysis, photometric stereo, rPPG blood flow, elasticity analysis, multispectral analysis, focus stacking *(Ref: Sections 3.4.1–3.4.8)*
- Predictive analytics (breakout, sun damage, dehydration) *(Ref: Section 3.4.14d)*
- Background upload architecture *(Ref: Section 11.4)*
- Battery & performance optimization *(Ref: Section 11.5)*
- Lazy model download *(Ref: Section 11.3)*

**Engineering Focus:**
- **Capability detection pattern:** Every hardware feature is gated by a capability check. `DeviceCapabilities` is a typed object populated at app launch: `{ hasLiDAR: boolean, hasRaw: boolean, hasMacro: boolean, ... }`. The capture flow reads this object and enables/disables features. NEVER check platform/device model — check capability.
- **On-device ML as Expo Modules:** BiSeNet, makeup detection, and face mesh run via CoreML (iOS) and TFLite (Android) through custom Expo Modules. The JS API is identical on both platforms: `segmentHair(frame) → Promise<Mask>`. Platform differences are buried in native code.
- **Graceful degradation as a design principle:** Every advanced feature degrades to the Phase 3 baseline. No LiDAR → IPD-based scale. No RAW → JPEG pipeline. No 240fps → 60fps. No macro → standard close-up. The degradation paths are tested explicitly.

---

### 2.7 Phase 6 — Engagement & Growth (Weeks 44–51)

**Goal:** Retention. The app is powerful but users need reasons to return daily (routine adherence) and monthly (re-scans). This phase makes SkinSense a habit.

**Features:**
- Interactive 3D face map *(Ref: Section 3.7.1)*
- Skin Health Score as headline *(Ref: Section 3.7.2)*
- Before/after comparison slider *(Ref: Section 3.7.4)*
- Real-time AR overlay *(Ref: Section 3.7.3)*
- Achievement system (streaks, milestones, badges) *(Ref: Section 3.7.9)*
- Context-aware notifications *(Ref: Section 3.7.10)*
- Weekly digest *(Ref: Section 3.7.11)*
- Skin diary *(Ref: Section 3.7.14)*
- Natural language report (LLM-generated) *(Ref: Section 3.7.5)*
- Printable routine card *(Ref: Section 3.7.12)*
- Accessible output formats (audio, simple language, high contrast) *(Ref: Section 3.7.13)*
- Full accessibility implementation *(Ref: Section 3.1.18)*
- Emotional design + information hierarchy *(Ref: Sections 3.9.2, 3.9.4)*
- Notification budget *(Ref: Section 3.9.5)*

**Engineering Focus:**
- **Notification service as a separate backend module:** Notifications are complex (multiple trigger sources, priority, budget, timing, user preferences). Build a `NotificationService` that receives events from the scan pipeline, routine engine, weather API, health app, and calendar — and decides what to send, when, and how. Not scattered `sendNotification()` calls across the codebase.
- **LLM report generation with verification:** Call the Claude API to generate the natural language report, passing structured scan data as context. The response is validated against the actual findings before rendering — every factual claim must map to a pipeline output. Use the Claude API's tool-use/structured output to ensure the report adheres to a typed schema.
- **3D face map as a reusable component:** Build the face map as a standalone `<FaceMap>` component that accepts `findings[]` and `layers[]` as props. It renders in the results screen, the progress comparison, and the AR overlay. One component, three contexts.

---

### 2.8 Phase 7 — Ecosystem (Weeks 52–61)

**Goal:** Connect SkinSense to the broader health ecosystem. This is where the app becomes a platform.

**Features:**
- Dermatologist clinical export (PDF) *(Ref: Section 3.7.6)*
- Dermatologist collaboration portal (web) *(Ref: Section 3.10.2)*
- Dermatologist feedback loop *(Ref: Section 3.7.8)*
- Health app integration (HealthKit / Health Connect) *(Ref: Section 3.2.6)*
- Historical photo import *(Ref: Section 3.6)*
- Multi-profile / family *(Ref: Section 3.10.1)*
- Predictive visualization (what-if) *(Ref: Section 3.7.7)*
- Personalized learning (per-ingredient efficacy) *(Ref: Section 3.5.3)*
- Causal inference engine *(Ref: Section 3.6)*
- Longitudinal correlation *(Ref: Section 3.6)*
- Life-stage adaptation (pregnancy, menopause) *(Ref: Section 3.4.14f)*
- Medication side-effect attribution *(Ref: Section 3.4.14g)*
- Seasonal auto-adjustment *(Ref: Section 3.5.8)*
- Voice input with NLP *(Ref: Section 3.2.4)*
- Routine version history *(Ref: Section 3.10.3)*
- Data portability + account deletion *(Ref: Section 3.10.4)*
- GDPR compliance *(Ref: Section 3.10.4)*

**Engineering Focus:**
- **Dermatologist portal as a separate Next.js app** in the monorepo (`apps/portal`). Shares `@skinsense/types` with the mobile app and API. Read-only, no PHI storage in the portal — it queries the main API with a scoped access token.
- **Health app integration via Expo Modules:** HealthKit (iOS) and Health Connect (Android) require native permissions and APIs. Build as an Expo Module that abstracts both behind a unified interface: `getRecentSleep(days: 7) → SleepData[]`.
- **Federated learning deferred:** This requires 10,000+ users. Don't build it until you have the data. Use clinical literature defaults until then. Mark it in the code as `// TODO: Phase 7b — federated learning when user base > 10k`.

---

### 2.9 Risk Register (Solo Developer)

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Burnout from scope | Critical | Each phase has a hard feature freeze. Ship what's done. Defer what's not. The spec is a vision, not a deadline. |
| "AI slop" code quality | High | Engineering principles (Section 2.0) are non-negotiable. Review every LLM-generated line. If you don't understand it, don't merge it. |
| Model training data | High | Start with public datasets (ISIC, Fitzpatrick17k, DermNet). Fine-tune with user-consented data over time. Don't wait for perfect data to ship. |
| App Store medical claims rejection | High | Legal review of ALL user-facing text before Phase 2 submission. "Cosmetic skincare recommendations" — never "diagnosis" or "treatment." |
| Expo camera limitations | Medium | Build the custom native module in Phase 3, not later. Do a feasibility spike in Phase 0 (1 day) to confirm the Expo Modules API can control exposure. |
| Solo dev bus factor | Critical | Document every architecture decision in ARCHITECTURE.md. Write ADRs (Architecture Decision Records) for non-obvious choices. If you need to bring on a second developer in Phase 5+, they can ramp up from docs, not from your memory. |
| Scope creep from this spec | High | This spec is 2000 lines. You are NOT building all of it in Phase 1. Treat each phase as a separate product. Phase 1 is a simple skin scanner. Phase 7 is a health platform. They're different products at different stages. |

---

## 3. Core Functional Requirements

### 3.1 Smart Capture & Client-Side Validation

#### 3.1.1 Skin Preparation & Pre-Scan Readiness

Before entering the capture flow, the app presents a **pre-scan checklist** to ensure the skin surface is in a diagnostic-ready state. No amount of image processing can recover accurate data from skin that is covered by products or in a transient physiological state.

- **Preparation Checklist (shown once, dismissable after first scan):**
  - Cleanse face and remove all makeup, foundation, concealer, tinted moisturizer, and SPF with white cast.
  - Wait 15 minutes after washing so the skin's natural oil and redness baseline returns (freshly washed skin masks oiliness and suppresses redness).
  - Pat dry — water droplets on the skin create specular reflections that mimic texture anomalies.
  - Pin hair back from the face to expose the full forehead, temples, and jawline.
- **Makeup / Product Detection:** A lightweight on-device classifier (trained on paired bare-skin vs. foundation-covered images) runs on the camera preview feed. Foundation has a distinctive uniform smoothness and hue shift that natural skin never exhibits. If cosmetic coverage is detected, the app prompts: "We think you may be wearing makeup — results will be more accurate on bare skin. Continue anyway?" If the user continues, the analysis report notes that results may have reduced accuracy due to detected cosmetic coverage.
- **Glasses & Accessory Removal:** Face landmark analysis detects glasses frames occluding the periorbital (under-eye) and nose bridge zones. The app prompts removal before capture to ensure full zone coverage.

#### 3.1.2 Physiological State Context

Transient skin states look identical to chronic conditions under a camera. The app captures context that helps the scoring engine distinguish real findings from temporary noise:

- **Pre-Scan Questions (2 quick taps):**
  - "Have you exercised in the last 30 minutes?" — Post-exercise vasodilation causes widespread temporary redness indistinguishable from rosacea or erythema. If yes, the app advises waiting 30 minutes, or proceeds with a metadata flag that discounts redness scores.
  - "Have you showered with hot water in the last 20 minutes?" — Hot water dilates capillaries and causes transient flushing, especially on cheeks and nose.
- **Ambient Temperature:** Read from the device's environmental sensor (if available) or from a weather API using the device's location. Extremes are flagged:
  - Cold (<10°C): Capillary constriction may mask real redness — erythema scores receive a low-confidence modifier.
  - Hot (>32°C): Vasodilation and sweat may inflate redness and texture readings.
- **Time of Day:** Captured automatically from the device clock and stored with every scan. Morning puffiness (periorbital fluid retention) and evening fatigue affect under-eye analysis differently. For progress tracking, the app recommends scanning at a consistent time and flags comparisons between scans taken >4 hours apart in the day.
- **Menstrual Cycle Phase (Optional):** Hormonal acne follows a strongly cyclical pattern (typically flaring in the luteal phase, days 15–28). If the user opts in, the app tracks cycle phase and overlays it on the progress timeline so that hormonal flare-ups are contextualized rather than interpreted as routine failure.

#### 3.1.3 Environment Quality Gate

Before capture begins, the app evaluates whether the user's environment is suitable for diagnostic-quality imaging:

- **Light Source Detection:** Using the color calibration reference (see below), the backend classifies the dominant light source — daylight (~5500K), fluorescent (~4000K with green spike), incandescent (~2700K), or mixed. Mixed lighting is flagged as suboptimal because it creates uneven color casts across the face that calibration alone cannot fully correct.
- **Guided Light Positioning:** Beyond just detecting light quality, the app actively guides the user to the optimal position relative to their light source: "Step forward so the light is above and slightly in front of you." The target is overhead-forward illumination at ~45° elevation, which provides even diffuse coverage across all facial zones with minimal shadow. The app estimates the dominant light direction from shadow analysis on the face preview and shows a directional arrow until the user is positioned correctly.
- **Environment Quality Indicator:** A real-time traffic-light indicator is displayed on the capture screen:
  - **Green:** Even, diffuse, overhead-forward lighting (e.g., bathroom with overhead light, user facing it). Optimal for scanning.
  - **Yellow:** Acceptable but suboptimal (e.g., warm indoor lamp, slightly uneven, light from the side). Scan will proceed with a note that results may have reduced accuracy.
  - **Red:** Unsuitable environment (direct sunlight creating harsh shadows, extremely dim, strong backlighting, or upward lighting from below creating unnatural shadows). The app blocks capture and suggests the user move to a bathroom mirror with overhead lighting.
- **Direct Sunlight Rejection:** Hard directional shadows across facial contours are detected via shadow edge analysis on the preview feed. These shadows are misinterpreted by segmentation models as skin features and must be avoided.

#### 3.1.4 Camera Selection & Capture Modes

The back camera is the **default and recommended** capture method. Flagship back cameras have 4–10x better specs than front cameras in every dimension that matters for skin analysis: resolution (48–200MP vs. 12MP), autofocus (PDAF + laser AF vs. fixed focus), sensor size (1/1.3" vs. 1/3.6"), optical stabilization (OIS vs. none), and RAW capture support. The front camera is offered as a fallback for users who cannot use any back-camera mode.

**Back Camera Modes (recommended — listed in order of quality):**

| Mode                                 | How It Works                                                                                                                                                                                                                                                                                                              | Best For                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Audio-Guided Self-Scan** (default) | User holds phone with back camera facing their face. The app detects the face via the back camera feed and provides **real-time voice instructions + haptic feedback** to guide positioning: "Move the phone slightly left... tilt up... hold still." Auto-captures when aligned. The user never needs to see the screen. | Solo use, visually impaired users, best image quality      |
| **Mirror Mode**                      | User faces a bathroom mirror, holds the phone beside their head with the back camera aimed at their reflection. The app detects the mirrored face, guides framing via on-screen overlay, and un-mirrors the image in processing.                                                                                          | Users who want visual feedback while using the back camera |
| **Assisted Mode**                    | Another person holds the phone and captures the scan. The app shows on-screen framing targets and angle guides to the photographer. Voice cues guide the subject's head positioning.                                                                                                                                      | Highest-quality captures, users with motor impairments     |
| **Stand/Tripod Mode**                | Phone is propped on a surface or mount. The user positions themselves in front using a voice-guided countdown. Especially useful with phone holders that ensure consistent distance and angle across sessions.                                                                                                            | Most consistent for progress tracking, hands-free          |

**Front Camera Mode (fallback):**
Available for users who prefer it or cannot use any back-camera mode. Uses the screen-as-fill-light technique (Section 2.1.9) and software-controlled front flash. The app notes that front camera results may have reduced detail on devices with low-resolution front sensors.

**Mode Recommendation Logic:** On first launch, the app recommends the optimal mode based on the device hardware profile. If the back camera is significantly higher quality than the front (which it almost always is), Audio-Guided Self-Scan is the default. The user can switch modes at any time.

#### 3.1.5 Device Camera Profiling & Hardware Capabilities

Not all phone cameras are the same instrument. A 48MP flagship sensor and a 5MP budget front camera produce fundamentally different image quality. The app profiles the device at first launch and unlocks hardware-specific features:

- **First-Launch Calibration:** On first use, the app captures a test image of the white calibration card and profiles the selected camera: effective resolution, noise floor (signal-to-noise ratio in flat skin regions), color accuracy (deviation from known white reference), and lens distortion characteristics. This produces a **per-device quality profile** stored locally. The profile is generated separately for back and front cameras.
- **Adaptive Thresholds:** Detection sensitivity, minimum resolution requirements, and texture analysis parameters are adjusted per device profile. A low-resolution camera gets more aggressive CLAHE and lower-confidence thresholds with appropriate disclaimers ("Results may be less detailed on this device"); a high-resolution camera uses tighter parameters for finer detection.
- **Minimum Hardware Gate:** If the selected camera falls below a usable floor (e.g., <5MP effective resolution, severe lens distortion, or extremely high noise floor), the app warns upfront: "Your camera may not capture enough detail for accurate skin analysis. Results will be approximate." If the back camera is above the floor but the front camera is below, the app strongly recommends switching to a back-camera mode.
- **Cross-Device Bridging:** If a user switches phones, the first scan on the new device is flagged as a "new baseline" for progress tracking. The app warns that score deltas between devices may not be directly comparable and recommends a fresh baseline scan.

**Hardware Feature Detection & Unlock:**

The app probes the device for advanced hardware capabilities and unlocks enhanced capture features when available:

| Capability                                      | Detection                                        | What It Enables                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RAW Capture** (ProRAW on iOS, DNG on Android) | `expo-camera` API capability check               | Bypasses the phone's entire processing pipeline — no beauty smoothing, no noise reduction that destroys skin texture, no tone mapping. RAW frames are uploaded alongside JPEGs; the backend uses RAW for analysis and JPEG for the user-facing preview. Dramatically better texture and color data.                                                                                                  |
| **Full-Resolution Sensor** (48–200MP)           | EXIF max resolution query                        | Captures at the sensor's native resolution instead of the default pixel-binned 12MP output. 4–16x more skin detail per frame. Used for the primary analysis frames; pixel-binned output is used for previews to save bandwidth.                                                                                                                                                                      |
| **LiDAR / Time-of-Flight Depth Sensor**         | ARKit (iOS) or Camera2 API (Android) depth check | Captures a depth map alongside every frame. Enables: (1) distinguishing raised lesions (papules, cysts, nodules) from flat pigmentation by measuring surface height; (2) accurate distance measurement without IPD estimation; (3) 3D facial mesh for perfectly consistent progress tracking — the face is aligned in 3D space, not 2D, eliminating all angle/distance variability between sessions. |
| **Macro Lens** (dedicated 2–4cm focus)          | Lens array enumeration                           | Replaces the software close-up pass (Section 2.4.7) with true macro photography at 2–4cm focus distance. Resolves individual pore walls, micro-comedone structure, and sebaceous filament detail that even high-resolution standard lenses cannot capture at full-face distance.                                                                                                                     |
| **Telephoto Lens** (3–5x optical zoom)          | Lens array enumeration                           | Provides close-up detail at a comfortable working distance (~30cm) instead of requiring the user to bring the phone within 10–15cm of their face. Better for the close-up refinement pass.                                                                                                                                                                                                           |
| **OIS (Optical Image Stabilization)**           | Camera API capability check                      | Relaxes the stability gate threshold (Section 2.1.10) since OIS compensates for hand shake optically. Allows longer exposure times in low light without motion blur.                                                                                                                                                                                                                                 |

#### 3.1.6 Color Calibration

- **White Reference Capture:** Before the facial scan, the app prompts the user to photograph a white reference surface (e.g., a sheet of paper) under their current lighting. This white-balance reference is sent alongside the scan so the backend can normalize color temperature per device, ensuring consistent LAB/HSV thresholds for erythema and pigmentation detection across different phone cameras.
- **Per-Session Calibration:** The calibration reference is captured once per scan session. If the user changes location between scans, the app prompts for a new calibration.

#### 3.1.7 Multi-Angle Guided Capture

A single frontal photo misses the sides of the nose, jawline, temples, and under-chin — all common problem areas for acne, hyperpigmentation, and texture concerns. The app guides the user through **3 sequential poses** using on-screen head-position targets:

| Pose          | Head Rotation | Zones Captured                                                           |
| ------------- | ------------- | ------------------------------------------------------------------------ |
| **Frontal**   | 0°            | Forehead, nose bridge, central cheeks, chin                              |
| **Left 45°**  | ~45° left     | Left jawline, left temple, left nostril fold, left ear-adjacent area     |
| **Right 45°** | ~45° right    | Right jawline, right temple, right nostril fold, right ear-adjacent area |

- **Pose Detection:** MediaPipe face mesh landmarks (available via `expo-camera` preview frames) calculate real-time head yaw. The capture triggers automatically when the user's head angle falls within ±5° of the target pose.
- **On-Screen Guide (Front Camera / Mirror Mode):** A translucent silhouette overlay shows the target head position. The silhouette turns green when the user is aligned, then auto-captures.
- **Audio + Haptic Guide (Audio-Guided / Stand Mode):** Voice instructions direct the user through each pose: "Look straight ahead... good. Now turn your head to the left... a little more... hold still." A short haptic pulse confirms each successful capture. This enables full back-camera quality without the user ever needing to see the screen.

#### 3.1.8 Video-Based Best-Frame Selection

Rather than requiring the user to hold perfectly still for a burst capture, the app records a **2-second video clip per angle** and algorithmically selects the optimal frame. Each frame in the clip is scored by:

- **Sharpness:** Laplacian variance — higher values indicate sharper focus with more skin detail preserved.
- **Stability:** Face landmark displacement between adjacent frames — minimal movement means no motion blur.
- **Exposure quality:** Histogram spread analysis — the frame with the widest tonal range (no clipping in highlights or shadows) is preferred.
- **Eye state:** Blink detection via eye-aspect-ratio from face landmarks — frames where the user is blinking are discarded.

The top-scoring frame from each 2-second clip is selected automatically. This is far more forgiving than static burst capture — the user just holds roughly steady and the system picks the winner.

#### 3.1.9 Multi-Exposure & Flash Capture

For each of the 3 angles, the app captures the following frame set from the best-frame video selection:

- **HDR Bracket:** 3 exposures at -1EV, 0, +1EV to recover detail in both oily highlight zones (where shine washes out pores) and shadowed areas (where dark spots disappear into undertone).
- **Flash / No-Flash Pair:** One frame with the device torch (back camera) or screen flash (front camera) enabled, one without. The flash image reveals surface texture (pores, fine lines, raised lesions) through micro-shadow contrast. The no-flash image preserves natural color for redness and pigmentation analysis. Back camera mode is preferred here — the rear torch is significantly brighter and more directional than the screen-based front flash, producing stronger micro-shadow contrast for texture detection.

Total frames per scan: **3 angles × 5 frames = 15 frames** + 1 calibration reference = **16 frames**. When RAW capture is available (Section 2.1.5), each frame is captured as both RAW + JPEG (RAW for analysis, JPEG for user preview), doubling the raw file count but not the capture effort.

#### 3.1.10 Multi-Camera Simultaneous Capture (When Available)

Modern flagships have 3–4 back cameras. Instead of choosing one lens, the app captures from **multiple cameras simultaneously** during each angle's video clip — no additional user effort required:

| Lens | Role | Data Produced |
|------|------|--------------|
| **Wide (main)** | Primary analysis: color, texture, all detection models | Full-resolution HDR composite per angle |
| **Ultrawide** | Full face + neck + upper chest context in a single frame. On devices where the ultrawide doubles as a macro lens (iPhone 13 Pro+), it also serves the close-up pass. | Wide-context frame for full coverage map; macro detail when supported |
| **Telephoto** (if present) | Simultaneous optical close-up of the highest-interest zone (e.g., nose/T-zone) while the wide captures the full face | High-resolution crop of a target zone without the user moving the phone closer |

- **Simultaneous Trigger:** iOS (AVCaptureMultiCamSession) and Android (Camera2 multi-camera API) support firing multiple cameras in the same capture window. The app triggers all available back cameras at the same instant for each angle.
- **Lens-Specific Calibration:** Each lens has different color rendition, distortion, and noise characteristics. The device profiling step (Section 2.1.5) calibrates each lens independently so that data from different cameras is comparable.
- **Automatic Role Assignment:** The app detects which lenses are available and assigns roles. If no telephoto exists, the wide handles everything. If no ultrawide exists, the wide captures the context frame at a slightly wider crop. The pipeline adapts gracefully to any lens combination.

#### 3.1.11 Skin Elasticity & Dynamic Assessment Video

A static image cannot measure skin firmness, elasticity, or dynamic wrinkle behavior. A short guided expression video captures these properties with zero additional hardware:

- **Expression Sequence (5 seconds total):** After the standard multi-angle capture, the app prompts the user through 3 quick expressions via voice + on-screen cues:
  1. **Raise eyebrows, then relax** (~2s) — measures forehead skin elasticity and dynamic vs. static wrinkle depth. Wrinkles that appear only during the raise are dynamic (early stage); wrinkles visible at rest are static (advanced).
  2. **Smile wide, then relax** (~2s) — measures nasolabial fold depth, crow's feet behavior, and cheek skin recovery speed.
  3. **Neutral hold** (~1s) — baseline reference.
- **What the Backend Extracts:**
  - **Elasticity score per zone:** The speed and completeness of the skin's return to resting position after each expression. Slower recovery = lower elasticity = reduced collagen density.
  - **Dynamic vs. static line classification:** Lines visible only during expression are classified separately from lines visible at rest, enabling more targeted treatment recommendations (preventive vs. corrective).
  - **Muscle movement symmetry:** Asymmetric facial movement can indicate underlying conditions worth flagging.
- **Capture Conditions:** Recorded at **240fps slow-motion** when supported (most modern flagships), falling back to 120fps or 60fps on older devices. At 240fps, a recovery event that takes 200ms produces 48 frames — enough to fit a precise exponential decay curve and extract a biomechanical elasticity coefficient. At 60fps the same event is only 12 frames, limiting analysis to rough "fast/medium/slow" buckets. The difference between healthy elasticity and early collagen loss may be only 30–50ms of recovery time — invisible at 60fps, measurable at 240fps. The video is 5 seconds × 240fps = 1200 frames, uploaded as a separate H.265 video file (~10–20 MB).
- **Optional:** This step is presented as "Want a deeper analysis?" after the standard scan. Users who want quick results can skip it.

#### 3.1.12 TrueDepth Front Camera Depth (iOS Fallback)

On iPhones, even the front camera fallback mode gets 3D depth data. Apple's TrueDepth system (used for Face ID) projects 30,000 infrared dots to create a structured-light depth map — separate from the back-camera LiDAR.

- **When It Applies:** Any iPhone X or later using front camera mode. The depth data is captured automatically alongside the color frames using ARKit's face tracking API.
- **What It Enables:** The same raised-lesion detection, lesion height measurement, and 3D facial mesh alignment described in Section 2.4.3 — meaning front camera mode on iPhones is not as degraded as the resolution gap alone would suggest. Users who prefer front camera selfie capture still get 3D analysis.
- **Limitations:** TrueDepth depth resolution is lower than back-camera LiDAR, and the working range is shorter (~25–50cm vs. up to 5m). Adequate for facial analysis at selfie distance but not for stand/tripod mode at arm's length.

#### 3.1.13 Front-Camera Multispectral Pass

After the back-camera main scan completes, the app offers an optional **multispectral capture** using the front camera + screen as a tunable light source. The phone screen is an RGB emitter that can display any color — by illuminating the face with specific wavelengths and capturing the reflection, the system performs controlled single-wavelength imaging that reveals skin properties invisible under white light. The back camera cannot do this because the screen faces away from the face during back-camera capture.

- **Capture Sequence (~3 seconds):** The app prompts the user to flip the phone to front camera. In a dimmed environment (same bathroom with the light off), the screen rapidly displays solid color screens while the front camera captures one frame under each:

| Screen Color | Wavelength | What It Reveals |
|-------------|-----------|----------------|
| **Red** | ~620nm | Penetrates ~1–2mm into skin. Subsurface vascular patterns and deep inflammation invisible at the surface become visible. |
| **Green** | ~520nm | Maximum hemoglobin absorption. Capillary networks, erythema, and redness show at peak contrast — far better than analyzing the green channel of a white-light photo, because no other wavelengths are present to dilute the signal. |
| **Blue** | ~450nm | Maximum melanin absorption. Faint sun spots and early-stage melasma that are invisible under white light become visible due to enhanced melanin contrast. |
| **Violet** | ~405nm | P. acnes bacteria on the skin produce porphyrins that **fluoresce orange-red under ~405nm excitation**. This detects active bacterial acne colonies before they surface as visible breakouts — effectively a UV Wood's lamp approximation from a phone screen. |

- **LCD Polarization Bonus:** LCD screens emit polarized light as a byproduct of how they work. Surface reflections (specular/oily shine) preserve the screen's polarization, while light that penetrated the skin and scattered back loses polarization. By analyzing polarization-dependent intensity differences in the captured frames, the pipeline can computationally separate surface reflection from subsurface scattering — a crude but real form of **cross-polarization**, the gold standard technique in dermatoscopy. OLED screens have a weaker but still measurable polarization effect from their circular polarizer layer.
- **When to Offer:**
  - **Always offer if active acne was flagged** — the violet-light bacterial detection is especially valuable for acne-prone users.
  - **Skip if environment is too bright** — ambient light sensor reads >200 lux (bright room). Screen illumination must be dominant for the wavelength separation to work. The app detects this and hides the option.
  - **Skip in simplified mode** — cognitive load reduction omits this step.
  - **User can always decline** — the back-camera scan is complete and sufficient on its own. Multispectral data is additive, not required.
- **Transition UX:** Voice prompt: "Great scan! Now flip your phone around for a quick light scan — we'll flash a few colors to check deeper." A single flip, 3 seconds of capture, done. The user flips back to see results.

#### 3.1.14 Screen-as-Fill-Light (Front Camera Mode)

When using the front camera, the phone screen is the dominant light source on the user's face. Rather than treating this as a limitation, the capture system exploits it as a controlled illumination source:

- **Neutral Fill Screen:** During capture, the screen is set to maximum brightness and displays a **neutral white border** around the camera viewport. This provides consistent, diffuse frontal lighting that reduces under-eye shadows and evens illumination across all facial zones.
- **Software-Controlled Front Flash:** For the flash/no-flash pair in front-camera mode (where the rear torch doesn't illuminate the face), the screen cycles between full-white (fill light ON) and black (ambient only). This provides a controlled "front flash" that's actually more useful than the rear torch for selfie-mode captures because the illumination is frontal and diffuse rather than off-axis and harsh.
- **Color-Neutral Guarantee:** The fill screen uses a calibrated D65 white point (6500K) to avoid introducing color bias. The calibration reference accounts for any residual screen color cast.

#### 3.1.15 Phone Orientation & Stability Lock

Inconsistent phone positioning introduces variability that the pipeline must normalize away. Locking orientation and stability at capture time is cheaper and more reliable than correcting in post-processing:

- **Level Hold Enforcement:** The device gyroscope and accelerometer verify the phone is held within ±10° of vertical during capture. Tilt beyond this range changes the lighting angle relative to the face, creating asymmetric shadows that make one cheek appear different from the other. If the phone is tilted, a visual level indicator prompts the user to straighten.
- **Stability Gate:** The accelerometer variance must fall below a threshold for 0.5 seconds before video capture begins. This pre-filters the worst hand shake before the best-frame algorithm even runs, ensuring the candidate pool starts with reasonable stability.
- **Landscape Rejection:** The app locks to portrait orientation during capture. Landscape hold changes the relationship between face zones and the camera's autofocus grid, producing inconsistent sharpness distribution across the face.

#### 3.1.16 Hair & Obstruction Detection

Hair falling across the forehead or cheeks causes false positives — dark hair reads as hyperpigmentation, fine strands read as texture anomalies.

- **Real-Time Obstruction Check:** A lightweight segmentation model (BiSeNet, running on-device via TFLite/CoreML) separates hair, hands, and accessories from skin in the preview feed.
- **Zone Occlusion Threshold:** If >30% of any facial zone is occluded by hair or other obstructions, the app pauses capture and prompts: "We can see hair covering your forehead — please pin it back for a more accurate scan."
- **Partial Occlusion Masking:** For minor obstruction (<30%), the occluded pixels are flagged in the upload metadata so the backend masks them out of analysis rather than misclassifying them.

#### 3.1.17 High-Fidelity Upload

- **Image Quality:** All frames are uploaded as high-quality JPEG (quality 92+, target size: 2–4 MB per frame) or PNG. When RAW capture is available (Section 2.1.5), RAW files (10–25 MB each for ProRAW/DNG) are uploaded alongside compressed JPEGs — RAW is used for backend analysis, JPEG for the user-facing preview and progress timeline.
- **LiDAR / TrueDepth Maps:** When a depth sensor is available (back LiDAR or front TrueDepth), the depth map for each frame is uploaded as a 16-bit grayscale PNG alongside the color image. Depth maps are small (~0.5–1 MB each) relative to the color frames.
- **Multi-Camera Frames:** When simultaneous multi-camera capture is active (Section 2.1.10), ultrawide and telephoto frames are uploaded alongside the main wide frames. These are lower priority — if bandwidth is constrained, the wide frames upload first.
- **Elasticity Video:** The 5-second expression sequence (Section 2.1.11) is uploaded as an H.265 video file (~10–20 MB at 240fps) alongside the still frames. Flagged as optional in the upload queue — skipped under bandwidth pressure.
- **Multispectral Frames:** The 4 front-camera frames from the multispectral pass (Section 2.1.13) — red, green, blue, violet illumination — are uploaded as standard JPEG (~1–2 MB each). Small payload, high diagnostic value.
- **Focus-Stacked Close-Up Video:** The 1-second focus sweep for the close-up pass (Section 2.4.12) is uploaded as an H.265 video (~3–5 MB) for server-side focus stacking.
- **Upload Budget:** Varies by device capability:
  - **Standard (JPEG only):** 16 frames × ~3 MB = ~48 MB per scan
  - **Full-resolution (48MP+ JPEG):** 16 frames × ~8 MB = ~128 MB per scan
  - **RAW + JPEG + Depth:** 16 frames × ~30 MB = ~480 MB per scan (flagship maximum)
    All frames are uploaded in parallel to S3 via presigned URLs with resumable multipart upload. On WiFi this completes quickly; on LTE the upload runs entirely in the background during the questionnaire and self-assessment. For RAW-capable devices on cellular, the app offers "Upload RAW on WiFi only" to avoid burning the user's data plan — JPEGs upload immediately, RAW files queue until WiFi is available.
- **Resumable Uploads:** If the connection drops mid-upload, completed frames are not re-uploaded. The client resumes from the last incomplete frame using S3 multipart upload.
- **Adaptive Upload Strategy:** The app monitors upload speed during the first few frames. If throughput is below 2 Mbps, it automatically drops to JPEG-only mode (skipping RAW and full-resolution) and flags the scan metadata so the backend applies more aggressive preprocessing to compensate.

#### 3.1.18 Accessibility

Building for back-camera audio guidance as the default capture mode means the entire scan flow works without vision. The app extends this foundation to support a range of accessibility needs:

- **Full VoiceOver / TalkBack Compatibility:** Every screen, control, and state change in the capture flow has proper accessibility labels and announcements. The scan flow is fully navigable via screen reader.
- **Audio-First Capture Flow:** The default Audio-Guided Self-Scan mode (Section 2.1.4) provides step-by-step voice instructions for every stage: skin prep reminders, environment check, calibration, positioning, pose guidance, and capture confirmation. No visual feedback is required at any point.
- **Haptic Feedback Layer:** Key events are communicated through distinct vibration patterns:
  - Short pulse: capture triggered successfully
  - Double pulse: pose change needed (turn head)
  - Long buzz: capture blocked (environment too dark, face not detected, obstruction)
  - Success pattern: scan complete
- **Voice-Triggered Controls:** Users can say "capture," "skip," "repeat," or "stop" instead of tapping buttons. Useful for users with motor impairments who may have difficulty reaching the screen while holding the phone in position.
- **Motor Impairment Accommodations:**
  - **Assisted Mode** (Section 2.1.4) allows another person to operate the phone entirely.
  - **Stand/Tripod Mode** eliminates the need to hold the phone steady.
  - Tap targets throughout the app meet WCAG 2.2 minimum size (44×44dp).
  - The self-assessment reference photo grid (Section 2.3) supports both tap and swipe-to-select for users with limited fine motor control.
- **Cognitive Load Reduction:** The scan flow can operate in a **simplified mode** that reduces the number of steps and decisions:
  - Skips the manual environment quality check (relies on auto-detection only)
  - Reduces pre-scan questions to a single "Are you ready to scan?" confirmation
  - Uses audio narration to walk through each step one at a time with no concurrent information
  - Hides advanced options (RAW capture, close-up pass) unless explicitly enabled in settings
- **Low-Vision Mode:** For users with partial vision, the capture UI switches to high-contrast mode with large text overlays and exaggerated color indicators (bright green/red for environment quality, oversized framing guides). Audio remains the primary guidance channel.

### 3.2 Diagnostic Questionnaire & User Input

#### 3.2.1 Skin Assessment Questions

- **Barrier Health Assessment:** 4–6 dynamic questions evaluating skin oiliness, tightness post-cleansing, flaking, sensitivity, and sun exposure frequency.
- **Allergies & Exclusions:** Capture of ingredient sensitivities (e.g., fragrance, essential oils, specific acids) and pregnancy/lactation safety constraints.

#### 3.2.2 Current Routine & Product Scanning

The recommendation engine cannot generate a safe, effective routine without knowing what the user is **already applying**. Recommending retinol to someone already on tretinoin is dangerous. Adding BHA when the user already uses daily AHA may destroy their barrier.

- **Product Barcode Scanning:** The user points the back camera at each product they currently use. The app scans the barcode and cross-references a product database (Open Beauty Facts, or a proprietary catalog) to retrieve the full ingredient list, active concentrations, and product category (cleanser, serum, moisturizer, SPF).
- **Ingredient List OCR Fallback:** If the barcode isn't in the database, the user photographs the ingredient list on the back of the product. On-device OCR (Apple Vision / ML Kit) extracts the INCI ingredient names. The system parses and categorizes them automatically.
- **"My Current Routine" Profile:** Products are organized into the user's existing AM/PM routine. The system knows exactly which actives are already being applied, at what step, and at what frequency.
- **Conflict Detection Against Current Routine:** The recommendation engine factors in existing products before generating new recommendations:
  - Avoids redundancy (user already uses niacinamide serum → don't recommend another niacinamide product)
  - Catches dangerous interactions (user uses benzoyl peroxide → warn about combining with retinoid in the same step)
  - Identifies products that may be causing detected issues ("Your current moisturizer contains comedogenic ingredients — this may be contributing to the clogged pores we detected on your chin")
- **"What Should I Stop Using?":** The engine can recommend product removals, not just additions. If a current product contains a flagged allergen or a comedogenic ingredient correlated with detected concerns, it's flagged for replacement.
- **Periodic Re-Scan Prompt:** Every 60 days, the app prompts the user to re-scan their products in case they've changed their routine.

#### 3.2.3 Medication & Treatment History

Certain medications and recent treatments dramatically alter the skin's behavior and what's safe to recommend:

- **Active Medications (required on first scan):**
  - Isotretinoin (Accutane) — skin is extremely sensitive, most actives are contraindicated, the routine must be minimal (gentle cleanser + heavy moisturizer + SPF only)
  - Hormonal birth control — affects sebum production and acne patterns
  - Topical prescription retinoids (tretinoin, adapalene) — captured via product scanning, but oral retinoids are captured here
  - Antibiotics (oral or topical) — affects the skin microbiome and bacterial acne dynamics
  - Corticosteroids — can cause skin thinning with prolonged use
- **Recent Professional Treatments:**
  - Chemical peels — skin is in recovery; redness and sensitivity are expected, not pathological. The system flags "recovery state" and adjusts severity scores.
  - Laser treatments — same recovery context
  - Microneedling — 48–72 hour recovery window where redness/texture is expected
- **Impact on Analysis:** Medication and treatment context adjusts both detection (don't flag recovery-state redness as rosacea) and recommendations (don't recommend actives that conflict with current medication).

#### 3.2.4 Voice Description (Free-Form Context)

Structured questionnaires miss nuance. "I switched moisturizers last week and my chin started breaking out" is critical context that no multiple-choice question can capture.

- **Optional Voice Input:** After the structured questions, the app offers: "Anything else you want us to know? Just say it." The user speaks freely for up to 30 seconds.
- **On-Device Transcription:** Speech-to-text runs locally (Whisper on-device, Apple Speech, or Google ML Kit) — no audio is uploaded to the server, only the transcript.
- **NLP Signal Extraction:** The backend extracts structured signals from the transcript:
  - Product changes and timeline ("switched moisturizer last week" → flag moisturizer change, 7 days ago)
  - Specific concerns and locations ("this bump on my chin won't go away" → high-priority marker on chin zone)
  - Texture/sensation descriptions ("it feels rough", "stings when I apply products" → barrier compromise indicators)
  - Trigger identification ("breaks out before my period", "worse when stressed" → hormonal/cortisol correlation flags)
- **Attached as Scan Metadata:** Extracted signals inform the scoring engine and routine recommendations. The raw transcript is stored for the user's reference but is not used for model training without explicit consent.

#### 3.2.5 Contextual Metadata (Auto-Captured)

The following metadata is attached to every scan automatically — no user effort required:

**Device Sensors:**
  - Time of day (from device clock)
  - Ambient temperature (from device sensor or weather API)
  - Barometric altitude (from device barometer when available) — UV intensity increases ~10–12% per 1000m; humidity decreases with altitude, contextualizing dryness/dehydration findings
  - Ambient brightness (from light sensor in lux) — gates multispectral pass viability
  - Autofocus distance per frame (from EXIF PDAF metadata) — direct distance measurement for scale normalization
  - Gyroscope orientation log during video capture — for photometric stereo surface reconstruction (Section 2.4.4)
  - Device camera profile ID (from Section 2.1.5)
  - Environment quality score (from Section 2.1.3)

**User State (from pre-scan questions):**
  - Physiological state flags (recent exercise, hot shower)
  - Menstrual cycle phase (if opted in — can also be pulled automatically from Apple Health / Google Health Connect)

**Environmental APIs (from GPS location):**
  - UV index (current, from weather API)
  - **UV accumulation (14-day cumulative)** — one sunny day doesn't cause visible sun damage; 14 consecutive high-UV days does. Cumulative exposure over the past 2 weeks is more predictive than today's reading.
  - **Air quality index (AQI / PM2.5)** — pollution causes oxidative stress, accelerates aging, and clogs pores. Sourced from OpenAQ, WAQI, or IQAir APIs. Elevated AQI contextualizes pore clogging and dullness findings; the routine engine may prioritize antioxidant serums and thorough double-cleansing.
  - **Weather history (7-day lookback)** — recent humidity trends, temperature swings, and precipitation. A sudden humidity drop from 80% to 30% over a week causes barrier disruption and flaking that today's humidity reading alone doesn't explain.
  - **Water hardness (by postal code / GPS)** — hard water (>250 ppm mineral content) damages the skin barrier, causing dryness, irritation, and eczema flare-ups. Queried from USGS (US), local water authority databases, or crowd-sourced data. If the user is in a hard water area and the scan shows barrier compromise, the system flags hard water as a likely contributor and recommends barrier-repair products.
  - **Pollen count** — high pollen can trigger skin irritation and eczema flares in sensitive individuals. Sourced from weather/pollen APIs.
  - **Seasonal context** — the pipeline tracks whether findings worsen in summer (UV-correlated), winter (dryness-correlated), or are season-independent (hormonal/inflammatory), refining attribution over multiple scans.

#### 3.2.6 Health App Integration (Optional, With Permission)

With user consent, the app reads data from Apple HealthKit or Google Health Connect that directly correlates with skin condition:

- **Sleep Data:** Average sleep duration and quality over the past 7 days. Poor sleep (<6 hours average) reduces cell turnover during deep sleep phases. If detected, dullness and dark circles are contextualized as sleep-related rather than requiring topical intervention — the system surfaces a sleep hygiene note alongside product recommendations.
- **Heart Rate Variability (HRV):** Low HRV over the past week indicates chronic stress → elevated cortisol → increased sebum production → breakouts. The system correlates stress periods with acne flare-ups across scans: "Your acne scores tend to spike during low-HRV weeks."
- **Activity / Step Data:** Regular exercise improves circulation and skin health. Sedentary periods correlate with poorer skin outcomes. The system tracks this as a longitudinal factor.
- **Menstrual Cycle (Auto-Sync):** Pulled directly from Apple Health / Health Connect instead of manual tracking — more accurate, no user effort. Overrides the manual cycle input from Section 2.1.2 when available.

#### 3.2.7 Offline-Capable

The questionnaire and product scanning are stored locally and can be completed without network connectivity. Responses are queued and synced when the connection is restored. Product barcode lookups cache recent results locally for offline use.

### 3.3 User Self-Assessment (Dual-Validation)

While the backend processes the uploaded images, the client presents an interactive self-assessment flow to the user. This serves two purposes: it captures the user's own perception of their skin concerns (ground truth that the camera may miss), and it fills the processing wait time with productive interaction so the experience feels active rather than passive.

- **Zone-Specific Visual Matching:** Once segmentation completes (~1.5s after upload), the app displays the user's face map divided into zones. For each zone, the user is shown a curated grid of **reference photos** depicting common concerns at varying severities (e.g., mild comedones vs. inflammatory acne, faint vs. pronounced dark spots). The user taps the examples that match what they see in the mirror.
- **Concern Categories Per Zone:** Reference examples cover: pore visibility, blackheads/whiteheads, active acne (papules/pustules), redness/rosacea, dark spots/hyperpigmentation, dryness/flaking, fine lines, and oiliness/shine.
- **Confidence Cross-Referencing:** The backend compares the user's self-selected concerns against the AI detection results per zone:
  - **Agreement (AI detected + user selected):** High-confidence finding. Scored and recommended at full weight.
  - **AI-only detection (user did not select):** Moderate confidence. May indicate a subtle issue the user hasn't noticed, or a false positive. Presented to the user as "We also noticed..." with a lower prominence.
  - **User-only selection (AI did not detect):** The pipeline re-analyzes that specific zone with increased sensitivity thresholds (lower detection confidence floor, enhanced CLAHE contrast). If still undetected, the concern is included in the report at a low severity with a note that it was user-reported.
  - **Neither detected nor selected:** Concern is excluded from the report for that zone.
- **Severity Calibration:** When the user selects a reference image, its known severity level helps calibrate the AI's normalized score. If the user picks a "moderate acne" reference but the model scored it as mild, the final score is adjusted upward within a bounded range.
- **Touch-to-Mark Specific Spots:** After the zone-level self-assessment, the app displays the user's captured face photo and allows them to **tap directly on specific spots** they're concerned about. Each tap creates a pixel-coordinate marker that:
  - Triggers enhanced detection at that exact location (lower confidence thresholds, zoomed patch analysis)
  - Cross-references with the AI's detection — if the model missed it, the patch is re-analyzed at higher sensitivity
  - Tracks that specific spot over time — "The bump you marked on Sept 15 has reduced by 40%"
  - Gives the user a sense of agency — "the app looked where I told it to" builds trust in results
  This is more precise than zone-level matching and captures the "this one specific bump" concern that zone-based assessment cannot express.

### 3.4 Cloud-Based Skin Analysis Pipeline

#### 3.4.1 Per-Angle Preprocessing

Each of the 3 captured angles (frontal, left 45°, right 45°) goes through the same preprocessing pipeline independently before analysis:

- **RAW Processing (when available):** If ProRAW/DNG files are present, the pipeline processes from RAW rather than JPEG. RAW data bypasses the phone's beauty smoothing, noise reduction, sharpening, and tone mapping — all of which destroy diagnostic detail. The pipeline applies its own controlled demosaicing (no skin smoothing), minimal noise reduction (preserving texture), and linear tone mapping. This is the single largest quality improvement when available — it recovers fine texture detail that the phone's default processing pipeline actively erases.
- **White Balance Normalization:** Using the calibration reference, the pipeline applies a per-channel correction to normalize color temperature before any LAB/HSV analysis. When working from RAW, this is applied during demosaicing for maximum precision; for JPEG inputs, it's a post-hoc correction. This ensures that erythema and pigmentation thresholds are device-agnostic.
- **HDR Exposure Merge:** The 3-bracket frames per angle are aligned (to correct for micro-movement) and merged using Mertens fusion or Debevec HDR, producing a single high-dynamic-range image that preserves detail across all tonal zones.
- **Flash/No-Flash Fusion:** The flash image is decomposed into a texture layer (high-frequency detail from directional lighting) and the no-flash image provides the color layer (natural pigmentation). These are combined to produce a composite that has both accurate color and enhanced surface detail.
- **Specular Map Analysis (Read Before Remove):** Before removing specular reflections, the isolated specular layer is analyzed as diagnostic data in its own right — the specular pattern IS the oiliness map:
  - **Sebum Distribution Map:** The shape, intensity, and spatial distribution of specular highlights maps directly to oil presence on the skin surface. T-zone shine vs. dry cheeks is encoded in the specular layer, providing a measured oiliness score per zone rather than relying on the user's subjective questionnaire answer.
  - **Oiliness Quantification:** Specular intensity per zone is normalized to a 0–100 oiliness scale, cross-referenced with the user's self-reported skin type for calibration.
  - **Dehydration vs. Oiliness Differentiation:** Dehydrated-but-oily skin produces patchy, uneven specular patterns; well-hydrated oily skin produces smooth, continuous specular. The specular texture (not just intensity) distinguishes these two conditions, which require opposite treatments.
- **Specular Reflection Removal:** After analysis, the specular layer is subtracted from the composite, revealing the skin surface underneath oily shine. For small remaining glare spots, surrounding texture is inpainted rather than analyzed as garbage pixels. This is critical for oily T-zones where shine hides comedones.
- **CLAHE (Contrast Limited Adaptive Histogram Equalization):** Applied per facial zone to locally enhance contrast (intensity adapted to the device camera profile). This makes faint dark spots, subtle redness, and shallow texture variations machine-detectable without blowing out highlights globally.

#### 3.4.2 Distance & Scale Normalization

Different capture distances mean different pixel densities on the skin — the same pore at 20cm is 4× more pixels than at 40cm, which causes severity scores to drift with camera distance. The pipeline normalizes all images to a consistent real-world scale:

- **Autofocus Distance (Primary, Back Camera):** Modern back cameras with PDAF report the focus distance in EXIF metadata. Combined with the camera's focal length and sensor dimensions, this directly computes the real-world scale factor (pixels per mm) — more accurate than any estimation method and available on virtually all modern back cameras.
- **Inter-Pupillary Distance (IPD) Fallback:** When AF distance metadata is unavailable (older devices, front camera), MediaPipe face landmarks detect the distance between pupils in pixels. The average adult IPD is ~62mm. Combined with the camera's focal length from EXIF metadata, this computes the real-world scale factor as a fallback.
- **LiDAR Distance (Most Accurate):** When depth data is available, the exact face-to-camera distance is read directly from the depth map — sub-millimeter accuracy, no estimation involved.
- **Normalization Target:** All texture analysis (pore size, fine line width, lesion diameter) is normalized to a standard resolution of **10 pixels/mm**. Images captured closer are downsampled; images captured further are flagged if resolution falls below the minimum threshold (5 px/mm), triggering a "move closer" prompt on the next scan.
- **Cross-Session Consistency:** The computed scale factor is stored per scan so that progress-tracking comparisons between sessions are dimensionally accurate — a pore measured at 0.3mm in scan 1 is compared to the same physical scale in scan 2, regardless of whether the user held the phone at the same distance.

#### 3.4.3 LiDAR Depth Analysis (When Available)

When LiDAR/ToF depth maps are present in the upload, the pipeline unlocks 3D analysis capabilities that 2D imaging alone cannot provide:

- **Raised vs. Flat Lesion Classification:** Depth data distinguishes raised lesions (papules, cysts, nodules — which protrude 0.5–3mm above the skin surface) from flat conditions (hyperpigmentation, freckles, flat moles) that appear similar in 2D color. This eliminates an entire class of misclassification.
- **Lesion Height Measurement:** Each detected lesion is annotated with its physical height above the surrounding skin surface (in mm), enabling severity tracking that captures whether a cyst is shrinking over time — something 2D imaging can only infer indirectly from diameter changes.
- **3D Facial Mesh for Progress Tracking:** A 3D point cloud of the face is constructed from the depth maps across all 3 angles. On follow-up scans, the new 3D mesh is registered (aligned) to the baseline mesh using iterative closest point (ICP) alignment. This provides perfectly consistent zone-to-zone comparison regardless of head angle, distance, or camera position — far more reliable than the 2D ghost silhouette fallback.
- **Pore Depth Profiling:** At close range (close-up pass), LiDAR can resolve pore depth, providing a topographic map of skin texture that complements the 2D Gabor/wavelet analysis.

When depth data is not available, the pipeline falls back to the 2D-only analysis described in the other sections with no degradation — depth is additive, not required.

#### 3.4.4 Gyroscope-Assisted Photometric Stereo (3D Texture Without LiDAR)

During the 2-second video capture per angle, the user's hand naturally trembles by 2–3mm. The gyroscope records this orientation change. The torch is a point light source at a known, fixed position relative to the camera sensor. As the phone shifts, the lighting angle on the skin surface changes slightly — and those tiny shading differences across frames encode **surface normals** (3D micro-texture).

- **Surface Normal Reconstruction:** Using the gyroscope orientation log and the known torch-to-sensor geometry, the backend computes per-pixel surface normals from shading variation across ~60 consecutive video frames. This produces a bump map of the skin surface — a 3D texture layer derived entirely from 2D video.
- **What It Detects:** Subtle raised features that are invisible in a single 2D frame — early-stage papules before they become visually inflamed, shallow acne scarring, fine-line depth, and pore structure. These features create micro-shadows that shift with lighting angle, which photometric stereo captures.
- **Universal Availability:** This works on **every device** with a torch and gyroscope — which is all modern phones. Users without LiDAR still get meaningful 3D texture data. The resolution is lower than LiDAR (surface normals rather than absolute depth), but it catches features that 2D analysis misses entirely.
- **Complementary to LiDAR:** On devices with LiDAR, photometric stereo provides higher-resolution surface detail (micro-texture) while LiDAR provides absolute depth (macro-structure). The two data sources are fused for the most complete 3D skin model.

#### 3.4.5 Remote Photoplethysmography — Blood Flow Mapping (rPPG)

Facial video captures subtle per-pixel color fluctuations caused by blood pulsing through capillaries beneath the skin. From the 2-second video clips already captured per angle (at 30–60fps), the backend extracts cardiovascular and perfusion data without any additional hardware:

- **Blood Perfusion Map:** By isolating the green channel (where hemoglobin absorption is strongest) and computing per-pixel temporal amplitude at the cardiac frequency (~1–1.7 Hz), the pipeline produces a spatial map of blood flow intensity across the face. Areas of high perfusion appear "hot."
- **Active Inflammation Detection:** Localized increased perfusion around a lesion indicates active inflammatory acne — distinguishable from post-inflammatory erythema (PIE) or post-inflammatory hyperpigmentation (PIH), which have normal perfusion. This distinction is critical because the treatments are different: active inflammation needs anti-inflammatory ingredients, while PIE/PIH need brightening agents.
- **Vascular Rosacea Mapping:** Visible vascular patterns (telangiectasia) and diffuse background redness caused by vascular rosacea have distinct perfusion signatures that are invisible in a single still frame but emerge from temporal video analysis.
- **Sub-Clinical Inflammation:** Areas with elevated perfusion but no visible surface redness may indicate developing lesions — enabling the routine engine to recommend preventive treatment for zones where breakouts are likely forming but haven't surfaced yet.
- **Minimum Requirements:** 2 seconds of 30fps video with reasonably stable framing. The best-frame selection video clips already satisfy this — no additional capture step is needed.

#### 3.4.6 Skin Elasticity Analysis

When the optional 5-second expression video (Section 2.1.11) is uploaded, the backend extracts biomechanical skin properties:

- **Elasticity Score Per Zone:** Optical flow analysis tracks how each facial zone deforms during expression and how quickly it recovers to the resting state. Recovery speed (measured in milliseconds from peak deformation to 90% return) correlates with collagen and elastin density. Slower recovery = lower elasticity.
- **Dynamic vs. Static Line Classification:** By comparing the expression-peak frame to the resting frame, wrinkles are classified as:
  - **Dynamic (expression-only):** Visible only during movement. Early stage — preventive treatment (peptides, retinoids) can slow progression.
  - **Static (always visible):** Present at rest. Advanced stage — corrective treatment (retinoids, vitamin C, professional interventions) needed.
  This distinction directly affects the routine engine's recommendation priority.
- **Zone-Specific Firmness Map:** Each zone gets a firmness score based on the magnitude of deformation relative to the expression force (estimated from facial action unit intensity). The forehead, periorbital, and nasolabial regions are scored independently.
- **Progress Tracking:** Elasticity scores are tracked over time alongside the static analysis scores. This captures whether a routine is improving skin firmness — something that 2D still-image analysis cannot measure.

#### 3.4.7 UV Exposure Contextualization

Using the UV index metadata captured from the weather API (Section 2.2), the pipeline contextualizes sun-damage-related findings:

- **Sun Damage Risk Score:** Based on the user's GPS location, average UV index for their region and season, and their Fitzpatrick skin tone (Section 2.4.9), the pipeline computes a cumulative sun exposure risk score.
- **Hyperpigmentation Attribution:** When hyperpigmentation is detected, the system evaluates whether the pattern is consistent with UV-induced damage (typically on sun-exposed zones: forehead, nose bridge, cheekbones) vs. post-inflammatory hyperpigmentation (localized to prior breakout sites). This distinction affects treatment: UV-induced pigmentation benefits most from SPF + vitamin C; PIH benefits from niacinamide + azelaic acid.
- **SPF Recommendation Calibration:** Rather than a generic "wear sunscreen," the routine engine recommends specific SPF levels based on the user's actual UV exposure environment: SPF 30 for moderate-UV indoor workers, SPF 50+ for high-UV outdoor lifestyles.
- **Seasonal Context:** The pipeline tracks whether findings worsen in summer months (consistent with UV causation) or are season-independent (consistent with hormonal or inflammatory causes), refining attribution over multiple scans.

#### 3.4.8 Multispectral Analysis (When Available)

When the front-camera multispectral frames (Section 2.1.13) are present, the pipeline performs wavelength-specific analysis that dramatically improves detection of conditions that are subtle or invisible under white light:

- **Red-Channel Deep Vascular Mapping:** The red-illuminated frame reveals subsurface vascular patterns at 1–2mm depth. Combined with the rPPG perfusion map (Section 2.4.5), this produces a multi-depth vascular assessment: surface perfusion (rPPG) + deep vessel structure (red illumination).
- **Green-Channel Enhanced Erythema Detection:** Under pure green illumination, hemoglobin contrast is maximized with no cross-wavelength noise. Erythema detection accuracy improves significantly, especially on Fitzpatrick IV–VI where redness is hard to detect under white light. The green-illuminated frame is used to recalibrate the erythema thresholds from the main back-camera scan.
- **Blue-Channel Melanin Mapping:** Pure blue illumination maximizes melanin absorption contrast. Early-stage hyperpigmentation and sun damage that are invisible under white light become detectable. The pipeline compares the blue-illuminated melanin map against the white-light LAB analysis to identify sub-clinical pigmentation forming beneath the visible surface.
- **Violet-Channel Bacterial Fluorescence:** Under ~405nm excitation, porphyrins produced by P. acnes bacteria fluoresce orange-red. The pipeline isolates the orange-red response in the violet-illuminated frame to map active bacterial colonies on the skin surface. This identifies zones where bacterial acne is forming before any visible breakout appears, enabling preventive treatment recommendations (e.g., benzoyl peroxide targeted to colonized zones).
- **Polarization-Based Subsurface Separation:** When the multispectral frames are captured via an LCD screen, the pipeline analyzes polarization-dependent intensity differences to separate surface reflection from subsurface scattering. The subsurface-only image reveals pigmentation and vascular patterns uncontaminated by surface texture and oiliness.

When multispectral data is not available, all detection models fall back to the white-light multi-channel analysis described in Section 2.4.11. Multispectral data is additive — it refines and extends the white-light results but is never required.

#### 3.4.9 Hair & Obstruction Masking

For frames where minor occlusion (<30%) was flagged by the client-side detection (see Section 2.1.6), the backend applies the BiSeNet segmentation mask to exclude hair, hand, and accessory pixels from all downstream analysis. These masked regions are marked as "not evaluated" in the per-zone results rather than producing false readings.

#### 3.4.10 Multi-Angle Zone Stitching

The 3 preprocessed angle composites are combined into a unified facial analysis:

- **Region of Interest (ROI) Segmentation:** Each angle is segmented into facial zones: forehead, nose, cheeks, chin, jawline, temples, and periorbital (under-eye) areas. Zones visible from multiple angles (e.g., cheeks appear in both frontal and 45° views) use the angle with the highest effective resolution and least occlusion for that zone.
- **Zone Coverage Map:** The system produces a coverage confidence score per zone based on which angles captured it, at what resolution, and with what occlusion level. Zones with low coverage (e.g., under-chin only partially visible) are noted in the results as "limited visibility — consider a dedicated close-up."

#### 3.4.11 Fitzpatrick Skin Tone Adaptation

Most dermatological AI models are trained predominantly on lighter skin tones (Fitzpatrick I–III) and perform significantly worse on darker skin (Fitzpatrick IV–VI). Erythema on dark skin is nearly invisible in standard RGB; hyperpigmentation presents as subtle tonal shifts rather than obvious dark spots. Without explicit adaptation, the system will systematically underdiagnose darker-skinned users.

- **Skin Tone Classification:** During the first scan, the preprocessed (white-balanced, specular-removed) facial composite is classified into a Fitzpatrick category (I–VI) using a dedicated skin tone classifier trained on diverse dermatological datasets. The classification is stored in the user profile and refined with each subsequent scan.
- **Per-Tone Detection Thresholds:** Each detection model (acne, erythema, pigmentation, texture) loads tone-specific thresholds:
  - **Erythema on Fitzpatrick V–VI:** Standard RGB redness detection fails. The pipeline switches to narrow-band analysis of the green channel (hemoglobin absorption) and uses a/b\* chromaticity shifts in LAB space that detect redness even under melanin-rich skin. Detection sensitivity is increased for these tones.
  - **Hyperpigmentation on Fitzpatrick I–II:** Faint pigmentation on very light skin requires lower detection thresholds in the L* (lightness) channel. Conversely, on Fitzpatrick V–VI, the pipeline analyzes relative rather than absolute L* differences to avoid flagging normal skin tone variation as pathological.
  - **Texture Analysis:** Pore visibility and fine-line detection thresholds are adjusted for melanin density, which affects how surface texture appears under different lighting conditions.
- **Diverse Training Data Requirement:** All detection models must be trained and validated on datasets with balanced representation across Fitzpatrick I–VI. Model accuracy metrics (mAP, F1) are reported per Fitzpatrick category in the model registry (Section 5.1), and any category-specific accuracy drop >5% below the overall average blocks deployment.
- **Self-Assessment Reference Photos:** The visual reference grid in the dual-validation flow (Section 2.3) dynamically filters to show examples on skin tones similar to the user's classified Fitzpatrick category, making self-matching more accurate.

#### 3.4.11b Data-Driven Skin Type Reclassification

Users frequently misidentify their own skin type — "I have oily skin" when they actually have dehydrated skin overproducing oil to compensate. The system now has objective measurements that override self-report:

- **Measured Skin Type:** Computed from pipeline data, not the questionnaire:
  - **Oiliness:** Specular map analysis (Section 2.4.1) — measured sebum distribution, not subjective feel.
  - **Hydration:** Dehydration micro-texture detection (Section 2.4.12) — objective crosshatch pattern presence/absence.
  - **Sensitivity:** Barrier health score (Section 2.4.14b) + reaction history from phased introduction (Section 2.5.2) + rPPG irritation signals (Section 2.4.5).
- **Common Misdiagnosis Correction:**
  - Self-reported "oily" + measured dehydration texture → **dehydrated-oily**. The system explains: "Your skin is producing excess oil because it's dehydrated. We've adjusted your routine to focus on hydration, which should reduce oiliness over time." This prevents the user from using stripping products that worsen the cycle.
  - Self-reported "dry" + measured normal hydration + low specular → **normal**. Prevents unnecessary heavy occlusives.
  - Self-reported "sensitive" + no barrier compromise + no rPPG irritation → **normal with perceived sensitivity**. May be caused by a specific irritant in current products rather than intrinsic sensitivity.
- **Seasonal Drift Detection:** Skin type changes with seasons (oilier in summer, drier in winter). The system detects this across scans: "Your skin has shifted from combination to dry over the past 2 months, consistent with the seasonal humidity drop in your area. We've adjusted your moisturizer recommendation."
- **Override Transparency:** When the measured skin type differs from self-reported, the app explains the discrepancy and shows the data: "You reported oily skin, but our measurements show [specular map visualization] — here's why we've classified you as dehydrated-oily."

#### 3.4.12 Multi-Target Detection

- **Acne & Blemishes:** Bounding box detection and classification (papules, pustules, comedones, cysts, milia, sebaceous filaments) across all zone data.
- **Hyperpigmentation & Erythema:** Multi-channel color analysis — LAB for perceptual lightness differences, HSV for hue-based redness detection, plus isolated green channel analysis (hemoglobin absorption peaks in green) and blue channel analysis (melanin separation). Using multiple color representations catches what any single colorspace conversion loses.
- **Surface Texture:** Gabor filter bank and wavelet decomposition to separate skin into frequency bands — low frequency captures overall tone and pigmentation gradients, high frequency captures pores, fine lines, and micro-texture. All texture measurements are expressed in real-world units (mm) using the scale normalization from Section 2.4.2.
- **Hydration Texture Detection:** Dehydrated skin exhibits a distinct micro-crosshatch pattern (fine lines that aren't wrinkles, visible across flat skin areas). The wavelet analysis is trained to separate dehydration texture from aging texture — the two look similar but require opposite treatments (hydration vs. anti-aging actives).
- **Ensemble Model Consensus:** Each detection category (acne, pigmentation, erythema, texture) is run through multiple model architectures (e.g., YOLOv8 + EfficientDet + a custom U-Net). Findings where 3/3 models agree are high-confidence. Findings where only 1/3 models detects are flagged as low-confidence and presented cautiously. This reduces both false positives and false negatives compared to single-model detection.
- **Scar Type Classification:** Texture anomalies classified as scarring are further categorized by morphology using 3D data (photometric stereo + LiDAR when available):
  - **Ice pick:** Deep, narrow, V-shaped depression. Treatment: TCA cross-peel, punch excision (professional only).
  - **Boxcar:** Broad, flat-bottomed depression with sharp edges. Treatment: laser resurfacing, subcision (professional only).
  - **Rolling:** Shallow, undulating, no sharp edges. Treatment: microneedling, subcision.
  - **Hypertrophic / Keloid:** Raised above skin surface (positive height in depth data). Treatment: silicone sheets, steroid injection (professional only).
  - **Post-inflammatory erythema (PIE):** Flat, red, no depth change. Treatment: azelaic acid, centella, time (topical-treatable).
  - **Post-inflammatory hyperpigmentation (PIH):** Flat, dark, no depth change. Treatment: niacinamide, vitamin C, arbutin (topical-treatable).
  The first four require professional intervention — the routine engine recommends a dermatologist visit for these rather than suggesting a product that won't work. Only PIE and PIH enter the topical recommendation pipeline.
- **Pore Congestion vs. Pore Size:** The pipeline distinguishes between structurally large pores (genetic, cannot be shrunk) and congested pores (filled with sebum/debris, can be cleared) using 3D depth data + specular oiliness correlation. Treatment differs: congested → BHA/oil cleansing to clear; structural → niacinamide/retinol to build collagen around pore walls and reduce appearance.
- **Skin of Color Specific Conditions:** Conditions that are more prevalent in darker skin tones and are commonly misclassified by standard models:
  - **Dermatosis papulosa nigra:** Small dark papules common on Fitzpatrick IV–VI faces, especially cheeks and temples. Benign. Must NOT be flagged as suspicious lesions or treated as acne. The model is trained to recognize and exclude these.
  - **Pseudofolliculitis barbae:** Ingrown hair bumps on jawline/neck, common in people with curly hair. Misclassified as acne by default models. Treatment is completely different (gentle exfoliation + shaving technique adjustment, not acne actives).
  - **Keloid risk awareness:** Hypertrophic scarring detected on Fitzpatrick IV–VI skin carries significantly higher keloid risk. Professional referral urgency is elevated and the report explicitly warns against any DIY treatments that could worsen scarring.
  - **PIH severity adjustment:** Post-inflammatory hyperpigmentation on Fitzpatrick IV–VI is disproportionately severe and long-lasting. Timeline estimation is adjusted: 6–12 months to fade vs. 3–6 months for lighter skin.
- **Contact Dermatitis Pattern Recognition:** If irritation/redness appears in a distribution that matches where a specific product is applied — sparing the eye area, hairline, or lips where the product wasn't applied — the pipeline flags this as probable contact dermatitis rather than a general skin condition. Cross-references with recently introduced products (from Section 2.2.2): "The redness pattern on your cheeks matches the application area of the moisturizer you started 10 days ago. This may be a reaction to that product."
- **Treatment Ceiling Honesty:** The system is explicit about what topicals cannot achieve:
  - Deep ice pick / boxcar scars → "Cannot be significantly improved with topical products. We recommend consulting a dermatologist for professional treatment."
  - Static deep wrinkles → "Topicals can slow progression but won't reverse established deep wrinkles. Professional interventions (injectables, resurfacing) are needed for significant correction."
  - Active cystic acne → "May need prescription oral medication. If OTC treatment doesn't improve cystic acne within 8 weeks, a dermatologist visit is strongly recommended."
  - Structural pore size → "Genetics determine pore size. Niacinamide and retinol can improve appearance slightly but won't dramatically shrink pores."
  These ceilings are stated in the natural language report (Section 2.7.5) and trigger dermatologist referrals in the clinical export.

#### 3.4.12c Suspicious Lesion Safety Screening

The app photographs every mole, freckle, and pigmented spot on the face. While not a diagnostic tool, it has an ethical responsibility to flag potentially suspicious findings for professional evaluation:

- **ABCDE Criteria Evaluation:** Every detected pigmented lesion is automatically scored against: **A**symmetry (shape irregularity), **B**order irregularity (ragged or blurred edges), **C**olor variation (multiple shades within the lesion), **D**iameter >6mm, **E**volution (change between scans). Scoring 3+ criteria triggers a safety flag.
- **Evolution Tracking (Unique Advantage):** A dermatologist sees a mole once. This app sees it every scan. A new pigmented lesion that appeared between scans, or an existing one that changed shape, color, or size, is automatically flagged. This temporal evolution data is the most clinically valuable signal the app produces for safety screening.
- **Ugly Duckling Sign:** A pigmented lesion that looks morphologically different from all other lesions on the face (outlier in size, shape, or color distribution) is flagged even if it doesn't meet ABCDE thresholds.
- **Presentation (Never a Diagnosis):** Flagged lesions are NEVER labeled with medical terms like "melanoma" or "suspicious." Instead: "We noticed a spot on your left cheek that has changed since your last scan. We recommend having a dermatologist take a look — they can do a definitive evaluation." Framed as a safety referral.
- **Dermatologist Export Integration:** Flagged lesions are automatically included in the clinical export (Section 2.7.2) with measurement history, evolution timeline, and annotated photos, so the dermatologist has the full context.
- **Gated by Onboarding Consent:** During onboarding, the user acknowledges that this is a cosmetic skincare app with an optional safety screening layer, not a medical diagnostic tool. The safety screening can be disabled in settings.

#### 3.4.12d Cross-Zone Differential Diagnosis

Analyzing zones independently misses diagnostic patterns that span the full face. After per-zone detection completes, the pipeline performs whole-face pattern analysis:

- **Spatial Distribution Analysis:** The spatial pattern of findings is itself a diagnostic signal:
  - **T-zone predominant** acne (forehead + nose + chin) → sebaceous overproduction. Treatment: oil control, salicylic acid.
  - **U-zone predominant** acne (jawline + chin) → hormonal cause. Treatment: different — azelaic acid, spironolactone consideration, cycle-aware timing.
  - **Symmetrical bilateral redness** (both cheeks equally) → rosacea or sensitized barrier. Treatment: anti-redness, barrier repair, trigger avoidance.
  - **Asymmetrical redness** (one cheek significantly worse) → external cause: phone contact, sleeping on one side, hand resting. The system asks: "Do you hold your phone to your left ear?" or "Do you sleep on your left side?"
  - **Perioral concentration** → perioral dermatitis. Treatment: completely different from acne — must avoid steroids, often requires prescription.
  - **Forehead-only small uniform bumps** → fungal acne (Malassezia folliculitis), especially if confirmed by violet-channel fluorescence. Treatment: antifungal, NOT antibacterial.
- **Ranked Differential List:** Instead of flat labels ("acne detected"), the system presents ranked possibilities: "Most likely: comedonal acne (85% confidence). Also consider: fungal folliculitis (12%) — your multispectral scan showed weak fluorescence in this zone. If this doesn't respond to treatment in 4 weeks, consult a dermatologist."
- **Comorbidity Awareness:** Detection of one condition increases sensitivity for commonly co-occurring conditions: acne → check for post-inflammatory hyperpigmentation; rosacea → check for dehydration and barrier compromise; eczema → check for barrier damage and sensitization.
- **Prior-Scan Informed Detection:** If a lesion was detected at position X in the previous scan, the current scan applies enhanced sensitivity at that location. Previous scans serve as informative priors — the system "remembers" where issues were and looks harder there.

#### 3.4.13 Coarse-to-Fine Close-Up Enhancement

After the full-face multi-angle analysis completes, the system identifies the top 1–2 zones with the highest concern scores. The client is prompted to capture a **close-up image** of those specific zones at 10–15cm distance:

- **Why:** At close range, phone cameras resolve individual pore structure, micro-comedones, and fine texture that are invisible at full-face distance. This turns the pipeline into a two-pass system — broad detection first, then fine-grained classification on flagged areas.
- **Macro Lens (when available):** On devices with a dedicated macro lens (Section 2.1.5), the close-up pass switches to the macro camera automatically. At 2–4cm focus distance, macro captures resolve individual pore walls, sebaceous filament structure, and micro-comedone morphology — detail that even a high-resolution standard lens cannot capture. This is the closest a phone camera gets to dermatoscope-level imaging.
- **Telephoto Alternative:** On devices with a telephoto lens but no macro, the close-up uses optical zoom (3–5x) to capture detail at a comfortable 25–30cm working distance instead of requiring the user to bring the phone within 10cm.
- **Focus Stacking:** At close range (especially macro at 2–4cm), depth of field is extremely shallow — as narrow as 2–3mm. One side of a lesion may be sharp while the other is blurry. To solve this, the close-up capture records a short **focus sweep video**: the autofocus racks smoothly from near to far across the zone over ~1 second. Each frame has a different depth plane in sharp focus. The backend merges them into a single **all-in-focus composite** where every part of the skin surface is sharp, using Laplacian-pyramid focus stacking. This is standard practice in macro photography and ensures no diagnostic detail is lost to depth-of-field limitations.
- **What It Enables:** The close-up pass can distinguish between visually similar conditions that the full-face scan cannot (e.g., closed comedone vs. sebaceous filament vs. milia — all appear as small bumps at full-face resolution but have distinct textures at macro scale).
- **Timing:** This step happens after the initial results are shown. It's optional but recommended for high-severity zones. The close-up results refine the existing scores rather than replacing them.

#### 3.4.14 Severity Scoring

- **Composite Score:** Normalized 0–100 per concern across each facial zone, calibrated against user self-assessment input (see Section 2.3).
- **Standardized Clinical Grades:** Alongside custom scores, the pipeline outputs standardized grades recognized by dermatologists:
  - **GAGS (Global Acne Grading System):** Scores forehead, right cheek, left cheek, nose, chin by lesion type × location factor. Produces a severity grade (1–44) with categories: mild (1–18), moderate (19–30), severe (31–38), very severe (39–44). Included in the clinical export (Section 2.7.6).
  - **IGA (Investigator's Global Assessment):** 0 (clear) to 4 (severe) scale used in clinical trials. Makes the dermatologist export directly comparable to clinical literature and treatment efficacy studies.
  - **Fitzpatrick-Adjusted PIH Grade:** Post-inflammatory hyperpigmentation graded on a scale that accounts for baseline melanin density, ensuring comparable severity assessment across skin tones.
- **Scale-Normalized Measurements:** Individual findings include real-world dimensions (e.g., "2.1mm papule", "pore visibility: 0.15mm average diameter") so progress tracking measures physical change, not pixel differences.
- **Coverage Confidence:** Each zone score includes a confidence modifier based on the zone coverage map — a score from a well-captured zone at optimal resolution is weighted higher than one from a partially occluded or distant capture.

#### 3.4.14b Barrier Health Composite Score

Multiple barrier-related signals are measured independently throughout the pipeline. This section synthesizes them into a single actionable score:

- **Barrier Score (0–100):** Weighted composite of:
  - Dehydration micro-texture from wavelet analysis (Section 2.4.12)
  - Oil/dehydration ratio from specular map analysis (Section 2.4.1)
  - Sensitivity self-report from questionnaire (Section 2.2.1)
  - Water hardness exposure from environmental metadata (Section 2.2.5)
  - Product-stripping risk — presence of SLS, high-concentration AHAs, or harsh surfactants in scanned current products (Section 2.2.2)
  - Weather-induced stress — recent humidity drops >30% (Section 2.2.5)
  - rPPG-detected diffuse irritation (Section 2.4.5)
- **Barrier-First Gatekeeping:** If the barrier score falls below 40 (moderate-to-severe compromise), the routine engine (Section 2.5) **locks out active ingredients** (retinoids, AHAs, BHAs, vitamin C at high concentrations) and prioritizes barrier repair (ceramides, hyaluronic acid, centella, gentle cleanser, heavy occlusives) for the first 2–4 weeks. Applying actives to a broken barrier worsens both the barrier and the concern. The system explains this to the user: "Your skin barrier needs repair before we can treat [concern]. Here's a repair-first plan."
- **Barrier Tracking:** The score is tracked over time. Once the barrier score recovers above 60, the system gradually reintroduces actives per the phased introduction protocol (Section 2.5).

#### 3.4.14c Skin Age & Biological Aging Score

The pipeline has all the data to compute biological skin age but doesn't surface it without this synthesis step:

- **Biological Skin Age:** Composite of elasticity scores (Section 2.4.6), fine line depth and count (static lines from expression analysis), pore visibility (texture analysis), pigmentation irregularity (multi-channel color analysis), texture roughness (Gabor analysis), and firmness scores — compared against population norms by chronological age and Fitzpatrick type.
- **Aging Velocity:** Tracked over time — is the user's biological skin age increasing faster or slower than their chronological age? "Your skin age has decreased by 2 years since you started your routine 6 months ago" is a powerful motivator.
- **Zone-Specific Aging Map:** The forehead may be aging faster than the cheeks (UV exposure pattern) or the periorbital region faster than the chin (thinner skin, more expression). Zone-level aging scores enable targeted anti-aging recommendations.

#### 3.4.14d Predictive Analytics

With sufficient scan data, the pipeline shifts from reactive detection to predictive intelligence:

- **Breakout Prediction (7–14 Day Window):** Based on current oiliness map (specular analysis), pore congestion levels, bacterial colonization density (multispectral violet fluorescence), menstrual cycle phase, stress indicators (HRV from health app), and historical breakout patterns — predict which zones are likely to break out before it happens. Push a notification: "Based on your cycle and current pore congestion, your chin may break out in the next week. Here's a preventive step."
- **Sun Damage Trajectory:** Using cumulative UV exposure (14-day history + altitude + location) + current sub-clinical pigmentation visible only in blue-channel multispectral — estimate future pigmentation risk. "You have early-stage UV damage forming on your forehead that isn't visible yet. Increasing your SPF now can prevent it from surfacing."
- **Dehydration Forecast:** Based on weather forecast for the next 7 days (incoming humidity drop, temperature swing) + current barrier score + routine hydration level — predict when dehydration may worsen and suggest preemptive moisturizer adjustment.
- **Routine Efficacy Prediction:** Based on similar-user outcomes (federated learning, Section 2.5), estimate how long the recommended routine will take to show measurable results for this user's specific concern profile: "Users with similar skin to yours typically see a 30% reduction in comedones within 6 weeks on this routine."

#### 3.4.14e Multi-Concern Treatment Dependency Graph

Some concerns must be addressed before others — treating in the wrong order makes each phase undermine the previous one. The pipeline models concern dependencies as a directed graph that controls the routine engine's phasing:

```
Barrier Damage (score < 40)
  │ MUST FIX FIRST — no actives until barrier recovers
  ▼
Active Inflammation (inflammatory acne, rosacea flare)
  │ MUST CALM BEFORE treating pigmentation
  │ (actives on inflamed skin → more post-inflammatory marks)
  ▼
Post-Inflammatory Marks (PIH, PIE)
  │ NOW safe to treat with brightening/fading agents
  ▼
Texture & Fine Lines
  │ LAST — retinol/AHAs require intact barrier + no active inflammation
  ▼
Maintenance & Prevention
```

- **Dependency Enforcement:** The routine engine reads the dependency graph and refuses to recommend downstream treatments while upstream concerns are unresolved. A user with barrier damage + active acne + PIH gets: Phase 1 = barrier repair only → Phase 2 = anti-inflammatory acne treatment → Phase 3 = PIH fading agents → Phase 4 = retinol for texture. Never all at once.
- **Parallel Branches:** Some concerns are independent and can be treated simultaneously. Dehydration (barrier track) + sun protection (UV track) don't conflict and can proceed in parallel.
- **Dynamic Re-Evaluation:** Each re-scan updates the dependency graph. If barrier recovers but inflammation persists, the system advances to Phase 2 but holds Phase 3. If the user develops a new concern (e.g., seasonal dryness), it's inserted at the appropriate dependency level without disrupting existing treatment phases.
- **User Communication:** The app explains the dependency to the user in plain language: "We know you want to treat your dark spots, but your skin barrier needs repair first. Applying brightening ingredients on a compromised barrier would cause irritation and potentially create more dark spots. Here's the plan: 2 weeks of barrier repair, then we'll re-scan and start on the dark spots."

#### 3.4.14f Life-Stage Adaptation

Skin changes dramatically during specific life stages, and the patterns are distinct from chronic conditions. The pipeline detects these transitions from data patterns across multiple scans and adapts the entire analysis and recommendation framework:

- **Pregnancy Detection & Safe Mode:** Melasma (mask of pregnancy) has a distinctive bilateral symmetrical pigmentation pattern on cheeks + forehead + upper lip. When detected in combination with the user's pregnancy flag (from questionnaire or health app), the system:
  - Recognizes the pattern as pregnancy-related rather than generic hyperpigmentation: "This pigmentation pattern is consistent with pregnancy-related melasma — it typically fades postpartum."
  - Locks ALL recommendations to pregnancy-safe ingredients only (no retinoids, no high-concentration salicylic acid, no hydroquinone, no chemical SPF filters). Uses pregnancy-safe alternatives (azelaic acid ≤20%, mineral SPF, vitamin C, niacinamide).
  - Adjusts expectations: "Melasma during pregnancy is hormonally driven. Topical treatment can manage but usually can't resolve it until postpartum hormone levels stabilize."
- **Postpartum Transition:** After the user updates their pregnancy status, the system tracks postpartum recovery — melasma fading, hormonal acne shifts, and re-enables previously restricted ingredients on a phased schedule.
- **Perimenopause / Menopause:** Detected from data pattern: sudden onset of dryness + elasticity loss + hormonal acne in a user aged 40–55 who previously had stable skin. Across 3+ scans showing this trajectory, the system shifts recommendations toward estrogen-decline-aware formulations: phytoestrogen-containing products, heavier barrier support, collagen-stimulating peptides, and increased focus on elasticity.
- **Puberty:** Rapid onset of T-zone oiliness + inflammatory acne in users aged 12–18. Recommendations are age-appropriate: gentler concentrations, simpler routines (Essential tier by default), and educational language rather than clinical terminology.

#### 3.4.14g Medication Side-Effect Attribution

Beyond safety gating, the pipeline actively attributes detected findings to known medication side effects — preventing the system from recommending topical solutions for pharmaceutically caused problems:

- **Side-Effect Cross-Reference:** Each medication in the user's profile (Section 2.2.3) is checked against a curated database of dermatological side effects. When a detected finding matches a known side-effect pattern:
  - Corticosteroid use + skin thinning / visible telangiectasia → "The visible capillaries on your cheeks may be related to your corticosteroid use. Discuss tapering options with your prescribing doctor."
  - Lithium + sudden acne onset → "Acne is a known side effect of lithium. Topical treatment can help manage symptoms, but the root cause is the medication."
  - Certain antibiotics + photosensitivity pattern (sun damage disproportionate to UV exposure) → "Your antibiotic increases sun sensitivity. Upgrade to SPF 50+ and reapply every 2 hours outdoors."
  - Hormonal birth control change + skin change within 4 weeks → "Your skin changed shortly after switching birth control — this is likely hormonal adjustment. Give it 2–3 months to stabilize before changing your skincare routine."
  - Isotretinoin + extreme dryness + chapped lips detected → "These are expected side effects of isotretinoin. We've adjusted your routine to maximum barrier support."
- **Recommendation Routing:** When a finding is attributed to a medication, the system recommends consulting the prescribing doctor rather than (or in addition to) topical treatment. The natural language report explains: "We've identified that some of your skin changes may be medication-related. Topical products can manage symptoms, but the underlying cause is pharmaceutical — your doctor can advise on alternatives or adjustments."

#### 3.4.14h Result Self-Audit & Consistency Checking

Before presenting results to the user, the pipeline audits its own outputs for internal consistency:

- **Score Jump Validation:** If a severity score changed >40% between scans with no product change, no environmental shift, and no lifecycle event — flag as potentially a scan quality artifact. Re-check the scan quality grades for that zone. If the quality grade is C or D, attribute the change to scan variability rather than real skin change, and present it with reduced confidence: "This zone's scores changed significantly, but the image quality was lower than your last scan — results may not be directly comparable."
- **Cross-Signal Consistency:** If the model detects "severe acne" but the rPPG shows no inflammation and the specular map shows no sebum overproduction in that zone — the detection is likely a false positive. Downgrade the finding's confidence or reclassify (e.g., may be flat pigmentation misidentified as raised lesions).
- **Recommendation Sanity Cap:** Routine complexity is bounded relative to concern severity: mild concerns = max 4 products total; moderate = max 6; severe = max 8. If the engine produces more, it must justify each additional product or collapse multi-product recommendations into fewer multi-benefit products.
- **Natural Language Report Verification:** Every factual claim in the LLM-generated report (Section 2.7.1) is verified against actual pipeline findings before delivery. If the text says "significant redness on your nose" but the erythema score for the nose zone is 15/100, the claim is flagged and rewritten. No hallucinated observations reach the user.
- **Temporal Hysteresis:** If the system said "barrier damaged, no actives" last scan and this scan the barrier score is 41 (barely above the 40 threshold), it doesn't immediately unlock aggressive actives. Hysteresis requires the barrier to sustain above 60 for 2 consecutive scans before fully unlocking the treatment dependency graph's downstream phases. This prevents oscillating between "barrier repair" and "active treatment" at the threshold boundary.
- **Differential Confidence Calibration:** The ranked differential list (Section 2.4.12d) is calibrated against historical accuracy — if the model's "85% confidence" predictions are actually correct only 60% of the time in production, the displayed confidence is recalibrated to reflect real-world accuracy, not model output logits.

#### 3.4.15 Scan Quality Feedback & Re-Capture Coaching

If the overall scan produces low-confidence results, the system doesn't just show a disclaimer — it tells the user **exactly what went wrong and how to fix it** for the next scan:

- **Per-Zone Quality Report:** Each zone gets a capture quality grade (A–D) based on resolution, occlusion, lighting evenness, and specular contamination. Zones graded C or D include a specific remediation hint:
  - "Your left cheek was underexposed — try turning slightly more toward the light source."
  - "Your forehead was partially covered by hair — pin it back for better coverage."
  - "Too much glare on your nose — blot oily areas with a tissue before scanning."
- **Immediate Re-Capture Option:** For zones graded D, the app offers to re-capture just that angle immediately rather than requiring a full rescan. The re-captured angle replaces the original in the analysis pipeline.
- **Learning Over Time:** The app tracks which quality issues recur across a user's scans (e.g., consistently poor lighting, always has hair occlusion on forehead) and surfaces proactive tips before the next scan: "Last time, your forehead was covered — make sure to pin your hair back before we start."

### 3.5 Routine Generation & Recommendation Engine

#### 3.5.1 Routine Construction

- **Current Routine Awareness:** The engine ingests the user's existing product routine (Section 2.2.2) and medication profile (Section 2.2.3) before generating any recommendations. It never recommends in a vacuum — every suggestion accounts for what's already on the skin.
- **Active Ingredient Mapping:** Match identified concerns with clinically supported ingredients (e.g., Salicylic Acid for active comedones, Azelaic Acid/Niacinamide for erythema/hyperpigmentation), cross-referenced against actives already present in the user's current routine to avoid redundancy.
- **Differential-Informed Recommendations:** The routine engine receives the ranked differential diagnosis (Section 2.4.12b), not just a flat finding list. If the top differential is hormonal acne (U-zone pattern), recommendations differ from sebaceous acne (T-zone pattern). If fungal folliculitis is a possibility, antifungal ingredients are included alongside standard acne treatment.
- **Step-by-Step AM/PM Schedules:** Generation of layered routines following correct application order (Cleanser → Toner/Treatment → Serum → Moisturizer → SPF). When the user already has products in some steps, the engine fills gaps and suggests swaps rather than generating a full routine from scratch.
- **Conflict Prevention:** Automated conflict resolution across both recommended AND current products (e.g., preventing simultaneous usage of Retinoids and strong AHAs/BHAs, flagging benzoyl peroxide + retinoid in the same step, checking for ingredient interactions with current medications like isotretinoin).
- **Product Removals & Swaps:** When a current product contains comedogenic ingredients correlated with detected concerns, or allergens the user listed, the engine recommends specific replacements rather than just additions.
- **Medication-Safe Mode:** If the user is on isotretinoin, oral retinoids, or certain other medications, the routine is automatically restricted to a minimal barrier-support protocol (gentle cleanser + heavy moisturizer + SPF) with a clear explanation of why.
- **Barrier-First Gatekeeping:** If the barrier health score (Section 2.4.14b) is below 40, actives are locked out and the routine focuses entirely on barrier repair until the next scan shows recovery.
- **Environmental Adaptation:** Recommendations factor in environmental context: high-pollution area → prioritize antioxidant serums; hard water area → recommend barrier-repair products; high-altitude → higher SPF; low-humidity season → heavier moisturizer.
- **Product Catalog Filtering:** Dynamic querying of the product database filtered by user skin type, target active ingredients, budget tier, excluded allergens, and ingredients already covered by the current routine.

#### 3.5.2 Phased Introduction Protocol

Dumping 5 new products on the user simultaneously is bad clinical practice — if a reaction occurs, the cause is unidentifiable. The routine engine generates a **phased introduction timeline**:

- **Phase 1 (Week 1–2): Foundation Only.** Cleanser + moisturizer + SPF. If the user is switching from problematic products (identified by the conflict analysis), this phase lets the skin stabilize on a clean baseline.
- **Phase 2 (Week 3–4): First Active.** Introduce the highest-priority active ingredient (the one targeting the most severe concern). Start at the lowest effective concentration:
  - Retinol: 0.025%, every 3rd night
  - AHA: 5%, 2× per week
  - Vitamin C: 10%, every morning
- **Phase 3 (Week 5–6): Assess & Escalate.** A re-scan checkpoint evaluates whether the first active is tolerated (no increase in redness, flaking, or sensitivity). If tolerated: increase frequency or concentration. If not: reduce or swap.
- **Phase 4 (Week 7+): Second Active.** Introduce the next active. Same assessment cycle.
- **Concentration Ramping:** The system generates explicit ramp schedules: "Use retinol 0.025% every 3rd night for 2 weeks. If your next scan shows no increase in redness or flaking, move to every other night. After another 2 weeks, move to nightly."
- **Reaction Attribution:** If a re-scan after introducing Product X shows worsened scores in any zone, the system flags the new product as the probable cause and recommends: "Your [zone] scores worsened after starting [product]. Consider discontinuing it and re-scanning in 2 weeks to confirm."
- **Purging vs. Adverse Reaction Differentiation:** When skin worsens after starting retinoids or BHAs, the system uses prior-scan data to distinguish:
  - **Purging (normal):** New breakouts appear in zones where the user ALREADY had congestion or comedones in prior scans. These are existing comedones being pushed to the surface faster. The system reassures: "This is purging — existing clogged pores are surfacing faster. It should resolve by week 4–6."
  - **Adverse Reaction (stop):** New breakouts appear in zones that were CLEAR in prior scans. This is not purging — it's a genuine reaction. The system flags: "We're seeing new breakouts in areas that were previously clear. This doesn't look like purging — consider stopping [product] and re-scanning in 1 week."
  - **Timeline check:** If worsening hasn't resolved by week 6, it's reclassified from possible purging to adverse reaction regardless of location.

#### 3.5.3 Personalized Treatment Response Learning

Over time, the system learns what works **for this specific user**, not just what works in general:

- **Per-Ingredient Efficacy Tracking:** When the user adds a new product (detected via product scanning), the system tracks scores in the relevant concern category before and after. After 6–8 weeks of consistent use, it computes an efficacy score: "Niacinamide reduced your pigmentation by 20% over 8 weeks" or "Salicylic acid hasn't measurably improved your comedones after 6 weeks."
- **Personal Ingredient Profile:** Over multiple scans, the system builds a map of which ingredients deliver results for this user. If retinol significantly improved their texture but salicylic acid was ineffective for comedones, future recommendations lean toward retinol-based approaches and try alternative comedolytic ingredients (adapalene, azelaic acid).
- **Similar-User Insights (Federated Learning):** Anonymized, privacy-preserving aggregate data across all users: "Users with Fitzpatrick IV, moderate comedonal acne, and similar barrier scores who used azelaic acid 15% saw a 35% improvement in 8 weeks." No raw data leaves the device — only aggregated statistical models are shared. The user can opt out entirely.
- **Adaptive Confidence:** Recommendations for new users are generic (evidence-based defaults). As the system accumulates scan data and product-response history, recommendations become increasingly personalized and confidence scores increase. The UI reflects this: "Personalized recommendation (based on your history)" vs. "Standard recommendation."

#### 3.5.4 Ingredient Synergy Optimization

Beyond preventing conflicts, the engine actively seeks **synergistic combinations** — ingredients that are more effective together than alone:

- **Known Synergies (hard-coded):**
  - Vitamin C (L-ascorbic acid) + Vitamin E + Ferulic acid = 8× more effective photoprotection than vitamin C alone
  - Niacinamide + Zinc = enhanced sebum reduction
  - Retinol + Peptides = enhanced collagen stimulation with reduced irritation
  - Hyaluronic acid + Ceramides + Cholesterol (3:1:1 ratio) = optimal barrier repair mimicking natural skin lipid composition
  - AHA followed by BHA (sequenced, not simultaneous) = deeper pore clearing than either alone
- **Anti-Synergies (also hard-coded):**
  - Niacinamide + L-ascorbic acid at low pH = potential flushing (recommend separating AM/PM)
  - Benzoyl peroxide + retinoid in same step = degradation of retinoid molecule (recommend alternating nights)
  - Multiple exfoliating acids in one routine = cumulative over-exfoliation risk — the engine caps total exfoliant load
- **Multi-Concern Efficiency:** When the user has multiple concerns, the engine prioritizes ingredients that address several simultaneously: niacinamide addresses pigmentation + oiliness + barrier; retinol addresses texture + fine lines + acne + pigmentation. This minimizes routine complexity and product count.
- **Cost-Effectiveness Optimization:** If the user has set a budget constraint, the engine maximizes concern coverage per dollar by favoring multi-benefit ingredients and avoiding single-purpose products when a multi-purpose alternative exists in the catalog.

#### 3.5.5 Application Technique & Layering Guidance

What to apply is half the equation — HOW to apply it determines whether it works. Each step in the generated routine includes technique guidance:

- **Amount Per Product:**
  - Retinol: pea-sized amount for full face (over-application causes irritation, not faster results)
  - SPF: ¼ teaspoon for face + neck (most users under-apply by 50%, reducing effective SPF by 75%)
  - Serum: 2–3 drops
  - Cleanser: dime-sized
- **Wait Times Between Layers:**
  - Vitamin C (low pH): 15 minutes before next layer to fully absorb at active pH
  - BHA: 20 minutes of skin contact for acid to penetrate pores before neutralizing with next layer
  - Retinol: let dry 5 minutes before moisturizer (unless buffering for tolerance — apply moisturizer first, then retinol on top)
  - SPF: 15 minutes before sun exposure for film to form
- **Application Technique:**
  - Eye cream: pat gently with ring finger (least pressure finger) on orbital bone, never directly on the lid
  - SPF: press and pat, don't rub — rubbing breaks the UV-protective film
  - Cleansing oil: massage for 60 seconds to dissolve sunscreen and sebum before rinsing
  - Toner: pat into skin or apply with cotton pad, depending on toner type (hydrating = pat, exfoliating = pad)
- **Layering Order Rules:** Thinnest to thickest consistency. Water-based before oil-based. Actives on bare skin unless buffering for tolerance. Occlusives last to seal everything in.
- **Animated Step-by-Step:** Each routine step is presented with a short looping animation showing correct amount, technique, and application area. Voice narration available for accessibility.

#### 3.5.6 Treatment Timeline Estimation

"When will I see results?" is the most common user question, and unrealistic expectations are the #1 reason users abandon effective routines. The engine sets explicit, honest timelines per concern:

| Concern | Typical Timeline | What to Expect Along the Way |
|---------|-----------------|------------------------------|
| Dehydration | 1–2 weeks | Fast response — visible improvement within days of correct hydration |
| Barrier damage | 2–4 weeks | Gradual reduction in tightness, stinging, and flaking |
| Active inflammatory acne | 4–8 weeks | Possible initial purging (week 2–3) as trapped comedones surface — this is normal, not failure |
| Comedonal acne | 6–12 weeks | Slow, gradual clearing — comedones take longest to resolve |
| PIE (red marks) | 2–4 months | Gradual fade; faster with azelaic acid |
| PIH (dark spots) | 3–6 months | Very slow fade — patience is critical |
| Fine lines (dynamic) | 3–6 months with retinol | Subtle softening; most visible improvement in expression lines |
| Deep wrinkles (static) | Ongoing management | Topicals slow progression but won't reverse — professional treatments for significant correction |
| Pore size (structural) | 8–12 weeks with retinol | Modest reduction through collagen remodeling around pore walls |
| Rosacea redness | 4–8 weeks | Cyclical — flares will still occur; baseline improves over time |

- **Milestone Previews:** "Here's what progress typically looks like at week 4, week 8, and week 12" — with reference images at each milestone matched to the user's Fitzpatrick type and concern severity.
- **Purging Warning:** For retinoids and BHAs, the system explicitly warns about initial purging: "You may see more breakouts in weeks 2–3. This is trapped debris being pushed to the surface faster, not a reaction. It should resolve by week 4–5. If it persists beyond week 6, re-scan and we'll reassess."
- **Patience Reinforcement:** At each scan, if the user is within the expected timeline but hasn't seen dramatic results yet, the system reinforces: "You're 4 weeks into your retinol routine. Based on your timeline, measurable improvement typically starts around week 6. Your barrier score is stable and you're not showing irritation — stay the course."

#### 3.5.7 Adaptive Re-Scan Scheduling

Scanning on a fixed schedule is suboptimal. The system computes the ideal next scan time based on context and pushes a smart notification:

| Context | Recommended Next Scan | Notification |
|---------|----------------------|-------------|
| Just introduced a new active (Phase 2+) | 2 weeks | "It's been 2 weeks since you started retinol — time for a check-in to see how your skin is adjusting." |
| Reaction detected at last scan | 1 week | "Let's check in on the irritation we noticed last week." |
| Stable scores, maintenance phase | 4 weeks | "Monthly check-in time — let's see how your routine is holding up." |
| Predictive alert fired (breakout predicted) | Now | "Based on your cycle and stress data, a breakout may be forming — scan now for early detection." |
| Seasonal transition detected | Now | "We've detected a seasonal shift in your area — scan now to establish a new seasonal baseline." |
| Just had a chemical peel / professional treatment | Wait 72 hours | "Your skin is recovering from your treatment. Wait until [date] before scanning — recovery redness would skew your results." |
| Product change detected (re-scanned products) | 2 weeks | "You've changed your moisturizer — scan in 2 weeks to see how your skin responds." |

- **Calendar Integration:** Scan reminders can sync with the user's calendar (iOS Calendar / Google Calendar) as events.
- **Smart Suppression:** If the user just scanned yesterday, the system doesn't push another reminder even if a new trigger fires — minimum 3-day cooldown between scan prompts.

#### 3.5.8 Seasonal Routine Adjustment

Environmental conditions change predictably with seasons. Rather than waiting for the user to scan and discover their skin has changed, the engine proactively adjusts:

- **Proactive Seasonal Notifications:** Based on the user's GPS location and weather forecast: "Winter is approaching in your area — humidity will drop significantly over the next 2 weeks. Here's how your routine should change." Triggered 2 weeks before the seasonal transition is expected.
- **Automatic Adjustments:**
  - **Winter:** Swap lightweight moisturizer → richer cream. Add hyaluronic acid if not present. Reduce AHA frequency (barrier stress). Maintain SPF (UV reflects off snow).
  - **Summer:** Swap heavy cream → lightweight gel moisturizer. Increase SPF from 30 → 50+. Reduce retinol frequency if sun exposure increases. Add antioxidant serum.
  - **Transitional (spring/fall):** Gradual shift — the engine blends seasonal routines over 2–3 weeks rather than switching abruptly.
- **User Control:** Seasonal suggestions are presented as recommendations, not auto-applied. The user confirms or dismisses each adjustment.

#### 3.5.9 Routine Complexity Modes

Users have different levels of skincare commitment. A 10-step routine is perfect for an enthusiast and overwhelming for a minimalist who'll abandon it after 3 days. The engine generates **multiple routine tiers** from the same analysis:

- **Essential (3 steps):** Cleanser + one multi-benefit active + moisturizer with SPF. The highest-impact minimal routine. The engine must make harder ingredient selection choices here — pick the single active that covers the most concerns simultaneously (e.g., niacinamide for oiliness + pigmentation + barrier, or azelaic acid for acne + pigmentation + redness). For users who will do 3 steps consistently rather than 7 steps inconsistently.
- **Standard (5–6 steps):** The balanced recommendation. AM and PM differentiated. Separate SPF. Covers the top 2–3 concerns with dedicated actives. This is the default tier.
- **Comprehensive (8–10 steps):** Full multi-concern coverage with layering, synergistic combinations, targeted zone-specific treatments, and weekly specialty steps (masks, exfoliating treatments). For skincare enthusiasts who enjoy the ritual.
- **Tier Selection:** The user selects their preferred tier during onboarding. The system can also recommend a tier based on the concern severity — severe multi-zone acne may genuinely need a Standard routine minimum, and the app communicates this: "Your concerns would benefit from at least 5 steps. We recommend the Standard routine, but here's what Essential would cover."
- **Tier Switching:** The user can switch tiers at any time. The engine regenerates within the new constraint without losing the phased introduction progress.

#### 3.5.10 Routine Calendar & Shopping List

The routine exists as a static AM/PM list, but real routines have temporal complexity. The output includes actionable scheduling and purchasing tools:

- **Visual Day-by-Day Calendar:** A weekly calendar view showing exactly which products to use each day, accounting for:
  - Alternating-night schedules (retinol Mon/Wed/Fri, AHA Tue/Thu)
  - Ramping schedules (week 1–2: retinol Monday only; week 3–4: Monday + Thursday; week 5+: Monday + Wednesday + Friday)
  - Weekly treatments (clay mask Sunday, exfoliating peel Wednesday)
  - Rest nights (moisturizer only — no actives — to prevent cumulative irritation)
- **Circadian Optimization:** The calendar is personalized to the user's actual sleep schedule (from HealthKit/Health Connect). A night-shift worker whose sleep period is 8 AM–4 PM gets "PM routine" products scheduled before their sleep period, not at an arbitrary 10 PM. Retinol always goes on before sleep (when cell turnover peaks), vitamin C always goes on before UV exposure.
- **Shopping List (Phase-Prioritized):** Products sorted by introduction phase — Phase 1 products at the top (buy now), Phase 3 products at the bottom (buy in 4 weeks, don't waste money yet). Includes:
  - Estimated monthly cost per product based on size and daily usage amount
  - Total routine cost per tier (Essential: ~$X/month, Standard: ~$Y/month)
  - Budget alternatives when available ("This product's active ingredient is also available in [cheaper alternative] at the same concentration")
- **Restock Reminders:** Based on product volume and daily usage amount, the system estimates when each product will run out and pushes a reminder 1 week before: "Your retinol serum will run out around Oct 15 — reorder soon to avoid a gap in your routine."

### 3.6 Progress Tracking & Scan History

- **Temporal Consistency Enforcement:** When a user starts a follow-up scan, the app overlays a **ghost silhouette** of their previous scan's face position, size, and head angle per pose. The capture only triggers when the user's face aligns within ±10% of the baseline IPD-derived distance and ±5° of the baseline head rotation. Both the current and baseline images are re-normalized to the same white balance before computing score deltas. Without this, changes in lighting, angle, or distance would create phantom improvements or regressions.
- **Scale-Normalized Comparison:** Progress deltas are computed using real-world measurements (mm) from the scale normalization pipeline (Section 2.4.2), not pixel differences. A pore measured at 0.3mm in scan 1 is compared against the same physical scale in scan 2 regardless of capture distance.
- **Temporal Comparison:** Side-by-side historical photo timeline with concern-score delta graphs (e.g., -15% redness over 30 days). Each data point includes a coverage confidence indicator so the user knows which comparisons are high-fidelity vs. approximate.
- **Routine Adherence Log:** Daily checkbox for routine completion to correlate regimen consistency with visual progress.
- **Historical Photo Import:** The user can import existing selfies from their camera roll to establish a **long-term baseline** that predates their first formal scan:
  - Selected photos are processed through the same pipeline with relaxed quality requirements (no calibration, no controlled lighting, no multi-angle). The system extracts what it can — approximate severity scores, concern presence/absence — at reduced confidence.
  - Even at low confidence per photo, a trend across 20 selfies over 6 months is statistically meaningful: "Your acne appears to have improved ~30% over the past 6 months."
  - Provides a "before I started" reference point — the first formal scan establishes precision, but imported photos show where the user was before they began using the app.
  - Photos are date-sorted from EXIF metadata. The app warns that comparisons between imported photos and formal scans have lower reliability than formal-to-formal comparisons.
- **Longitudinal Correlation Engine:** The system tracks all contextual factors (AQI, weather, sleep, HRV, cycle phase, routine adherence, product changes) alongside skin scores over time. After sufficient data points (~8+ scans over 2+ months), it surfaces correlations: "Your skin scores tend to dip during high-pollution weeks," "Breakouts correlate with your luteal phase," "Scores improved after you switched from Product X to Product Y." These are presented as observations, not diagnoses.
- **Causal Inference Engine:** Correlation is not causation. When the user changed two variables simultaneously (e.g., started a new product AND moved to a drier climate), the system applies causal reasoning to disentangle:
  - **Temporal ordering:** Which variable changed first? Did the skin change lag one variable's introduction by the expected timeline (e.g., product effects typically appear at 4–8 weeks, climate effects appear within days)?
  - **Natural experiments:** If the user used a product consistently, then stopped for 2 weeks (ran out), then restarted — and scores worsened during the gap and recovered after restart — that's causal evidence, not just correlation.
  - **Confound flagging:** When disentanglement isn't possible, the system is transparent: "Your redness decreased after starting azelaic acid, but this also coincided with a humidity increase in your area. We'll have stronger evidence after your next scan in stable conditions."
  - **Counterfactual estimation:** For users with enough scan history, the system estimates what scores would have been WITHOUT the intervention (using the user's own seasonal/cyclical baseline), making product efficacy claims more reliable.
- **Spot-Level Tracking:** Individual spots marked via touch-to-mark (Section 2.3) are tracked across scans. The system registers the spot's position on the 3D facial mesh (when available) or 2D zone coordinates, and reports per-spot deltas: "The mark you flagged on your left cheek on Sept 15 has faded by 40%."
- **Skin Age Timeline:** Biological skin age (Section 2.4.14c) is plotted over time alongside chronological age. The user sees whether their routine is "de-aging" or "aging" their skin: "Your biological skin age has decreased from 34 to 31 over the past 6 months."
- **Product Efficacy Dashboard:** Each product in the user's routine gets a tracked efficacy score (Section 2.5.3). The progress screen shows: "Products working for you: Niacinamide serum (-20% pigmentation). Products to reconsider: Salicylic acid cleanser (no measurable change after 8 weeks)."
- **Predictive Alerts:** Based on the predictive analytics engine (Section 2.4.14d), the app sends proactive notifications: "Based on your cycle and current pore congestion, your chin may break out this week — here's a preventive step." These alerts arrive days before issues become visible.

### 3.7 Results Output & Reporting

#### 3.7.1 Interactive 3D Annotated Face Map

The primary results view is an interactive diagnostic map of the user's own face, not a static list of scores:

- **3D Rotatable Model:** Built from the LiDAR/TrueDepth mesh or photometric stereo surface normals. The user rotates their face with their finger to examine any angle. On devices without 3D data, a textured 2D projection on a face template provides a simplified interactive view.
- **Findings Pinned to Exact Locations:** Each detected concern is a tappable pin at its real coordinates on the face. Tap to expand: what it is (plain language), severity score, cause attribution (from differential + environmental + product analysis), which product in the routine targets it, expected timeline, and a trend arrow (improving / worsening / stable / new).
- **Data Layer Toggles:** The user switches between visualization layers:
  - **All Concerns** — color-coded severity pins across the full face
  - **Oiliness Map** — specular-derived sebum distribution heatmap
  - **Blood Flow Map** — rPPG perfusion heatmap (inflammation hot spots)
  - **Texture Map** — surface roughness visualization from Gabor/wavelet analysis
  - **UV Damage Map** — blue-channel multispectral sub-clinical pigmentation
  - **Bacterial Map** — violet-channel fluorescence density (when multispectral data available)
  - **3D Surface** — photometric stereo bump map showing raised/depressed features
- **Zone Drill-Down:** Tap any zone to see its full breakdown: individual findings, zone quality grade, coverage confidence, and the specific products in the routine that target this zone with connecting lines.

#### 3.7.2 Skin Health Score

Individual scores per concern per zone are comprehensive but overwhelming. The user needs one number to track:

- **Skin Health Score (0–100):** Weighted composite of all concern severity scores (inverted — fewer/milder concerns = higher score), barrier health, elasticity, hydration, and skin age relative to chronological age.
- **Personalized Weightings:** Concerns the user cares most about (inferred from self-assessment emphasis, touch-to-mark frequency, and voice description keywords) are weighted higher. A user who marks acne spots every scan sees acne improvement reflected more strongly in their score.
- **Trend as Headline:** "Your Skin Health Score: 72 (+8 from last month)." The delta is more motivating than the absolute number.
- **Breakdown on Tap:** The score expands to show each category's contribution — what's pulling the score up and what's dragging it down, with arrows indicating which categories improved or declined.
- **Benchmark (Opt-In):** "Your score is in the top 35% for your age group and skin type." Contextualized against anonymous aggregate data from similar users. Disabled by default — the user opts in if they want comparative context.

#### 3.7.3 Real-Time AR Results Overlay

After results are processed, the user opens the camera and sees their analysis **overlaid live on their face**:

- **Live Concern Highlighting:** Zones are color-coded in real-time — green (clear), yellow (mild), orange (moderate), red (severe). The overlay tracks with head movement using ARKit (iOS) or ARCore (Android) face tracking.
- **Finding Pins:** Individual findings appear as floating labels pinned to their exact location, tracking with head movement. Tap any pin for details.
- **Before/After AR Toggle:** The left half of the face shows the current state; the right half renders the predicted 3-month outcome from the "what-if" visualization as a live filter. The user turns their head to see the comparison from different angles.
- **Layer Toggle in AR:** Switch between concern overlay, oiliness heatmap, and blood flow heatmap in the live camera view.
- **Screenshot / Record:** The user can screenshot or record a short video of the AR overlay for their records or to share with their dermatologist.

#### 3.7.4 Before/After Comparison Slider

The most satisfying progress visualization tool:

- **Aligned Side-by-Side View:** Any two scans can be compared. Both images are normalized to the same white balance, scale, and angle using the 3D mesh alignment (or 2D face landmark alignment as fallback) — so differences are genuine skin changes, not capture variability.
- **Draggable Slider:** A vertical slider splits the view. Drag left to reveal more of the older scan, right for the newer. The transition is seamless because both images are geometrically aligned.
- **Delta Annotations:** Optional overlay showing per-zone improvement metrics: "Redness: -25%," "Pore visibility: -15%," "Barrier: +12." Displayed at the zone level on the comparison.
- **Timeline Scrubber:** For users with many scans, a horizontal timeline scrubber at the bottom lets them slide through all historical scans and watch their skin change over time as a smooth sequence.

#### 3.7.5 Natural Language Analysis Report

Scores and product cards alone are insufficient — the user needs to **understand** their skin, not just see numbers. An LLM generates a human-readable narrative for each scan:

- **Plain-Language Summary:** "Your skin is generally healthy with mild dehydration on your cheeks and moderate comedonal acne concentrated in your T-zone. The acne pattern is consistent with sebaceous overproduction rather than hormonal causes. Your current cleanser contains sodium lauryl sulfate, which may be contributing to the barrier compromise we measured on your cheeks."
- **Concern-by-Concern Explanation:** Each detected concern includes: what it is (in plain terms), what likely caused it (based on differential diagnosis, environmental data, and product analysis), and what the recommended treatment targets.
- **Routine Rationale:** Each recommended product/ingredient includes a one-sentence explanation of WHY it was chosen: "Niacinamide 10% serum — targets your T-zone hyperpigmentation while also reducing sebum production, addressing two of your concerns simultaneously."
- **Phased Plan Narrative:** The introduction timeline (Section 2.5.2) is explained in natural language: "We're starting you with just the basics for 2 weeks to let your skin stabilize. Then we'll add retinol at a low dose and check in with a scan to make sure your skin tolerates it before adding anything else."
- **Confidence Transparency:** Where the system is uncertain, it says so: "We're not 100% sure whether the bumps on your forehead are closed comedones or fungal folliculitis. We've recommended treatment that addresses both, but if you don't see improvement in 4 weeks, a dermatologist can do a definitive test."

#### 3.7.6 Dermatologist-Ready Clinical Export

The user can generate a clinical-grade PDF summary to share with a dermatologist. This saves 15+ minutes of intake and makes the consultation immediately productive:

- **Standardized Concern Classification:** Findings mapped to ICD-10 codes where applicable (L70.0 Acne vulgaris, L71.9 Rosacea, L81.1 Chloasma, etc.) with severity grades.
- **Measurement History:** Longitudinal charts of concern scores, lesion counts, and real-world dimensions (mm) with confidence intervals per scan.
- **Facial Zone Map:** Annotated face map showing all detected concerns by zone with severity color coding.
- **Full Ingredient List:** Complete INCI ingredient list from all scanned current products, with known irritants and comedogenic ingredients highlighted.
- **Medication Profile:** Current medications, recent professional treatments, and any flagged interactions.
- **Environmental Context:** Location-based UV exposure, water hardness, AQI averages for the user's area.
- **Treatment Response Log:** Which recommended ingredients the user tried and their measured efficacy (from Section 2.5.3).
- **Photo Timeline:** Side-by-side comparison photos (with user consent) showing progression.
- **AI Confidence Notes:** Where the system was uncertain or where findings warrant professional evaluation: "Asymmetric pigmentation on left cheek — recommend dermoscopy to rule out atypical melanocytic lesion."

#### 3.7.7 Predictive Visualization ("What-If" Previews)

Using generative models (diffusion-based or GAN), the app shows the user realistic previews of potential skin outcomes. These are **powerful motivation tools for routine adherence**:

- **Positive Trajectory:** "If you follow this routine consistently for 3 months, here's a realistic prediction of what your skin could look like" — generated from the user's current photo + similar-user outcome data at the predicted improvement rate.
- **Risk Trajectory:** "If you continue without SPF at your current UV exposure level, here's projected sun damage over 5 years" — based on cumulative UV modeling + Fitzpatrick type + current sub-clinical damage detected in multispectral.
- **Before/After for Motivation:** Once the user has 2+ scans showing improvement, generate a smooth interpolation between their first scan and their best scan to visualize the journey.
- **Ethical Guardrails:**
  - All predictive images are clearly watermarked "AI Prediction — Not a Guarantee"
  - Predictions are bounded by similar-user outcome distributions — the system never shows unrealistically perfect skin
  - The user can disable predictive visualizations in settings
  - Predictions are never shown for medical conditions — only cosmetic concerns where routine intervention is appropriate

#### 3.7.8 Dermatologist Feedback Loop

When users share the clinical export (Section 2.7.2) with a dermatologist and receive a professional diagnosis, that feedback is captured to improve both the user's ongoing care and the system's accuracy:

- **Diagnosis Capture:** After a dermatologist visit, the app prompts: "Did your dermatologist give you a diagnosis or new prescription? Tap to update your profile." The user selects from a structured list of common diagnoses or enters free text.
- **Treatment Plan Reconciliation:** If the dermatologist prescribed a treatment (topical prescription, oral medication, professional procedure), the user enters it. The routine engine reconciles: professional prescriptions take priority, and OTC recommendations are adjusted to complement (not conflict with) the prescription. The phased introduction protocol pauses until the prescription stabilizes.
- **Model Correction Signal:** If the system's top differential was "comedonal acne" but the dermatologist diagnosed "fungal folliculitis," this is a correction signal. With the user's explicit consent, the anonymized scan data + professional correction is queued for the training pipeline. Over time, this closes the gap between AI and professional diagnosis, especially for conditions the model struggles with.
- **Accuracy Tracking:** The system tracks its own diagnostic accuracy against dermatologist feedback across all users who opt in. Per-condition accuracy rates (e.g., "our rosacea detection agrees with dermatologists 78% of the time") are reported in the model registry (Section 5.1) and used to calibrate displayed confidence levels.
- **User Benefit:** After entering a professional diagnosis, the user gets an updated analysis that incorporates the dermatologist's findings: "Your dermatologist confirmed rosacea. We've updated your analysis and adjusted your routine to a rosacea-specific protocol."

#### 3.7.9 Achievement System & Gamification

The best routine is the one the user actually follows. Gamification drives adherence, which drives results:

- **Streak Tracking:** Consecutive days of routine adherence displayed prominently on the home screen. "14-day streak! Your consistency is in the top 20% of users." Breaking a streak sends a gentle re-engagement nudge ("missed a day — no worries, pick it up tonight"), never guilt.
- **Clinical Milestones as Achievements:** Real clinical progress tied to achievement language:
  - "Barrier health reached 70 — retinol unlocked in your routine!" (real dependency graph gate)
  - "Skin age improved by 1 year — your routine is working."
  - "Breakout prediction avoided — you took preventive action and no breakout occurred!"
  - "First product with confirmed efficacy — niacinamide is measurably improving your pigmentation."
- **Progress Badges:** First scan completed. 7-day streak. 30-day streak. Skin Health Score improved 10+ points. All zones graded A on scan quality. Barrier fully recovered. Successfully completed Phase 1 introduction.
- **Weekly Points:** Points for routine adherence, scanning on schedule, completing self-assessment, updating products, adding diary entries. Points are purely motivational — no pay-to-win, no locked features. A simple number that grows with engagement.
- **Shareable Progress Cards:** "I improved my Skin Health Score by 15 points in 2 months" — branded, anonymized card the user can share to social media for accountability. Includes the before/after slider image (with user consent) and the key stats.

#### 3.7.10 Context-Aware Daily Routine Notifications

Not dumb alarms — intelligent, contextual nudges based on the routine calendar, environmental data, and health app integration:

- **Routine-Calendar-Aware:** "Tonight is a retinol night. Remember to skip AHA. Apply pea-sized amount after your serum dries for 5 minutes."
- **Weather-Triggered:** "Humidity is dropping sharply tonight — apply an extra layer of moisturizer before bed." / "UV index is 9 today — reapply SPF at lunch if you're outdoors."
- **Health-Data-Triggered:** "Your sleep was poor last night (4.5 hours from HealthKit). Your skin may be more sensitive today — consider skipping the AHA and using your soothing toner instead."
- **Cycle-Aware:** "You're entering your luteal phase — your T-zone may get oilier this week. We've added a midday blotting reminder."
- **Encouragement-Timed:** "You've been consistent for 21 days — here's what to expect in the next 2 weeks based on your retinol timeline." / "Week 3 of retinol — some users see purging around now. This is normal. It should clear by week 5."
- **Product-Specific:** "You're running low on your vitamin C serum (estimated 5 days left) — reorder soon to avoid a gap."
- **Notification Preferences:** The user controls notification frequency and categories. "Routine reminders only" / "Routine + weather" / "All context" / "Silent mode." Defaults to routine + weather.

#### 3.7.11 Weekly Progress Digest

A push notification or in-app card delivered every Sunday evening:

- **One-Paragraph Summary:** "This week: Skin Health Score 72 (+3). Barrier up +5. Redness down 8%. Routine adherence: 85% (6/7 days). Your retinol is in week 4 — visible texture improvement typically starts around week 6. Sleep averaged 6.8 hours — try for 7+ for better skin recovery. Keep going."
- **No navigation required.** The user reads it in the notification shade and feels informed. Tapping opens the full dashboard for details.
- **Trend Mini-Chart:** A tiny sparkline of the Skin Health Score over the past 4 weeks, embedded in the notification (rich notification on iOS/Android).
- **Actionable Next Step:** One specific action for the coming week: "This week, try to scan on Wednesday for your retinol check-in" or "Try adding one extra glass of water per day — your dehydration texture has been trending up."

#### 3.7.12 Printable Routine Card

A single-page PDF designed to be printed and taped to the bathroom mirror:

- **AM Routine (left column) / PM Routine (right column):** Product images in application order. Amount per product shown as visual dot size (small = pea-sized, large = liberal). Wait times between steps shown as small clock icons (5 min, 15 min).
- **Weekly Calendar Strip:** Bottom of the page shows the current week's schedule — which products apply on which days, with alternating-night actives clearly marked.
- **QR Code:** Links back to the full digital routine in the app for detailed instructions, technique animations, and any recent changes.
- **Auto-Regenerated:** When the routine changes (new phase, seasonal adjustment, product swap), the printable card updates and the app notifies: "Your routine card has been updated — print the new version."

#### 3.7.13 Accessible Output Formats

Every output in Section 2.7 is available in accessible formats:

- **Audio Summary:** After each scan, an auto-generated 60-second audio walkthrough of key findings, score changes, and routine updates. Plays via the app or can be saved and shared. Uses the device's preferred voice (Siri voice / Google TTS). Essential for visually impaired users, but also useful for anyone who prefers listening over reading.
- **Simple-Language Mode:** Toggle in settings that replaces all clinical terminology with plain language throughout the app:
  - "Comedone" → "clogged pore"
  - "Erythema" → "redness"
  - "Retinoid" → "vitamin A treatment"
  - "Transepidermal water loss" → "skin losing moisture"
  - "Sebum" → "natural skin oil"
  Applied to the natural language report, notifications, routine descriptions, and all UI text.
- **Multi-Language Reports:** The natural language report (Section 2.7.5) is auto-translated to the user's device language. Supported languages include the app's full localization set. Medical/skincare terminology is verified per language to avoid mistranslation.
- **High-Contrast Results UI:** WCAG AAA contrast ratios. Large text option. No information conveyed by color alone — always paired with icons, labels, or patterns. The face map uses distinct patterns (stripes, dots, crosshatch) in addition to colors for concern severity.
- **Export Formats Beyond PDF:**
  - Apple Health / Google Health Connect integration: Skin Health Score written as a health metric, tracked alongside other health data
  - CSV data export for power users who want to analyze their own data
  - Shareable social media card (anonymized progress)

#### 3.7.14 Skin Diary / Journal

Beyond structured pipeline data, the user adds free-form context that no sensor can detect:

- **Daily Notes:** "Felt very stressed — work deadline." / "Changed pillowcases to silk." / "Started drinking 3L water/day." / "Ate a lot of dairy this week." / "Traveled to a humid climate for 5 days." / "Started a new medication not in the app's list."
- **Attached to Timeline:** Diary entries appear as markers on the progress timeline alongside scan results, product changes, and environmental data. The correlation engine (Section 2.6) includes diary entries as variables: "You noted switching to silk pillowcases on Oct 1. Your cheek texture scores improved 15% over the following 3 weeks."
- **Quick-Entry Shortcuts:** Common entries available as one-tap chips: "Stressed," "Poor sleep," "Traveled," "Period started," "Ate dairy," "Drank alcohol," "Forgot routine." Custom entries via text or voice.
- **Photo Diary:** The user can snap a quick photo on any day (not a full scan — just a selfie) and attach it to the diary. These casual photos appear on the timeline and provide visual context between formal scans, even though they're not analyzed with the full pipeline.
- **Prompted Entries:** After the user logs routine completion each day, the app asks one optional micro-question: "How does your skin feel today?" with quick-tap options: "Normal / Tight / Oily / Irritated / Great." This builds a daily subjective dataset that complements the objective scan data.

### 3.8 Offline & Degraded-Mode Behavior

- **Cached Routines:** The most recent analysis result and active AM/PM routine are persisted locally via MMKV/AsyncStorage so they remain accessible without connectivity.
- **Questionnaire Queueing:** Completed questionnaires are stored in a local queue (React Query's `persistQueryClient`) and automatically submitted when the network is available.
- **Graceful Degradation:** When the backend is unreachable, the app displays the last-known routine with a clear "Results may be outdated" banner and disables new scan uploads rather than showing an error wall.

### 3.9 Onboarding & User Experience Design

#### 3.9.1 Progressive Feature Disclosure

The app has extensive capabilities. Presenting all of them on day one causes information overload and churn. Features unlock progressively as the user builds comfort:

- **First Scan (Minimal Viable Experience, ~3 minutes):**
  - One-screen skin prep reminder
  - Auto environment check (no manual steps)
  - One calibration photo
  - **Frontal capture only** (single angle — no multi-angle yet)
  - Basic questionnaire (4 questions — skin type, top concern, allergies, age)
  - Results: Skin Health Score + simplified face map + 3-step Essential routine
- **Scan 2:** Multi-angle capture unlocks. "Want more detailed results? We'll guide you through 3 poses this time."
- **Scan 3:** Self-assessment reference photos and touch-to-mark unlock.
- **After baseline established (2+ scans):** Progress tracking, predictions, achievements, and timeline comparisons activate.
- **Advanced features appear as optional prompts:** Multispectral pass, elasticity video, product scanning, close-up pass, and health app integration surface as "Want to try [feature]? It improves accuracy for [specific benefit]" cards at contextually appropriate moments.
- **Power User Override:** Settings toggle to unlock all features immediately for users who want the full experience from day one.

#### 3.9.2 Emotional Design Principles

Skin is deeply personal. The app's tone and visual design must be emotionally supportive, never clinical or judgmental:

- **Lead with Strengths:** Results screen always opens with what's good: "Your skin is well-hydrated and your barrier is healthy" BEFORE presenting concerns. Every scan has something positive — find it and lead with it.
- **Constructive Framing:** Never "problems" or "issues." Use "areas to focus on" or "opportunities." A score of 40/100 is NOT "40% — poor." Instead: "Your acne score is 40 — moderate. Here's the plan to improve it." Numbers inform, framing motivates.
- **Progress Celebration:** When ANY score improves, even by 2 points, celebrate it: subtle confetti animation, green glow on the improved metric, achievement sound. Small wins sustain motivation through the 4–12 week treatment timelines.
- **No Shame on Missed Routines:** "Welcome back! Ready to pick up where you left off?" — never "You missed 3 days." / "Your streak is broken." The gamification system rewards consistency but never punishes absence.
- **Warm Visual Design:** Rounded corners, warm neutral palette, soft gradients. The scan results should feel like a supportive health check, not a medical diagnosis. Face map overlays use soft pastel tones for concern severity, not alarming reds.
- **Encouraging Copy at Hard Moments:** During retinol purging: "Week 3 can feel discouraging — this is your skin adjusting, not getting worse. Hang in there." When improvement is slow: "PIH takes patience — you're doing everything right."

#### 3.9.3 First-Scan Guided Results Walkthrough

The first time results are presented, the app walks the user through interactively rather than dumping the full dashboard:

- Step 1: "Here's your Skin Health Score — this is your overall skin health in one number." (Explain the score, show the benchmark.)
- Step 2: "Tap to explore your face map." (Guided tap on a finding. Explain what the pins mean.)
- Step 3: "Here's what we recommend." (Show the Essential routine with rationale for each product.)
- Step 4: "Set up your first routine reminder." (Time picker for AM and PM.)
- Step 5: "You're all set! Scan again in 2 weeks to start tracking progress."
- Subsequent scans skip the walkthrough and go straight to the results dashboard.

#### 3.9.4 Information Hierarchy

The results screen has a clear visual hierarchy — the user never processes everything at once:

| Level | Time | What's Visible |
|-------|------|---------------|
| **Glance** | 0 sec | Skin Health Score + trend arrow. Nothing else. |
| **Scan** | 2 sec | Face map with color-coded zones. One-sentence summary. |
| **Read** | 10 sec | Top 3 concerns with severity and trend. Routine summary card. |
| **Explore** | 30+ sec | Full zone drill-down, data layers, natural language report, predictions, diary. |

Each level is a scroll or tap deeper. The glance level is the home screen. Everything else is progressive disclosure.

#### 3.9.5 Notification Budget & Smart Delivery

With multiple notification sources (routine reminders, weather alerts, restock reminders, scan scheduling, weekly digests, predictive alerts, achievements), the user could receive 5+ notifications daily, causing notification fatigue.

- **Hard Cap:** Maximum 2 push notifications per day. Prioritized by impact:
  1. Safety alerts (suspicious lesion change, medication interaction) — always delivered
  2. Routine reminders — daily at the user's learned routine time
  3. Predictive alerts (breakout predicted) — delivered when actionable
  4. Everything else (weather, restock, achievements, digest) — bundled or deferred
- **Smart Bundling:** If 3+ low-priority notifications are pending, bundle into one: "3 updates for you" with a single tap to expand.
- **Learned Timing:** Routine reminders are delivered at the time the user actually does their routine (learned from adherence log patterns), not a fixed time. The weekly digest is delivered when the user typically opens the app on Sundays.
- **Mute Mode:** One-tap "quiet week" that silences everything except safety alerts. Auto-resets after 7 days.
- **Granular Preferences:** The user controls each category independently: "Routine reminders: ON. Weather alerts: OFF. Achievements: ON. Restock: OFF."

### 3.10 Multi-Profile & Collaboration

#### 3.10.1 Family / Multi-Profile Support

Parents scanning their teenager's skin. Partners sharing a device. Roommates. Each profile is fully independent:

- **Separate Everything:** Each profile has its own scan history, routine, product library, medication list, health app connection, diary, preferences, notification settings, and privacy controls.
- **Profile Switching:** Avatar tap on the home screen to switch profiles. Biometric lock (Face ID / fingerprint) per profile for privacy.
- **Family Dashboard (Optional):** A parent can monitor their child's routine adherence, scan results, and alerts (with the child's consent toggle). The parent sees a simplified view — adherence percentage and any safety flags — not the full diagnostic detail.
- **Profile-Specific Device Calibration:** Each profile stores their own Fitzpatrick classification, skin type, and baseline scans independently.

#### 3.10.2 Dermatologist Collaboration Portal

Beyond exporting a static PDF, the app supports live collaboration with a skincare professional:

- **Invite a Dermatologist:** The user shares a secure, revocable link. The dermatologist accesses a read-only web dashboard showing: scan history, scores, product routine, timeline, diary entries, and the clinical export — all in real-time, always up to date.
- **In-App Notes from Dermatologist:** The dermatologist can leave notes visible in the user's app: "I've reviewed your latest scan. The redness on your cheeks is consistent with rosacea. I'm prescribing metronidazole cream — add it to your products."
- **Photo Requests:** The dermatologist can request a specific close-up or additional photo through the portal. The user receives a notification and captures the requested image, which uploads directly to the shared view.
- **Telemedicine-Ready:** The portal provides all context a dermatologist needs for a video consultation — the appointment starts with full diagnostic history instead of 15 minutes of intake questions.
- **Access Control:** All access is revocable by the user at any time. The dermatologist cannot download raw images — view-only in the secure portal. Data sharing complies with HIPAA (US) / GDPR (EU) requirements.

#### 3.10.3 Routine Version History

Every routine change is version-controlled with timestamps and reasons:

- "Oct 1: Retinol added — Phase 2 active introduction"
- "Oct 15: AHA frequency reduced — seasonal adjustment (winter dryness detected)"
- "Nov 3: Metronidazole cream added — dermatologist prescription for rosacea"
- "Nov 10: Vitamin C swapped for azelaic acid — personalized learning (vitamin C showed no improvement after 8 weeks)"
- The user can view any past routine version: "What was my routine 3 months ago?" Essential when tracing what caused a positive or negative change.
- Routine versions are included in the clinical export (Section 2.7.6) so the dermatologist sees the full treatment history.

#### 3.10.4 Data Portability & Privacy

- **Full Data Export:** One-tap export of everything — scans, scores, products, diary, health correlations, routine history — as a structured JSON archive + original image files. GDPR Article 20 (Right to Data Portability) compliant.
- **Account Deletion:** One-tap hard delete of all data from servers. Images purged from S3, database records hard-deleted (not soft-deleted), federated learning contributions cannot be reversed but no new data is retained. Confirmation email sent.
- **Data Residency Choice:** During onboarding, the user selects their preferred data storage region (EU, US, APAC). All scan data, images, and personal information are stored exclusively in the selected region for regulatory compliance.
- **Encryption:** All personal data encrypted at rest (AES-256) with user-specific keys. Image encryption is tenant-isolated — even a database breach cannot decrypt one user's images using another user's keys.

---

## 4. Technical Architecture & Tech Stack

```
┌──────────────────────────────────────────────────────────────┐
│                Expo Mobile App (React Native)                │
│  - expo-camera / expo-image-manipulator                      │
│  - TanStack Query (caching, offline persistence, sync)       │
│  - MMKV (local routine & questionnaire cache)                │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTPS / REST
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                   API Gateway & Auth                         │
│  - Cloudflare (CDN, WAF, DDoS protection, rate limiting)    │
│  - Supabase Auth (JWT issuance, refresh token rotation)      │
└──────────┬───────────────────────────────────┬───────────────┘
           │                                   │
           ▼                                   ▼
┌────────────────────────────┐   ┌─────────────────────────────┐
│    Core Backend Service    │   │     Redis (Bull MQ)         │
│  - NestJS (Node.js / TS)  │   │  - Job queue for inference  │
│  - Routine Engine Logic    │   │  - Product catalog cache    │
│  - Product Catalog API     │   │  - Rate limit counters      │
└──────────┬─────────────────┘   └──────────────┬──────────────┘
           │                                    │
           │         ┌──────────────────────────┘
           │         │  Job dispatch / consume
           │         ▼
           │   ┌─────────────────────────────────┐
           │   │     AI Inference Pipeline        │
           │   │  - FastAPI (Python)              │
           │   │  - Triton Inference Server       │
           │   │  - PyTorch / TensorRT            │
           │   │  - OpenCV / MediaPipe            │
           │   │  - Model Registry (versioned)    │
           │   └──────────────┬──────────────────-┘
           │                  │
           ▼                  ▼
┌────────────────────────────┐  ┌──────────────────────────────┐
│      Main Database         │  │      Cloud Storage           │
│  - PostgreSQL (RDS/Aurora) │  │  - S3 / GCS (AES-256)       │
│  - Composite indexes on    │  │  - Auto-lifecycle expiry     │
│    skin_type, ingredients, │  │  - CDN for product images    │
│    budget, allergens       │  │    (CloudFront / Cloud CDN)  │
└────────────────────────────┘  └──────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   Observability Stack                        │
│  - OpenTelemetry (distributed tracing)                       │
│  - Prometheus + Grafana (metrics, dashboards, alerting)      │
│  - Structured JSON logging → CloudWatch / Loki               │
│  - PagerDuty / Opsgenie (on-call alerting)                   │
└──────────────────────────────────────────────────────────────┘
```

| Layer                | Technology                                | Purpose                                                                                |
| -------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------- |
| **Mobile Client**    | Expo SDK (React Native), TypeScript       | Cross-platform UI, camera access, state management.                                    |
| **Networking**       | TanStack Query + Axios                    | Image upload, background retry, query caching, offline persistence.                    |
| **API Backend**      | NestJS (Node.js, TypeScript)              | User state, business logic, routine builder engine. Shares types with the Expo client. |
| **Job Queue**        | Redis + BullMQ                            | Async dispatch of inference jobs; decouples backend from GPU workers.                  |
| **AI Inference**     | Python, PyTorch / TensorRT, Triton Server | High-throughput GPU inference for computer vision models.                              |
| **Caching**          | Redis                                     | Product catalog cache, rate limit counters, session data.                              |
| **CDN**              | Cloudflare / CloudFront                   | Static product images, API edge caching, DDoS protection.                              |
| **Primary Database** | PostgreSQL (RDS / Aurora)                 | Relational data: user profiles, routines, products, adherence logs.                    |
| **Object Storage**   | AWS S3 / Google Cloud Storage             | Encrypted facial imagery with presigned URLs.                                          |
| **Observability**    | OpenTelemetry, Prometheus, Grafana, Loki  | Distributed tracing, metrics, log aggregation, alerting.                               |

---

## 5. End-to-End Analysis Data Flow

### Step 1 — Pre-Scan Readiness

The app walks the user through the preparation sequence:

1. **Skin prep checklist** (Section 2.1.1) — bare skin, hair pinned, face dry. Shown once for new users; returning users see a condensed reminder.
2. **Physiological state questions** (Section 2.1.2) — 2 quick taps: recent exercise? hot shower? Flags are attached as scan metadata.
3. **Environment quality gate** (Section 2.1.3) — traffic-light indicator evaluates lighting. Guided positioning ("step toward the light") until green/yellow. Red blocks capture.
4. **Color calibration** (Section 2.1.5) — photograph white reference surface. On first launch, this also runs the device camera profiling (Section 2.1.4).
5. **Makeup/product detection** — real-time classifier checks the preview feed for cosmetic coverage before proceeding.

### Step 2 — Back Camera: Multi-Angle Guided Capture

The app guides the user through 3 poses (frontal → left 45° → right 45°) using voice + haptic guidance (audio-guided mode, default) or on-screen silhouette overlay (mirror/assisted mode). For each pose, a 2-second video clip is recorded via the back camera; the best frame is auto-selected. Multi-camera simultaneous capture fires all available lenses (wide + ultrawide + telephoto) per angle when supported. Hair/obstruction detection runs in real-time, pausing if coverage is blocked. Per angle, the system captures the HDR bracket (3 exposures) and flash/no-flash pair. After the 3 angles, the optional 5-second expression video (raise eyebrows → smile → neutral) is recorded at 240fps for elasticity analysis. Gyroscope orientation is logged throughout for photometric stereo.

### Step 2b — Front Camera: Multispectral Pass (Optional)

If the environment is dim enough (<200 lux, detected via ambient light sensor), the app prompts: "Flip your phone around for a quick light scan." The user switches to the front camera. The screen rapidly flashes red → green → blue → violet, capturing one frame under each wavelength (~3 seconds total). This detects bacterial colonies (violet fluorescence), enhances erythema mapping (green), reveals sub-clinical pigmentation (blue), and maps deep vascular patterns (red). The user flips back and proceeds. Skipped automatically in bright environments, simplified mode, or if the user declines.

### Step 3 — Background Upload + Questionnaire + Product Scan (Parallel)

Upload begins immediately in the background via parallel presigned S3 URLs (resumable multipart). **While frames upload**, the user completes the input sequence:

1. **Skin assessment questions** (Section 2.2.1) — 4–6 taps on skin type, sensitivity, sun exposure (~30s)
2. **Medication & treatment check** (Section 2.2.3) — quick taps for active medications, recent treatments (~15s). Skipped after first scan if nothing changed.
3. **Product scan** (Section 2.2.2) — on first scan only, the user scans their current products (barcode or ingredient list OCR). Takes 2–5 minutes depending on routine size, but only happens once — subsequent scans skip this unless the user has changed products.
4. **Voice description** (Section 2.2.4) — optional 30-second free-form voice note: "Anything else?" (~30s)
5. **Health app sync** (Section 2.2.6) — automatic background pull of sleep, HRV, and activity data from HealthKit/Health Connect (instant, no user effort)

On returning scans, steps 2–3 are skipped (medications/products cached from prior scan), making the questionnaire phase fast (~60s). Environmental metadata (Section 2.2.5) is auto-captured throughout with no user interaction.

Once all frames are uploaded and questionnaire is complete, the client sends the analysis initiation request with S3 keys + all input data. The backend returns a `jobId` immediately (HTTP 202 Accepted).

### Step 4 — Async Job Dispatch & Multi-Angle Preprocessing

The backend enqueues an inference job into **BullMQ** (backed by Redis). An AI inference worker picks up the job and runs the preprocessing pipeline per angle:

1. **RAW demosaicing** (when RAW files are present) — controlled demosaicing with no skin smoothing, minimal noise reduction, linear tone mapping
2. **White balance normalization** using the calibration reference (applied during demosaicing for RAW, post-hoc for JPEG)
3. **HDR merge** of the 3-bracket exposures per angle (Mertens/Debevec fusion)
4. **Flash/no-flash fusion** per angle — texture layer from flash + color layer from ambient
5. **Specular map analysis** — extract sebum distribution and oiliness scores from the specular layer before removal
6. **Specular reflection removal** — subtract the specular layer from the composite after analysis
7. **Distance & scale normalization** — compute from AF distance (primary), IPD (fallback), or LiDAR (most accurate); normalize to 10 px/mm
8. **LiDAR / TrueDepth depth processing** (when depth maps are present) — 3D mesh, raised lesion detection, pore depth
9. **Gyroscope-assisted photometric stereo** — reconstruct 3D surface normals from video frame shading variation + gyro orientation log
10. **rPPG blood flow mapping** — extract per-pixel perfusion map from video green channel temporal analysis
11. **CLAHE enhancement** per facial zone (intensity adapted to device camera profile)
12. **Hair/obstruction masking** — apply BiSeNet mask to exclude flagged pixels
13. **Multi-angle zone stitching** — select the best-angle data per zone; fuse multi-camera data (wide + ultrawide + telephoto) when available
14. **Fitzpatrick classification** — classify skin tone and load per-tone detection thresholds
15. **Elasticity analysis** (when 240fps expression video is present) — compute recovery speed via exponential decay fitting, dynamic vs. static line classification, firmness scores
16. **Multispectral analysis** (when front-camera wavelength frames are present) — bacterial fluorescence detection, enhanced erythema/melanin mapping, polarization-based subsurface separation
17. **UV exposure contextualization** — attribute sun-damage findings using UV index + barometric altitude + 14-day UV accumulation
18. **Environmental correlation** — cross-reference findings with AQI, water hardness, weather history, pollen count
19. **Current routine conflict analysis** — compare detected concerns against ingredients in the user's scanned product routine; flag potential comedogenic or irritant contributors
20. **Medication context adjustment** — if isotretinoin or other flagged medications are active, restrict recommendation scope and adjust recovery-state scoring
21. **Voice input NLP extraction** — parse free-form voice transcript for product changes, triggers, timelines, and specific concern locations
22. **Spot-marker enhanced analysis** — re-analyze touch-to-mark pixel coordinates at higher sensitivity
23. **Scan quality grading** — assign A–D quality grade per zone; flag D-grade zones for re-capture coaching

### Step 5 — Progressive Delivery + User Self-Assessment (Parallel)

The client establishes a WebSocket connection (or falls back to SSE) keyed to the `jobId`. As backend stages complete, progressive updates stream to the client. **Simultaneously**, the user performs their self-assessment — the two processes run in parallel:

| Timeline | Backend (async)                                                           | Client (user-facing)                          |
| -------- | ------------------------------------------------------------------------- | --------------------------------------------- |
| 0–2s     | Per-angle preprocessing (HDR, specular, normalization)                    | "Analyzing your photos..." animation          |
| ~2s      | **Segmentation + zone stitching complete** → pushes unified face zone map | Face zone map appears; self-assessment begins |
| 2–6s     | Detection models running per zone across all angle data                   | User taps matching reference photos per zone  |
| ~5s      | **Detection complete** → pushes raw scores per zone                       | User taps specific spots on face photo (touch-to-mark) |
| ~6s      | Self-assessment + spot markers received by backend                        | "Finalizing your results..."                  |
| ~7s      | **Cross-referencing + routine generation complete**                       | Full results screen renders                   |

The self-assessment fills the processing gap naturally. The user is actively engaged in diagnostic input while the GPU works, eliminating perceived idle wait time.

### Step 6 — Dual-Validation & Rule Engine Evaluation

The core backend cross-references the AI detection scores with the user's self-assessment selections per zone (see Section 2.3). Agreement boosts confidence; user-only concerns trigger re-analysis at higher sensitivity; AI-only detections are flagged as "We also noticed..." The calibrated scores are then passed to the rule engine alongside questionnaire constraints (allergies, budget, barrier feel). The rules engine resolves ingredient conflicts and maps target ingredients to current product stock.

### Step 7 — Initial Results + Close-Up Prompt

The client receives the initial analysis report: calibrated score breakdown (with AI + user agreement indicators), highlighted facial concern zones with coverage confidence, and the AM/PM routine with product cards. For the top 1–2 highest-severity zones, the app prompts: **"Want a closer look at your [zone]? A close-up scan can detect finer details."**

### Step 8 — Optional Close-Up Refinement

If the user accepts the close-up prompt, they capture the flagged zone at 10–15cm distance (or 2–4cm with macro lens). The capture includes a 1-second **focus sweep video** where autofocus racks from near to far — the backend merges this into an all-in-focus composite via Laplacian-pyramid focus stacking, ensuring no detail is lost to shallow depth of field at close range. This is uploaded and processed through the same pipeline (minus multi-angle — a single frontal close-up suffices at this scale). The close-up pass refines the existing zone scores with finer classification (e.g., distinguishing closed comedones from sebaceous filaments from milia). Updated scores and any new product recommendations are pushed to the client as a delta update — the routine adjusts in-place without a full re-render.

### Step 9 — Final Payload & Local Cache

The complete analysis report (including any close-up refinements) is cached locally for offline access. If the user opted into progress tracking, all preprocessed composites and scores are stored server-side for future temporal comparison.

---

## 6. Model Versioning & Deployment Strategy

### 5.1 Model Registry

All trained models are stored in a versioned registry (Triton Model Repository or MLflow) with the following metadata per version:

- Model artifact (ONNX / TensorRT engine)
- Training dataset hash and date
- Validation accuracy metrics (mAP, F1, IoU)
- Rollback-safe flag (whether the previous version can be restored without data migration)

### 5.2 Deployment & Rollback

- **Blue-Green Model Deployment:** Triton Inference Server supports loading multiple model versions simultaneously. New models are deployed as a secondary version and traffic is shifted gradually (10% → 50% → 100%) using model version routing in the inference worker.
- **Automated Rollback:** If the new model version's error rate exceeds a threshold (e.g., >5% of inferences return anomalous scores), the routing automatically reverts to the last stable version and triggers a PagerDuty alert.

### 5.3 A/B Testing

- **Shadow Mode:** A new model version can run in shadow mode — receiving the same inputs as production but not serving results to users. Its outputs are logged for offline comparison against the production model.
- **Split Testing:** For routine generation changes, a percentage of users can be assigned to a variant group (stored in their user profile). Outcome metrics (routine adherence rate, re-scan improvement delta) are tracked per variant to measure real-world efficacy.

---

## 7. Security, Privacy & Compliance

Because facial imagery and personal health data fall under strict regulatory guidelines (GDPR, CCPA, and regional health data protections):

- **Image Ephemerality Option:** Provide a toggle allowing users to choose whether their facial scans are stored for progress tracking or permanently deleted from cloud storage immediately after analysis.
- **Data in Transit and at Rest:** Mandatory TLS 1.3 for all API traffic. All stored facial photos must be encrypted using AES-256 with tenant-isolated access controls.
- **Storage Isolation:** Facial photos must never be stored in publicly accessible buckets; access is granted strictly through expiring presigned URLs (TTL ≤ 15 minutes).
- **Medical Disclaimer Enforcement:** Clear UI banners and terms stating that the app provides cosmetic skincare recommendations and does not constitute medical diagnosis or replace a licensed dermatologist.

---

## 8. Rate Limiting & Abuse Prevention

| Control                      | Implementation                                                             | Threshold                                                     |
| ---------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Per-user scan rate limit** | Redis sliding window counter (enforced at API gateway)                     | 10 scans / hour, 30 scans / day                               |
| **Upload size enforcement**  | Cloudflare WAF rule + backend validation                                   | Max 5 MB per frame, 80 MB per scan set (16 frames + close-up) |
| **Auth throttling**          | Exponential backoff on failed login attempts                               | 5 failures → 15-min lockout                                   |
| **Bot protection**           | Cloudflare Turnstile (CAPTCHA-free challenge) on signup and scan endpoints | Automatic                                                     |
| **GPU cost guard**           | BullMQ concurrency limit per user                                          | Max 2 concurrent inference jobs                               |
| **Anomaly detection**        | Alert on users exceeding 3× average scan volume                            | Flagged for manual review                                     |

All rate limit responses return `429 Too Many Requests` with a `Retry-After` header. The mobile client displays a user-friendly cooldown message rather than a raw error.

---

## 9. Monitoring, Observability & Error Budgets

### 8.1 Observability Stack

- **Distributed Tracing:** OpenTelemetry SDK instrumented across NestJS backend, BullMQ workers, and FastAPI inference service. Every scan request gets a trace ID propagated end-to-end so latency bottlenecks are attributable to a specific stage.
- **Metrics:** Prometheus exporters on all services, scraped into Grafana dashboards:
  - `inference_latency_seconds` (p50, p95, p99 per model version)
  - `scan_queue_depth` (BullMQ pending jobs)
  - `scan_error_rate` (failed inferences / total)
  - `routine_generation_latency_seconds`
  - `product_catalog_cache_hit_ratio`
- **Logging:** Structured JSON logs shipped to CloudWatch Logs or Grafana Loki. Every log entry includes `traceId`, `userId` (hashed), and `jobId` for correlation.
- **Alerting:** PagerDuty / Opsgenie integration with tiered severity:

| Severity          | Condition                                                        | Response                              |
| ----------------- | ---------------------------------------------------------------- | ------------------------------------- |
| **P1 — Critical** | API error rate > 5% for 5 min, or inference pipeline fully down  | Page on-call immediately              |
| **P2 — High**     | Inference p95 latency > 8s for 10 min, or scan queue depth > 100 | Page on-call within 15 min            |
| **P3 — Warning**  | Cache hit ratio < 70%, or model accuracy drift detected          | Slack notification, next business day |

### 8.2 Error Budgets (SLO Framework)

Based on the 99.9% availability target (≈ 8.7 hours downtime / year):

| SLI (Service Level Indicator)                        | SLO (Target) | Error Budget (30-day window) |
| ---------------------------------------------------- | ------------ | ---------------------------- |
| API request success rate                             | 99.9%        | 43 minutes of downtime       |
| Inference job completion rate                        | 99.5%        | 3.6 hours of failed jobs     |
| End-to-end scan latency (p95, post-upload)           | < 8 seconds  | 0.5% of scans may exceed     |
| Routine accuracy (no conflicting ingredients served) | 100%         | Zero tolerance               |

When an error budget is >75% consumed, a freeze on non-critical deployments is triggered automatically until the budget recovers.

### 8.3 Model Quality Monitoring

- **Drift Detection:** Weekly automated comparison of production inference score distributions against the validation dataset baseline. Statistical divergence (KL divergence > threshold) triggers a P3 alert and queues a retraining review.
- **Feedback Loop:** Users can flag "This doesn't look right" on any concern score. Flagged scans are routed to a review queue for human annotation, feeding back into the training pipeline.

---

## 10. Non-Functional Requirements & Performance Targets

- **Progressive Result Delivery:** Rather than a single blocking response, results stream to the client in stages (zone map → self-assessment → calibrated scores → routine → optional close-up refinement). The upload happens in the background during the questionnaire (~40s). After upload completes, the user sees the zone map and begins self-assessment within ~2 seconds; the full routine renders within ~7 seconds. Perceived wait is near-zero because the user is always doing something — answering questions during upload, tapping reference photos during inference. The optional close-up adds ~10s but only applies to 1–2 flagged zones.
- **API Availability:** 99.9% uptime SLA for backend recommendation and product catalog services, enforced via the SLO framework in Section 8.2.
- **Scalability:** The inference pipeline leverages Kubernetes HPA (Horizontal Pod Autoscaler) keyed to the BullMQ queue depth metric. When pending jobs exceed the threshold, GPU worker pods scale out automatically. Scale-to-zero is supported during off-peak hours to control cost.
- **Product Catalog Performance:** Hot product data (top 500 products by query frequency) is cached in Redis with a 1-hour TTL. Product images are served via CDN with immutable cache headers. Cold catalog queries hit PostgreSQL with composite indexes on `(skin_type, category, price_tier)` and a GIN index on the `excluded_allergens` array column.
- **Database Query Strategy:** Product filtering (by skin type, ingredients, budget, allergens) uses standard relational queries with composite and GIN indexes — not vector similarity search. If a "find similar products" feature is added later, pgvector can be introduced for that specific use case without affecting the core query path.

---

## 11. Expo & Mobile Implementation Strategy

### 10.1 Camera Implementation Layers

The capture spec requires features beyond `expo-camera`'s native API. The implementation uses a layered approach:

| Feature | Implementation | Notes |
|---------|---------------|-------|
| Face detection preview, single-frame capture, torch, front/back switching | `expo-camera` | Works out of the box |
| Manual exposure bracketing (HDR) | Custom Expo Module wrapping Camera2 (Android) / AVCaptureDevice (iOS) | Requires platform-specific session configuration |
| 240fps slow-motion video | Custom Expo Module with high-frame-rate session preset | Check device capability first — not all devices support 240fps |
| Simultaneous multi-camera | Custom Expo Module wrapping AVCaptureMultiCamSession (iOS) / Camera2 multi-camera (Android) | iOS 13+ only; limited Android support. Graceful fallback to sequential capture. |
| RAW capture (ProRAW / DNG) | Custom Expo Module with RAW output configuration | iOS: Apple ProRAW API. Android: Camera2 RAW_SENSOR output. |
| Programmatic focus sweep | Custom Expo Module with focus distance control | Required for focus stacking in close-up pass |
| ARKit / ARCore face tracking | `expo-modules` bridging native AR frameworks | For real-time AR results overlay and TrueDepth depth capture |

All custom camera modules are built using the **Expo Modules API** (Swift on iOS, Kotlin on Android), exposed to JavaScript as native modules. The app uses **bare workflow** or **development builds** — Expo Go cannot run custom native modules.

### 10.2 On-Device ML Framework

On-device models (BiSeNet hair segmentation, makeup detection, face mesh, skin tone classification) run via platform-native inference:

- **iOS:** CoreML models (.mlmodel) loaded via a custom Expo Module wrapping Apple's Vision framework.
- **Android:** TFLite models (.tflite) loaded via a custom Expo Module wrapping Google's ML Kit or TFLite Interpreter.
- **Model Format:** Models are trained in PyTorch, exported to ONNX, then converted to CoreML (iOS) and TFLite (Android) for on-device deployment.
- **Inference Priority on Preview:** Only ONE model runs per preview frame on mid-range devices. Priority order: face detection (required for framing) > hair segmentation (obstruction check). Makeup detection and skin tone run on the FIRST captured frame, not on the live preview.
- **Frame Processor Architecture:** Use `react-native-vision-camera` frame processors or a custom Expo Module frame callback to pipe camera frames to native ML inference without crossing the JS bridge per frame.

### 10.3 App Size & Model Download Strategy

Bundling all ML models in the app binary would exceed 300MB. Instead:

- **Initial App Binary:** Core app without ML models — target **under 80MB** for fast App Store / Play Store download.
- **First-Launch Model Download:** After install, download the core model bundle (~100–150MB) in the background. Show a one-time setup screen: "Setting up your skin analysis... This only happens once." Progress bar with estimated time.
- **Per-Feature Model Download:** Models for optional features (multispectral analysis, elasticity analysis, scar classification) download only when the user first activates that feature. Shown as: "Downloading enhanced analysis... (12 MB)"
- **Model Updates:** Lightweight threshold adjustments and confidence calibrations ship via **EAS Update** (OTA, no app store review). Full model architecture changes require a new build via **EAS Build**.
- **Local Storage Management:** Models are stored in the app's documents directory. Total model storage budget: ~200MB. If device storage is critically low, the app warns and offers to delete optional models.

### 10.4 Background Upload Architecture

Scan uploads (up to 500MB for RAW + depth + video) must survive app backgrounding, suspension, and kill:

- **iOS:** `NSURLSessionUploadTask` with background configuration. The OS continues the upload even when the app is suspended or terminated, and wakes the app on completion.
- **Android:** `WorkManager` with network constraints for chunked upload tasks. Survives app kill and device reboot.
- **Expo Integration:** Built as a custom Expo Module wrapping platform-native background transfer APIs. React Native's default `fetch` does NOT survive app backgrounding.
- **Upload Priority Queue:**
  1. **Critical (immediate):** Compressed JPEG frames — needed for analysis to begin
  2. **High (next):** Depth maps, multispectral frames — small files, high diagnostic value
  3. **Medium (background):** Full-resolution JPEGs, expression video, focus sweep video
  4. **Low (WiFi-only):** RAW files — large, queued until WiFi is available (user-configurable)
- **Resumable Multipart:** All uploads use S3 multipart upload. If interrupted, only the incomplete part resumes — completed parts are not re-uploaded.

### 10.5 Performance & Battery Optimization

The capture flow simultaneously uses camera, torch, screen at max brightness, gyroscope, accelerometer, and ML inference — heavy resource consumption that needs management:

- **Battery Pre-Check:** Before starting a scan, check battery level. Below 20%: "Your battery is low. A full scan uses significant power — charge first or use Quick Scan (frontal only)." Below 10%: block full scan, offer Quick Scan only.
- **Thermal Throttling Detection:** Monitor device temperature during capture. If thermally throttling (common on older phones running ML + camera), reduce ML inference rate (every 3rd frame instead of every frame) and pause non-critical models to prevent frame drops and overheating.
- **Memory Budget:** 16 RAW frames + depth maps + video can exceed 1GB in working memory. The capture pipeline processes and queues frames for upload **incrementally** — each frame is written to temp storage and released from memory after capture. Never hold all frames in memory simultaneously. Use `expo-file-system` temp directories with automatic cleanup after confirmed upload.
- **GPU vs. CPU Inference:** On devices with Neural Engine (iPhone) or GPU delegate (Android), route ML inference to the dedicated hardware accelerator. Fall back to CPU on devices without — with reduced model resolution to maintain frame rate.
- **Background Processing Limits:** On iOS, background processing time is limited. All scan uploads use the background transfer API (Section 10.4) rather than attempting to process in the background. Processing is server-side only.

### 10.6 Cross-Platform Considerations

- **Haptic Abstraction:** Different Android devices have vastly different haptic capabilities (simple vibration motor vs. advanced linear actuator). Build a haptic abstraction layer that maps the distinct vibration patterns (short pulse, double pulse, long buzz, success pattern) to the best available hardware. Degrade gracefully to simple vibration on basic motors.
- **Deep Linking:** Dermatologist export links, shareable progress cards, scan reminders, and notification taps all use deep links (Expo Router linking configuration) to open directly to the relevant screen.
- **Multi-Device Sync:** Scan history, routines, products, and diary sync across devices (phone → tablet → web dashboard) via the backend API. Local MMKV cache is per-device; server is the source of truth. Sync uses efficient delta updates, not full re-downloads.
- **EAS Update for Fast Iteration:** UI changes, threshold adjustments, notification copy, report templates, and questionnaire updates ship via EAS Update (OTA) without app store review. Camera modules, ML models, and native code changes require EAS Build.
