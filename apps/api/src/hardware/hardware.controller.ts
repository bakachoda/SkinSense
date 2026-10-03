import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { DeviceProfilingService } from "./device-profiling.service";
import { LidarTopologyService } from "./lidar-topology.service";
import { PhotometricStereoService } from "./photometric-stereo.service";
import { RppgService } from "./rppg.service";
import { ElasticityService } from "./elasticity.service";
import { MultispectralService } from "./multispectral.service";
import { PredictionService } from "./prediction.service";
import type { DeviceCapabilities } from "@skinsense/types";

@Controller("hardware")
export class HardwareController {
  constructor(
    private deviceProfilingService: DeviceProfilingService,
    private lidarTopologyService: LidarTopologyService,
    private photometricStereoService: PhotometricStereoService,
    private rppgService: RppgService,
    private elasticityService: ElasticityService,
    private multispectralService: MultispectralService,
    private predictionService: PredictionService,
  ) {}

  @Post("device-profile")
  @HttpCode(HttpStatus.OK)
  async calibrateDevice(@Body() body: any) {
    const profile = await this.deviceProfilingService.calibrateDevice(body);
    const thresholds = this.deviceProfilingService.computeAdaptiveThresholds(profile);
    return {
      profile,
      adaptiveThresholds: thresholds,
    };
  }

  @Get("device-profile/:deviceId")
  async getDeviceProfile(@Param("deviceId") deviceId: string) {
    const profile = await this.deviceProfilingService.getProfile(deviceId);
    if (!profile) {
      return { profile: null };
    }
    const thresholds = this.deviceProfilingService.computeAdaptiveThresholds(profile);
    return {
      profile,
      adaptiveThresholds: thresholds,
    };
  }

  @Post("capabilities-audit")
  @HttpCode(HttpStatus.OK)
  auditCapabilities(@Body() caps: DeviceCapabilities) {
    const tier = this.deviceProfilingService.classifyHardwareTier(caps);
    const minimumCheck = this.deviceProfilingService.meetsMinimumRequirements(caps);

    return {
      tier,
      meetsMinimum: minimumCheck.supported,
      reason: minimumCheck.reason,
      supportedModes: {
        raw: caps.hasRAW,
        lidar: caps.hasLiDAR,
        trueDepth: caps.hasTrueDepth,
        macro: caps.hasMacro,
        telephoto: caps.hasTelephoto,
        highSpeed240fps: caps.has240fps,
        photometricStereo: true, // Universal fallback supported on all devices
        multispectral: true, // Supported via screen flash
        rppg: true, // Supported via standard/high-speed video
      },
      fallbackGuidance: {
        depth: caps.hasLiDAR
          ? "LiDAR active (0.5mm precision)"
          : caps.hasTrueDepth
          ? "TrueDepth active (1.0mm precision)"
          : "Photometric stereo fallback active",
        macro: caps.hasMacro
          ? "Dedicated macro lens (2-4cm distance)"
          : "Subpixel digital enhancement active",
        elasticity: caps.has240fps
          ? "240fps High-Speed capture active"
          : caps.has120fps
          ? "120fps capture active"
          : "60fps standard optical flow fallback",
      },
    };
  }

  @Post("predictions")
  @HttpCode(HttpStatus.OK)
  async createPredictions(@Body() body: any) {
    return this.predictionService.generatePredictions(body);
  }

  @Get("predictions/user/:userId")
  async getUserPredictions(@Param("userId") userId: string) {
    return this.predictionService.getUserPredictions(userId);
  }

  @Get("sample-analysis")
  getSampleAdvancedAnalysis(@Query("mode") mode?: string) {
    const topology = this.lidarTopologyService.classifyLesionTopology({
      hasDepthData: mode === "lidar",
      zone: "left_cheek",
    });

    const photometric = this.photometricStereoService.reconstructSurfaceNormals(
      [
        { timestamp: 100, roll: 0.08, pitch: 0.02, yaw: 0.0 },
        { timestamp: 200, roll: -0.06, pitch: 0.04, yaw: 0.02 },
        { timestamp: 300, roll: 0.02, pitch: -0.07, yaw: -0.01 },
      ],
      30,
    );

    const rppg = this.rppgService.analyzePerfusion({
      hasVideo: true,
      videoFps: 60,
      durationSeconds: 5,
    });

    const elasticity = this.elasticityService.analyzeElasticity({
      hasHighSpeedVideo: true,
      userAge: 26,
    });

    const multispectral = this.multispectralService.analyzeSpectralChannels({
      hasMultispectralFrames: true,
    });

    return {
      captureMode: mode || "standard",
      topology,
      photometric,
      rppg,
      elasticity,
      multispectral,
    };
  }
}
