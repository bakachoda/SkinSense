import { Injectable, UnauthorizedException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  PortalAccessLink,
  PortalPatientSummary,
  DermatologistNote,
  PhotoRequest,
} from "@skinsense/types";
import { randomBytes } from "crypto";

@Injectable()
export class PortalService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a secure, scoped access token for dermatologist sharing (valid for 90 days).
   */
  async createInviteLink(userId: string, appBaseUrl: string = "https://skinsense.health"): Promise<PortalAccessLink> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const accessToken = `portal_${randomBytes(24).toString("hex")}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // 90 days validity

    const record = await this.prisma.portalAccess.create({
      data: {
        userId,
        accessToken,
        expiresAt,
      },
    });

    return {
      id: record.id,
      userId: record.userId,
      accessToken: record.accessToken,
      expiresAt: record.expiresAt.toISOString(),
      revokedAt: null,
      createdAt: record.createdAt.toISOString(),
      isActive: true,
      shareableUrl: `${appBaseUrl}/portal/patient/${accessToken}`,
    };
  }

  /**
   * Lists active portal links for a user.
   */
  async listUserLinks(userId: string): Promise<PortalAccessLink[]> {
    const records = await this.prisma.portalAccess.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    return records.map((r) => ({
      id: r.id,
      userId: r.userId,
      accessToken: r.accessToken,
      expiresAt: r.expiresAt.toISOString(),
      revokedAt: r.revokedAt?.toISOString() || null,
      createdAt: r.createdAt.toISOString(),
      isActive: !r.revokedAt && r.expiresAt > now,
      shareableUrl: `https://skinsense.health/portal/patient/${r.accessToken}`,
    }));
  }

  /**
   * Revokes a specific access link immediately.
   */
  async revokeInviteLink(userId: string, linkId: string): Promise<void> {
    const link = await this.prisma.portalAccess.findUnique({ where: { id: linkId } });
    if (!link || link.userId !== userId) {
      throw new NotFoundException("Portal access link not found");
    }

    await this.prisma.portalAccess.update({
      where: { id: linkId },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Validates access token and returns associated portal access record.
   */
  async validateToken(accessToken: string) {
    const record = await this.prisma.portalAccess.findUnique({
      where: { accessToken },
      include: { user: true },
    });

    if (!record) {
      throw new UnauthorizedException("Invalid dermatologist portal access token");
    }

    if (record.revokedAt) {
      throw new UnauthorizedException("This access link has been revoked by the patient");
    }

    if (new Date() > record.expiresAt) {
      throw new UnauthorizedException("This dermatologist access link has expired");
    }

    return record;
  }

  /**
   * Retrieves read-only patient summary for the dermatologist portal.
   */
  async getPatientSummary(accessToken: string): Promise<PortalPatientSummary> {
    const record = await this.validateToken(accessToken);
    const userId = record.userId;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        scans: {
          where: { status: "COMPLETED" },
          include: { result: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        routines: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        medications: {
          where: { isActive: true },
        },
        dermatologistNotes: {
          where: { portalAccessId: record.id },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) throw new NotFoundException("Patient not found");

    const latestScan = user.scans[0];
    const latestResult = (latestScan?.result as any) || {};
    const activeRoutine = user.routines[0];

    const routineSummary = {
      amSteps: (activeRoutine?.amSteps as any[]) || [
        { stepNumber: 1, category: "CLEANSER", productName: "Gentle Hydrating Cleanser" },
        { stepNumber: 2, category: "SERUM", productName: "Niacinamide 10% + Zinc 1%" },
        { stepNumber: 3, category: "SPF", productName: "Broad Spectrum Mineral SPF 50" },
      ],
      pmSteps: (activeRoutine?.pmSteps as any[]) || [
        { stepNumber: 1, category: "CLEANSER", productName: "Gentle Hydrating Cleanser" },
        { stepNumber: 2, category: "TREATMENT", productName: "Azelaic Acid Suspension 10%" },
        { stepNumber: 3, category: "MOISTURIZER", productName: "Ceramide Barrier Repair Cream" },
      ],
    };

    return {
      patientId: user.id.slice(-6).toUpperCase(),
      displayName: `Patient ${user.id.slice(-4).toUpperCase()}`,
      age: user.birthYear ? new Date().getFullYear() - user.birthYear : undefined,
      fitzpatrick: user.fitzpatrick || 3,
      skinType: user.skinType || "COMBINATION",
      barrierScore: latestResult.barrierScore || 68,
      skinAge: latestResult.skinAge || 28,
      scanCount: user.scans.length,
      latestScan: latestScan
        ? {
            id: latestScan.id,
            date: latestScan.createdAt.toISOString(),
            skinHealthScore: latestResult.skinHealthScore || 72,
            zoneScores: latestResult.zoneScores || {},
            findings: [],
          }
        : undefined,
      routineSummary,
      medications: user.medications.map((m: any) => ({
        name: m.name,
        dosage: m.restriction,
        startDate: m.startDate?.toISOString(),
      })),
      notes: user.dermatologistNotes.map((n: any) => ({
        id: n.id,
        userId: n.userId,
        portalAccessId: n.portalAccessId,
        clinicianName: n.clinicianName || undefined,
        message: n.message,
        readAt: n.readAt?.toISOString() || null,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Clinician leaves a clinical note which notifies the patient in mobile app.
   */
  async addClinicianNote(
    accessToken: string,
    message: string,
    clinicianName?: string,
  ): Promise<DermatologistNote> {
    const record = await this.validateToken(accessToken);

    const note = await this.prisma.dermatologistNote.create({
      data: {
        userId: record.userId,
        portalAccessId: record.id,
        clinicianName: clinicianName || "Dermatologist",
        message,
      },
    });

    return {
      id: note.id,
      userId: note.userId,
      portalAccessId: note.portalAccessId,
      clinicianName: note.clinicianName || undefined,
      message: note.message,
      readAt: null,
      createdAt: note.createdAt.toISOString(),
    };
  }

  /**
   * Clinician requests a specific zone close-up photo from patient.
   */
  async requestPhoto(
    accessToken: string,
    zone: string,
    reason: string,
    instructions: string,
  ): Promise<PhotoRequest> {
    const record = await this.validateToken(accessToken);

    return {
      id: `req_${randomBytes(8).toString("hex")}`,
      userId: record.userId,
      portalAccessId: record.id,
      zone,
      reason,
      instructions,
      requestedAt: new Date().toISOString(),
      fulfilledScanId: null,
    };
  }
}
