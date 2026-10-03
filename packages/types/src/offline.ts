import { z } from "zod";

// ──────────────────────────────────────────────
// Offline Mutation Types & Queue
// ──────────────────────────────────────────────

export const OfflineMutationTypeSchema = z.enum([
  "DIARY_ENTRY",
  "ROUTINE_STEP_TOGGLE",
  "SCAN_CACHE",
  "SCAN_FEEDBACK",
  "DAILY_CHECKIN",
  "PRODUCT_RATING",
  "ADHERENCE_LOG",
]);
export type OfflineMutationType = z.infer<typeof OfflineMutationTypeSchema>;

export const OfflineQueueItemSchema = z.object({
  id: z.string(),
  type: OfflineMutationTypeSchema,
  payload: z.record(z.string(), z.any()),
  createdAt: z.string(),
  retryCount: z.number().int().nonnegative().default(0),
  status: z.enum(["QUEUED", "SYNCING", "FAILED"]).default("QUEUED"),
});
export type OfflineQueueItem = z.infer<typeof OfflineQueueItemSchema>;

export const BatchSyncRequestSchema = z.object({
  userId: z.string().optional(),
  items: z.array(OfflineQueueItemSchema),
});
export type BatchSyncRequest = z.infer<typeof BatchSyncRequestSchema>;

export const BatchSyncResponseSchema = z.object({
  success: z.boolean(),
  syncedCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  syncedIds: z.array(z.string()),
  serverTimestamp: z.string(),
});
export type BatchSyncResponse = z.infer<typeof BatchSyncResponseSchema>;
