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
});

