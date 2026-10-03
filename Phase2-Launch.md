# SkinSense Phase 2: Polish & App Store Launch

**Duration:** Weeks 12--17 (6 weeks)
**Goal:** Make the Phase 1 MVP shippable. Handle every edge case, polish the UI, run a beta, and submit to the App Store and Play Store.
**Depends on:** Phase 0 (Foundation & Tooling) and Phase 1 (Core Loop) fully complete.
**Team:** Solo developer, LLM-assisted.

---

## 1. Onboarding Flow

### 1.1 Three-Screen Welcome Sequence

New users see exactly three screens before reaching the app. Each screen has a single primary action button ("Next" / "I Agree" / "Continue"). A small "Skip" link appears on screens 1 and 3 but not on screen 2 (the disclaimer is mandatory).

**Screen 1 -- App Intro**

| Element | Detail |
|---------|--------|
| Hero area | Horizontally scrollable carousel of three key screenshots: (a) the scan-in-progress camera view, (b) a completed results screen, (c) a personalized routine card. |
| Headline | "Your skin, understood." |
| Body copy | "SkinSense uses AI to analyze your skin, spot concerns early, and build a routine that actually works -- all from your phone's camera." |
| CTA | "Next" (primary button, bottom-pinned) |
| Skip | Text link, top-right corner. Skips to Screen 2 (disclaimer cannot be bypassed). |

**Screen 2 -- Medical Disclaimer Acknowledgment**

| Element | Detail |
|---------|--------|
| Icon | Shield icon with a medical cross. |
| Headline | "Important: This Is Not Medical Advice" |
| Disclaimer text | "SkinSense provides cosmetic skincare recommendations only. It does not diagnose, treat, or prevent any medical condition. This app is not a substitute for professional dermatological care. If you have a medical concern about your skin, please consult a qualified healthcare provider." |
| Checkbox | Unchecked by default. Label: "I understand this is not a medical diagnosis." |
| CTA | "I Agree" -- disabled (grayed, opacity 0.5) until the checkbox is checked. |
| No skip | This screen cannot be skipped. The user must check the box and tap "I Agree." |

Implementation: persist a boolean `hasAcknowledgedDisclaimer` in local storage (AsyncStorage) and in the user's Supabase profile. If the flag is `false` or missing, the app routes here before any other screen.

**Screen 3 -- Permission Requests**

Permissions are requested one at a time, each with an explanation. The screen shows a checklist of three items; each becomes checked/green after the user grants or skips it.

| Order | Permission | Explanation shown | If denied |
|-------|------------|-------------------|-----------|
| 1 | Camera | "SkinSense needs your camera to scan your skin. No photos leave your device until you choose to upload." | Show inline warning: "You can grant camera access later in Settings." Mark as skipped. |
| 2 | Photo Library (iOS) / Media (Android) | "Optionally upload an existing photo for analysis instead of taking a new one." | No warning. Mark as skipped. |
| 3 | Notifications | "We'll remind you to apply your AM and PM routine and let you know when it's time for a progress scan." | No warning. Mark as skipped. |

After all three are resolved (granted or skipped), the CTA changes to "Get Started" and taps through to the skin profile questionnaire (built in Phase 1).

Technical notes:
- Use `expo-permissions` to check status before requesting. If already granted (e.g., from a previous install), auto-check that row and don't re-prompt.
- On iOS, camera and photo library trigger native system dialogs. The explanation text appears *before* the system dialog so the user has context.
- On Android 13+, request `POST_NOTIFICATIONS` at runtime. On Android 12 and below, notifications are granted by default -- skip that row.

### 1.2 First-Time Questionnaire

The skin profile questionnaire from Phase 1 flows immediately after Screen 3. No changes to the questionnaire itself; it just sits in the onboarding navigation stack so the back button returns to Screen 3 rather than the home screen.

### 1.3 Returning Users

A returning user is anyone with `hasAcknowledgedDisclaimer === true` AND a completed questionnaire profile. On app launch, check both flags:
- Both true: navigate straight to the Home tab.
- Disclaimer true but questionnaire incomplete: navigate to the questionnaire.
- Disclaimer false: navigate to Screen 2 (disclaimer).

---

## 2. Error States

Every failure mode maps to a specific UI treatment. The table below defines the screen, copy, icon, and retry behavior for each.

### 2.1 No Internet Connection

**Trigger:** Device has no network connectivity (detected via `@react-native-community/netinfo`).

| Context | UI | Copy | Retry |
|---------|----|------|-------|
| During upload | Full-screen overlay on the camera/upload screen. | Headline: "No Connection" / Body: "SkinSense needs the internet to upload your photo. Check your Wi-Fi or mobile data and try again." / Icon: cloud with a slash. | Auto-retry when connectivity is restored (register NetInfo listener). Also show a "Retry" button. |
| During analysis (waiting for result) | Full-screen overlay replacing the loading animation. | Headline: "Connection Lost" / Body: "We lost the connection while analyzing your scan. Your photo is saved -- we'll retry automatically when you're back online." / Icon: broken chain link. | Auto-retry on reconnect. Photo is persisted locally. If auto-retry succeeds, navigate to results. |
| While browsing (product catalog, routine, history) | Inline banner at top of the screen (not blocking). | "You're offline. Showing cached data." / Dismiss "X" button. | No retry button. Banner dismisses automatically when connection returns. Stale data is shown from local cache. |

### 2.2 Upload Failed

| Sub-type | Detection | UI | Copy | Retry |
|----------|-----------|-----|------|-------|
| Presigned URL expired | S3 returns 403 Forbidden. | Inline error below the upload progress bar. | "Upload session expired. Tap to try again." | On tap: request a fresh presigned URL from the backend, then auto-restart the upload. Max 2 auto-retries, then show manual "Retry" button. |
| Network timeout | Upload request exceeds 60-second timeout. | Same inline error UI. | "Upload timed out. Check your connection and try again." | Manual "Retry" button. On tap: re-request presigned URL (it may have expired during the wait) and restart upload. |
| File too large | Client-side check before upload (>10 MB after compression). | Alert dialog (not a screen). | "This photo is too large. Try taking a new one with better compression." / Single "OK" button. | No retry. User is returned to the camera screen. The app should prevent this by compressing to JPEG quality 80 before upload, so this is a safety net only. |

