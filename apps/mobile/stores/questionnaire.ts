import { create } from "zustand";
import type { Questionnaire, SkinTypeType, SkinConcernType, AgeRangeType } from "@skinsense/types";

// Safe wrapper for MMKV in Expo Go / simulator / web
let storage: any = null;
try {
  const { MMKV } = require("react-native-mmkv");
  storage = new MMKV({ id: "skinsense-questionnaire" });
} catch {
  // Fallback in-memory storage if native MMKV is unavailable in bare dev client
  const memStore = new Map<string, string>();
  storage = {
    getString: (k: string) => memStore.get(k),
    set: (k: string, v: string) => memStore.set(k, v),
    delete: (k: string) => memStore.delete(k),
  };
}

const STORAGE_KEY = "user_questionnaire_v1";

interface QuestionnaireState {
  hasCompletedQuestionnaire: boolean;
  questionnaire: Questionnaire;
  setSkinType: (type: SkinTypeType) => void;
  toggleConcern: (concern: SkinConcernType) => void;
  toggleAllergy: (allergy: string) => void;
  addAllergy: (custom: string) => void;
  setAgeRange: (age: AgeRangeType) => void;
  setIsPregnant: (val: boolean) => void;
  completeQuestionnaire: () => void;
  resetQuestionnaire: () => void;
}

const DEFAULT_QUESTIONNAIRE: Questionnaire = {
  skinType: "COMBINATION",
  concerns: ["ACNE", "OILINESS"],
  allergies: [],
  ageRange: "TWENTIES",
  isPregnant: false,
};

function loadInitial(): { completed: boolean; data: Questionnaire } {
  try {
    const raw = storage.getString(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { completed: true, data: parsed };
    }
  } catch (e) {
    console.warn("Failed to read questionnaire from MMKV:", e);
  }
  return { completed: false, data: DEFAULT_QUESTIONNAIRE };
}

const initial = loadInitial();

export const useQuestionnaireStore = create<QuestionnaireState>((set, get) => ({
  hasCompletedQuestionnaire: initial.completed,
  questionnaire: initial.data,

  setSkinType: (skinType) => {
    const updated = { ...get().questionnaire, skinType };
    set({ questionnaire: updated });
    storage.set(STORAGE_KEY, JSON.stringify(updated));
  },

  toggleConcern: (concern) => {
    const current = get().questionnaire.concerns;
    let next: SkinConcernType[];
    if (current.includes(concern)) {
      if (current.length === 1) return; // Must keep at least 1 concern
      next = current.filter((c) => c !== concern);
    } else {
      if (current.length >= 3) {
        // Max 3 concerns: replace the oldest or ignore
        next = [...current.slice(1), concern];
      } else {
        next = [...current, concern];
      }
    }
    const updated = { ...get().questionnaire, concerns: next };
    set({ questionnaire: updated });
    storage.set(STORAGE_KEY, JSON.stringify(updated));
  },

  toggleAllergy: (allergy) => {
    const current = get().questionnaire.allergies;
    let next: string[];
    if (current.includes(allergy)) {
      next = current.filter((a) => a !== allergy);
    } else {
      next = [...current, allergy];
    }
    const updated = { ...get().questionnaire, allergies: next };
    set({ questionnaire: updated });
    storage.set(STORAGE_KEY, JSON.stringify(updated));
  },

  addAllergy: (custom) => {
    const trimmed = custom.trim();
    if (!trimmed) return;
    const current = get().questionnaire.allergies;
    if (!current.includes(trimmed)) {
      const updated = { ...get().questionnaire, allergies: [...current, trimmed] };
      set({ questionnaire: updated });
      storage.set(STORAGE_KEY, JSON.stringify(updated));
    }
  },

  setAgeRange: (ageRange) => {
    const updated = { ...get().questionnaire, ageRange };
    set({ questionnaire: updated });
    storage.set(STORAGE_KEY, JSON.stringify(updated));
  },

  setIsPregnant: (isPregnant) => {
    const updated = { ...get().questionnaire, isPregnant };
    set({ questionnaire: updated });
    storage.set(STORAGE_KEY, JSON.stringify(updated));
  },

  completeQuestionnaire: () => {
    set({ hasCompletedQuestionnaire: true });
    storage.set(STORAGE_KEY, JSON.stringify(get().questionnaire));
  },

  resetQuestionnaire: () => {
    set({
      hasCompletedQuestionnaire: false,
      questionnaire: DEFAULT_QUESTIONNAIRE,
    });
    storage.delete(STORAGE_KEY);
  },
}));
