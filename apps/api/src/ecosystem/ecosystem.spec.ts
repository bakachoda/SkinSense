import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { ClinicalExportService } from "./clinical-export.service";
import { PortalService } from "./portal.service";
import { FeedbackService } from "./feedback.service";
import { HealthSyncService } from "./health-sync.service";
import { CausalInferenceService } from "./causal-inference.service";
import { LifeStageService } from "./life-stage.service";
import { SeasonalService } from "./seasonal.service";
import { VoiceNlpService } from "./voice-nlp.service";
import { RoutineVersionService } from "./routine-version.service";
import { DataPrivacyService } from "./data-privacy.service";
import { ICD10_MAP, PREGNANCY_BANNED, PREGNANCY_SAFE } from "@skinsense/types";

// ── Mock Prisma Data & Service ──

const mockUser = {
  id: "user-phase7-test",
  supabaseId: "sub-p7-001",
  email: "patient.phase7@skinsense.health",
  birthYear: 1996,
  fitzpatrick: 4,
  skinType: "COMBINATION",
  isPregnant: false,
  lifeStage: "NONE",
  allergies: ["Fragrance", "Eucalyptus"],
  dataRegion: "US",
  products: [
    {
      id: "prod-1",
      userId: "user-phase7-test",
      name: "Acne Clearing Gel Cleanser",
      brand: "SkinSense Care",
      category: "CLEANSER",
      ingredients: ["Water", "Glycerin", "Sodium Lauryl Sulfate", "Salicylic Acid"],
      routineSlot: "AM",
      stepOrder: 1,
    },
    {
      id: "prod-2",
      userId: "user-phase7-test",
      name: "Barrier Lipid Cream",
      brand: "SkinSense Restore",
      category: "MOISTURIZER",
      ingredients: ["Water", "Ceramides", "Coconut Oil", "Shea Butter"],
      routineSlot: "BOTH",
      stepOrder: 2,
    },
  ],
  medications: [
    {
      id: "med-1",
      userId: "user-phase7-test",
      name: "Tretinoin 0.05% Cream",
      restriction: "NO_OTC_RETINOL",
      startDate: new Date("2026-08-01"),
      isActive: true,
    },
  ],
  scans: [
    {
      id: "scan-p7-01",
      userId: "user-phase7-test",
      status: "COMPLETED",
      createdAt: new Date("2026-10-01"),
      result: {
        id: "res-01",
        scanId: "scan-p7-01",
        skinHealthScore: 68,
        barrierScore: 58,
        skinAge: 30,
        zoneScores: {
          forehead: { acne: 55, redness: 25, pigmentation: 20, oiliness: 50 },
          left_cheek: { acne: 45, redness: 50, pigmentation: 45, oiliness: 30 },
          right_cheek: { acne: 40, redness: 48, pigmentation: 42, oiliness: 30 },
          nose: { acne: 30, redness: 20, pigmentation: 15, oiliness: 65 },
          chin: { acne: 50, redness: 25, pigmentation: 20, oiliness: 40 },
        },
        clinicalGrading: { gagsScore: 16, igaGrade: 2 },
        environmentalContext: { uvIndex: 5.5, airQualityIndex: 42, waterHardness: "hard", climateZone: "subtropical" },
        safetyFlags: [
          { type: "asymmetric_pigment_macule", zone: "left_cheek", criteria: ["asymmetry", "irregular_border"] },
        ],
      },
    },
  ],
  routines: [
    {
      id: "rt-p7-01",
      userId: "user-phase7-test",
      version: 1,
      amSteps: [{ stepNumber: 1, category: "CLEANSER", productName: "Gentle Cleanser" }],
      pmSteps: [{ stepNumber: 1, category: "MOISTURIZER", productName: "Barrier Cream" }],
      createdAt: new Date(),
    },
  ],
  dermatologistNotes: [],
  profiles: [],
};

