import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { QueueProducer } from "./queue.producer";
import { ScanProcessor } from "./processors/scan.processor";
import { GatewayModule } from "../gateway/gateway.module";
import { SmartEngineModule } from "../smart-engine/smart-engine.module";
import { HardwareModule } from "../hardware/hardware.module";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "scan-processing",
    }),
    GatewayModule,
    SmartEngineModule,
    HardwareModule,
  ],
  providers: [QueueProducer, ScanProcessor],
  exports: [QueueProducer],
})
export class QueueModule {}
