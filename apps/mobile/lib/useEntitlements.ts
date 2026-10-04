import { useEffect } from "react";
import { create } from "zustand";
import { apiClient } from "./api-client";
import type {
  UserEntitlements,
  SubscriptionTier,
  EntitlementKey,
  SubscriptionProduct,
} from "@skinsense/types";

const DEFAULT_FALLBACK_ENTITLEMENTS: UserEntitlements = {
  userId: "user-1",
  tier: "FREE",
  status: "ACTIVE",
  expiresAt: null,
  trialEndsAt: null,
  scansUsedThisMonth: 0,
  maxScansPerMonth: 3,
  scansRemainingThisMonth: 3,
  entitlements: {
    UNLIMITED_SCANS: false,
    ADVANCED_HEATMAPS: false,
    CLINICAL_PDF_EXPORT: false,
    DERM_PORTAL_SHARING: false,
    FAMILY_PROFILES: false,
    AUDIO_WALKTHROUGH: false,
    BATHROOM_ROUTINE_CARD: true,
  },
};

interface EntitlementsState {
  entitlements: UserEntitlements;
  plans: SubscriptionProduct[];
  loading: boolean;
  isUpgrading: boolean;
  hasLoaded: boolean;
  fetchEntitlements: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  hasEntitlement: (key: EntitlementKey) => boolean;
  upgrade: (tier: SubscriptionTier, provider?: string) => Promise<{ success: boolean; updated?: UserEntitlements; error?: string }>;
  restore: () => Promise<{ success: boolean; message?: string; error?: string }>;
}

export const useEntitlementsStore = create<EntitlementsState>((set, get) => ({
  entitlements: DEFAULT_FALLBACK_ENTITLEMENTS,
  plans: [],
  loading: false,
  isUpgrading: false,
  hasLoaded: false,

  fetchEntitlements: async () => {
    try {
      const data = await apiClient.getUserEntitlements();
      if (data && data.entitlements) {
        set({ entitlements: data });
      }
    } catch (err) {
      console.log("[Entitlements] Backend unreachable, using cached defaults");
    }
  },

  fetchPlans: async () => {
    try {
      const availablePlans = await apiClient.getSubscriptionPlans();
      if (Array.isArray(availablePlans)) {
        set({ plans: availablePlans });
      }
    } catch {}
  },

  hasEntitlement: (key: EntitlementKey): boolean => {
    return !!get().entitlements.entitlements[key];
  },

  upgrade: async (tier: SubscriptionTier, provider: string = "SANDBOX_TEST") => {
    set({ isUpgrading: true });
    try {
      const updated = await apiClient.upgradeSubscription(tier, provider);
      if (updated && updated.entitlements) {
        set({ entitlements: updated });
      }
      return { success: true, updated };
    } catch (err: any) {
      console.error("Upgrade failed:", err);
      return { success: false, error: err.message };
    } finally {
      set({ isUpgrading: false });
    }
  },

  restore: async () => {
    try {
      const result = await apiClient.restorePurchases();
      if (result && result.entitlements) {
        set({ entitlements: result.entitlements });
      }
      return { success: true, message: result?.message || "Restored" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
}));

export function useEntitlements() {
  const store = useEntitlementsStore();

  useEffect(() => {
    if (!store.hasLoaded) {
      useEntitlementsStore.setState({ hasLoaded: true });
      void store.fetchEntitlements();
      void store.fetchPlans();
    }
  }, [store]);

  return {
    entitlements: store.entitlements,
    tier: store.entitlements.tier,
    status: store.entitlements.status,
    scansRemaining: store.entitlements.scansRemainingThisMonth,
    maxScansPerMonth: store.entitlements.maxScansPerMonth,
    plans: store.plans,
    loading: store.loading,
    isUpgrading: store.isUpgrading,
    hasEntitlement: store.hasEntitlement,
    upgrade: store.upgrade,
    restore: store.restore,
    refresh: store.fetchEntitlements,
  };
}
