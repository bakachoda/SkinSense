import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { UpdateProfile } from "@skinsense/types";
import type { SkinType } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUser(supabaseId: string, email: string) {
    return this.prisma.user.upsert({
      where: { supabaseId },
      update: {},
      create: {
        supabaseId,
        email,
      },
    });
  }

  async getUserBySupabaseId(supabaseId: string) {
    return this.prisma.user.findUnique({
      where: { supabaseId },
    });
  }

  async updateProfile(supabaseId: string, data: UpdateProfile) {
    const updateData: any = {};
    if (data.skinType !== undefined) updateData.skinType = data.skinType as SkinType;
    if (data.concerns !== undefined) updateData.concerns = data.concerns;
    if (data.allergies !== undefined) updateData.allergies = data.allergies;
    if (data.ageRange !== undefined) updateData.ageRange = data.ageRange;
    if (data.isPregnant !== undefined) updateData.isPregnant = data.isPregnant;

    return this.prisma.user.update({
      where: { supabaseId },
      data: updateData,
    });
  }

  async acknowledgeDisclaimer(supabaseId: string, version: number) {
    return this.prisma.user.update({
      where: { supabaseId },
      data: {
        disclaimerAcknowledgedAt: new Date(),
        disclaimerVersion: version,
      },
    });
  }

  async updateNotificationPreferences(
    supabaseId: string,
    prefs: {
      amReminderEnabled?: boolean;
      pmReminderEnabled?: boolean;
      scanReminderEnabled?: boolean;
    },
  ) {
    return this.prisma.user.update({
      where: { supabaseId },
      data: prefs,
    });
  }

  async exportUserData(supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      include: {
        scans: {
          include: {
            result: true,
          },
        },
        routines: true,
        adherenceLogs: true,
        feedbacks: true,
      },
    });

    if (!user) return null;

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        skinType: user.skinType,
        fitzpatrick: user.fitzpatrick,
        concerns: user.concerns,
        allergies: user.allergies,
        isPregnant: user.isPregnant,
        disclaimerAcknowledgedAt: user.disclaimerAcknowledgedAt,
        disclaimerVersion: user.disclaimerVersion,
        createdAt: user.createdAt,
      },
      scans: user.scans,
      routines: user.routines,
      adherenceLogs: user.adherenceLogs,
      feedbacks: user.feedbacks,
    };
  }

  async deleteUserData(supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true },
    });

    if (!user) return false;

    // Delete scans, routines, adherence logs, feedback
    await this.prisma.$transaction([
      this.prisma.adherenceLog.deleteMany({ where: { userId: user.id } }),
      this.prisma.routine.deleteMany({ where: { userId: user.id } }),
      this.prisma.scan.deleteMany({ where: { userId: user.id } }),
      this.prisma.feedback.deleteMany({ where: { userId: user.id } }),
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          skinType: null,
          concerns: [],
          allergies: [],
          isPregnant: false,
          disclaimerAcknowledgedAt: null,
          disclaimerVersion: null,
        },
      }),
    ]);

    return true;
  }

  async deleteUserAccount(supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true },
    });

    if (!user) return false;

    await this.prisma.user.delete({
      where: { id: user.id },
    });

    return true;
  }
}

