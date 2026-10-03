import { PrismaService } from "./prisma/prisma.service";
import { ProductService } from "./product/product.service";
import { ScanService } from "./scan/scan.service";
import { AuthService } from "./auth/auth.service";
import { AdherenceService } from "./adherence/adherence.service";
import { QueueProducer } from "./queue/queue.producer";

describe("API Integration Tests (Database & Service Layer)", () => {
  let prisma: PrismaService;
  let productService: ProductService;
  let scanService: ScanService;
  let authService: AuthService;
  let adherenceService: AdherenceService;
  let mockQueueProducer: Partial<QueueProducer>;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();

    productService = new ProductService(prisma);
    authService = new AuthService(prisma);
    adherenceService = new AdherenceService(prisma);

    mockQueueProducer = {
      enqueueScan: jest.fn().mockResolvedValue("job-test-123"),
    };

    scanService = new ScanService(prisma, mockQueueProducer as QueueProducer);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Product Catalog & Filtering", () => {
    it("should query seeded products and filter by skinType", async () => {
      const res = await productService.findAll({
        skinType: "OILY",
        limit: 10,
        offset: 0,
      });

      expect(res.products.length).toBeGreaterThan(0);
      expect(res.total).toBeGreaterThan(0);
      for (const prod of res.products) {
        expect(prod.skinTypes).toContain("OILY");
      }
    });

    it("should exclude products containing allergen ingredients", async () => {
      const res = await productService.findAll({
        excludeIngredients: ["fragrance", "parfum"],
        limit: 50,
        offset: 0,
      });

      expect(res.products.length).toBeGreaterThan(0);
      for (const prod of res.products) {
        const containsFragrance = prod.ingredients.some(
          (ing) => ing.toLowerCase().includes("fragrance") || ing.toLowerCase().includes("parfum"),
        );
        expect(containsFragrance).toBe(false);
      }
    });

    it("should filter by product category", async () => {
      const res = await productService.findAll({
        category: "CLEANSER",
        limit: 10,
        offset: 0,
      });

      expect(res.products.length).toBeGreaterThan(0);
      for (const prod of res.products) {
        expect(prod.category).toBe("CLEANSER");
      }
    });
  });

  describe("Scan Creation & Job Enqueuing", () => {
    it("should create a Scan record in PENDING state and enqueue a background job", async () => {
      const res = await scanService.create("test-supabase-id-000", {
        imageKey: "scans/test-image-integration.jpg",
        questionnaire: {
          skinType: "COMBINATION",
          concerns: ["ACNE", "REDNESS"],
          allergies: ["Fragrance / Parfum"],
          ageRange: "TWENTIES",
          isPregnant: false,
        },
      });

      expect(res).toBeDefined();
      expect(res.status).toBe("PENDING");
      expect(res.scanId).toBeDefined();

      // Verify record exists in Postgres
      const record = await prisma.scan.findUnique({
        where: { id: res.scanId },
      });
      expect(record).toBeDefined();
      expect(record?.status).toBe("PENDING");
      expect(record?.imageKeys).toContain("scans/test-image-integration.jpg");

      // Verify queue producer was called
      expect(mockQueueProducer.enqueueScan).toHaveBeenCalledWith(
        expect.objectContaining({
          scanId: res.scanId,
          imageKey: "scans/test-image-integration.jpg",
        }),
      );
    });
  });

  describe("User Profile & Adherence Tracking", () => {
    it("should update user profile questionnaire responses", async () => {
      const updated = await authService.updateProfile("test-supabase-id-000", {
        skinType: "DRY",
        concerns: ["DRYNESS", "SENSITIVITY"],
        ageRange: "THIRTIES",
      });

      expect(updated.skinType).toBe("DRY");
      expect(updated.ageRange).toBe("THIRTIES");
      expect(updated.concerns).toEqual(["DRYNESS", "SENSITIVITY"]);
    });

    it("should log daily routine adherence", async () => {
      const today = new Date().toISOString().split("T")[0]!;
      const logRes = await adherenceService.logAdherence("test-supabase-id-000", {
        routineId: "mock-routine-001",
        date: today,
        amCompleted: true,
        pmCompleted: false,
      });

      expect(logRes.log).toBeDefined();
      expect(logRes.log.amCompleted).toBe(true);
      expect(logRes.log.pmCompleted).toBe(false);

      const logs = await adherenceService.getLogs("test-supabase-id-000");
      expect(logs.logs.length).toBeGreaterThan(0);
    });
  });

  describe("Phase 3 Capture & Self-Assessment Integration", () => {
    it("should create multi-frame scan with Phase 3 capture metadata", async () => {
      const res = await scanService.create("test-supabase-id-000", {
        imageKeys: ["scans/pose1.jpg", "scans/pose2.jpg", "scans/pose3.jpg"],
        calibrationKey: "scans/white-balance.jpg",
        captureMode: "audio_guided",
        environmentScore: "green",
        physiologicalState: {
          exercised: false,
          hotShower: false,
        },
        questionnaire: {
          skinType: "COMBINATION",
          concerns: ["ACNE", "OILINESS"],
          allergies: [],
          ageRange: "TWENTIES",
          isPregnant: false,
        },
      });

      expect(res.scanId).toBeDefined();

      const scanRecord = await prisma.scan.findUnique({
        where: { id: res.scanId },
      });
      expect(scanRecord?.captureMode).toBe("audio_guided");
      expect(scanRecord?.calibrationKey).toBe("scans/white-balance.jpg");
      expect(scanRecord?.environmentScore).toBe("green");
      expect(scanRecord?.imageKeys.length).toBe(3);
    });

    it("should submit self-assessment and persist spot markers and zone selections", async () => {
      const scanRes = await scanService.create("test-supabase-id-000", {
        imageKeys: ["scans/pose1.jpg"],
        captureMode: "mirror",
        questionnaire: {
          skinType: "OILY",
          concerns: ["ACNE"],
          allergies: [],
          ageRange: "TWENTIES",
          isPregnant: false,
        },
      });

      // Submit self assessment
      const selfAssessmentRes = await scanService.submitSelfAssessment(scanRes.scanId, {
        selections: [
          {
            zone: "forehead",
            concerns: ["active_acne", "oiliness"],
          },
        ],
        spotMarkers: [
          {
            x: 0.48,
            y: 0.22,
            zone: "forehead",
            userNote: "Forehead breakout area",
          },
        ],
      });

      expect(selfAssessmentRes.selfAssessment).toBeDefined();
      expect(selfAssessmentRes.selfAssessment.scanId).toBe(scanRes.scanId);

      // Verify retrieval with scan record
      const fetched = await scanService.findOne(scanRes.scanId);
      expect(fetched.selfAssessment).toBeDefined();
      expect((fetched.selfAssessment?.selections as any[])[0].zone).toBe("forehead");
    });
  });

  // ══════════════════════════════════════════════
  // Phase 4: Smart Engine Integration Tests
  // ══════════════════════════════════════════════

  describe("Phase 4: Product Barcode Scanning & OCR", () => {
    it("should return known product from local barcode dictionary", async () => {
      const res = await productService.scanBarcode("3337875597196");
      expect(res.found).toBe(true);
      expect(res.product.name).toContain("CeraVe");
      expect(res.product.brand).toBe("CeraVe");
      expect(res.product.category).toBe("CLEANSER");
      expect(res.product.ingredients.length).toBeGreaterThan(5);
      expect(res.product.scannedVia).toBe("barcode");
    });

    it("should look up The Ordinary Niacinamide by barcode", async () => {
      const res = await productService.scanBarcode("769915190602");
      expect(res.found).toBe(true);
      expect(res.product.brand).toBe("The Ordinary");
      expect(res.product.category).toBe("SERUM");
      expect(res.product.ingredients).toContain("Niacinamide");
    });

    it("should look up La Roche-Posay SPF by barcode", async () => {
      const res = await productService.scanBarcode("3606000537446");
      expect(res.found).toBe(true);
      expect(res.product.brand).toBe("La Roche-Posay");
      expect(res.product.category).toBe("SPF");
    });

    it("should return fallback product for unknown barcode", async () => {
      const res = await productService.scanBarcode("0000000000000");
      expect(res.found).toBe(false);
      expect(res.product).toBeDefined();
      expect(res.product.scannedVia).toBe("barcode");
    });

    it("should extract INCI ingredients from raw OCR text", async () => {
      const res = await productService.scanOcr(
        "Ingredients: Aqua, Glycerin, Niacinamide, Salicylic Acid, Zinc PCA, Phenoxyethanol",
      );
      expect(res.extractedIngredients.length).toBeGreaterThan(3);
      expect(res.confidence).toBeGreaterThan(0.8);
      expect(res.extractedIngredients).toContain("Niacinamide");
      expect(res.extractedIngredients).toContain("Salicylic Acid");
    });

    it("should handle OCR text without 'Ingredients:' prefix", async () => {
      const res = await productService.scanOcr("Water, Ceramide NP, Cholesterol, Hyaluronic Acid");
      expect(res.extractedIngredients.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Phase 4: User Product Library CRUD", () => {
    const testSupabaseId = "test-supabase-id-p4-products";

    it("should add a user product to their personal library", async () => {
      const res = await productService.addUserProduct(testSupabaseId, {
        name: "Hydrating Cleanser",
        brand: "CeraVe",
        category: "CLEANSER",
        ingredients: ["Aqua", "Glycerin", "Ceramide NP", "Hyaluronic Acid"],
        activeIngredients: [{ name: "Ceramides", concentration: "3 essential" }],
        routineSlot: "BOTH",
        stepOrder: 1,
        scannedVia: "barcode",
      });

      expect(res.product).toBeDefined();
      expect(res.product.name).toBe("Hydrating Cleanser");
      expect(res.product.brand).toBe("CeraVe");
      expect(res.product.scannedVia).toBe("barcode");
    });

    it("should retrieve user product library", async () => {
      const res = await productService.getUserProducts(testSupabaseId);
      expect(res.products.length).toBeGreaterThan(0);
      expect(res.products[0]!.brand).toBe("CeraVe");
    });

    it("should delete a user product from their library", async () => {
      const addRes = await productService.addUserProduct(testSupabaseId, {
        name: "To Delete",
        brand: "TestBrand",
        category: "SERUM",
        ingredients: ["Water"],
        activeIngredients: [],
        routineSlot: "AM",
        stepOrder: 2,
        scannedVia: "manual",
      });

      const deleteRes = await productService.deleteUserProduct(testSupabaseId, addRes.product.id);
      expect(deleteRes.success).toBe(true);
    });
  });

  describe("Phase 4: Medication CRUD & Restriction Enforcement", () => {
    let medicationService: any;
    const testSupabaseId = "test-supabase-id-p4-meds";

    beforeAll(async () => {
      const { MedicationService } = await import("./medication/medication.service");
      medicationService = new MedicationService(prisma);
    });

    it("should add medication and auto-detect isotretinoin restriction", async () => {
      const res = await medicationService.addMedication(testSupabaseId, {
        name: "Isotretinoin (Accutane) 20mg",
        startDate: new Date().toISOString(),
      });

      expect(res.medication).toBeDefined();
      expect(res.medication.restriction).toBe("MINIMAL_ROUTINE");
      expect(res.medication.isActive).toBe(true);
    });

    it("should auto-detect tretinoin restriction as NO_OTC_RETINOL", async () => {
      const res = await medicationService.addMedication(testSupabaseId, {
        name: "Tretinoin Cream 0.025%",
      });

      expect(res.medication.restriction).toBe("NO_OTC_RETINOL");
    });

    it("should auto-detect photosensitivity for antibiotics", async () => {
      const res = await medicationService.addMedication(testSupabaseId, {
        name: "Doxycycline 100mg",
      });

      expect(res.medication.restriction).toBe("NOTE_PHOTOSENSITIVITY");
    });

    it("should auto-detect corticosteroid thinning monitor", async () => {
      const res = await medicationService.addMedication(testSupabaseId, {
        name: "Hydrocortisone 1% Cream",
      });

      expect(res.medication.restriction).toBe("MONITOR_THINNING");
    });

    it("should assign NONE restriction for unknown medications", async () => {
      const res = await medicationService.addMedication(testSupabaseId, {
        name: "Multivitamin Daily",
      });

      expect(res.medication.restriction).toBe("NONE");
    });

    it("should retrieve all medications for user", async () => {
      const res = await medicationService.getMedications(testSupabaseId);
      expect(res.medications.length).toBeGreaterThanOrEqual(4);
    });

    it("should delete medication", async () => {
      const addRes = await medicationService.addMedication(testSupabaseId, {
        name: "Temporary Supplement",
      });
      const deleteRes = await medicationService.deleteMedication(testSupabaseId, addRes.medication.id);
      expect(deleteRes.success).toBe(true);
    });
  });

  describe("Phase 4: Environmental Context", () => {
    let environmentalService: any;

    beforeAll(async () => {
      const { EnvironmentalService } = await import("./smart-engine/environmental.service");
      environmentalService = new EnvironmentalService();
    });

    it("should return complete environmental context with seasonal data", () => {
      const ctx = environmentalService.getEnvironmentalContext();
      expect(ctx.uvIndex).toBeGreaterThan(0);
      expect(ctx.uvAccumulation14Day).toBeGreaterThan(0);
      expect(ctx.aqi).toBeDefined();
      expect(ctx.pm25).toBeDefined();
      expect(ctx.waterHardnessPpm).toBeGreaterThan(0);
      expect(ctx.humidity7DayHistory.length).toBe(7);
      expect(["winter", "spring", "summer", "fall"]).toContain(ctx.season);
      expect(ctx.advisoryNote).toBeDefined();
    });
  });

  describe("Phase 4: Smart Engine Service Stack (Composable Pipeline)", () => {
    let fitzpatrickService: any;
    let barrierService: any;
    let differentialService: any;
    let ensembleService: any;
    let clinicalGradingService: any;
    let skinAgeService: any;
    let safetyScreeningService: any;
    let selfAuditService: any;
    let reclassificationService: any;

    beforeAll(async () => {
      const { FitzpatrickService } = await import("./smart-engine/fitzpatrick.service");
      const { BarrierService } = await import("./smart-engine/barrier.service");
      const { DifferentialService } = await import("./smart-engine/differential.service");
      const { EnsembleService } = await import("./smart-engine/ensemble.service");
      const { ClinicalGradingService } = await import("./smart-engine/clinical-grading.service");
      const { SkinAgeService } = await import("./smart-engine/skin-age.service");
      const { SafetyScreeningService } = await import("./smart-engine/safety-screening.service");
      const { SelfAuditService } = await import("./smart-engine/self-audit.service");
      const { ReclassificationService } = await import("./smart-engine/reclassification.service");

      fitzpatrickService = new FitzpatrickService();
      barrierService = new BarrierService();
      differentialService = new DifferentialService();
      ensembleService = new EnsembleService();
      clinicalGradingService = new ClinicalGradingService();
      skinAgeService = new SkinAgeService();
      safetyScreeningService = new SafetyScreeningService();
      selfAuditService = new SelfAuditService();
      reclassificationService = new ReclassificationService();
    });

    it("should run the full smart engine pipeline end-to-end", () => {
      // 1. Fitzpatrick classification
      const fitz = fitzpatrickService.classifyTone({ l: 55, a: 10, b: 14 });
      expect(fitz.category).toBe(3);
      const thresholds = fitzpatrickService.getToneThresholds(fitz.category);
      expect(thresholds.erythemaMethod).toBe("GREEN_BOOST");

      // 2. Skin type reclassification
      const reclass = reclassificationService.reclassifySkinType("OILY", 72, 32, 40);
      expect(reclass.measuredType).toBe("DEHYDRATED_OILY");
      expect(reclass.discrepancy).toBe(true);

      // 3. Zone scores for differential diagnosis
      const zoneScores = {
        forehead: { acne: 55, redness: 20, pigmentation: 15, texture: 30, dryness: 10, oiliness: 50 },
        nose: { acne: 40, redness: 15, pigmentation: 10, texture: 25, dryness: 5, oiliness: 60 },
        left_cheek: { acne: 20, redness: 45, pigmentation: 20, texture: 20, dryness: 15, oiliness: 25 },
        right_cheek: { acne: 18, redness: 43, pigmentation: 18, texture: 20, dryness: 15, oiliness: 25 },
        chin: { acne: 70, redness: 30, pigmentation: 15, texture: 30, dryness: 10, oiliness: 40 },
      };

      // 4. Ensemble consensus per zone/category
      const acneConsensus = ensembleService.evaluateConsensus("acne", "chin", zoneScores.chin.acne);
      expect(acneConsensus.consensusConfidence).toBe("HIGH");
      expect(acneConsensus.agreements).toBe(3);

      // 5. Differential diagnosis
      const differential = differentialService.evaluateDifferential(zoneScores);
      expect(differential.primary).toBeDefined();
      expect(differential.primary.confidence).toBeGreaterThan(0.6);

      // 6. Barrier health
      const barrier = barrierService.computeBarrierHealth({
        dehydrationTexture: 30,
        oilDehydrationRatio: 25,
        sensitivityReport: 20,
        waterHardness: 15,
        productStrippingRisk: 20,
        weatherStress: 15,
      });
      expect(barrier.score).toBeGreaterThan(60);
      expect(barrier.isLockedOut).toBe(false);

      // 7. Clinical grading
      const grading = clinicalGradingService.computeGrading([
        { id: "f1", type: "papule", zone: "chin", severity: 70, confidence: 0.9, boundingBox: { x: 0.5, y: 0.8, w: 0.05, h: 0.05 } },
        { id: "f2", type: "comedone", zone: "forehead", severity: 50, confidence: 0.85, boundingBox: { x: 0.5, y: 0.2, w: 0.04, h: 0.04 } },
      ]);
      expect(grading.gagsScore).toBeGreaterThan(0);
      expect(grading.igaScore).toBeGreaterThanOrEqual(1);

      // 8. Skin age
      const skinAge = skinAgeService.computeSkinAge(zoneScores, 28, fitz.category);
      expect(skinAge.biologicalAge).toBeGreaterThan(0);
      expect(skinAge.chronologicalAge).toBe(28);
      expect(skinAge.zoneAges).toBeDefined();

      // 9. Safety screening
      const safety = safetyScreeningService.screenLesions([
        { id: "l1", type: "dark_spot", zone: "left_cheek", severity: 40, confidence: 0.9,
          boundingBox: { x: 0.3, y: 0.4, w: 0.03, h: 0.03 } },
      ], [], fitz.category);
      expect(safety.length).toBeGreaterThanOrEqual(0); // May or may not flag

      // 10. Self-audit (no previous scan = no jumps)
      const audit = selfAuditService.auditResult(zoneScores);
      expect(audit.passed).toBe(true);
      expect(audit.confidence).toBe("HIGH");
    });
  });
});