### 2.3 Inference Timeout

**Trigger:** The backend has not returned a result within 30 seconds of the analysis request.

| UI | Copy | Retry |
|----|------|-------|
| The 3-stage loading animation (Section 3) freezes on its current stage. A subtle "Taking longer than expected..." label fades in below the animation after 30 seconds. At 60 seconds, the loading animation is replaced with a full-screen message. | Headline: "Analysis Taking Too Long" / Body: "Our servers are under heavy load. Your scan has been queued and you'll get a notification when results are ready." / CTA: "Go to Home" (secondary) and "Wait" (primary). | If user taps "Wait": continue polling every 10 seconds for up to 5 minutes total. If result arrives, navigate to results. If 5 minutes elapse, show: "We couldn't complete your analysis right now. Please try again later." with a "Retry Scan" button that returns to the camera. If user taps "Go to Home": continue polling in the background. Deliver a push notification when the result arrives. |

### 2.4 No Face Detected

**Trigger:** The on-device face detection model (ML Kit or Vision) returns zero faces.

| UI | Copy | Retry |
|----|------|-------|
| Overlay on the camera preview (before upload). Does not dismiss the camera. | Headline: "We can't find your face" / Body: "Make sure your face is centered in the frame and clearly visible." / Icon: face outline with a question mark. | User adjusts position. Detection runs continuously; overlay dismisses automatically when a face is found. "Use Photo Anyway" escape hatch link at the bottom (for body skin scans in future phases). |

### 2.5 Bad Lighting Detected

**Trigger:** On-device brightness analysis of the camera feed. Thresholds: average luminance < 40 (too dark), > 220 (too bright), local contrast variance > threshold (strong shadows).

| Sub-type | UI | Copy | Retry |
|----------|-----|------|-------|
| Too dark | Overlay on camera preview, semi-transparent dark background with light text. | "It's too dark. Move to a well-lit area or turn on a light." / Icon: lightbulb. | Continuous check. Overlay dismisses when lighting improves. |
| Too bright | Same overlay style. | "Too much light. Move away from direct sunlight or bright lamps." / Icon: sun with down arrow. | Same continuous check. |
| Strong shadows | Same overlay style. | "We're detecting uneven lighting. Face the light source directly for the most accurate scan." / Icon: half-shaded circle. | Same continuous check. |

All three show a "Take Photo Anyway" text link after 5 seconds, so the user is never permanently blocked.

### 2.6 Photo Too Blurry

**Trigger:** Laplacian variance of the captured image is below a threshold (calculated after capture, before upload).

| UI | Copy | Retry |
|----|------|-------|
| Alert dialog over the captured photo preview. | "This photo looks blurry. For the best results, hold your phone steady and make sure your face is in focus." / Two buttons: "Retake" (primary) and "Use Anyway" (secondary). | "Retake" returns to camera. "Use Anyway" proceeds with upload (may produce lower-confidence results; backend flags this). |

### 2.7 Backend API Error (500)

**Trigger:** Any API response with status 500--599.

| UI | Copy | Retry |
|----|------|-------|
| If during scan flow: full-screen error replacing the loading state. If during browsing: inline banner. | Headline: "Something Went Wrong" / Body: "Our servers hit a snag. This isn't your fault. Please try again in a moment." / Error code displayed in small gray text: "Error 500 -- ref: {request_id}". | Auto-retry once after 3 seconds. If the retry also fails, show a "Try Again" button. If three consecutive retries fail, show: "We're experiencing issues. Please try again later." with no retry button, just a "Go to Home" CTA. Log to Sentry with the request ID. |

### 2.8 Auth Token Expired Mid-Session

**Trigger:** Any API response with status 401. Supabase refresh token rotation has also failed.

| UI | Copy | Retry |
|----|------|-------|
| Modal dialog overlaying the current screen. Blocks interaction. | Headline: "Session Expired" / Body: "You've been signed out for security. Please sign in again to continue." / CTA: "Sign In" (primary). | On tap: navigate to the sign-in screen. After successful sign-in, deep-link back to the screen the user was on (pass the route as a parameter). Any in-progress upload is saved locally and resumed after re-auth. |

### 2.9 Rate Limit Exceeded (429)

**Trigger:** API returns 429 with a `Retry-After` header.

| UI | Copy | Retry |
|----|------|-------|
| Inline banner at the top of the current screen. | "You're doing that too fast. Please wait {Retry-After} seconds." / The banner includes a countdown timer. | Auto-retry after the `Retry-After` duration. User cannot tap a retry button during the countdown. After the countdown, the original request is automatically re-sent. If 429 is returned again, double the wait (exponential backoff, max 120 seconds). After 3 consecutive 429s, show: "Please try again later." and stop retrying. |

---

## 3. Loading States

### 3.1 Scan Upload

- **Component:** Circular progress ring (animated SVG or `react-native-reanimated` circle).
- **Behavior:** Ring fills clockwise from 0% to 100%. Percentage is displayed as large centered text inside the ring (e.g., "42%").
- **Data source:** Track `XMLHttpRequest` upload progress events or `fetch` with a progress polyfill. If presigned URL upload does not support progress events, simulate with timed increments (0--90% over estimated time, jump to 100% on completion).
- **Below the ring:** "Uploading your scan..." in body text.
- **Duration:** Typical upload is 2--5 seconds on LTE/Wi-Fi.
- **Interruption:** If the user backgrounds the app, upload continues. On foregrounding, ring resumes from last known progress.

### 3.2 Analysis Processing

A 3-stage progressive indicator that gives the user a sense of what is happening server-side.

