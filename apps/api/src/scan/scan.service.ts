import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QueueProducer } from "../queue/queue.producer";
import type { CreateScanRequest } from "@skinsense/types";
import type { Prisma } from "@prisma/client";

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

    // Create the scan record in PENDING state
    const scan = await this.prisma.scan.create({
      data: {
        userId: user.id,
        imageKeys,
        questionnaire: data.questionnaire as unknown as Prisma.InputJsonValue,
        status: "PENDING",
      },
    });

    // Enqueue for background worker processing
    await this.queueProducer.enqueueScan({
      scanId: scan.id,
      userId: user.id,
      imageKey: key,
      questionnaire: data.questionnaire,
      modelVersion: "v1.0",
    });

    return {
      scanId: scan.id,
      status: "PENDING" as const,
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
        include: { result: true },
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
      include: { result: true },
    });

    if (!scan) {
      throw new NotFoundException("Scan not found");
    }

    return {
      scan,
      result: scan.result ?? undefined,
    };
  }

  async getResult(scanId: string) {
    const scan = await this.prisma.scan.findUnique({
      where: { id: scanId },
      include: { result: true },
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
    };
  }
}
