import { create } from "zustand";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const memStore = new Map<string, string>();

async function getStoredValue(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      const storage = (globalThis as any).localStorage;
      return storage ? storage.getItem(key) : memStore.get(key) || null;
    } catch {
      return memStore.get(key) || null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return memStore.get(key) || null;
  }
}

async function setStoredValue(key: string, value: string): Promise<void> {
  memStore.set(key, value);
  if (Platform.OS === "web") {
    try {
      const storage = (globalThis as any).localStorage;
      if (storage) {
        storage.setItem(key, value);
      }
    } catch {}
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {}
}

async function deleteStoredValue(key: string): Promise<void> {
  memStore.delete(key);
  if (Platform.OS === "web") {
    try {
      const storage = (globalThis as any).localStorage;
      if (storage) {
        storage.removeItem(key);
      }
    } catch {}
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {}
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: { email: string } | null;

  setTokens: (access: string, refresh: string, email?: string) => Promise<void>;
  clearTokens: () => Promise<void>;
  signOut: () => Promise<void>;
  loadTokens: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  user: { email: "dev@skinsense.io" },

  setTokens: async (access, refresh, email = "dev@skinsense.io") => {
    await setStoredValue("access_token", access);
    await setStoredValue("refresh_token", refresh);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true, user: { email } });
  },

  clearTokens: async () => {
    await deleteStoredValue("access_token");
    await deleteStoredValue("refresh_token");
    set({ accessToken: null, refreshToken: null, isAuthenticated: false, user: null });
  },

  signOut: async () => {
    await deleteStoredValue("access_token");
    await deleteStoredValue("refresh_token");
    set({ accessToken: null, refreshToken: null, isAuthenticated: false, user: null });
  },

  loadTokens: async () => {
    const access = await getStoredValue("access_token");
    const refresh = await getStoredValue("refresh_token");
    set({
      accessToken: access,
      refreshToken: refresh,
      isAuthenticated: !!access,
    });
  },
}));