| Stage | Label | Timing | Visual |
|-------|-------|--------|--------|
| 1 | "Mapping your face..." | 0--10 seconds | Animated dot grid overlaying a silhouette of a face, dots appearing one by one. |
| 2 | "Detecting concerns..." | 10--20 seconds | Magnifying glass icon scanning across the face silhouette. Subtle pulse animation. |
| 3 | "Building your routine..." | 20--30 seconds | Product bottle icons assembling into a row, one by one. |

Implementation:
- Stages are time-based on the client, not driven by backend progress. The backend returns a single result; the client animates through stages to manage perceived wait time.
- If the result arrives before Stage 3 completes, fast-forward the animation (1-second transition to results).
- If the result has not arrived by end of Stage 3 (30 seconds), hold on Stage 3 with a looping animation. After 30 more seconds, trigger the inference timeout error state (Section 2.3).
- Use `react-native-reanimated` for all animations. Target 60 fps on the UI thread.

### 3.3 Product Catalog Loading

- **Component:** Skeleton screen using `react-native-skeleton-placeholder` or equivalent.
- **Layout:** Mimics the actual product card layout -- a rectangular placeholder for the product image, two shorter bars for the product name and brand, and a narrow bar for the price.
- **Count:** Show 4 skeleton cards (matching the viewport) while loading.
- **Animation:** Shimmer effect (left-to-right gradient sweep) on each skeleton element.
- **Duration:** Skeleton is shown for a minimum of 300ms even if data arrives instantly (prevents flash).
- **Transition:** Fade-in (200ms, `opacity` animated from 0 to 1) when real data replaces the skeleton.

### 3.4 Routine Generation

- **Trigger:** After results are shown and the user taps "See Your Routine."
- **Component:** Product cards in the routine list render in a shimmer state (same shimmer animation as catalog skeletons, but shaped like the routine card layout: product thumbnail, product name, usage instruction text block).
- **Staggered reveal:** Cards animate in one by one, 150ms apart, sliding up and fading in.
- **Duration:** Routine generation typically takes 1--3 seconds. Shimmer is shown until the backend returns the routine object.

---

## 4. Empty States

### 4.1 No Scans Yet (Home Screen)

| Element | Detail |
|---------|--------|
| Illustration | Custom illustration: a friendly face outline with a subtle sparkle. Centered, max 200x200dp. |
| Headline | "Your skin journey starts here" |
| Body | "Take your first scan to get a personalized skin analysis and routine." |
| CTA | "Take My First Scan" -- primary button, centered below body text. Navigates to the camera screen. |
| Placement | Vertically centered in the scrollable area of the home screen. |

### 4.2 No Products Match Filters

| Element | Detail |
|---------|--------|
| Illustration | A funnel icon with an "X" or empty result icon. 80x80dp. |
| Headline | "No products found" |
| Body | "Try adjusting your filters to see more results." |
| CTA | "Reset Filters" -- secondary button. On tap: clear all active filters and re-fetch the catalog. |
| Placement | Centered in the product list area, replacing the list. |

### 4.3 No Progress Data Yet

| Element | Detail |
|---------|--------|
| Illustration | A timeline graphic with a single dot (today) and a dashed line extending to the right. 240x80dp. |
| Headline | "Not enough data yet" |
| Body | "Scan again in 2 weeks to start tracking your skin's progress over time." |
| CTA | None (informational only). Optionally: "Set a Reminder" link that schedules a local notification for 14 days out. |
| Placement | In the Progress/History tab, replacing the chart/timeline. |

---

## 5. Settings Screen

The settings screen is a scrollable list of grouped sections, following native platform conventions (grouped `UITableView` style on iOS, Material sections on Android).

### 5.1 Account

| Row | Action |
|-----|--------|
| Email | Display the user's email. Non-editable (email changes require re-verification; out of scope for Phase 2). |
| Change Password | Navigates to a screen with "Current Password," "New Password," "Confirm New Password" fields. Uses Supabase `updateUser`. On success: toast "Password updated." On error: inline error message. |
| Delete Account | Navigates to a confirmation screen. Copy: "This will permanently delete your account and all associated data, including scan history, routines, and skin profile. This action cannot be undone." Two buttons: "Cancel" (secondary) and "Delete My Account" (destructive red). Requires re-entering password. On confirmation: call backend endpoint that deletes all user data from Supabase and S3, then signs out. |

### 5.2 Skin Profile

| Row | Action |
|-----|--------|
| Edit Skin Profile | Navigates to the same questionnaire from Phase 1, pre-filled with current answers. User can change any answer and tap "Save." Changes trigger a re-generation of routine recommendations (show a loading state, then confirmation toast). |

### 5.3 Notifications

| Row | Type | Default |
|-----|------|---------|
| AM Routine Reminder | Toggle (Switch) | On |
| PM Routine Reminder | Toggle (Switch) | On |
| Scan Reminders | Toggle (Switch) | On |

- Toggling on prompts for notification permission if not already granted.
- AM reminder defaults to 7:00 AM local time. PM reminder defaults to 9:00 PM. Scan reminder fires every 14 days.
- Each toggle persists to the user's Supabase profile and registers/cancels the corresponding local notification.

### 5.4 Data

| Row | Action |
|-----|--------|
| Export My Data | Triggers a backend job that compiles the user's data (profile, scan results, routine history, product preferences) into a JSON file. The file is emailed to the user's registered email. Copy on tap: "We'll email your data export to {email}. This may take a few minutes." Toast on success. |
| Delete All My Data | Same flow as Delete Account (Section 5.1) but the account itself remains. Copy: "This will permanently delete all your scans, routines, and skin profile data. Your account will remain active, but you'll need to retake the questionnaire." Requires password confirmation. |

### 5.5 About

