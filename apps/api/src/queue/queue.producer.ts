import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue } from "bullmq";
import type { ScanJobPayload } from "@skinsense/types";

@Injectable()
export class QueueProducer implements OnApplicationBootstrap {
  private readonly logger = new Logger(QueueProducer.name);

  constructor(
    @InjectQueue("scan-processing") private scanQueue: Queue,
    @InjectQueue("catalog-sync") private catalogQueue: Queue,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.scheduleWeeklyCatalogSync();
  }

  async enqueueScan(payload: ScanJobPayload): Promise<string> {
    const job = await this.scanQueue.add("process-scan", payload, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
    return job.id ?? "";
  }

  /**
   * Schedules automated weekly catalog synchronization
   * Cron: 0 2 * * 0 (Every Sunday at 02:00 AM UTC)
   */
  async scheduleWeeklyCatalogSync(): Promise<void> {
    try {
      await this.catalogQueue.add(
        "sync-catalog",
        {},
        {
          repeat: {
            pattern: "0 2 * * 0",
          },
          jobId: "weekly-indian-catalog-sync",
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      );
      this.logger.log("Weekly Indian Skincare catalog sync cron job registered (0 2 * * 0).");
    } catch (err: any) {
      this.logger.warn(`Could not schedule catalog sync job: ${err.message}`);
    }
  }

  /**
   * Manually trigger an immediate catalog sync job.
   */
  async triggerCatalogSync(): Promise<string> {
    const job = await this.catalogQueue.add(
      "sync-catalog",
      {},
      {
        jobId: `manual-sync-${Date.now()}`,
        attempts: 2,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      },
    );
    return job.id ?? "";
  }
}
