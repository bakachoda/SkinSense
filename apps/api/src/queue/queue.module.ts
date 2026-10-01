import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { QueueProducer } from "./queue.producer";
import { ScanProcessor } from "./processors/scan.processor";
import { GatewayModule } from "../gateway/gateway.module";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "scan-processing",
    }),
    GatewayModule,
  ],
  providers: [QueueProducer, ScanProcessor],
  exports: [QueueProducer],
})
export class QueueModule {}