| Row | Action |
|-----|--------|
| App Version | Displays version and build number (e.g., "1.0.0 (42)"). Read from `expo-constants`. Non-interactive. |
| Privacy Policy | Opens the privacy policy in an in-app browser (`expo-web-browser`). URL: `https://skinsense.app/privacy`. |
| Terms of Service | Opens terms in an in-app browser. URL: `https://skinsense.app/terms`. |
| Medical Disclaimer | Opens a modal with the full disclaimer text (same as onboarding Screen 2). |

### 5.6 Support

| Row | Action |
|-----|--------|
| Send Feedback | Opens an in-app form with a text area (min 10 characters) and optional screenshot attachment. On submit: sends to a Supabase `feedback` table with user ID, app version, OS version, and timestamp. Toast: "Thanks for your feedback!" |
| Report a Bug | Same form as feedback but pre-tagged as "bug." Includes an automatic attachment of the last 50 log lines from the local log buffer (no PII). |

---

## 6. Medical Disclaimer Implementation

### 6.1 Canonical Disclaimer Text

The following is the single source of truth for all disclaimer copy. Store it in `src/constants/legal.ts` so every surface references the same string.

**Full disclaimer (onboarding, App Store description, clinical export header):**

> SkinSense provides cosmetic skincare recommendations. It does not diagnose, treat, or prevent any medical condition. This is not a substitute for professional dermatological care. If you notice any unusual skin changes, moles that evolve, or persistent irritation, consult a board-certified dermatologist. SkinSense analysis is based on photographic assessment and does not constitute a medical examination.

**Short disclaimer (results screen footer):**

> For informational purposes only. Not a medical diagnosis. Consult a dermatologist for medical concerns.

### 6.2 Placement Rules

| Surface | Variant | Placement | Visibility Rule |
|---------|---------|-----------|-----------------|
| Onboarding Screen 2 | Full | Center of screen, above the checkbox. | Must be fully readable without scrolling on a 5.4" screen (iPhone SE). |
| Results screen | Short | Fixed footer bar at the bottom of the results screen, above the tab bar. | Must be visible without scrolling at all times while viewing results. The footer is pinned (not part of the scrollable content). Background: semi-transparent with blur. Text: 12sp, secondary color. |
| Clinical export (PDF) | Full | Header of the exported PDF, below the app logo and above the scan data. | Always the first text element on the document. |
| App Store / Play Store description | Full | Last paragraph of the app description, preceded by a "Disclaimer" subheading. | Always present in the listing. |

### 6.3 Implementation Notes

- The onboarding disclaimer checkbox state is stored both locally (AsyncStorage) and remotely (Supabase `users.disclaimer_acknowledged_at` timestamp).
- If the disclaimer text changes in a future update, bump a `disclaimerVersion` integer. On app launch, compare the stored version with the current version. If they differ, re-show the disclaimer screen (even for returning users) and require re-acknowledgment.
- The results screen footer disclaimer is implemented as an absolutely positioned `View` with `pointerEvents="none"` (non-interactive, does not intercept taps on content behind it if overlap occurs). Ensure bottom padding on the results scroll view accounts for the footer height.

---

## 7. Privacy Policy & Terms of Service

These documents must be reviewed by a lawyer before publication. The sections below define the required content and structure. Draft the actual text using these outlines, then send to legal counsel for review.

### 7.1 Privacy Policy Outline

**Section 1: Information We Collect**

- *Facial images:* Photos taken via the app camera or uploaded from the photo library. Used solely for skin analysis.
- *Skin profile data:* Questionnaire responses (skin type, concerns, sensitivities, age range, gender identity).
- *Scan results:* AI-generated skin analysis data tied to each photo (detected concerns, severity scores, recommended products).
- *Product preferences:* Products saved, routine adherence data, product ratings.
- *Device and usage data:* Device model, OS version, app version, session duration, feature usage (anonymized analytics).
- *Account data:* Email address, hashed password.

**Section 2: How We Use Your Data**

- To generate personalized skin analysis and product recommendations.
- To track your skin's progress over time.
- To improve our AI models (only with explicit opt-in consent; images are de-identified before use in training).
- To send you notifications you have opted into.
- To provide customer support.

**Section 3: How Images Are Stored**

- Photos are uploaded to Amazon S3 via short-lived presigned URLs (15-minute expiration).
- Images are encrypted at rest (AES-256) and in transit (TLS 1.2+).
- Images are associated with your user ID but stored in a separate, access-controlled bucket.
- You may delete any or all images at any time via the app (Settings > Data > Delete All My Data) or by contacting support.
- Deleted images are permanently removed from S3 within 30 days (accounting for backup rotation).

**Section 4: Third-Party Services**

| Service | Purpose | Data shared |
|---------|---------|-------------|
| Supabase | Authentication, database, real-time subscriptions | Email, hashed password, skin profile, scan results |
| Amazon S3 | Image storage | Facial images (encrypted) |
| Sentry | Error monitoring and crash reporting | Device info, OS version, stack traces (no PII, no images) |
| Analytics provider (e.g., PostHog or Mixpanel) | Anonymous usage analytics | Anonymized event data, no PII |

**Section 5: Data Retention**

- Active accounts: data retained indefinitely while the account is active.
- Deleted accounts: all personal data is purged within 30 days of account deletion.
- Anonymized, aggregated analytics data (no PII) may be retained indefinitely for product improvement.

**Section 6: Your Rights**

- *Access:* Request a copy of all data we hold about you (Settings > Data > Export My Data, or email privacy@skinsense.app).
- *Deletion:* Delete all your data or your entire account at any time.
- *Portability:* Export your data in a standard JSON format.
- *Correction:* Update your skin profile and account information at any time through the app.
- *Objection:* Opt out of analytics tracking (Settings > Data, or do-not-track header).
- *GDPR:* EU users have all rights under GDPR Articles 15--21. Data controller: [Your Legal Entity Name]. Contact: privacy@skinsense.app.
- *CCPA:* California users have the right to know, delete, and opt out of the sale of personal information. SkinSense does not sell personal information.

**Section 7: Children's Privacy**

