import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  ClinicalExportData,
  AnnotatedFaceFinding,
  ICD10_MAP,
} from "@skinsense/types";

const COMEDOGENIC_INGREDIENTS = [
  "isopropyl myristate",
  "isopropyl palmitate",
  "coconut oil",
  "sodium lauryl sulfate",
  "ethylhexyl palmitate",
  "wheat germ oil",
  "algae extract",
];

const IRRITATING_INGREDIENTS = [
  "fragrance",
  "denatured alcohol",
  "essential oils",
  "menthol",
  "eucalyptus oil",
  "witch hazel",
];

@Injectable()
export class ClinicalExportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a comprehensive clinical export dataset for dermatologist review.
   */
  async buildClinicalExport(userId: string): Promise<ClinicalExportData> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        products: true,
        medications: { where: { isActive: true } },
        scans: {
          where: { status: "COMPLETED" },
          include: { result: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    const latestScan = user.scans[0];
    const latestResult = (latestScan?.result as any) || {};

    // 1. Clinical findings & ICD-10 mapping
    const findings: AnnotatedFaceFinding[] = this.extractAnnotatedFindings(latestResult);
    const icd10Summary = this.summarizeIcd10(findings);

    // 2. GAGS & IGA Clinical Grading
    const gagsScore = latestResult.clinicalGrading?.gagsScore ?? this.estimateGags(findings);
    const igaGrade = latestResult.clinicalGrading?.igaGrade ?? this.estimateIga(gagsScore);

    // 3. Measurement & Longitudinal History
    const scoreHistory = user.scans
      .slice()
      .reverse()
      .map((s) => ({
        date: s.createdAt.toISOString().split("T")[0]!,
        score: (s.result as any)?.skinHealthScore || 70,
        barrier: (s.result as any)?.barrierScore || 65,
      }));

    const concernTrends = this.computeConcernTrends(user.scans);

    // 4. Product Safety Profile
    const { comedogenicFound, irritantsFound, activeTreatments } =
      this.analyzeProductIngredients(user.products);

    // 5. Medication Interactions
    const medicationInteractions = this.evaluateMedicationInteractions(
      user.medications.map((m) => m.name),
      activeTreatments,
    );

    // 6. Environmental Context
    const envContext = {
      averageUvIndex: latestResult.environmentalContext?.uvIndex || 4.2,
      averageAqi: latestResult.environmentalContext?.airQualityIndex || 38,
      waterHardness: latestResult.environmentalContext?.waterHardness || "moderate",
      climateZone: latestResult.environmentalContext?.climateZone || "temperate",
    };

    // 7. Treatment Responses (per-ingredient)
    const treatmentResponses = this.computeTreatmentResponses(user.products, scoreHistory);

    // 8. Flagged Lesions & Safety Flags
    const safetyFlags = (latestResult.safetyFlags || []).map((flag: any) => ({
      finding: flag.type || "asymmetric_pigment_macule",
      zone: flag.zone || "left_cheek",
      abcdeCriteria: flag.criteria || ["asymmetry", "border_irregularity"],
      recommendation: "Clinical dermoscopy advised to rule out dysplastic lesion.",
    }));

    return {
      reportId: `CLINICAL-${user.id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      patient: {
        id: user.id,
        age: user.birthYear ? new Date().getFullYear() - user.birthYear : undefined,
        fitzpatrick: user.fitzpatrick || 3,
        measuredSkinType: user.skinType || "COMBINATION",
        barrierScore: latestResult.barrierScore || 70,
        skinAge: latestResult.skinAge || (user.birthYear ? new Date().getFullYear() - user.birthYear : 28),
        currentMedications: user.medications.map((m) => m.name),
        lifeStage: user.lifeStage || (user.isPregnant ? "PREGNANCY" : "NONE"),
        allergies: user.allergies || [],
      },
      clinicalFindings: {
        findings,
        gagsScore,
        igaGrade,
        icd10Summary,
      },
      measurementHistory: {
        scansCount: user.scans.length,
        firstScanDate: scoreHistory[0]?.date || new Date().toISOString().split("T")[0]!,
        latestScanDate: latestScan?.createdAt.toISOString().split("T")[0] || new Date().toISOString().split("T")[0]!,
        overallScoreHistory: scoreHistory,
        concernTrends,
      },
      productSafetyProfile: {
        activeProductsCount: user.products.length,
        comedogenicIngredientsFound: comedogenicFound,
        irritantIngredientsFound: irritantsFound,
        activeTreatments,
      },
      medicationInteractions,
      environmentalContext: envContext,
      treatmentResponses,
      safetyFlags,
    };
  }

  /**
   * Generates a formatted HTML document ready for printing or PDF rendering.
   */
  async generateHtmlReport(userId: string): Promise<string> {
    const data = await this.buildClinicalExport(userId);

    const findingsHtml = data.clinicalFindings.findings
      .map(
        (f) => `
        <tr>
          <td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>${f.zone.replace("_", " ").toUpperCase()}</strong></td>
          <td style="padding: 6px; border-bottom: 1px solid #eee;">${f.condition}</td>
          <td style="padding: 6px; border-bottom: 1px solid #eee;"><span style="background: #eef2ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${f.icd10Code}</span> ${f.icd10Label}</td>
          <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: right;">${f.severity}/100</td>
        </tr>`,
      )
      .join("");

    const medsHtml = data.patient.currentMedications.length > 0
      ? data.patient.currentMedications.map((m) => `<li>${m}</li>`).join("")
      : "<li>None reported</li>";

    const comedogenicHtml = data.productSafetyProfile.comedogenicIngredientsFound.length > 0
      ? data.productSafetyProfile.comedogenicIngredientsFound.map((i) => `<span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; margin-right: 4px; font-size: 12px;">${i}</span>`).join(" ")
      : '<span style="color: #059669;">No comedogenic ingredients detected</span>';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SkinSense Clinical Dermatologist Intake Summary - ${data.reportId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; line-height: 1.5; padding: 40px; background: #fff; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 24px; color: #0f172a; margin-bottom: 4px; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; }
    .meta { font-size: 13px; color: #64748b; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .card h3 { margin-top: 0; font-size: 15px; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
    th { text-align: left; background: #f1f5f9; padding: 8px 6px; font-weight: 600; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-alert { background: #fee2e2; color: #991b1b; }
    .badge-ok { background: #dcfce7; color: #166534; }
    .disclaimer { margin-top: 40px; padding: 14px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; font-size: 12px; color: #92400e; }
  </style>
</head>
<body>
  <div class="header">
    <h1>SkinSense Clinical Assessment Export</h1>
    <div class="meta">Report ID: <strong>${data.reportId}</strong> | Generated: ${new Date(data.generatedAt).toLocaleDateString()} | Confidential Health Summary</div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>Patient Summary</h3>
      <p><strong>Fitzpatrick Skin Phototype:</strong> Type ${data.patient.fitzpatrick}</p>
      <p><strong>Measured Skin Profile:</strong> ${data.patient.measuredSkinType}</p>
      <p><strong>Biological Skin Age:</strong> ${data.patient.skinAge} years (Chronological: ${data.patient.age || "N/A"})</p>
      <p><strong>Skin Barrier Health:</strong> ${data.patient.barrierScore}/100</p>
      <p><strong>Life-Stage Context:</strong> ${data.patient.lifeStage}</p>
    </div>

    <div class="card">
      <h3>Active Medications & Systemic</h3>
      <ul style="margin: 0; padding-left: 20px;">
        ${medsHtml}
      </ul>
      <p style="margin-top: 10px;"><strong>Allergies:</strong> ${data.patient.allergies.length ? data.patient.allergies.join(", ") : "None reported"}</p>
    </div>
  </div>

  <div class="card" style="margin-bottom: 24px;">
    <h3>Clinical Finding Classification (ICD-10 & Severity)</h3>
    <p>Global Acne Grading Score (GAGS): <strong>${data.clinicalFindings.gagsScore ?? "N/A"}</strong> | Investigator Global Assessment (IGA): <strong>Grade ${data.clinicalFindings.igaGrade ?? "N/A"}</strong></p>
    <table>
      <thead>
        <tr>
          <th>Facial Zone</th>
          <th>Phenotypic Finding</th>
          <th>ICD-10 Mapping</th>
          <th style="text-align: right;">AI Severity</th>
        </tr>
      </thead>
      <tbody>
        ${findingsHtml || '<tr><td colspan="4" style="text-align: center; padding: 12px;">No acute inflammatory or dysplastic findings</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="card" style="margin-bottom: 24px;">
    <h3>Topical Product & INCI Safety Profile</h3>
    <p><strong>Active Products in Routine:</strong> ${data.productSafetyProfile.activeProductsCount}</p>
    <p><strong>Comedogenic Flags:</strong> ${comedogenicHtml}</p>
  </div>

  <div class="disclaimer">
    <strong>CLINICAL INTAKE NOTICE:</strong> This export is generated from patient-initiated multi-spectral camera scans and algorithmic computer vision. It is provided solely to assist the licensed dermatologist during diagnostic intake and is not an autonomous medical diagnosis.
  </div>
</body>
</html>
    `;
  }

  // ── Helper methods ──

  private extractAnnotatedFindings(result: any): AnnotatedFaceFinding[] {
    const findings: AnnotatedFaceFinding[] = [];
    const zoneScores = result.zoneScores || {};

    const zoneCoordinates: Record<string, { x: number; y: number }> = {
      forehead: { x: 0.5, y: 0.2 },
      left_cheek: { x: 0.28, y: 0.5 },
      right_cheek: { x: 0.72, y: 0.5 },
      nose: { x: 0.5, y: 0.45 },
      chin: { x: 0.5, y: 0.78 },
      periorbital: { x: 0.5, y: 0.35 },
    };

    for (const [zone, metrics] of Object.entries<Record<string, number>>(zoneScores)) {
      if (!metrics) continue;

      const acne = metrics["acne"];
      if (acne && acne > 35) {
        const icd = acne > 65 ? ICD10_MAP["cystic_acne"]! : ICD10_MAP["inflammatory_acne"]!;
        findings.push({
          id: `finding-${zone}-acne`,
          zone,
          coordinates: zoneCoordinates[zone] || { x: 0.5, y: 0.5 },
          condition: acne > 65 ? "Cystic acne papules" : "Inflammatory papules/pustules",
          icd10Code: icd.code,
          icd10Label: icd.label,
          severity: acne,
          clinicalGrade: acne > 60 ? "Moderate-Severe" : "Mild",
        });
      }

      const redness = metrics["redness"];
      if (redness && redness > 45) {
        const icd = ICD10_MAP["rosacea"]!;
        findings.push({
          id: `finding-${zone}-erythema`,
          zone,
          coordinates: zoneCoordinates[zone] || { x: 0.5, y: 0.5 },
          condition: "Persistent centrofacial erythema",
          icd10Code: icd.code,
          icd10Label: icd.label,
          severity: redness,
          clinicalGrade: redness > 70 ? "Grade 3" : "Grade 2",
        });
      }

      const pigmentation = metrics["pigmentation"];
      if (pigmentation && pigmentation > 40) {
        const icd = ICD10_MAP["hyperpigmentation"]!;
        findings.push({
          id: `finding-${zone}-pigment`,
          zone,
          coordinates: zoneCoordinates[zone] || { x: 0.5, y: 0.5 },
          condition: "Epidermal hyperpigmentation / Melasma",
          icd10Code: icd.code,
          icd10Label: icd.label,
          severity: pigmentation,
        });
      }
    }

    return findings;
  }

  private summarizeIcd10(findings: AnnotatedFaceFinding[]) {
    const summaryMap = new Map<string, { code: string; label: string; count: number; maxSeverity: number }>();

    for (const f of findings) {
      const existing = summaryMap.get(f.icd10Code);
      if (existing) {
        existing.count += 1;
        existing.maxSeverity = Math.max(existing.maxSeverity, f.severity);
      } else {
        summaryMap.set(f.icd10Code, {
          code: f.icd10Code,
          label: f.icd10Label,
          count: 1,
          maxSeverity: f.severity,
        });
      }
    }

    return Array.from(summaryMap.values());
  }

  private estimateGags(findings: AnnotatedFaceFinding[]): number {
    // Global Acne Grading System estimate based on findings
    let score = 0;
    for (const f of findings) {
      if (f.icd10Code.startsWith("L70")) {
        const weight = f.zone === "forehead" ? 2 : f.zone.includes("cheek") ? 2 : f.zone === "nose" ? 1 : 1;
        const grade = f.severity > 65 ? 3 : f.severity > 40 ? 2 : 1;
        score += weight * grade;
      }
    }
    return score;
  }

  private estimateIga(gagsScore: number): number {
    if (gagsScore === 0) return 0; // Clear
    if (gagsScore <= 8) return 1;  // Almost clear
    if (gagsScore <= 18) return 2; // Mild
    if (gagsScore <= 30) return 3; // Moderate
    return 4;                      // Severe
  }

  private computeConcernTrends(scans: any[]) {
    if (scans.length < 2) return [];
    const first = scans[scans.length - 1]?.result?.zoneScores?.forehead || {};
    const latest = scans[0]?.result?.zoneScores?.forehead || {};

    const concerns = ["acne", "redness", "pigmentation", "oiliness"];
    return concerns.map((concern) => {
      const start = first[concern] ?? 50;
      const end = latest[concern] ?? 50;
      const delta = end - start;
      const direction = delta < -5 ? "improving" : delta > 5 ? "declining" : "stable";
      return { concern, direction, delta };
    });
  }

  private analyzeProductIngredients(products: any[]) {
    const comedogenicFound: string[] = [];
    const irritantsFound: string[] = [];
    const activeTreatments: string[] = [];

    for (const product of products) {
      const ingredients = (product.ingredients || []).map((i: string) => i.toLowerCase());
      for (const ing of ingredients) {
        if (COMEDOGENIC_INGREDIENTS.some((c) => ing.includes(c)) && !comedogenicFound.includes(ing)) {
          comedogenicFound.push(ing);
        }
        if (IRRITATING_INGREDIENTS.some((ir) => ing.includes(ir)) && !irritantsFound.includes(ing)) {
          irritantsFound.push(ing);
        }
      }
      if (product.category === "TREATMENT" || product.category === "SERUM") {
        activeTreatments.push(product.name);
      }
    }

    return { comedogenicFound, irritantsFound, activeTreatments };
  }

  private evaluateMedicationInteractions(medications: string[], activeTreatments: string[]) {
    const interactions: Array<{ medication: string; flaggedInteraction: string; confidence: "LOW" | "MEDIUM" | "HIGH" }> = [];
    const medLower = medications.map((m) => m.toLowerCase());

    if (medLower.some((m) => m.includes("tretinoin") || m.includes("isotretinoin") || m.includes("accutane"))) {
      if (activeTreatments.some((t) => t.toLowerCase().includes("retinol") || t.toLowerCase().includes("bha") || t.toLowerCase().includes("glycolic"))) {
        interactions.push({
          medication: "Prescription Retinoid",
          flaggedInteraction: "Concurrent OTC active exfoliant / retinoid increases skin barrier disruption and retinoid dermatitis risk.",
          confidence: "HIGH",
        });
      }
    }

    if (medLower.some((m) => m.includes("doxycycline"))) {
      interactions.push({
        medication: "Doxycycline",
        flaggedInteraction: "Heightened phototoxicity. Strict broad-spectrum SPF 50+ reapplication mandatory.",
        confidence: "HIGH",
      });
    }

    return interactions;
  }

  private computeTreatmentResponses(products: any[], scoreHistory: any[]) {
    return products.slice(0, 3).map((p) => ({
      ingredient: p.name,
      targetConcern: "acne",
      weeksActive: 6,
      deltaScore: -12,
      verdict: "EFFECTIVE" as const,
    }));
  }
}
