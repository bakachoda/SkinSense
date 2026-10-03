import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QueueProducer } from "../queue/queue.producer";
import type { CreateScanRequest, CreateSelfAssessment } from "@skinsense/types";
import { Prisma } from "@prisma/client";
import { crossReferenceFindings } from "./self-assessment";

@Injectable()
export class ScanService {
  constructor(
    private prisma: PrismaService,
    private queueProducer: QueueProducer,
  ) {}

  async create(supabaseId: string, data: CreateScanRequest) {
    let user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      // Auto-create or upsert minimal user record for demo / dev environments
      user = await this.prisma.user.create({
        data: {
          supabaseId,
          email: `${supabaseId}@skinsense.dev`,
          skinType: (data.questionnaire?.skinType as any) || "COMBINATION",
          allergies: data.questionnaire?.allergies || [],
          isPregnant: data.questionnaire?.isPregnant || false,
          ageRange: data.questionnaire?.ageRange || "TWENTIES",
          concerns: data.questionnaire?.concerns || [],
        },
      });
    }

    const key = data.imageKey || (data.imageKeys && data.imageKeys[0]) || "scans/default.jpg";
    const imageKeys = data.imageKeys && data.imageKeys.length > 0 ? data.imageKeys : [key];

    // Create the scan record in PENDING state with Phase 3 & Phase 5 attributes
    const scan = await this.prisma.scan.create({
      data: {
        userId: user.id,
        imageKeys,
        questionnaire: data.questionnaire as unknown as Prisma.InputJsonValue,
        status: "PENDING",
        captureMode: data.captureMode || "audio_guided",
        calibrationKey: data.calibrationKey,
        frameCount: data.frameCount || imageKeys.length,
        environmentScore: data.environmentScore || "green",
        physiologicalState: data.physiologicalState
          ? (data.physiologicalState as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        deviceCapabilities: (data as any).deviceCapabilities
          ? ((data as any).deviceCapabilities as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        rawFileUrl: (data as any).rawFileUrl,
        depthMapUrl: (data as any).depthMapUrl,
        pointCloudUrl: (data as any).pointCloudUrl,
        videoUrl: (data as any).videoUrl,
        gyroData: (data as any).gyroData
          ? ((data as any).gyroData as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        multispectralUrls: (data as any).multispectralUrls
          ? ((data as any).multispectralUrls as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });

    // Enqueue for background worker processing
    await this.queueProducer.enqueueScan({
      scanId: scan.id,
      userId: user.id,
      imageKey: key,
      imageKeys,
      calibrationKey: data.calibrationKey,
      captureMode: data.captureMode,
      environmentScore: data.environmentScore,
      physiologicalState: data.physiologicalState,
      questionnaire: data.questionnaire,
      modelVersion: "v1.0",
    });

    return {
      scanId: scan.id,
      status: "PENDING" as const,
    };
  }

  async submitSelfAssessment(scanId: string, data: CreateSelfAssessment) {
    const scan = await this.prisma.scan.findUnique({
      where: { id: scanId },
      include: { result: true },
    });

    if (!scan) {
      throw new NotFoundException("Scan not found");
    }

    // Upsert self-assessment
    const selfAssessment = await this.prisma.selfAssessment.upsert({
      where: { scanId },
      update: {
        selections: data.selections as unknown as Prisma.InputJsonValue,
        spotMarkers: data.spotMarkers as unknown as Prisma.InputJsonValue,
      },
      create: {
        scanId,
        selections: data.selections as unknown as Prisma.InputJsonValue,
        spotMarkers: data.spotMarkers as unknown as Prisma.InputJsonValue,
      },
    });

    // If scan result already produced, cross-reference immediately
    let updatedFindings = null;
    if (scan.result) {
      const currentFindings = (scan.result.findings as any[]) || [];
      const calibrated = crossReferenceFindings(
        currentFindings,
        data.selections as any,
        data.spotMarkers as any,
      );

      await this.prisma.scanResult.update({
        where: { id: scan.result.id },
        data: {
          findings: calibrated as unknown as Prisma.InputJsonValue,
        },
      });
      updatedFindings = calibrated;
    }

    return {
      selfAssessment,
      findings: updatedFindings,
    };
  }

  async findAllByUser(supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      return { scans: [], total: 0 };
    }

    const [scans, total] = await Promise.all([
      this.prisma.scan.findMany({
        where: { userId: user.id },
        include: { result: true, selfAssessment: true },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.scan.count({
        where: { userId: user.id },
      }),
    ]);

    return { scans, total };
  }

  async findOne(id: string) {
    const scan = await this.prisma.scan.findUnique({
      where: { id },
      include: { result: true, selfAssessment: true },
    });

    if (!scan) {
      throw new NotFoundException("Scan not found");
    }

    return {
      scan,
      result: scan.result ?? undefined,
      selfAssessment: scan.selfAssessment ?? undefined,
    };
  }

  async getResult(scanId: string) {
    const scan = await this.prisma.scan.findUnique({
      where: { id: scanId },
      include: { result: true, selfAssessment: true },
    });

    if (!scan) {
      throw new NotFoundException("Scan not found");
    }

    if (scan.status === "PENDING" || scan.status === "PROCESSING") {
      throw new ConflictException("Scan analysis is still in progress");
    }

    if (scan.status === "FAILED") {
      throw new BadRequestException("Scan analysis failed. Please retake photo and try again.");
    }

    if (!scan.result) {
      throw new NotFoundException("Scan result record not found");
    }

    return {
      result: scan.result,
      selfAssessment: scan.selfAssessment ?? undefined,
    };
  }
}

