# SkinSense -- Master Overview

> Shared context for all phase specs. Load this + the current phase spec only.

---

## 1. Project Summary

SkinSense is an AI-powered skincare assessment app for iOS and Android.

- **Mobile client**: Expo (React Native) with TypeScript
- **Backend API**: NestJS (Node.js)
- **AI inference pipeline**: FastAPI (Python) with PyTorch / TensorRT / Triton
- **Auth**: Supabase Auth
- **Developer profile**: Solo developer building with LLM assistance

Users photograph a skin concern, the app runs it through a classification model, and returns a structured assessment with severity, possible conditions, and care recommendations. This is **not** a diagnostic tool -- every surface carries a medical disclaimer.

---

## 2. Engineering Principles

Eight non-negotiable rules applied across every phase:

| # | Principle | Detail |
|---|-----------|--------|
| 1 | **Type safety end-to-end** | Shared `@skinsense/types` package. Every API contract defined in Zod; inferred TS types flow from backend to mobile. No `any`. |
| 2 | **Turborepo monorepo** | `apps/mobile`, `apps/api`, `apps/inference`, `packages/types`, `packages/ui`, `packages/config`. Single `pnpm` lockfile. |
| 3 | **Prisma migrations** | All schema changes via Prisma Migrate. No raw DDL. Migration files committed to git. |
| 4 | **Practical testing** | Unit tests on pure logic, integration tests on API routes, one E2E smoke test per critical flow. No chasing coverage numbers. |
| 5 | **CI/CD from day one** | GitHub Actions for lint/test/typecheck. EAS Build for native binaries. EAS Update for OTA JS pushes. |
| 6 | **Feature flags, not branches** | Long-lived feature branches are banned. Ship dark behind flags, enable when ready. |
| 7 | **Sentry observability from day one** | Crashes, ANRs, and performance traces captured on mobile and API from the first deployable build. |
| 8 | **LLM dev rules** | AI-generated code is reviewed like any other PR. No blind paste. Every generated file must pass lint + typecheck before commit. |

---

## 3. Phase Timeline

Sequential execution. No parallelism between phases.

| Phase | Name | Duration | Ship Milestone |
|-------|------|----------|----------------|
| 0 | Foundation | 3--4 weeks | Monorepo boots, CI green, blank app on TestFlight |
| 1 | Auth & Profile | 3--4 weeks | Sign-up / sign-in flow live, profile CRUD |
| 2 | Camera & Upload | 4--5 weeks | Photo capture, guided framing, upload to S3 via presigned URL |
| 3 | AI Pipeline | 8--12 weeks | Model training, FastAPI serving, end-to-end inference |
| 4 | Results & History | 4--5 weeks | Assessment results screen, scan history, trend view |
| 5 | Monetisation | 5--7 weeks | IAP subscriptions, paywall, entitlement gating |
| 6 | Polish & Launch | 6--8 weeks | Performance tuning, accessibility, App Store submission |
| 7 | Ecosystem | 13--16 weeks | Routine engine, community features, provider portal |
| | **Total** | **~46--61 weeks** | |

---

## 4. Architecture Overview

```
+------------+       +------------+       +-----------------+
|            | HTTPS |            |  gRPC |                 |
|  Expo App  +------>+ Cloudflare +------>+   NestJS API    |
|  (mobile)  |       |   (CDN)    |       | (apps/api)      |
+------------+       +------------+       +----+------+-----+
                                               |      |
                                  Supabase Auth |      | BullMQ
                                               |      |
                                          +----v-+  +-v----------+
                                          |Redis |  | FastAPI    |
                                          |      |  | Inference  |
                                          +------+  | (PyTorch/  |
                                                     | TensorRT/  |
                                                     | Triton)    |
                                                     +-----+------+
                                                           |
                                              +------------+------------+
                                              |                         |
                                        +-----v------+          +------v-----+
                                        | PostgreSQL  |          |     S3     |
                                        | (Prisma)    |          |  (images)  |
                                        +-------------+          +------------+
```

**Request flow (scan):**

1. Mobile captures photo, uploads to S3 via presigned URL from API.
2. Mobile sends scan request to NestJS API (through Cloudflare).
3. API authenticates via Supabase Auth, validates entitlements.
4. API enqueues inference job in Redis via BullMQ.
5. FastAPI worker picks up job, runs model (PyTorch on GPU, Triton in prod).
6. Result written to PostgreSQL; mobile polls or receives push notification.

