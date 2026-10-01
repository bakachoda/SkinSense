import { Module } from "@nestjs/common";
import { ScanController } from "./scan.controller";
import { ScanService } from "./scan.service";
import { QueueModule } from "../queue/queue.module";
import { GatewayModule } from "../gateway/gateway.module";

@Module({
  imports: [QueueModule, GatewayModule],
  controllers: [ScanController],
  providers: [ScanService],
  exports: [ScanService],
})
export class ScanModule {}
