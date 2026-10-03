import { create } from "zustand";
import { DISCLAIMER_VERSION } from "@skinsense/types";

let storage: any = null;
try {
  const { MMKV } = require("react-native-mmkv");
  storage = new MMKV({ id: "skinsense-onboarding" });
} catch {
  const memStore = new Map<string, string>();
  storage = {
    getString: (k: string) => memStore.get(k),
    set: (k: string, v: string) => memStore.set(k, v),
    delete: (k: string) => memStore.delete(k),
  };
}

const STORAGE_KEY = "user_onboarding_v2";

interface OnboardingState {
  hasSeenWelcome: boolean;
  hasAcknowledgedDisclaimer: boolean;
  disclaimerVersion: number;
  permissionsCompleted: boolean;
  setHasSeenWelcome: (val: boolean) => void;
  acknowledgeDisclaimer: (version?: number) => void;
  setPermissionsCompleted: (val: boolean) => void;
  resetOnboarding: () => void;
}

function loadInitial(): {
  hasSeenWelcome: boolean;
  hasAcknowledgedDisclaimer: boolean;
  disclaimerVersion: number;
  permissionsCompleted: boolean;
} {
  try {
    const raw = storage.getString(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Re-prompt if disclaimer version bumped
      const disclaimerValid =
        parsed.hasAcknowledgedDisclaimer &&
        (parsed.disclaimerVersion ?? 1) >= DISCLAIMER_VERSION;
      return {
        hasSeenWelcome: parsed.hasSeenWelcome ?? false,
        hasAcknowledgedDisclaimer: disclaimerValid,
        disclaimerVersion: parsed.disclaimerVersion ?? DISCLAIMER_VERSION,
        permissionsCompleted: parsed.permissionsCompleted ?? false,
      };
    }
  } catch (e) {
    console.warn("Failed to load onboarding store:", e);
  }
  return {
    hasSeenWelcome: true,
    hasAcknowledgedDisclaimer: true,
    disclaimerVersion: DISCLAIMER_VERSION,
    permissionsCompleted: true,
  };
}

const initial = loadInitial();

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  hasSeenWelcome: initial.hasSeenWelcome,
  hasAcknowledgedDisclaimer: initial.hasAcknowledgedDisclaimer,
  disclaimerVersion: initial.disclaimerVersion,
  permissionsCompleted: initial.permissionsCompleted,

  setHasSeenWelcome: (hasSeenWelcome) => {
    set({ hasSeenWelcome });
    const current = get();
    storage.set(STORAGE_KEY, JSON.stringify(current));
  },

  acknowledgeDisclaimer: (version = DISCLAIMER_VERSION) => {
    set({ hasAcknowledgedDisclaimer: true, disclaimerVersion: version });
    const current = get();
    storage.set(STORAGE_KEY, JSON.stringify(current));
  },

  setPermissionsCompleted: (permissionsCompleted) => {
    set({ permissionsCompleted });
    const current = get();
    storage.set(STORAGE_KEY, JSON.stringify(current));
  },

  resetOnboarding: () => {
    set({
      hasSeenWelcome: false,
      hasAcknowledgedDisclaimer: false,
      disclaimerVersion: DISCLAIMER_VERSION,
      permissionsCompleted: false,
    });
    storage.delete(STORAGE_KEY);
  },
}));
