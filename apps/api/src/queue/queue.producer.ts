import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue } from "bullmq";
import type { ScanJobPayload } from "@skinsense/types";

@Injectable()
export class QueueProducer {
  constructor(@InjectQueue("scan-processing") private scanQueue: Queue) {}

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
}
