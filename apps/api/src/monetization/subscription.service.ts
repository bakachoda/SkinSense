import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type {
  SubscriptionTier,
  SubscriptionStatus,
  EntitlementKey,
  UserEntitlements,
  SubscriptionProduct,
  BillingWebhookPayload,
} from "@skinsense/types";

export const SUBSCRIPTION_PRODUCTS: SubscriptionProduct[] = [
  {
    id: "plan_pro_annual",
    tier: "PRO_ANNUAL",
    title: "Pro Annual",
    subtitle: "Full Clinical AI Suite",
    price: "$79.99/year",
    priceMonthlyEquivalent: "$6.67/mo",
    billingPeriod: "year",
    trialDays: 7,
    savingsBadge: "SAVE 33%",
    isPopular: true,
    features: [
      "Unlimited AI multi-angle scans",
      "Interactive 3D Face Map with UV & Sebum heatmaps",
      "Printable Bathroom Mirror Guide with QR verification",
      "Clinical PDF exports for dermatologists",
      "Multi-profile family support (up to 5 profiles)",
      "Continuous biomarker telemetry & causal correlation",
    ],
  },
  {
    id: "plan_pro_monthly",
    tier: "PRO_MONTHLY",
    title: "Pro Monthly",
    subtitle: "Flexible Clinical Routine",
    price: "$9.99/month",
    priceMonthlyEquivalent: "$9.99/mo",
    billingPeriod: "month",
    trialDays: 7,
    savingsBadge: null,
    isPopular: false,
    features: [
      "Unlimited AI multi-angle scans",
      "Interactive 3D Face Map with all layers",
      "Printable Bathroom Mirror Guide",
      "Clinical PDF exports",
      "Standard priority inference queue",
    ],
  },
  {
    id: "plan_founder_lifetime",
    tier: "FOUNDER_LIFETIME",
    title: "Founder Lifetime",
    subtitle: "One-Time Access Forever",
    price: "$199.99",
    priceMonthlyEquivalent: null,
    billingPeriod: "lifetime",
    trialDays: 0,
    savingsBadge: "BEST VALUE",
    isPopular: false,
    features: [
      "Lifetime unlimited scans & full intelligence suite",
      "VIP priority inference GPU cluster access",
      "Direct dermatologist portal reconciliation",
      "Unlimited family profiles",
      "All future hardware sensors & beta features included",
    ],
  },
];

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private readonly prisma: PrismaService) {}

  getAvailablePlans(): SubscriptionProduct[] {
    return SUBSCRIPTION_PRODUCTS;
  }

  private getCurrentYearMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  async getUserEntitlements(userId: string): Promise<UserEntitlements> {
    const resolvedUser = await this.resolveInternalUserId(userId);
    const internalId = resolvedUser ? resolvedUser.id : userId;

    let sub = await this.prisma.subscription.findUnique({
      where: { userId: internalId },
    });

    if (!sub) {
      sub = await this.prisma.subscription.create({
        data: {
          userId: internalId,
          tier: "FREE",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
        },
      });
    }

    const yearMonth = this.getCurrentYearMonth();
    let quota = await this.prisma.scanQuota.findUnique({
      where: {
        userId_yearMonth: {
          userId: internalId,
          yearMonth,
        },
      },
    });

    if (!quota) {
      quota = await this.prisma.scanQuota.create({
        data: {
          userId: internalId,
          yearMonth,
          scansUsed: 0,
          maxAllowed: 3,
        },
      });
    }

    const isProOrLifetime =
      sub.tier === "PRO_MONTHLY" ||
      sub.tier === "PRO_ANNUAL" ||
      sub.tier === "FOUNDER_LIFETIME";

    const isPaidActive = isProOrLifetime && (sub.status === "ACTIVE" || sub.status === "TRIALING");

    const maxScans = isPaidActive ? null : quota.maxAllowed;
    const scansRemaining = isPaidActive
      ? null
      : Math.max(0, quota.maxAllowed - quota.scansUsed);

    const entitlements: Record<EntitlementKey, boolean> = {
      UNLIMITED_SCANS: isPaidActive,
      ADVANCED_HEATMAPS: isPaidActive,
      CLINICAL_PDF_EXPORT: isPaidActive,
      DERM_PORTAL_SHARING: isPaidActive,
      FAMILY_PROFILES: isPaidActive,
      AUDIO_WALKTHROUGH: isPaidActive,
      BATHROOM_ROUTINE_CARD: true, // Free teaser feature
    };

    return {
      userId,
      tier: sub.tier as SubscriptionTier,
      status: sub.status as SubscriptionStatus,
      expiresAt: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
      trialEndsAt: sub.trialEndsAt ? sub.trialEndsAt.toISOString() : null,
      scansUsedThisMonth: quota.scansUsed,
      maxScansPerMonth: maxScans,
      scansRemainingThisMonth: scansRemaining,
      entitlements,
    };
  }

  async checkAndConsumeScanQuota(userId: string): Promise<{
    allowed: boolean;
    remaining: number | null;
    reason?: string;
  }> {
    const entitlements = await this.getUserEntitlements(userId);

    if (entitlements.entitlements.UNLIMITED_SCANS) {
      return { allowed: true, remaining: null };
    }

    if (
      entitlements.scansRemainingThisMonth !== null &&
      entitlements.scansRemainingThisMonth <= 0
    ) {
      return {
        allowed: false,
        remaining: 0,
        reason: `Monthly free limit (${entitlements.maxScansPerMonth} scans) reached. Upgrade to Pro for unlimited scans.`,
      };
    }

    // Consume 1 scan from quota
    const resolvedUser = await this.resolveInternalUserId(userId);
    const internalId = resolvedUser ? resolvedUser.id : userId;
    const yearMonth = this.getCurrentYearMonth();

    const updatedQuota = await this.prisma.scanQuota.update({
      where: {
        userId_yearMonth: {
          userId: internalId,
          yearMonth,
        },
      },
      data: {
        scansUsed: { increment: 1 },
      },
    });

    const newRemaining = Math.max(0, updatedQuota.maxAllowed - updatedQuota.scansUsed);
    return { allowed: true, remaining: newRemaining };
  }

  async upgradeTier(
    userId: string,
    tier: SubscriptionTier,
    provider: string = "SANDBOX_TEST",
  ): Promise<UserEntitlements> {
    const resolvedUser = await this.resolveInternalUserId(userId);
    const internalId = resolvedUser ? resolvedUser.id : userId;

    const now = new Date();
    let currentPeriodEnd: Date | null = null;
    let trialEndsAt: Date | null = null;

    if (tier === "PRO_MONTHLY") {
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      currentPeriodEnd = nextMonth;
      const trial = new Date(now);
      trial.setDate(trial.getDate() + 7);
      trialEndsAt = trial;
    } else if (tier === "PRO_ANNUAL") {
      const nextYear = new Date(now);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      currentPeriodEnd = nextYear;
      const trial = new Date(now);
      trial.setDate(trial.getDate() + 7);
      trialEndsAt = trial;
    } else if (tier === "FOUNDER_LIFETIME") {
      currentPeriodEnd = null; // No expiration
      trialEndsAt = null;
    }

    await this.prisma.subscription.upsert({
      where: { userId: internalId },
      create: {
        userId: internalId,
        tier: tier as any,
        status: trialEndsAt ? "TRIALING" : "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd,
        trialEndsAt,
        provider,
      },
      update: {
        tier: tier as any,
        status: trialEndsAt ? "TRIALING" : "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd,
        trialEndsAt,
        provider,
        cancelAtPeriodEnd: false,
      },
    });

    this.logger.log(`User ${userId} successfully upgraded to ${tier} via ${provider}`);
    return this.getUserEntitlements(userId);
  }

  async restorePurchases(userId: string): Promise<UserEntitlements> {
    this.logger.log(`Restoring purchases for user ${userId}`);
    return this.getUserEntitlements(userId);
  }

  async cancelSubscription(userId: string): Promise<UserEntitlements> {
    const resolvedUser = await this.resolveInternalUserId(userId);
    const internalId = resolvedUser ? resolvedUser.id : userId;

    await this.prisma.subscription.update({
      where: { userId: internalId },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    this.logger.log(`User ${userId} scheduled subscription cancellation at period end`);
    return this.getUserEntitlements(userId);
  }

  async handleWebhook(payload: BillingWebhookPayload): Promise<{ received: boolean }> {
    this.logger.log(`Received billing webhook event: ${payload.event} for user ${payload.userId}`);
    const resolvedUser = await this.resolveInternalUserId(payload.userId);
    const internalId = resolvedUser ? resolvedUser.id : payload.userId;

    if (payload.event === "SUBSCRIPTION_CREATED" || payload.event === "SUBSCRIPTION_RENEWED") {
      await this.prisma.subscription.upsert({
        where: { userId: internalId },
        create: {
          userId: internalId,
          tier: payload.tier as any,
          status: payload.status as any,
          currentPeriodEnd: payload.expiresAt ? new Date(payload.expiresAt) : null,
          provider: payload.provider,
          providerSubscriptionId: payload.providerSubscriptionId,
        },
        update: {
          tier: payload.tier as any,
          status: payload.status as any,
          currentPeriodEnd: payload.expiresAt ? new Date(payload.expiresAt) : null,
          providerSubscriptionId: payload.providerSubscriptionId,
        },
      });
    } else if (payload.event === "SUBSCRIPTION_CANCELED" || payload.event === "SUBSCRIPTION_EXPIRED") {
      await this.prisma.subscription.updateMany({
        where: { userId: internalId },
        data: {
          status: payload.status as any,
        },
      });
    }

    return { received: true };
  }

  private async resolveInternalUserId(userId: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { supabaseId: userId }],
      },
    });
  }
}
