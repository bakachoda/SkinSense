import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { QueueProducer } from "./queue.producer";
import { ScanProcessor } from "./processors/scan.processor";
import { CatalogSyncProcessor } from "./processors/catalog-sync.processor";
import { IndianSkincareScraperService } from "../product/scraper/indian-skincare.scraper";
import { GatewayModule } from "../gateway/gateway.module";
import { SmartEngineModule } from "../smart-engine/smart-engine.module";
import { HardwareModule } from "../hardware/hardware.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: "scan-processing",
      },
      {
        name: "catalog-sync",
      },
    ),
    GatewayModule,
    SmartEngineModule,
    HardwareModule,
    PrismaModule,
  ],
  providers: [
    QueueProducer,
    ScanProcessor,
    CatalogSyncProcessor,
    IndianSkincareScraperService,
  ],
  exports: [QueueProducer, IndianSkincareScraperService],
})
export class QueueModule {}
