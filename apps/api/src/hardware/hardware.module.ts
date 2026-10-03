import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { DeviceProfilingService } from "./device-profiling.service";
import { LidarTopologyService } from "./lidar-topology.service";
import { PhotometricStereoService } from "./photometric-stereo.service";
import { RppgService } from "./rppg.service";
import { ElasticityService } from "./elasticity.service";
import { MultispectralService } from "./multispectral.service";
import { PredictionService } from "./prediction.service";
import { HardwareController } from "./hardware.controller";

@Module({
  imports: [PrismaModule],
  controllers: [HardwareController],
  providers: [
    DeviceProfilingService,
    LidarTopologyService,
    PhotometricStereoService,
    RppgService,
    ElasticityService,
    MultispectralService,
    PredictionService,
  ],
  exports: [
    DeviceProfilingService,
    LidarTopologyService,
    PhotometricStereoService,
    RppgService,
    ElasticityService,
    MultispectralService,
    PredictionService,
  ],
})
export class HardwareModule {}
