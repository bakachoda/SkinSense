import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { DeviceProfilingService } from "./device-profiling.service";
import { LidarTopologyService } from "./lidar-topology.service";
import { PhotometricStereoService } from "./photometric-stereo.service";
import { RppgService } from "./rppg.service";
import { ElasticityService } from "./elasticity.service";
import { MultispectralService } from "./multispectral.service";
import { PredictionService } from "./prediction.service";
import type { DeviceCapabilities } from "@skinsense/types";

describe("Phase 5: Hardware & Advanced Capture Services", () => {
  let deviceProfilingService: DeviceProfilingService;
  let lidarTopologyService: LidarTopologyService;
  let photometricStereoService: PhotometricStereoService;
  let rppgService: RppgService;
  let elasticityService: ElasticityService;
  let multispectralService: MultispectralService;
  let predictionService: PredictionService;

  const mockPrisma = {
    deviceProfile: {
      upsert: jest.fn().mockResolvedValue({ id: "dp-123" }),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    prediction: {
      createMany: jest.fn().mockResolvedValue({ count: 3 }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  const flagshipCaps: DeviceCapabilities = {
    hasRAW: true,
    hasLiDAR: true,
    hasTrueDepth: true,
    hasMacro: true,
    hasTelephoto: true,
    hasUltrawide: true,
    hasMultiCam: true,
    has240fps: true,
    has120fps: true,
    has60fps: true,
    hasOIS: true,
    hasEIS: true,
    maxPhotoResolution: { width: 8064, height: 6048 },
    maxVideoResolution: { width: 3840, height: 2160 },
    nativeSensorResolution: { width: 8064, height: 6048 },
    hasGyroscope: true,
    hasAccelerometer: true,
    hasBarometer: true,
    hasNeuralEngine: true,
    hasNNAPI: false,
    maxDisplayBrightness: 2000,
    supportsWideColor: true,
    hardwareTier: "TIER_1_FLAGSHIP",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceProfilingService,
        LidarTopologyService,
        PhotometricStereoService,
        RppgService,
        ElasticityService,
        MultispectralService,
        PredictionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    deviceProfilingService = module.get<DeviceProfilingService>(DeviceProfilingService);
    lidarTopologyService = module.get<LidarTopologyService>(LidarTopologyService);
    photometricStereoService = module.get<PhotometricStereoService>(PhotometricStereoService);
    rppgService = module.get<RppgService>(RppgService);
    elasticityService = module.get<ElasticityService>(ElasticityService);
    multispectralService = module.get<MultispectralService>(MultispectralService);
    predictionService = module.get<PredictionService>(PredictionService);
  });

  describe("1. Device Profiling & Capability Detection", () => {
    it("should classify flagship hardware with LiDAR as TIER_1_FLAGSHIP", () => {
      const tier = deviceProfilingService.classifyHardwareTier(flagshipCaps);
      expect(tier).toBe("TIER_1_FLAGSHIP");
    });

    it("should classify mid-range device with RAW as TIER_2_MIDRANGE", () => {
      const midCaps: DeviceCapabilities = {
        ...flagshipCaps,
        hasLiDAR: false,
        hasTelephoto: false,
        has240fps: false,
        hasRAW: true,
      };
      const tier = deviceProfilingService.classifyHardwareTier(midCaps);
      expect(tier).toBe("TIER_2_MIDRANGE");
    });

    it("should classify budget device without advanced sensors as TIER_3_BUDGET", () => {
      const budgetCaps: DeviceCapabilities = {
        ...flagshipCaps,
        hasLiDAR: false,
        hasTrueDepth: false,
        hasMacro: false,
        hasTelephoto: false,
        hasRAW: false,
        has240fps: false,
        has120fps: false,
      };
      const tier = deviceProfilingService.classifyHardwareTier(budgetCaps);
      expect(tier).toBe("TIER_3_BUDGET");
    });

    it("should enforce minimum hardware camera resolution (>= 1080p)", () => {
      const lowResCaps: DeviceCapabilities = {
        ...flagshipCaps,
        maxPhotoResolution: { width: 1280, height: 720 },
      };
      const check = deviceProfilingService.meetsMinimumRequirements(lowResCaps);
      expect(check.supported).toBe(false);
      expect(check.reason).toContain("1080p");
    });

    it("should calibrate white balance 3x3 matrix and compute adaptive thresholds", async () => {
      const profile = await deviceProfilingService.calibrateDevice({
        deviceId: "test-device-uuid",
        osType: "ios",
        osVersion: "18.0",
        deviceModel: "iPhone16,2",
        capabilities: flagshipCaps,
        whiteReferencePatchRGB: [235, 230, 220],
      });

      expect(profile.whiteBalanceMatrix).toHaveLength(3);
      expect(profile.noiseFloorRGB[0]).toBeLessThan(0.02);
      expect(profile.dynamicRangeStops).toBeGreaterThan(12);

      const thresholds = deviceProfilingService.computeAdaptiveThresholds(profile);
      expect(thresholds.acneThreshold).toBeGreaterThan(0.69);
      expect(thresholds.erythemaThreshold).toBeGreaterThan(0.64);
    });
  });

  describe("2. 3D LiDAR & Topology Analysis", () => {
    it("should classify raised lesion when height exceeds +0.5mm", () => {
      const result = lidarTopologyService.classifyLesionTopology({
        hasDepthData: true,
        sampleDepthsMm: [278.2, 278.4, 278.1],
        surroundingDepthsMm: [280.0, 280.1, 279.9],
        zone: "left_cheek",
      });

      expect(result.classification).toBe("raised");
      expect(result.lesionHeightMm).toBeGreaterThan(0.5);
      expect(result.confidence).toBe(0.94);
    });

    it("should classify depressed scar when height is below -0.5mm", () => {
      const result = lidarTopologyService.classifyLesionTopology({
        hasDepthData: true,
        sampleDepthsMm: [281.2, 281.4, 281.1],
        surroundingDepthsMm: [280.0, 280.1, 279.9],
        zone: "left_cheek",
      });

      expect(result.classification).toBe("depressed");
      expect(result.lesionHeightMm).toBeLessThan(-0.5);
    });

    it("should evaluate nasal pore depth and congestion", () => {
      const poreAnalysis = lidarTopologyService.analyzePoreDepth("nose");
      expect(poreAnalysis.averageDepthMm).toBeCloseTo(0.35);
      expect(poreAnalysis.maxDepthMm).toBeGreaterThan(0.5);
      expect(poreAnalysis.congestionScore).toBeGreaterThan(5);
    });
  });

  describe("3. Photometric Stereo Reconstruction", () => {
    it("should compute surface normal deviation and detect early papules from gyro samples", () => {
      const result = photometricStereoService.reconstructSurfaceNormals(
        [
          { timestamp: 10, roll: 0.12, pitch: 0.05, yaw: 0.0 },
          { timestamp: 20, roll: -0.08, pitch: -0.06, yaw: 0.02 },
          { timestamp: 30, roll: 0.02, pitch: 0.09, yaw: -0.01 },
          { timestamp: 40, roll: -0.04, pitch: -0.02, yaw: 0.03 },
          { timestamp: 50, roll: 0.07, pitch: 0.01, yaw: -0.02 },
          { timestamp: 60, roll: 0.01, pitch: -0.08, yaw: 0.01 },
        ],
        60,
      );

      expect(result.meanNormalDeviation).toBeGreaterThan(0.2);
      expect(result.earlyPapulesCount).toBeGreaterThanOrEqual(1);
      expect(result.microTextureScore).toBeGreaterThan(50);
    });
  });

  describe("4. rPPG Blood Flow & Perfusion Analysis", () => {
    it("should detect resting cardiac frequency and classify active vs resolved inflammation", () => {
      const activeResult = rppgService.analyzePerfusion({
        hasVideo: true,
        lesionPixelSignals: [10.2, 10.5, 9.8],
        surroundingPixelSignals: [5.1, 5.3, 5.0],
      });

      expect(activeResult.peakBpm).toBe(72);
      expect(activeResult.inflammationStatus).toBe("active");
      expect(activeResult.subclinicalInflammationDetected).toBe(true);

      const resolvedResult = rppgService.analyzePerfusion({
        hasVideo: true,
        lesionPixelSignals: [5.5, 5.8, 5.4],
        surroundingPixelSignals: [5.0, 5.2, 5.1],
      });

      expect(resolvedResult.inflammationStatus).toBe("resolved");
    });

    it("should detect vascular rosacea pattern when cheek capillary index is elevated", () => {
      const rosaceaResult = rppgService.analyzePerfusion({
        hasVideo: true,
        isRosaceaSuspected: true,
        lesionPixelSignals: [12.0, 11.8],
        surroundingPixelSignals: [4.0, 4.2],
      });

      expect(rosaceaResult.isVascularRosaceaPattern).toBe(true);
      expect(rosaceaResult.capillaryDilationIndex).toBeGreaterThan(7.0);
    });
  });

  describe("5. 240fps Elasticity & Viscoelastic Recovery", () => {
    it("should grade young resilient skin as excellent (tau < 250ms)", () => {
      const result = elasticityService.analyzeElasticity({
        hasHighSpeedVideo: true,
        measuredTauForeheadMs: 220,
        measuredTauCheeksMs: 235,
        measuredTauUnderEyeMs: 245,
      });

      expect(result.overallGrade).toBe("excellent");
      expect(result.recoveryTimeMs).toBeLessThan(250);
      expect(result.firmnessScore).toBeGreaterThan(8.5);
    });

    it("should grade delayed snapback as fair/poor with lower firmness score", () => {
      const result = elasticityService.analyzeElasticity({
        hasHighSpeedVideo: true,
        measuredTauForeheadMs: 520,
        measuredTauCheeksMs: 560,
        measuredTauUnderEyeMs: 590,
      });

      expect(["fair", "poor"]).toContain(result.overallGrade);
      expect(result.firmnessScore).toBeLessThan(5.0);
    });
  });

  describe("6. Multispectral Screen Flash Analysis", () => {
    it("should isolate vascular, hemoglobin, melanin, and P. acnes porphyrin fluorescence", () => {
      const result = multispectralService.analyzeSpectralChannels({
        hasMultispectralFrames: true,
        redIntensity: 175,
        greenIntensity: 150,
        blueIntensity: 135,
        violetIntensity: 190,
        verticalPolarizedIntensity: 160,
        horizontalPolarizedIntensity: 100,
      });

      expect(result.redVascularSignal).toBeGreaterThan(80);
      expect(result.greenHemoglobinSignal).toBeGreaterThan(0);
      expect(result.violetBacteriaSignal).toBeGreaterThan(80);
      expect(result.bacteriaLevel).toBeGreaterThan(5.0);
      expect(result.depolarizationRatio).toBeCloseTo(1.6, 1); // Specular sebum reflection
    });
  });

  describe("7. Predictive Analytics", () => {
    it("should predict high breakout risk in 24-48h when bacteria and congestion are elevated", () => {
      const prediction = predictionService.predictBreakout({
        userId: "user-123",
        congestionScore: 8.2,
        bacteriaLevel: 7.5,
        oilinessTrend: 0.45,
      });

      expect(prediction.riskLevel).toBe("high");
      expect(prediction.timeframe).toBe("24-48 hours");
      expect(prediction.recommendation).toContain("Salicylic Acid");
      expect(prediction.triggerFactors.length).toBeGreaterThan(0);
    });

    it("should project cumulative sun damage trajectory to age 50, 60, and 70 via power law", () => {
      const trajectory = predictionService.projectSunDamage({
        userId: "user-123",
        userAge: 25,
        sunDamageScore: 30,
      });

      expect(trajectory.projectedAge50).toBeGreaterThan(30);
      expect(trajectory.projectedAge60).toBeGreaterThan(trajectory.projectedAge50);
      expect(trajectory.projectedAge70).toBeGreaterThan(trajectory.projectedAge60);
      expect(trajectory.message).toContain("SPF");
    });

    it("should forecast high dehydration risk in dry windy climate", () => {
      const forecast = predictionService.forecastDehydration({
        userId: "user-123",
        weather: {
          humidityPercent: 18,
          tempF: 92,
          windMph: 20,
        },
      });

      expect(forecast.riskLevel).toBe("high");
      expect(forecast.recommendation).toContain("ceramide");
    });
  });
});
