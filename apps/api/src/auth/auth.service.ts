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
}
