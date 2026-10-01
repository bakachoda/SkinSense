import { supabase } from "./supabase";
import { useAuthStore } from "../stores/auth";

export function setupAuthListener() {
  supabase.auth.onAuthStateChange(async (_event, session) => {
    const store = useAuthStore.getState();

    if (session) {
      await store.setTokens(session.access_token, session.refresh_token);
    } else {
      await store.clearTokens();
    }
  });
}
