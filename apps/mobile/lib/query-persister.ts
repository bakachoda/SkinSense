import { MMKV } from "react-native-mmkv";
import type { Persister, PersistedClient } from "@tanstack/react-query-persist-client";

const storage = new MMKV({ id: "skinsense-query-cache" });

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
