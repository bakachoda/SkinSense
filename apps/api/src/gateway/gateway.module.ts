import { Module } from "@nestjs/common";
import { ScanGateway } from "../scan/scan.gateway";

@Module({
  providers: [ScanGateway],
  exports: [ScanGateway],
})
export class GatewayModule {}
