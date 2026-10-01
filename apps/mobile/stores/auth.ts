import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

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
    await SecureStore.setItemAsync("access_token", access);
    await SecureStore.setItemAsync("refresh_token", refresh);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true, user: { email } });
  },

  clearTokens: async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    set({ accessToken: null, refreshToken: null, isAuthenticated: false, user: null });
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    set({ accessToken: null, refreshToken: null, isAuthenticated: false, user: null });
  },

  loadTokens: async () => {
    const access = await SecureStore.getItemAsync("access_token");
    const refresh = await SecureStore.getItemAsync("refresh_token");
    set({
      accessToken: access,
      refreshToken: refresh,
      isAuthenticated: !!access,
    });
  },
}));