describe("Phase 7: Ecosystem & Scale — Comprehensive Service Tests", () => {
  let prismaMock: any;
  let clinicalExportService: ClinicalExportService;
  let portalService: PortalService;
  let feedbackService: FeedbackService;
  let healthSyncService: HealthSyncService;
  let causalService: CausalInferenceService;
  let lifeStageService: LifeStageService;
  let seasonalService: SeasonalService;
  let voiceNlpService: VoiceNlpService;
  let routineVersionService: RoutineVersionService;
  let dataPrivacyService: DataPrivacyService;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...mockUser, ...data })),
        delete: jest.fn().mockResolvedValue(mockUser),
      },
      scan: {
        findUnique: jest.fn().mockResolvedValue(mockUser.scans[0]),
        findFirst: jest.fn().mockResolvedValue(mockUser.scans[0]),
      },
      portalAccess: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: "portal-link-1", ...data, createdAt: new Date() })),
        findMany: jest.fn().mockResolvedValue([
          { id: "portal-link-1", userId: mockUser.id, accessToken: "portal_tok_test", expiresAt: new Date(Date.now() + 86400000), revokedAt: null, createdAt: new Date() },
        ]),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.accessToken === "revoked_token") {
            return Promise.resolve({ id: "revoked", userId: mockUser.id, accessToken: "revoked_token", expiresAt: new Date(Date.now() + 86400000), revokedAt: new Date() });
          }
          if (where.accessToken === "expired_token") {
            return Promise.resolve({ id: "expired", userId: mockUser.id, accessToken: "expired_token", expiresAt: new Date(Date.now() - 86400000), revokedAt: null });
          }
          return Promise.resolve({ id: "portal-link-1", userId: mockUser.id, accessToken: where.accessToken || "portal_tok_test", expiresAt: new Date(Date.now() + 86400000), revokedAt: null });
        }),
        update: jest.fn().mockResolvedValue({ id: "portal-link-1", revokedAt: new Date() }),
      },
      dermatologistNote: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: "note-1", ...data, createdAt: new Date() })),
      },
      diagnosticCorrection: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: "diag-corr-1", ...data, createdAt: new Date() })),
      },
      medication: {
        upsert: jest.fn().mockResolvedValue({ id: "med-upserted", name: "Tretinoin", isActive: true }),
      },
      healthSyncLog: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: "hsl-1", ...data, createdAt: new Date() })),
      },
      routineVersion: {
        findFirst: jest.fn().mockResolvedValue({ version: 2 }),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: "rv-1", ...data, changedAt: new Date() })),
        findMany: jest.fn().mockResolvedValue([
          { id: "rv-2", userId: mockUser.id, routineId: "rt-1", version: 2, amSteps: [], pmSteps: [], changeReason: "Retinol introduced", changedAt: new Date() },
          { id: "rv-1", userId: mockUser.id, routineId: "rt-1", version: 1, amSteps: [], pmSteps: [], changeReason: "Baseline initial routine", changedAt: new Date() },
        ]),
      },
      appProfile: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: "prof-1", ...data, createdAt: new Date() })),
        findMany: jest.fn().mockResolvedValue([
          { id: "prof-1", userId: mockUser.id, displayName: "Teen Profile", isDefault: false, biometricLockEnabled: false, createdAt: new Date() },
        ]),
        findUnique: jest.fn().mockResolvedValue({ id: "prof-1", userId: mockUser.id }),
        delete: jest.fn().mockResolvedValue({ id: "prof-1" }),
      },
    };

    clinicalExportService = new ClinicalExportService(prismaMock as unknown as PrismaService);
    portalService = new PortalService(prismaMock as unknown as PrismaService);
    feedbackService = new FeedbackService(prismaMock as unknown as PrismaService);
    healthSyncService = new HealthSyncService(prismaMock as unknown as PrismaService);
    causalService = new CausalInferenceService();
    lifeStageService = new LifeStageService();
    seasonalService = new SeasonalService();
    voiceNlpService = new VoiceNlpService();
    routineVersionService = new RoutineVersionService(prismaMock as unknown as PrismaService);
    dataPrivacyService = new DataPrivacyService(prismaMock as unknown as PrismaService);
  });

  // ══════════════════════════════════════════════
  // 1. Clinical Export & ICD-10 Mapping
  // ══════════════════════════════════════════════

  describe("1. Clinical Export & ICD-10 Mapping", () => {
    it("should build complete clinical export dataset with ICD-10 mappings", async () => {
      const exportData = await clinicalExportService.buildClinicalExport(mockUser.id);

      expect(exportData.reportId).toBeDefined();
      expect(exportData.patient.fitzpatrick).toBe(4);
      expect(exportData.patient.barrierScore).toBe(58);
      expect(exportData.clinicalFindings.findings.length).toBeGreaterThan(0);

      // Verify ICD-10 mappings
      const icdCodes = exportData.clinicalFindings.findings.map((f) => f.icd10Code);
      expect(icdCodes).toContain(ICD10_MAP["inflammatory_acne"]!.code); // L70.0
      expect(icdCodes).toContain(ICD10_MAP["rosacea"]!.code); // L71.9
      expect(icdCodes).toContain(ICD10_MAP["hyperpigmentation"]!.code); // L81.1
    });

    it("should detect comedogenic ingredients from scanned products", async () => {
      const exportData = await clinicalExportService.buildClinicalExport(mockUser.id);

      expect(exportData.productSafetyProfile.comedogenicIngredientsFound).toContain("coconut oil");
      expect(exportData.productSafetyProfile.comedogenicIngredientsFound).toContain("sodium lauryl sulfate");
    });

    it("should flag concurrent prescription retinoid interactions", async () => {
      const exportData = await clinicalExportService.buildClinicalExport(mockUser.id);
      expect(exportData.patient.currentMedications).toContain("Tretinoin 0.05% Cream");
      expect(exportData.safetyFlags.length).toBeGreaterThan(0);
    });

    it("should generate valid printable HTML clinical summary", async () => {
      const html = await clinicalExportService.generateHtmlReport(mockUser.id);
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("SkinSense Clinical Assessment Export");
      expect(html).toContain("L70.0");
      expect(html).toContain("CLINICAL INTAKE NOTICE");
    });
  });

  // ══════════════════════════════════════════════
  // 2. Dermatologist Collaboration Portal
  // ══════════════════════════════════════════════

  describe("2. Dermatologist Collaboration Portal", () => {
    it("should generate a 90-day scoped invite link", async () => {
      const link = await portalService.createInviteLink(mockUser.id);
      expect(link.accessToken).toMatch(/^portal_/);
      expect(link.isActive).toBe(true);
      expect(new Date(link.expiresAt).getTime()).toBeGreaterThan(Date.now() + 80 * 24 * 3600 * 1000);
    });

    it("should reject revoked portal access tokens", async () => {
      await expect(portalService.validateToken("revoked_token")).rejects.toThrow("revoked");
    });

    it("should reject expired portal access tokens", async () => {
      await expect(portalService.validateToken("expired_token")).rejects.toThrow("expired");
    });

    it("should deliver read-only patient summary to clinician", async () => {
      const summary = await portalService.getPatientSummary("valid_token");
      expect(summary.displayName).toBeDefined();
      expect(summary.fitzpatrick).toBe(4);
      expect(summary.barrierScore).toBe(58);
      expect(summary.routineSummary.amSteps.length).toBeGreaterThan(0);
    });

    it("should allow clinician to post a note visible to patient", async () => {
      const note = await portalService.addClinicianNote("valid_token", "Please reduce morning wash to water only.", "Dr. Smith");
      expect(note.message).toContain("reduce morning wash");
      expect(note.clinicianName).toBe("Dr. Smith");
    });

    it("should create photo request for specific facial zone", async () => {
      const photoReq = await portalService.requestPhoto("valid_token", "left_cheek", "Inspect pigment evolution", "High lighting close-up");
      expect(photoReq.zone).toBe("left_cheek");
      expect(photoReq.reason).toContain("pigment evolution");
    });
  });

  // ══════════════════════════════════════════════
  // 3. Dermatologist Feedback Loop & Reconciliation
  // ══════════════════════════════════════════════

  describe("3. Dermatologist Feedback Loop & Treatment Reconciliation", () => {
    it("should record diagnosis discrepancy and training consent", async () => {
      const result = await feedbackService.submitDiagnosisFeedback(mockUser.id, {
        scanId: "scan-p7-01",
        professionalDiagnosis: "Fungal folliculitis",
        prescriptions: ["Ketoconazole 2% Cream"],
        consentToTraining: true,
      });

      expect(result.correction.professionalDiagnosis).toBe("Fungal folliculitis");
      expect(result.correction.consentToTraining).toBe(true);
    });

    it("should override OTC retinoids and pause phased intro when tretinoin is prescribed", async () => {
      const reconciliation = await feedbackService.reconcileTreatments(mockUser.id, ["Tretinoin 0.05%"]);
      expect(reconciliation.otcProductsRemoved).toContain("OTC Retinol / Retinaldehyde");
      expect(reconciliation.phasedIntroPaused).toBe(true);
      expect(reconciliation.pauseDurationWeeks).toBe(4);
    });

    it("should strip routine to gentle essentials when isotretinoin is prescribed", async () => {
      const reconciliation = await feedbackService.reconcileTreatments(mockUser.id, ["Isotretinoin 20mg"]);
      expect(reconciliation.otcProductsRemoved).toContain("All active serums (Vit C, Retinol)");
      expect(reconciliation.pauseDurationWeeks).toBe(16);
      expect(reconciliation.reconciliationSummary).toContain("Accutane protocol");
    });
  });

  // ══════════════════════════════════════════════
  // 4. Health App Integration (HealthKit / Health Connect)
  // ══════════════════════════════════════════════

  describe("4. Health App Integration & Biomarkers", () => {
    it("should flag sleep deficit (<6h) as poor sleep quality", () => {
      const derived = healthSyncService.computeDerivedSignals({
        sleep: [{ date: "2026-10-01", durationHours: 5.2, quality: "poor" }],
      });
      expect(derived.avgSleepHours).toBe(5.2);
      expect(derived.sleepQualitySummary).toBe("poor");
      expect(derived.suggestedScoreContext[0]).toContain("Sub-optimal sleep");
    });

    it("should flag low HRV trend as elevated sympathetic stress", () => {
      const derived = healthSyncService.computeDerivedSignals({
        hrv: [
          { date: "2026-09-30", avgMs: 32, trend: "decreasing" },
          { date: "2026-10-01", avgMs: 29, trend: "decreasing" },
        ],
      });
      expect(derived.stressIndicator).toBe("high");
      expect(derived.suggestedScoreContext.some((c) => c.includes("cortisol"))).toBe(true);
    });

    it("should flag hormonal breakout risk during luteal cycle phase", () => {
      const derived = healthSyncService.computeDerivedSignals({
        cycle: { currentDay: 22, phase: "luteal", predictedFlareRisk: "high" },
      });
      expect(derived.hormonalAcneRisk).toBe(true);
      expect(derived.suggestedScoreContext.some((c) => c.includes("Luteal phase"))).toBe(true);
    });

    it("should retrieve skin health score formatted for health app export", async () => {
      const exportScore = await healthSyncService.getScoreForHealthAppExport(mockUser.id);
      expect(exportScore.score).toBe(68);
      expect(exportScore.date).toBeDefined();
    });
  });

  // ══════════════════════════════════════════════
  // 5. Causal Inference Engine
  // ══════════════════════════════════════════════

  describe("5. Causal Inference Engine", () => {
    it("should classify relationship as LIKELY_CAUSAL when temporal onset matches expectation", () => {
      const assessment = causalService.assessCausality({
        event: "started Retinoid serum",
        metric: "forehead acne",
        startDate: "2026-08-01",
        changeDate: "2026-09-15", // ~6.4 weeks lag (matches retinoid 4-12 weeks)
        metricHistory: [],
      });

      expect(assessment.temporalMatch).toBe(true);
      expect(assessment.verdict).toBe("LIKELY_CAUSAL");
    });

    it("should declare UNCERTAIN when simultaneous confounders are detected", () => {
      const assessment = causalService.assessCausality({
        event: "started Azelaic Acid",
        metric: "redness",
        startDate: "2026-09-01",
        changeDate: "2026-10-01",
        metricHistory: [],
        confounders: ["moved to humid climate", "started meditation"],
      });

      expect(assessment.verdict).toBe("UNCERTAIN");
      expect(assessment.explanation).toContain("confounding factors");
    });

    it("should recognize natural experiment when symptoms worsen during product hiatus", () => {
      const assessment = causalService.assessCausality({
        event: "moisturizer",
        metric: "barrier hydration",
        startDate: "2026-08-01",
        changeDate: "2026-08-15",
        gaps: [{ start: "2026-08-20", end: "2026-09-10" }], // 3 week gap
        metricHistory: [],
      });

      expect(assessment.naturalExperimentObserved).toBe(true);
      expect(assessment.verdict).toBe("LIKELY_CAUSAL");
    });

    it("should evaluate ingredient efficacy: EFFECTIVE, WORSENED, TOO_EARLY", () => {
      const effective = causalService.evaluateIngredientEfficacy("Niacinamide", "ACNE", "2026-08-01", 60, 42, "2026-10-01");
      expect(effective.verdict).toBe("EFFECTIVE");

      const tooEarly = causalService.evaluateIngredientEfficacy("Azelaic Acid", "REDNESS", "2026-09-25", 50, 48, "2026-10-01");
      expect(tooEarly.verdict).toBe("TOO_EARLY");

      const worsened = causalService.evaluateIngredientEfficacy("New Facial Oil", "ACNE", "2026-08-01", 30, 45, "2026-10-01");
      expect(worsened.verdict).toBe("WORSENED");
    });
  });

  // ══════════════════════════════════════════════
  // 6. Life-Stage Adaptation & Medication Attribution
  // ══════════════════════════════════════════════

  describe("6. Life-Stage Adaptation & Medication Attribution", () => {
    it("should detect contraindicated ingredients during pregnancy audit", () => {
      const audit = lifeStageService.auditPregnancySafety([
        "Water",
        "Tretinoin",
        "Salicylic Acid",
        "Ceramides",
      ]);

      expect(audit.isSafe).toBe(false);
      expect(audit.bannedIngredientsDetected).toContain("Tretinoin");
      expect(audit.bannedIngredientsDetected).toContain("Salicylic Acid");
      expect(audit.safeAlternativesRecommended).toContain("Azelaic Acid");
    });

    it("should detect bilateral symmetrical melasma pattern", () => {
      const audit = lifeStageService.auditPregnancySafety(
        ["Water", "Hyaluronic Acid"],
        {
          left_cheek: { pigmentation: 55 },
          right_cheek: { pigmentation: 50 },
          forehead: { pigmentation: 40 },
        },
      );

      expect(audit.isSafe).toBe(true);
      expect(audit.melasmaPatternDetected).toBe(true);
    });

    it("should adapt routine for perimenopause with peptides and barrier lipids", () => {
      const adaptation = lifeStageService.getLifeStageAdaptation("PERIMENOPAUSE");
      expect(adaptation.keyIngredientsPrioritized).toContain("Ceramides");
      expect(adaptation.keyIngredientsPrioritized).toContain("Peptides");
      expect(adaptation.routineTierLimit).toBe("COMPREHENSIVE");
    });

    it("should adapt routine for puberty with essential 3-step tier", () => {
      const adaptation = lifeStageService.getLifeStageAdaptation("PUBERTY");
      expect(adaptation.routineTierLimit).toBe("ESSENTIAL");
      expect(adaptation.restrictedIngredients[0]).toContain("High strength retinol");
    });

    it("should attribute cutaneous findings to known medication side effects", () => {
      const attributions = lifeStageService.attributeMedicationSideEffects([
        "Corticosteroids cream",
        "Oral Doxycycline 100mg",
      ]);

      expect(attributions.some((a) => a.finding === "skin_thinning")).toBe(true);
      expect(attributions.some((a) => a.finding === "photosensitivity")).toBe(true);
    });
  });

  // ══════════════════════════════════════════════
  // 7. Seasonal Auto-Adjustment
  // ══════════════════════════════════════════════

  describe("7. Seasonal Auto-Adjustment", () => {
    it("should detect drying transition (Fall to Winter) when humidity drops >= 18%", () => {
      const history = Array(7).fill({ date: "2026-10-01", tempC: 22, humidity: 65, uvIndex: 5 });
      const forecast = Array(14).fill({ date: "2026-10-15", tempC: 10, humidity: 40, uvIndex: 2 }); // drop 25%

      const transition = seasonalService.detectSeasonalTransition(history, forecast);
      expect(transition).not.toBeNull();
      expect(transition!.type).toBe("DRYING");
      expect(transition!.toSeason).toBe("Winter");
      expect(transition!.routineAdjustments.moisturizerWeight).toBe("heavy");
    });

    it("should detect humidifying transition (Winter to Spring) when humidity rises >= 18%", () => {
      const history = Array(7).fill({ date: "2026-02-01", tempC: 4, humidity: 35, uvIndex: 1 });
      const forecast = Array(14).fill({ date: "2026-02-15", tempC: 16, humidity: 60, uvIndex: 3 }); // rise 25%

      const transition = seasonalService.detectSeasonalTransition(history, forecast);
      expect(transition).not.toBeNull();
      expect(transition!.type).toBe("HUMIDIFYING");
      expect(transition!.toSeason).toBe("Spring");
      expect(transition!.routineAdjustments.moisturizerWeight).toBe("light");
    });
  });

  // ══════════════════════════════════════════════
  // 8. Voice NLP Entity Extraction
  // ══════════════════════════════════════════════

  describe("8. Voice NLP Entity Extraction", () => {
    it("should extract product changes, concerns, triggers, and sensations from user transcript", () => {
      const transcript = "I started using moisturizer 2 weeks ago, but yesterday I noticed burning redness and breakout around my chin after eating dairy.";
      const signals = voiceNlpService.extractSignalsFromTranscript(transcript);

      expect(signals.productChanges.length).toBeGreaterThan(0);
      expect(signals.productChanges[0]!.product).toBe("moisturizer");
      expect(signals.productChanges[0]!.action).toBe("started");

      expect(signals.concerns.some((c) => c.zone === "chin" || c.description.includes("breakout"))).toBe(true);
      expect(signals.triggers.some((t) => t.trigger === "dairy")).toBe(true);
      expect(signals.sensations.some((s) => s.feeling === "burning")).toBe(true);
      expect(signals.timeline.length).toBeGreaterThan(0);
    });
  });

  // ══════════════════════════════════════════════
  // 9. Routine Version History
  // ══════════════════════════════════════════════

  describe("9. Routine Version History", () => {
    it("should increment routine version number on each change", async () => {
      const version = await routineVersionService.recordVersion(
        mockUser.id,
        "rt-p7-01",
        [{ step: 1, name: "Gentle Cleanser" }],
        [{ step: 1, name: "Night Moisturizer" }],
        "Winter dryness adjustment: heavier moisturizer",
      );

      expect(version.version).toBe(3); // previous mock was 2
      expect(version.changeReason).toContain("Winter dryness");
    });

    it("should retrieve chronological routine version history", async () => {
      const history = await routineVersionService.getHistory(mockUser.id, "rt-p7-01");
      expect(history.length).toBe(2);
      expect(history[0]!.version).toBe(2);
      expect(history[1]!.version).toBe(1);
    });
  });

  // ══════════════════════════════════════════════
  // 10. Data Portability, GDPR, & Multi-Profile
  // ══════════════════════════════════════════════

  describe("10. Data Portability, GDPR Erasure & Multi-Profile", () => {
    it("should generate full GDPR data export manifest", async () => {
      const exportBundle = await dataPrivacyService.generateDataExport(mockUser.id);
      expect(exportBundle.exportId).toBeDefined();
      expect(exportBundle.filesIncluded).toContain("profile.json");
      expect(exportBundle.filesIncluded).toContain("scans.json");
      expect(exportBundle.filesIncluded).toContain("products.json");
      expect(exportBundle.downloadUrl).toContain(exportBundle.exportId);
    });

    it("should support cascading account deletion", async () => {
      const result = await dataPrivacyService.deleteAccount(mockUser.id);
      expect(result.deleted).toBe(true);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: mockUser.id } });
    });

    it("should manage multi-profiles (create, list, switch, delete)", async () => {
      const newProfile = await dataPrivacyService.createProfile(mockUser.id, "Daughter Profile", undefined, true);
      expect(newProfile.displayName).toBe("Daughter Profile");
      expect(newProfile.biometricLockEnabled).toBe(true);

      const switched = await dataPrivacyService.switchProfile(mockUser.id, "prof-1");
      expect(switched.activeProfileId).toBe("prof-1");

      await dataPrivacyService.deleteProfile(mockUser.id, "prof-1");
      expect(prismaMock.appProfile.delete).toHaveBeenCalledWith({ where: { id: "prof-1" } });
    });
  });
});
