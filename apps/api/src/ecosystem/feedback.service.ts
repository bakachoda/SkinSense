import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  DiagnosticCorrection,
  TreatmentReconciliationResult,
} from "@skinsense/types";

export interface DiagnosisFeedbackSubmission {
  scanId: string;
  professionalDiagnosis: string;
  prescriptions: string[];
  consentToTraining: boolean;
}

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Captures dermatologist diagnosis after visit and triggers treatment reconciliation.
   */
  async submitDiagnosisFeedback(
    userId: string,
    submission: DiagnosisFeedbackSubmission,
  ): Promise<{
    correction: DiagnosticCorrection;
    reconciliation: TreatmentReconciliationResult;
  }> {
    // 1. Fetch scan to inspect AI differential
    const scan = await this.prisma.scan.findUnique({
      where: { id: submission.scanId },
      include: { result: true },
    });

    const systemDifferential =
      (scan?.result as any)?.differentialDiagnosis?.topCondition ||
      (scan?.result as any)?.zoneScores?.forehead?.acne > 40
        ? "Acne vulgaris"
        : "Healthy/Clear";

    // 2. Log diagnostic correction
    const record = await this.prisma.diagnosticCorrection.create({
      data: {
        userId,
        scanId: submission.scanId,
        systemDifferential,
        professionalDiagnosis: submission.professionalDiagnosis,
        prescriptions: submission.prescriptions,
        consentToTraining: submission.consentToTraining,
      },
    });

    // 3. Reconcile routine based on new prescriptions
    const reconciliation = await this.reconcileTreatments(userId, submission.prescriptions);

    return {
      correction: {
        id: record.id,
        userId: record.userId,
        scanId: record.scanId,
        systemDifferential: record.systemDifferential,
        professionalDiagnosis: record.professionalDiagnosis,
        prescriptions: record.prescriptions,
        consentToTraining: record.consentToTraining,
        createdAt: record.createdAt.toISOString(),
      },
      reconciliation,
    };
  }

  /**
   * Reconciles current OTC skincare routine with dermatologist prescriptions.
   */
  async reconcileTreatments(
    userId: string,
    prescriptions: string[],
  ): Promise<TreatmentReconciliationResult> {
    const rxLower = prescriptions.map((p) => p.toLowerCase());
    const otcRemoved: string[] = [];
    const otcAdjusted: Array<{ product: string; adjustment: string }> = [];

    let phasedIntroPaused = false;
    let pauseDurationWeeks = 0;
    const summaryPoints: string[] = [];

    // Add prescriptions to Medication list in DB
    for (const rx of prescriptions) {
      await this.prisma.medication.upsert({
        where: {
          id: `med-${userId}-${rx.toLowerCase().replace(/\s+/g, "_")}`,
        },
        create: {
          id: `med-${userId}-${rx.toLowerCase().replace(/\s+/g, "_")}`,
          userId,
          name: rx,
          restriction: rxLower.some((r) => r.includes("tretinoin") || r.includes("adapalene"))
            ? "NO_OTC_RETINOL"
            : rxLower.some((r) => r.includes("isotretinoin") || r.includes("accutane"))
              ? "MINIMAL_ROUTINE"
              : "NOTE_PHOTOSENSITIVITY",
          isActive: true,
        },
        update: {
          isActive: true,
        },
      });
    }

    // Prescription rule 1: Topical Retinoid (Tretinoin, Adapalene, Tazarotene)
    if (rxLower.some((r) => r.includes("tretinoin") || r.includes("adapalene") || r.includes("tazarotene"))) {
      otcRemoved.push("OTC Retinol / Retinaldehyde", "AHA / BHA Exfoliating Toners");
      otcAdjusted.push(
        { product: "Moisturizer", adjustment: "Prioritize ceramide & panthenol barrier support" },
        { product: "Sunscreen", adjustment: "Mandatory daily SPF 50+ due to increased photosensitivity" },
      );
      phasedIntroPaused = true;
      pauseDurationWeeks = 4;
      summaryPoints.push("Prescription retinoid overrides OTC retinol. Exfoliants paused for 4 weeks.");
    }

    // Prescription rule 2: Oral Isotretinoin (Accutane)
    if (rxLower.some((r) => r.includes("isotretinoin") || r.includes("accutane"))) {
      otcRemoved.push("All chemical exfoliants", "All active serums (Vit C, Retinol)", "Clay masks");
      otcAdjusted.push(
        { product: "Cleanser", adjustment: "Ultra-gentle non-foaming cream cleanser only" },
        { product: "Moisturizer", adjustment: "Heavy occlusive barrier balm applied twice daily" },
      );
      phasedIntroPaused = true;
      pauseDurationWeeks = 16;
      summaryPoints.push("Accutane protocol engaged: stripped routine down to ultra-gentle barrier protection.");
    }

    // Prescription rule 3: Metronidazole / Rosacea topicals
    if (rxLower.some((r) => r.includes("metronidazole") || r.includes("ivermectin") || r.includes("azelaic"))) {
      otcRemoved.push("Harsh physical scrubs", "Fragrance-containing serums");
      otcAdjusted.push({ product: "Soothing Serum", adjustment: "Centella / Madecassoside calming support" });
      phasedIntroPaused = true;
      pauseDurationWeeks = 2;
      summaryPoints.push("Anti-inflammatory rosacea protocol engaged.");
    }

    // If no specific override, standard 2-week adaptation pause
    if (!phasedIntroPaused && prescriptions.length > 0) {
      phasedIntroPaused = true;
      pauseDurationWeeks = 2;
      summaryPoints.push("Routine paused for 2 weeks to assess cutaneous tolerance to new medication.");
    }

    return {
      prescriptionsAdded: prescriptions,
      otcProductsRemoved: otcRemoved,
      otcProductsAdjusted: otcAdjusted,
      phasedIntroPaused,
      pauseDurationWeeks,
      reconciliationSummary: summaryPoints.join(" ") || "Routine successfully reconciled with prescriptions.",
    };
  }
}
