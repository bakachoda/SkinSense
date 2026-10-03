import { z } from "zod";

// ──────────────────────────────────────────────
// Subscription Tiers & Statuses
// ──────────────────────────────────────────────

export const SubscriptionTierSchema = z.enum([
  "FREE",
  "PRO_MONTHLY",
  "PRO_ANNUAL",
  "FOUNDER_LIFETIME",
]);
export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>;

export const SubscriptionStatusSchema = z.enum([
  "ACTIVE",
  "TRIALING",
  "PAST_DUE",
  "CANCELED",
  "EXPIRED",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

// ──────────────────────────────────────────────
// Entitlement Keys
// ──────────────────────────────────────────────

export const EntitlementKeySchema = z.enum([
  "UNLIMITED_SCANS",
  "ADVANCED_HEATMAPS",
  "CLINICAL_PDF_EXPORT",
  "DERM_PORTAL_SHARING",
  "FAMILY_PROFILES",
  "AUDIO_WALKTHROUGH",
  "BATHROOM_ROUTINE_CARD",
]);
export type EntitlementKey = z.infer<typeof EntitlementKeySchema>;

// ──────────────────────────────────────────────
// User Entitlements State
// ──────────────────────────────────────────────

export const UserEntitlementsSchema = z.object({
  userId: z.string(),
  tier: SubscriptionTierSchema,
  status: SubscriptionStatusSchema,
  expiresAt: z.string().nullable(),
  trialEndsAt: z.string().nullable(),
  scansUsedThisMonth: z.number().int().nonnegative(),
  maxScansPerMonth: z.number().int().nullable(), // null = unlimited
  scansRemainingThisMonth: z.number().int().nullable(), // null = unlimited
  entitlements: z.record(EntitlementKeySchema, z.boolean()),
});
export type UserEntitlements = z.infer<typeof UserEntitlementsSchema>;

// ──────────────────────────────────────────────
// Subscription Product Plans
// ──────────────────────────────────────────────

export const SubscriptionProductSchema = z.object({
  id: z.string(),
  tier: SubscriptionTierSchema,
  title: z.string(),
  subtitle: z.string(),
  price: z.string(),
  priceMonthlyEquivalent: z.string().nullable(),
  billingPeriod: z.enum(["month", "year", "lifetime"]),
  trialDays: z.number().int().nonnegative(),
  savingsBadge: z.string().nullable(),
  features: z.array(z.string()),
  isPopular: z.boolean().default(false),
});
export type SubscriptionProduct = z.infer<typeof SubscriptionProductSchema>;

// ──────────────────────────────────────────────
// Requests & Responses
// ──────────────────────────────────────────────

export const UpgradeSubscriptionRequestSchema = z.object({
  tier: SubscriptionTierSchema,
  provider: z.enum(["SANDBOX_TEST", "APPLE_IAP", "GOOGLE_PLAY", "REVENUECAT"]).default("SANDBOX_TEST"),
  receiptOrToken: z.string().optional(),
});
export type UpgradeSubscriptionRequest = z.infer<typeof UpgradeSubscriptionRequestSchema>;

export const RestorePurchasesResponseSchema = z.object({
  restored: z.boolean(),
  entitlements: UserEntitlementsSchema,
  message: z.string(),
});
export type RestorePurchasesResponse = z.infer<typeof RestorePurchasesResponseSchema>;

export const BillingWebhookPayloadSchema = z.object({
  event: z.enum([
    "SUBSCRIPTION_CREATED",
    "SUBSCRIPTION_RENEWED",
    "SUBSCRIPTION_CANCELED",
    "SUBSCRIPTION_EXPIRED",
    "PAYMENT_FAILED",
  ]),
  userId: z.string(),
  tier: SubscriptionTierSchema,
  status: SubscriptionStatusSchema,
  expiresAt: z.string().nullable(),
  provider: z.string(),
  providerSubscriptionId: z.string(),
  timestamp: z.string(),
});
export type BillingWebhookPayload = z.infer<typeof BillingWebhookPayloadSchema>;