- SkinSense is not intended for users under 13 (or 16 in the EU). We do not knowingly collect data from children.

**Section 8: Changes to This Policy**

- Users will be notified of material changes via in-app notification and email.

### 7.2 Terms of Service Outline

- Acceptance of terms upon creating an account.
- License to use the app for personal, non-commercial use.
- User responsibilities (accurate information, appropriate photos, no misuse).
- Intellectual property (app content, AI models, branding belong to SkinSense).
- Disclaimer of warranties (the app is provided "as is").
- Limitation of liability (SkinSense is not liable for skincare outcomes or adverse reactions).
- Medical disclaimer (full text from Section 6.1, incorporated by reference).
- Account termination (SkinSense reserves the right to terminate accounts for violations).
- Governing law and dispute resolution.
- Contact information.

---

## 8. Performance Audit Targets

### 8.1 Targets

| Metric | Target | Critical Threshold |
|--------|--------|--------------------|
| App launch to interactive (cold start) | < 2 seconds | < 3 seconds |
| Results screen render after data arrives | < 500ms | < 1 second |
| Product catalog filter response | < 300ms | < 500ms |
| Image upload start (time from capture to first byte sent) | < 1 second | < 2 seconds |
| Peak memory during scan flow | < 150 MB | < 200 MB |
| JS bundle size (excluding native modules) | < 30 MB | < 40 MB |

### 8.2 How to Measure

**App launch to interactive:**
- iOS: Use Xcode Instruments > App Launch template. Measure from `process start` to `first frame rendered` (`UIKit` first meaningful paint).
- Android: Use `adb shell am start -W` to measure `TotalTime`. Also use Android Studio Profiler > Startup trace.
- Cross-platform: Add a `performance.mark('app_interactive')` call in the root component's `useEffect` (fires after the first render commit). Log the delta from app start via `expo-constants` `sessionId` timestamp.
- CI: Use Flashlight (`@bamlab/flashlight`) for automated startup profiling on every build.

**Results screen render:**
- Instrument the results screen component. Record a timestamp when the API response is received in the state manager. Record a second timestamp in `useEffect` when the component mounts with data. Log the delta.
- Automate with Flashlight or Maestro performance assertions.

**Product catalog filter response:**
- Measure time from filter toggle tap to the `FlatList` re-render completing. Use `InteractionManager.runAfterInteractions` callback as the end marker.
- The 300ms target means filter logic must not run on the JS thread if the catalog exceeds 500 items. Use `useMemo` with stable dependencies or offload to a background thread via `react-native-worklets`.

**Image upload start:**
- Timestamp at photo capture (shutter callback). Timestamp at the first `XMLHttpRequest` upload progress event. Log the delta. The gap includes JPEG compression, presigned URL fetch, and connection setup.

**Memory during scan:**
- iOS: Xcode Instruments > Allocations. Capture a trace during the full scan flow.
- Android: Android Studio Profiler > Memory. Watch for the camera preview buffer + captured image + compressed image coexisting in memory.
- Target: peak < 150 MB. If exceeded, ensure the raw camera buffer is released before compression completes.

**Bundle size:**
- Run `npx expo export` and measure the total size of the JS bundle(s) in the `dist/` output.
- Use `npx react-native-bundle-visualizer` to identify the largest dependencies.
- Set up a CI check that fails if bundle size exceeds 30 MB.

### 8.3 Optimization Strategies (if targets are missed)

- Cold start: lazy-load non-critical screens with `React.lazy`. Defer analytics init. Use Hermes bytecode precompilation.
- Bundle size: audit dependencies with `npx depcheck`. Replace large libraries with smaller alternatives (e.g., `date-fns` instead of `moment`). Enable tree-shaking.
- Memory: release camera resources immediately after capture. Compress images in a background thread. Avoid holding multiple copies of the same image in memory.
- Render performance: memoize expensive components. Use `FlashList` instead of `FlatList` for long lists. Avoid re-renders from context changes by splitting contexts.

---

## 9. Accessibility Baseline

### 9.1 Labels

- Every interactive element (`TouchableOpacity`, `Pressable`, `Button`, `TextInput`, `Switch`) must have an `accessibilityLabel` that describes its purpose, not its appearance.
  - Good: `accessibilityLabel="Take a new skin scan"`
  - Bad: `accessibilityLabel="Blue button"`
- Every `Image` component must have `accessibilityRole="image"` and a meaningful `accessibilityLabel` describing the content.
  - Product images: `accessibilityLabel="Photo of {product name} by {brand}"`
  - Scan result images: `accessibilityLabel="Your skin scan from {date}"`
  - Decorative images (illustrations in empty states): `accessible={false}` to hide from the accessibility tree.

### 9.2 Tap Targets

- Minimum tap target size: 44x44 dp (density-independent pixels) on both platforms.
- This applies to all buttons, icons, toggles, checkboxes, and list items.
- If the visual element is smaller than 44x44 (e.g., a 24x24 icon), expand the touchable area using `hitSlop` or padding.
- Verify with: Xcode Accessibility Inspector (iOS), Layout Inspector (Android).

### 9.3 Color Contrast

- **Text on backgrounds:** minimum 4.5:1 contrast ratio (WCAG AA for normal text).
- **Large text (18sp+ or 14sp+ bold):** minimum 3:1.
- **UI components and graphical objects** (icons, borders, focus indicators): minimum 3:1 against adjacent colors.
- Verify with: Colour Contrast Analyser (desktop tool) or Stark plugin (Figma).
- Implementation: define all color pairings in the theme file and document their contrast ratios in a comment. Do not use hardcoded colors outside the theme.

### 9.4 Screen Reader Flow Test

Before launch, complete the following end-to-end test using VoiceOver (iOS) and TalkBack (Android):

