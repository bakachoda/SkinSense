import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoutineService {
  constructor(private prisma: PrismaService) {}

  async findByUserId(supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      return { routines: [], total: 0 };
    }

    const routines = await this.prisma.routine.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return { routines, total: routines.length };
  }

  async findLatest(supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      throw new NotFoundException("User profile not found");
    }

    const routine = await this.prisma.routine.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!routine) {
      throw new NotFoundException("No routine found for user. Complete a scan first.");
    }

    return { routine };
  }

  async findOne(id: string) {
    const routine = await this.prisma.routine.findUnique({
      where: { id },
    });

    if (!routine) {
      throw new NotFoundException("Routine not found");
    }

    return { routine };
  }
}
