import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RoutineVersionRecord } from "@skinsense/types";

@Injectable()
export class RoutineVersionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a snapshot of a routine version.
   */
  async recordVersion(
    userId: string,
    routineId: string,
    amSteps: any,
    pmSteps: any,
    changeReason: string,
  ): Promise<RoutineVersionRecord> {
    const latestVersion = await this.prisma.routineVersion.findFirst({
      where: { userId, routineId },
      orderBy: { version: "desc" },
    });

    const nextVersionNumber = (latestVersion?.version ?? 0) + 1;

    const record = await this.prisma.routineVersion.create({
      data: {
        userId,
        routineId,
        version: nextVersionNumber,
        amSteps,
        pmSteps,
        changeReason,
      },
    });

    return {
      id: record.id,
      userId: record.userId,
      routineId: record.routineId,
      version: record.version,
      amSteps: record.amSteps,
      pmSteps: record.pmSteps,
      changeReason: record.changeReason,
      changedAt: record.changedAt.toISOString(),
    };
  }

  /**
   * Retrieves full chronological version history for a routine.
   */
  async getHistory(userId: string, routineId: string): Promise<RoutineVersionRecord[]> {
    const versions = await this.prisma.routineVersion.findMany({
      where: { userId, routineId },
      orderBy: { version: "desc" },
    });

    return versions.map((v) => ({
      id: v.id,
      userId: v.userId,
      routineId: v.routineId,
      version: v.version,
      amSteps: v.amSteps,
      pmSteps: v.pmSteps,
      changeReason: v.changeReason,
      changedAt: v.changedAt.toISOString(),
    }));
  }
}
