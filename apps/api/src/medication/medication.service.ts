import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const KNOWN_MEDICATION_RESTRICTIONS: Record<string, string> = {
  accutane: "MINIMAL_ROUTINE",
  isotretinoin: "MINIMAL_ROUTINE",
  tretinoin: "NO_OTC_RETINOL",
  "retin-a": "NO_OTC_RETINOL",
  differin: "NO_OTC_RETINOL",
  adapalene: "NO_OTC_RETINOL",
  doxycycline: "NOTE_PHOTOSENSITIVITY",
  minocycline: "NOTE_PHOTOSENSITIVITY",
  hydrocortisone: "MONITOR_THINNING",
  triamcinolone: "MONITOR_THINNING",
};

@Injectable()
export class MedicationService {
  constructor(private prisma: PrismaService) {}

  async addMedication(supabaseId: string, data: { name: string; startDate?: string }) {
    let user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          supabaseId,
          email: `${supabaseId}@skinsense.dev`,
        },
      });
    }

    const nameLower = data.name.toLowerCase();
    let restriction = "NONE";
    for (const [medKey, rest] of Object.entries(KNOWN_MEDICATION_RESTRICTIONS)) {
      if (nameLower.includes(medKey)) {
        restriction = rest;
        break;
      }
    }

    const medication = await this.prisma.medication.create({
      data: {
        userId: user.id,
        name: data.name,
        restriction,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        isActive: true,
      },
    });

    return { medication };
  }

  async getMedications(supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) return { medications: [] };

    const medications = await this.prisma.medication.findMany({
      where: { userId: user.id },
      orderBy: { startDate: "desc" },
    });

    return { medications };
  }

  async deleteMedication(supabaseId: string, id: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) return { success: false };

    await this.prisma.medication.deleteMany({
      where: { id, userId: user.id },
    });

    return { success: true };
  }
}
