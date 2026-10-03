import { useEffect } from "react";
import { create } from "zustand";
import { apiClient } from "./api-client";
import type { OfflineMutationType, OfflineQueueItem } from "@skinsense/types";

let storage: any = null;
try {
  const { MMKV } = require("react-native-mmkv");
  const probe = new MMKV({ id: "probe-test" });
  probe.set("k", "v");
  probe.delete("k");
  storage = new MMKV({ id: "skinsense-offline-mutations" });
} catch {
  const memStore = new Map<string, string>();
  storage = {
    getString: (k: string) => memStore.get(k),
    set: (k: string, v: string) => memStore.set(k, v),
    delete: (k: string) => memStore.delete(k),
  };
}

const OFFLINE_QUEUE_KEY = "offline_queue_v1";

interface OfflineSyncState {
  isOffline: boolean;
  queue: OfflineQueueItem[];
  isSyncing: boolean;
  lastSyncedAt: string | null;
  hasLoaded: boolean;
  loadQueue: () => void;
  saveQueue: (items: OfflineQueueItem[]) => void;
  flushQueue: () => Promise<void>;
  queueMutation: (type: OfflineMutationType, payload: any) => Promise<OfflineQueueItem>;
  toggleSimulateOffline: () => void;
  setIsOffline: (val: boolean) => void;
}

export const useOfflineSyncStore = create<OfflineSyncState>((set, get) => ({
  isOffline: false,
  queue: [],
  isSyncing: false,
  lastSyncedAt: null,
  hasLoaded: false,

  loadQueue: () => {
    try {
      const val = storage.getString(OFFLINE_QUEUE_KEY);
      if (val) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) set({ queue: parsed });
      }
    } catch {}
  },

  saveQueue: (items: OfflineQueueItem[]) => {
    set({ queue: items });
    try {
      storage.set(OFFLINE_QUEUE_KEY, JSON.stringify(items));
    } catch {}
  },

  flushQueue: async () => {
    const { isSyncing, queue, isOffline, saveQueue } = get();
    if (isSyncing || queue.length === 0 || isOffline) return;

    set({ isSyncing: true });
    try {
      const response = await apiClient.batchSyncOfflineItems(queue);
      if (response && response.syncedIds) {
        const syncedSet = new Set(response.syncedIds);
        const remaining = queue.filter((item) => !syncedSet.has(item.id));
        saveQueue(remaining);
        set({ lastSyncedAt: new Date().toLocaleTimeString() });
      }
    } catch (err) {
      console.warn("Offline sync retry deferred:", err);
    } finally {
      set({ isSyncing: false });
    }
  },

  queueMutation: async (type: OfflineMutationType, payload: any) => {
    const newItem: OfflineQueueItem = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: "QUEUED",
    };

    const updated = [...get().queue, newItem];
    get().saveQueue(updated);

    if (!get().isOffline) {
      setTimeout(() => get().flushQueue(), 500);
    }

    return newItem;
  },

  toggleSimulateOffline: () => {
    const next = !get().isOffline;
    set({ isOffline: next });
    if (!next) {
      setTimeout(() => get().flushQueue(), 300);
    }
  },

  setIsOffline: (val: boolean) => {
    set({ isOffline: val });
    if (!val) {
      setTimeout(() => get().flushQueue(), 300);
    }
  },
}));

export function useOfflineSync() {
  const store = useOfflineSyncStore();

  useEffect(() => {
    if (!store.hasLoaded) {
      useOfflineSyncStore.setState({ hasLoaded: true });
      store.loadQueue();
    }
  }, [store]);

  return {
    isOffline: store.isOffline,
    queuedCount: store.queue.length,
    isSyncing: store.isSyncing,
    lastSyncedAt: store.lastSyncedAt,
    queueMutation: store.queueMutation,
    flushQueue: store.flushQueue,
    toggleSimulateOffline: store.toggleSimulateOffline,
    setIsOffline: store.setIsOffline,
  };
}
