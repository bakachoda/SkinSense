import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateFeedback } from "@skinsense/types";

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async createFeedback(supabaseId: string, data: CreateFeedback) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.prisma.feedback.create({
      data: {
        userId: user.id,
        type: data.type,
        content: data.content,
        screenshotUrl: data.screenshotUrl ?? null,
        appVersion: data.appVersion ?? null,
        osVersion: data.osVersion ?? null,
        deviceModel: data.deviceModel ?? null,
        logs: data.logs ?? null,
      },
    });
  }

  async getFeedbackForUser(supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.prisma.feedback.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  }
}
