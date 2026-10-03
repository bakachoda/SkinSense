import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  DataExportBundle,
  DataResidencyRegion,
  AppProfileData,
} from "@skinsense/types";
import { randomBytes } from "crypto";

@Injectable()
export class DataPrivacyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a GDPR Article 20 compliant data export bundle manifest.
   */
  async generateDataExport(userId: string): Promise<DataExportBundle> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        scans: true,
        routines: true,
        products: true,
        medications: true,
        adherenceLogs: true,
        lifestyleLogs: true,
        achievements: true,
        profiles: true,
      },
    });

    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const filesIncluded = [
      "profile.json",
      "scans.json",
      "products.json",
      "medications.json",
      "routines.json",
      "adherence.json",
      "lifestyle.json",
      "achievements.json",
      "profiles.json",
    ];

    const exportId = `exp_${randomBytes(12).toString("hex")}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days download window

    return {
      exportId,
      generatedAt: new Date().toISOString(),
      dataRegion: (user.dataRegion as DataResidencyRegion) || "US",
      filesIncluded,
      downloadUrl: `https://api.skinsense.health/api/export/${exportId}/download`,
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * Permanently hard-deletes user account and all associated personal health data (GDPR Right to Erasure).
   */
  async deleteAccount(userId: string): Promise<{ deleted: boolean; deletedAt: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    // Cascade delete user in Prisma
    await this.prisma.user.delete({ where: { id: userId } });

    return {
      deleted: true,
      deletedAt: new Date().toISOString(),
    };
  }

  /**
   * Updates user's storage data residency region (US, EU, APAC).
   */
  async setDataRegion(userId: string, region: DataResidencyRegion): Promise<{ dataRegion: string }> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { dataRegion: region },
    });

    return { dataRegion: user.dataRegion };
  }

  // ──────────────────────────────────────────────
  // Multi-Profile Management
  // ──────────────────────────────────────────────

  async createProfile(
    userId: string,
    displayName: string,
    avatarUri?: string,
    biometricLockEnabled: boolean = false,
  ): Promise<AppProfileData> {
    const profile = await this.prisma.appProfile.create({
      data: {
        userId,
        displayName,
        avatarUri,
        isDefault: false,
        biometricLockEnabled,
      },
    });

    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      avatarUri: profile.avatarUri,
      isDefault: profile.isDefault,
      biometricLockEnabled: profile.biometricLockEnabled,
      createdAt: profile.createdAt.toISOString(),
    };
  }

  async listProfiles(userId: string): Promise<AppProfileData[]> {
    const profiles = await this.prisma.appProfile.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return profiles.map((p) => ({
      id: p.id,
      userId: p.userId,
      displayName: p.displayName,
      avatarUri: p.avatarUri,
      isDefault: p.isDefault,
      biometricLockEnabled: p.biometricLockEnabled,
      createdAt: p.createdAt.toISOString(),
    }));
  }

  async switchProfile(userId: string, profileId: string): Promise<{ activeProfileId: string }> {
    const profile = await this.prisma.appProfile.findUnique({ where: { id: profileId } });
    if (!profile || profile.userId !== userId) {
      throw new NotFoundException("Profile not found");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { activeProfileId: profileId },
    });

    return { activeProfileId: profileId };
  }

  async deleteProfile(userId: string, profileId: string): Promise<void> {
    const profile = await this.prisma.appProfile.findUnique({ where: { id: profileId } });
    if (!profile || profile.userId !== userId) {
      throw new NotFoundException("Profile not found");
    }

    await this.prisma.appProfile.delete({ where: { id: profileId } });
  }
}
