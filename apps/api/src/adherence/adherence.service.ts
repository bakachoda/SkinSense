import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateAdherenceLog } from "@skinsense/types";

@Injectable()
export class AdherenceService {
  constructor(private prisma: PrismaService) {}

  async logAdherence(supabaseId: string, data: CreateAdherenceLog) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const logDate = new Date(data.date);

    const log = await this.prisma.adherenceLog.upsert({
      where: {
        userId_routineId_date: {
          userId: user.id,
          routineId: data.routineId,
          date: logDate,
        },
      },
      update: {
        amCompleted: data.amCompleted,
        pmCompleted: data.pmCompleted,
      },
      create: {
        userId: user.id,
        routineId: data.routineId,
        date: logDate,
        amCompleted: data.amCompleted,
        pmCompleted: data.pmCompleted,
      },
    });

    return { log };
  }

  async getLogs(supabaseId: string, from?: string, to?: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      return { logs: [] };
    }

    const where: any = { userId: user.id };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const logs = await this.prisma.adherenceLog.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return { logs };
  }
}
