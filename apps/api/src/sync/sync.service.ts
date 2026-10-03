import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type {
  BatchSyncRequest,
  BatchSyncResponse,
  OfflineQueueItem,
} from "@skinsense/types";

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processBatchSync(
    userId: string,
    request: BatchSyncRequest,
  ): Promise<BatchSyncResponse> {
    const resolvedUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { supabaseId: userId }],
      },
    });
    const internalUserId = resolvedUser ? resolvedUser.id : userId;

    const syncedIds: string[] = [];
    let failedCount = 0;

    for (const item of request.items) {
      try {
        await this.processItem(internalUserId, item);
        syncedIds.push(item.id);
      } catch (err: any) {
        this.logger.error(
          `Failed to sync offline item ${item.id} of type ${item.type}: ${err.message}`,
        );
        failedCount++;
      }
    }

    this.logger.log(
      `Batch sync completed for user ${userId}: ${syncedIds.length} synced, ${failedCount} failed`,
    );

    return {
      success: failedCount === 0,
      syncedCount: syncedIds.length,
      failedCount,
      syncedIds,
      serverTimestamp: new Date().toISOString(),
    };
  }

  private async processItem(userId: string, item: OfflineQueueItem) {
    if (item.type === "DIARY_ENTRY") {
      const { date, skinFeel, activeIrritation, symptoms, notes } = item.payload;
      const targetDate = date ? new Date(date) : new Date();
      targetDate.setHours(0, 0, 0, 0);

      const symptomArray = Array.isArray(symptoms) ? symptoms : [];

      await this.prisma.lifestyleLog.upsert({
        where: {
          userId_date: {
            userId,
            date: targetDate,
          },
        },
        create: {
          userId,
          date: targetDate,
          sleepHours: 7.0,
          waterGlasses: 8,
          stressLevel: skinFeel === "EXCESS_SEBUM" ? 4 : 2,
          exerciseMinutes: 30,
          sunExposureMinutes: 15,
          dietTags: symptomArray,
          notes: notes
            ? `[Skin Feel: ${skinFeel}] ${notes}`
            : `[Skin Feel: ${skinFeel}] Symptoms: ${symptomArray.join(", ")}`,
        },
        update: {
          stressLevel: skinFeel === "EXCESS_SEBUM" ? 4 : 2,
          dietTags: symptomArray,
          notes: notes
            ? `[Skin Feel: ${skinFeel}] ${notes}`
            : `[Skin Feel: ${skinFeel}] Symptoms: ${symptomArray.join(", ")}`,
        },
      });
    } else if (item.type === "ROUTINE_STEP_TOGGLE") {
      const { period, completed, routineId } = item.payload;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let targetRoutineId = routineId;
      if (!targetRoutineId) {
        const latestRoutine = await this.prisma.routine.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });
        targetRoutineId = latestRoutine?.id;
      }

      if (targetRoutineId) {
        const isAm = (period || "AM").toUpperCase() === "AM";
        await this.prisma.adherenceLog.upsert({
          where: {
            userId_routineId_date: {
              userId,
              routineId: targetRoutineId,
              date: today,
            },
          },
          create: {
            userId,
            routineId: targetRoutineId,
            date: today,
            amCompleted: isAm ? !!completed : false,
            pmCompleted: !isAm ? !!completed : false,
          },
          update: isAm
            ? { amCompleted: !!completed }
            : { pmCompleted: !!completed },
        });
      }
    } else if (item.type === "SCAN_CACHE") {
      this.logger.log(`Acknowledged offline scan cache entry ${item.id} for user ${userId}`);
    } else if (item.type === "SCAN_FEEDBACK") {
      this.logger.log(`Acknowledged offline scan feedback ${item.id} for user ${userId}`);
    } else if (item.type === "DAILY_CHECKIN") {
      this.logger.log(`Acknowledged offline daily check-in ${item.id} for user ${userId}`);
    } else if (item.type === "PRODUCT_RATING") {
      this.logger.log(`Acknowledged offline product rating ${item.id} for user ${userId}`);
    } else if (item.type === "ADHERENCE_LOG") {
      this.logger.log(`Acknowledged offline adherence log ${item.id} for user ${userId}`);
    } else {
      this.logger.warn(`Unknown offline mutation type for item ${item.id}: ${(item as any).type}`);
    }
  }
}
