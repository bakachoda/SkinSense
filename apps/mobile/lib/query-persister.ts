import type { Persister, PersistedClient } from "@tanstack/react-query-persist-client";

let storage: any = null;
try {
  const { MMKV } = require("react-native-mmkv");
  storage = new MMKV({ id: "skinsense-query-cache" });
} catch {
  const memStore = new Map<string, string>();
  storage = {
    getString: (k: string) => memStore.get(k),
    set: (k: string, v: string) => memStore.set(k, v),
    delete: (k: string) => memStore.delete(k),
  };
}

export const mmkvPersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    storage.set("query-client", JSON.stringify(client));
  },
  restoreClient: async () => {
    const data = storage.getString("query-client");
    return data ? (JSON.parse(data) as PersistedClient) : undefined;
  },
  removeClient: async () => {
    storage.delete("query-client");
  },
};