1. Launch the app and navigate through all three onboarding screens using only swipe gestures.
2. Complete the skin profile questionnaire using only the screen reader.
3. Take a scan (navigate to camera, trigger capture, wait for results).
4. Review the results screen: every concern, score, and product recommendation is read aloud in a logical order.
5. Navigate to the routine screen and hear all product names and usage instructions.
6. Open Settings and toggle a notification.
7. Export data and delete account.

Document any step where the screen reader order is illogical, an element is unlabeled, or an action is unreachable. Fix all issues before App Store submission.

### 9.5 Color Independence

- No information is conveyed by color alone. Every color-coded indicator is paired with a text label or icon.
  - Severity scores: color dot + text label (e.g., green dot + "Mild").
  - Progress trends: arrow icon + text (e.g., up arrow + "Improving").
  - Error states: red color + error icon + text message.

### 9.6 Motion and Reduced Motion

- Respect the device's "Reduce Motion" setting (`AccessibilityInfo.isReduceMotionEnabled` on React Native).
- When reduce motion is enabled: replace slide/scale animations with simple fade transitions. Disable shimmer and looping animations. Keep the loading progress ring but remove decorative animations.

---

## 10. App Store Submission Checklist

### 10.1 iOS -- App Store Connect

**Metadata:**

| Field | Value / Guidance |
|-------|------------------|
| App Name | SkinSense |
| Subtitle | AI Skin Analysis & Routine |
| Category | Health & Fitness (primary), Lifestyle (secondary) |
| Description | Full app description (see Section 10.3). |
| Keywords | skin care, skin analysis, skincare routine, face scan, skin type, acne, dark spots, personalized skincare (100 characters max, comma-separated) |
| Promotional Text | Can be updated without a new build. Use for launch promos: "Discover your personalized skincare routine in 60 seconds." |
| Support URL | https://skinsense.app/support |
| Marketing URL | https://skinsense.app |
| Privacy Policy URL | https://skinsense.app/privacy |

**Screenshots:**

Provide screenshots for three device classes at minimum:

| Device Class | Resolution | Required |
|--------------|------------|----------|
| 6.7" (iPhone 15 Pro Max) | 1290 x 2796 | Yes |
| 6.5" (iPhone 14 Plus) | 1284 x 2778 | Yes |
| 5.5" (iPhone 8 Plus) | 1242 x 2208 | Yes (for older device support) |

Minimum 3 screenshots, maximum 10 per device class. Recommended set:
1. Home screen with a completed scan summary.
2. Camera scan in progress.
3. Results screen showing detected concerns.
4. Personalized routine with product cards.
5. Progress tracking timeline (even if sparse, shows the concept).

**Privacy Labels (App Privacy):**

| Data Type | Collected | Linked to Identity | Used for Tracking |
|-----------|-----------|--------------------|--------------------|
| Photos | Yes | Yes | No |
| Health & Fitness (skin data) | Yes | Yes | No |
| Email Address | Yes | Yes | No |
| Usage Data | Yes | No | No |
| Diagnostics (crash logs) | Yes | No | No |

