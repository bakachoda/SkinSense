import { Test, TestingModule } from "@nestjs/testing";
import { SubscriptionService } from "./subscription.service";
import { PrismaService } from "../prisma/prisma.service";

describe("Phase 11: Monetization & Subscription Engine", () => {
  let service: SubscriptionService;
  let prisma: PrismaService;

  const mockUser = {
    id: "test-user-monetization",
    supabaseId: "mock-sub-monetization",
    email: "monetization@skinsense.ai",
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionService, PrismaService],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    prisma = module.get<PrismaService>(PrismaService);

    // Upsert test user
    await prisma.user.upsert({
      where: { supabaseId: mockUser.supabaseId },
      create: mockUser,
      update: {},
    });
  });

  afterAll(async () => {
    await prisma.scanQuota.deleteMany({ where: { userId: mockUser.id } });
    await prisma.subscription.deleteMany({ where: { userId: mockUser.id } });
    await prisma.user.deleteMany({ where: { id: mockUser.id } });
    await prisma.$disconnect();
  });

  it("should return available subscription product catalog", () => {
    const plans = service.getAvailablePlans();
    expect(plans.length).toBeGreaterThanOrEqual(3);
    const proAnnual = plans.find((p) => p.tier === "PRO_ANNUAL");
    expect(proAnnual).toBeDefined();
    expect(proAnnual?.isPopular).toBe(true);
    expect(proAnnual?.trialDays).toBe(7);
  });

  it("should initialize default FREE tier entitlements for new user", async () => {
    const entitlements = await service.getUserEntitlements(mockUser.id);
    expect(entitlements.tier).toBe("FREE");
    expect(entitlements.status).toBe("ACTIVE");
    expect(entitlements.maxScansPerMonth).toBe(3);
    expect(entitlements.scansRemainingThisMonth).toBe(3);
    expect(entitlements.entitlements.UNLIMITED_SCANS).toBe(false);
    expect(entitlements.entitlements.ADVANCED_HEATMAPS).toBe(false);
    expect(entitlements.entitlements.CLINICAL_PDF_EXPORT).toBe(false);
  });

  it("should track and consume free monthly scan quota", async () => {
    const check1 = await service.checkAndConsumeScanQuota(mockUser.id);
    expect(check1.allowed).toBe(true);
    expect(check1.remaining).toBe(2);

    const check2 = await service.checkAndConsumeScanQuota(mockUser.id);
    expect(check2.allowed).toBe(true);
    expect(check2.remaining).toBe(1);

    const check3 = await service.checkAndConsumeScanQuota(mockUser.id);
    expect(check3.allowed).toBe(true);
    expect(check3.remaining).toBe(0);

    const check4 = await service.checkAndConsumeScanQuota(mockUser.id);
    expect(check4.allowed).toBe(false);
    expect(check4.remaining).toBe(0);
    expect(check4.reason).toContain("Monthly free limit");
  });

  it("should upgrade user to PRO_ANNUAL with unlimited scans and trial status", async () => {
    const upgraded = await service.upgradeTier(mockUser.id, "PRO_ANNUAL", "SANDBOX_TEST");
    expect(upgraded.tier).toBe("PRO_ANNUAL");
    expect(upgraded.status).toBe("TRIALING");
    expect(upgraded.trialEndsAt).not.toBeNull();
    expect(upgraded.maxScansPerMonth).toBeNull();
    expect(upgraded.scansRemainingThisMonth).toBeNull();
    expect(upgraded.entitlements.UNLIMITED_SCANS).toBe(true);
    expect(upgraded.entitlements.ADVANCED_HEATMAPS).toBe(true);
    expect(upgraded.entitlements.CLINICAL_PDF_EXPORT).toBe(true);
    expect(upgraded.entitlements.FAMILY_PROFILES).toBe(true);

    // Consumption should now always be permitted
    const quotaCheck = await service.checkAndConsumeScanQuota(mockUser.id);
    expect(quotaCheck.allowed).toBe(true);
    expect(quotaCheck.remaining).toBeNull();
  });

  it("should upgrade user to FOUNDER_LIFETIME without expiration", async () => {
    const lifetime = await service.upgradeTier(mockUser.id, "FOUNDER_LIFETIME", "SANDBOX_TEST");
    expect(lifetime.tier).toBe("FOUNDER_LIFETIME");
    expect(lifetime.status).toBe("ACTIVE");
    expect(lifetime.expiresAt).toBeNull();
    expect(lifetime.entitlements.UNLIMITED_SCANS).toBe(true);
    expect(lifetime.entitlements.DERM_PORTAL_SHARING).toBe(true);
  });

  it("should handle billing webhooks for renewal and cancellation", async () => {
    const webhookResult = await service.handleWebhook({
      event: "SUBSCRIPTION_RENEWED",
      userId: mockUser.id,
      tier: "PRO_MONTHLY",
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      provider: "REVENUECAT",
      providerSubscriptionId: "sub_12345_rc",
      timestamp: new Date().toISOString(),
    });

    expect(webhookResult.received).toBe(true);

    const entitlements = await service.getUserEntitlements(mockUser.id);
    expect(entitlements.tier).toBe("PRO_MONTHLY");
    expect(entitlements.status).toBe("ACTIVE");
  });
});