---

## 5. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Mobile | Expo SDK 53+, TypeScript | Expo Router, EAS Build/Update |
| Networking | TanStack Query + tRPC | End-to-end type-safe API calls |
| Backend | NestJS (Node.js) | REST + tRPC adapter |
| Auth | Supabase Auth | JWT, social providers, row-level security |
| Queue | Redis + BullMQ | Job scheduling, rate limiting |
| AI / ML | Python, PyTorch, TensorRT, Triton | FastAPI serving layer |
| Cache | Redis | Session cache, inference result cache |
| CDN | Cloudflare | DDoS protection, edge caching, WAF |
| Database | PostgreSQL (Prisma ORM) | Hosted on Supabase or RDS |
| Storage | S3 (or S3-compatible) | Presigned uploads, lifecycle policies |
| Observability | Sentry, OpenTelemetry, Prometheus, Grafana | Traces, metrics, alerting |

---

## 6. Monorepo Structure

```
skinsense/
  apps/
    mobile/          # Expo app (React Native)
    api/             # NestJS backend
    inference/       # FastAPI inference service (Python)
  packages/
    types/           # @skinsense/types -- Zod schemas + inferred TS types
    ui/              # @skinsense/ui -- shared RN components
    config/          # @skinsense/config -- shared ESLint, TSConfig, etc.
  turbo.json
  pnpm-workspace.yaml
  .github/
    workflows/       # CI pipelines
```

---

## 7. Cross-Phase Concerns

### Security

- TLS 1.3 everywhere. No plaintext traffic.
- AES-256 encryption at rest for user images and PII.
- S3 uploads via short-lived presigned URLs only. No direct bucket access.
- Medical disclaimer on every assessment screen and in App Store metadata.
- HIPAA-informed practices (we are not claiming compliance, but we follow the spirit).

### Rate Limiting

- Per-user scan limits enforced at the API layer (Redis counters).
- Free tier: N scans/month. Paid tier: higher or unlimited.
- Inference queue has concurrency caps to protect GPU resources.

### Monitoring

- Structured JSON logging on all services.
- Alerting tiers:
  - **P0 (page)**: API down, inference pipeline down, auth service down.
  - **P1 (Slack)**: Error rate > 5%, queue depth > 100, p95 latency > 3s.
  - **P2 (daily digest)**: Slow queries, cache miss rate spikes, disk usage warnings.

---

## 8. How to Use These Specs

Each phase has its own spec file:

| File | Phase |
|------|-------|
| `Phase0-Foundation.md` | Monorepo, CI, blank app deploy |
| `Phase1-Auth-Profile.md` | Authentication and user profile |
| `Phase2-Camera-Upload.md` | Camera capture and image upload |
| `Phase3-AI-Pipeline.md` | Model training and inference service |
| `Phase4-Results-History.md` | Assessment results and scan history |
| `Phase5-Monetisation.md` | Subscriptions and paywall |
| `Phase6-Polish-Launch.md` | Performance, accessibility, store launch |
| `Phase7-Ecosystem.md` | Routines, community, provider portal |

**Loading rules:**

- When working on Phase N, load **this file** + **PhaseN-*.md** only.
- Do NOT load other phase specs. They contain future context that causes scope creep.
- Each phase spec is self-contained: it lists its own acceptance criteria, task breakdown, and definition of done.

---

## 9. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| 1 | **Burnout** | High | Critical | Strict phase gates. No weekend crunches. Ship increments, not perfection. |
| 2 | **AI slop** | High | High | All LLM-generated code must pass lint + typecheck + review. No blind paste. |
| 3 | **Training data scarcity** | Medium | High | Start with pretrained dermatology models (e.g., fine-tune from public datasets). Augment aggressively. |
| 4 | **App Store rejection** | Medium | High | No diagnostic claims. Disclaimer on every screen. Follow Apple Health guidelines. Pre-submit review checklist. |
| 5 | **Expo camera limits** | Medium | Medium | Prototype camera early (Phase 2). Have native module escape hatch via expo-modules if needed. |
| 6 | **Bus factor = 1** | High | Critical | Document everything in these specs. Keep architecture simple. Avoid custom infra. |
| 7 | **Scope creep** | High | High | Phase specs are frozen once work begins. New ideas go to a backlog, not the current phase. |

---

*Last updated: 2026-09-30*