**Age Rating:** 4+ (no medical content per Apple's definition, since the app provides cosmetic recommendations only).

**Review Notes (critical for approval):**

Include the following in the "Notes for Review" field:

> SkinSense is a cosmetic skincare recommendation app. It does NOT provide medical diagnoses, medical advice, or clinical assessments. The app analyzes facial photos to suggest cosmetic skincare products and routines for common concerns such as dryness, oiliness, and uneven texture.
>
> The app includes a mandatory medical disclaimer during onboarding that users must acknowledge before use. The disclaimer is also visible on every results screen.
>
> Demo account for review:
> Email: review@skinsense.app
> Password: [generate a strong password and include it here]
>
> To test the full flow: Sign in > Take a scan (use the front camera) > View results > See routine.

### 10.2 Android -- Google Play Console

**Store Listing:**

| Field | Value / Guidance |
|-------|------------------|
| App name | SkinSense |
| Short description | AI-powered skin analysis and personalized skincare routines. (80 characters max) |
| Full description | Same as iOS, adapted for Play Store formatting (no markdown). |
| App category | Health & Fitness |
| Tags | Skin care, Beauty, Health |

**Graphics:**

| Asset | Dimensions | Notes |
|-------|------------|-------|
| Feature graphic | 1024 x 500 | Displayed at the top of the Play Store listing. Include app name, tagline, and a device mockup showing the results screen. |
| Screenshots | Min 2, max 8. 16:9 or 9:16 aspect ratio. | Same set as iOS, adapted to Android device frames. |
| App icon | 512 x 512 | High-res version of the app icon. |

**Content Rating:** Complete the IARC questionnaire. Expected rating: "Everyone" (no medical content, no user-generated content visible to others).

**Data Safety Form:**

| Question | Answer |
|----------|--------|
| Does your app collect or share user data? | Yes |
| Data types collected | Photos, personal info (email), health info (skin profile), app activity, app info and performance |
| Is data encrypted in transit? | Yes |
| Can users request data deletion? | Yes |
| Data shared with third parties? | Crash reporting data shared with Sentry (anonymized). No other sharing. |

### 10.3 App Description Template

Use this structure for both stores:

> **Understand your skin. Build your routine. Track your progress.**
>
> SkinSense uses advanced AI to analyze your skin from a simple selfie. In under a minute, you'll receive a detailed breakdown of your skin's condition and a personalized routine built just for you.
>
> **What SkinSense does:**
> - Scans your skin using your phone's camera
> - Identifies concerns like dryness, oiliness, dark spots, texture, and more
> - Recommends products tailored to your skin type and goals
> - Builds a morning and evening routine you can follow daily
> - Tracks your skin's progress over time with regular scans
>
> **How it works:**
> 1. Answer a few quick questions about your skin
> 2. Take a selfie in good lighting
> 3. Get your analysis and personalized routine
>
> **Your privacy matters:**
> Your photos are encrypted and never shared. You can delete all your data at any time. SkinSense does not sell your personal information.
>
> **Disclaimer:**
> SkinSense provides cosmetic skincare recommendations. It does not diagnose, treat, or prevent any medical condition. This is not a substitute for professional dermatological care. If you have concerns about a skin condition, please consult a qualified healthcare provider.

### 10.4 Common Rejection Reasons and Preemptive Measures

| Rejection Reason | How to Preempt |
|------------------|----------------|
| **"App provides medical diagnoses"** (Apple Guideline 5.1.1(ix)) | Never use the words "diagnose," "diagnosis," "medical," "clinical," or "treatment" in user-facing copy. Use "analyze," "assess," "concern," "recommendation" instead. Include the medical disclaimer on onboarding, results, and in the store description. |
| **Missing purpose string for camera permission** (Apple) | Provide a clear, specific `NSCameraUsageDescription`: "SkinSense uses your camera to scan your skin and provide personalized skincare recommendations." |
| **Incomplete data privacy labels** (Apple) | Fill out every applicable data type. Under-reporting (e.g., omitting that photos are collected) triggers rejection. |
| **Login required with no guest mode** (Apple Guideline 5.1.1) | Provide a demo account in review notes. Alternatively, implement Apple Sign In (required if any third-party sign-in is offered). |
| **No Apple Sign In** (Apple Guideline 4.8) | If the app offers Google Sign In or any other third-party login, Apple Sign In must also be offered. Implement it in Phase 2. |
| **App content not appropriate for the selected age rating** (both stores) | Select 4+ (iOS) / Everyone (Android) only if no graphic medical imagery is shown. SkinSense shows the user's own face with annotations, which is acceptable. |
| **Broken functionality during review** (both stores) | Ensure the demo account has a pre-existing scan result so reviewers can see the full experience immediately without waiting for server processing. Seed the demo account's database. |
| **Insufficient app description** (Google Play) | Ensure the description is at least 300 characters and clearly explains what the app does. Avoid keyword stuffing. |

---

## 11. Beta Testing Plan

### 11.1 Distribution

| Platform | Channel | Tool |
|----------|---------|------|
| iOS | TestFlight (external testing group) | EAS Build + EAS Submit to TestFlight |
| Android | Internal testing track (Google Play Console) | EAS Build + manual upload, or EAS Submit |

### 11.2 Tester Recruitment

- Target: 20--50 beta testers.
- Sources: friends and family (10), online communities (Reddit r/SkincareAddiction, Twitter/X) (10--20), personal network (10--20).
- Diversity goals: mix of skin types, age ranges, device types (older and newer phones, Android and iOS), and lighting conditions (different countries/climates).
- Provide testers with a 1-page onboarding guide: what SkinSense is, what to test, how to report feedback.

### 11.3 Test Matrix

Every beta tester should attempt the following:

| Area | Specific Tests |
|------|----------------|
| Full scan flow | Complete onboarding > questionnaire > camera scan > view results > view routine. |
| All questionnaire paths | Test every combination of skin type, concern, and sensitivity that produces a different recommendation set. (Provide a list of 5 test scenarios.) |
| Product filtering | Apply filters by concern, price range, brand. Verify results update correctly. Reset filters. |
| Routine generation | Confirm that AM and PM routines match the scan results and questionnaire. |
| Error states | Airplane mode during upload. Kill the app during analysis. Background the app during a scan. Force a timeout by toggling airplane mode after upload completes. |
| Offline behavior | Browse cached scans and routines without internet. Verify the offline banner appears. Verify data syncs when connectivity returns. |
| Settings | Change password. Toggle notifications. Export data. Delete data. View privacy policy and terms. |
| Edge cases | Very dark environment (lighting warning). Blurry photo (blur warning). Multiple faces in frame. Non-face photo. Extremely close-up photo. |
| Performance | Note any perceived slowness, jank, or unresponsiveness. Report device model and OS version. |

### 11.4 Feedback Collection

- **Primary method:** In-app feedback form (Settings > Send Feedback). Automatically attaches: user ID, device model, OS version, app version, last scan ID.
- **Secondary method:** A shared Typeform link distributed to all testers. Includes structured questions (rating 1--5 for each feature area) and open-ended fields. Link is also accessible from Settings > Send Feedback > "Take the Beta Survey" link.
- **Bug reporting:** In-app bug report form (Settings > Report a Bug). Includes option to attach a screenshot. Automatically attaches device logs (last 50 lines, no PII).
- **Communication channel:** A private Discord server or group chat for beta testers. Used for announcements, quick questions, and discussion. Not the primary feedback mechanism (everything actionable should go through the in-app form or Typeform).

### 11.5 Bug Severity Classification

| Severity | Definition | SLA | Examples |
|----------|------------|-----|----------|
| P0 -- Critical | App crashes, data loss, security vulnerability, or complete flow blocker. No workaround exists. | Fix within 24 hours. Push a hotfix build to TestFlight / internal track. | Crash on scan upload. User data exposed to another user. App won't launch. |
| P1 -- High | A core feature is broken or produces incorrect results. A workaround may exist. | Fix before public launch. | Scan results are incorrect for a specific skin type. Routine recommendations are empty. Password change fails silently. |
| P2 -- Medium | Visual bug, minor UI inconsistency, or non-critical feature malfunction. | Fix before public launch if possible; otherwise, defer to a post-launch patch. | Misaligned text on the results screen. Skeleton screen flickers. Wrong icon on a button. |
| P3 -- Low | Enhancement request, cosmetic preference, or minor annoyance. | Log for future consideration. Do not fix before launch unless trivial. | "I wish the progress chart had more detail." "Can you add a dark mode?" |

### 11.6 Timeline

| Week | Activity |
|------|----------|
| Week 12 | Complete Phase 2 development (onboarding, error states, loading/empty states, settings, disclaimer, accessibility pass). |
| Week 13 | Internal testing (solo developer). Fix P0/P1 issues. Prepare beta build. |
| Week 14 | Distribute beta to 20--50 testers. Collect feedback for 7 days. |
| Week 15 | Triage and fix all P0 and P1 bugs. Fix P2 bugs where feasible. Push updated beta build. 3 additional days of regression testing by testers. |
| Week 16 | Final fixes. Performance audit against targets (Section 8). Accessibility audit (Section 9). Prepare store assets (screenshots, descriptions, metadata). |
| Week 17 | Submit to App Store and Play Store. Monitor review process. Address any reviewer feedback or rejection reasons. |

---

## 12. Deliverable Checklist

Every item below is a verifiable completion criterion. Phase 2 is complete when all items are checked.

### Onboarding

1. Three-screen onboarding flow is implemented and navigable.
2. Screen 2 (disclaimer) cannot be skipped; the checkbox must be checked to proceed.
3. Permissions are requested one at a time with explanation text shown before the native dialog.
4. Returning users with completed onboarding and questionnaire land on the Home tab.
5. Returning users with an incomplete questionnaire are routed to the questionnaire.

### Error States

6. No-internet overlay appears within 2 seconds of connectivity loss during upload or analysis.
7. No-internet inline banner appears when browsing offline, showing cached data.
8. Upload failure (expired URL) auto-retries up to 2 times, then shows a manual retry button.
9. Upload timeout shows a retry button after 60 seconds.
10. File-too-large check prevents uploads over 10 MB with an alert dialog.
11. Inference timeout shows "taking longer than expected" at 30 seconds and a full error at 60 seconds.
12. No-face-detected overlay appears on the camera preview and dismisses when a face is found.
13. Bad-lighting overlay appears for too-dark, too-bright, and strong-shadow conditions.
14. Photo-too-blurry alert offers "Retake" and "Use Anyway" options.
15. Backend 500 errors auto-retry once, then show a manual retry button, then give up after 3 failures.
16. Auth token expiry (401) shows a modal directing the user to re-authenticate, then resumes the session.
17. Rate limit (429) shows a countdown banner and auto-retries after the `Retry-After` duration.

### Loading States

18. Scan upload shows an animated progress ring with percentage.
19. Analysis processing shows 3 sequential stages with distinct animations.
20. Product catalog shows skeleton screens while loading.
21. Routine generation shows shimmer animation on product cards with staggered reveal.

### Empty States

22. Home screen with no scans shows an illustration and "Take My First Scan" CTA.
23. Product catalog with no filter matches shows a "Reset Filters" button.
24. Progress tab with insufficient data shows a "Scan again in 2 weeks" message.

### Settings

25. Settings screen contains all six sections: Account, Skin Profile, Notifications, Data, About, Support.
26. Change password flow works end-to-end with validation and success toast.
27. Delete account requires password re-entry and deletes all user data from Supabase and S3.
28. Edit Skin Profile navigates to the pre-filled questionnaire; saving triggers routine re-generation.
29. Notification toggles register and cancel local notifications correctly on both platforms.
30. Export My Data sends a JSON file to the user's email.
31. Delete All My Data purges data but preserves the account.
32. About section displays correct app version, and links to privacy policy, terms, and disclaimer.
33. Feedback and bug report forms submit to the Supabase `feedback` table with device metadata.

### Medical Disclaimer

34. Full disclaimer text is stored in a single constants file and referenced everywhere.
35. Disclaimer is shown and must be acknowledged during onboarding.
36. Short disclaimer is visible without scrolling on the results screen (pinned footer).
37. Full disclaimer is included in the clinical export PDF header.
38. Full disclaimer is included in both App Store and Play Store descriptions.
39. `disclaimerVersion` mechanism re-prompts users if the disclaimer text changes.

### Privacy & Terms

40. Privacy policy page is published at `https://skinsense.app/privacy` and accessible from the app.
41. Terms of service page is published at `https://skinsense.app/terms` and accessible from the app.
42. Both documents have been reviewed by a lawyer (sign-off recorded).

### Performance

43. Cold start to interactive is under 2 seconds on a mid-range device (measured and documented).
44. Results screen renders in under 500ms after data arrival (measured and documented).
45. Product catalog filter response is under 300ms (measured and documented).
46. Image upload starts within 1 second of capture (measured and documented).
47. Peak memory during scan is under 150 MB (measured and documented).
48. JS bundle size is under 30 MB (measured and documented).

### Accessibility

49. Every interactive element has an `accessibilityLabel`.
50. Every meaningful image has `accessibilityRole="image"` and a descriptive label.
51. All tap targets are at least 44x44 dp.
52. All text meets WCAG AA contrast ratios (4.5:1 for body text, 3:1 for large text and UI).
53. A full scan flow can be completed using only VoiceOver (iOS) and TalkBack (Android) -- tested and documented.
54. No information is conveyed by color alone.
55. Reduce Motion preference is respected (decorative animations disabled).

### App Store Submission

56. App Store Connect metadata is complete (name, description, keywords, screenshots for 3 device classes, privacy labels, age rating, review notes with demo account).
57. Google Play Console listing is complete (name, descriptions, screenshots, feature graphic, content rating, data safety form).
58. Demo/review account is seeded with pre-existing scan data.
59. Review notes explicitly state the app is cosmetic, not medical.

### Beta Testing

60. Beta build is distributed to 20--50 testers via TestFlight (iOS) and internal track (Android).
61. All items in the test matrix (Section 11.3) have been executed by at least 3 testers each.
62. All P0 bugs are resolved.
63. All P1 bugs are resolved.
64. P2 bugs are resolved or documented with a post-launch fix plan.
65. A regression build has been tested for at least 3 days after final fixes.

### Launch

66. App is submitted to App Store review.
67. App is submitted to Google Play review.
68. Any reviewer rejections are addressed and the app is resubmitted.
69. App is approved and live on both stores.

---

*End of Phase 2 spec. This document is the single source of truth for the Polish & App Store Launch phase. All implementation decisions should reference this spec. If a conflict arises between this document and Phase 0 or Phase 1 specs, this document takes precedence for Phase 2 scope.*
