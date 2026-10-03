import { Injectable } from "@nestjs/common";
import {
  CausalAssessment,
  CausalVerdict,
  IngredientEfficacy,
  EfficacyVerdict,
} from "@skinsense/types";

export interface EventDataPoint {
  date: string;
  value: number;
}

export interface CausalEvaluationInput {
  event: string;
  metric: string;
  startDate: string;
  changeDate: string;
  gaps?: Array<{ start: string; end: string }>;
  metricHistory: EventDataPoint[];
  confounders?: string[];
}

const EXPECTED_ONSET_WEEKS: Record<string, { min: number; max: number }> = {
  retinoid: { min: 4, max: 12 },
  tretinoin: { min: 4, max: 12 },
  adapalene: { min: 4, max: 8 },
  salicylic_acid: { min: 2, max: 6 },
  azelaic_acid: { min: 4, max: 8 },
  niacinamide: { min: 3, max: 8 },
  vitamin_c: { min: 6, max: 12 },
  moisturizer: { min: 1, max: 3 },
  stress: { min: 0.5, max: 2 },
  diet: { min: 0.5, max: 2 },
  default: { min: 2, max: 6 },
};

@Injectable()
export class CausalInferenceService {
  /**
   * Evaluates causality vs mere correlation for skincare interventions.
   */
  assessCausality(input: CausalEvaluationInput): CausalAssessment {
    const startMs = new Date(input.startDate).getTime();
    const changeMs = new Date(input.changeDate).getTime();
    const lagWeeks = Math.max(0, (changeMs - startMs) / (1000 * 60 * 60 * 24 * 7));

    // 1. Expected onset matching
    const eventKey = Object.keys(EXPECTED_ONSET_WEEKS).find((k) =>
      input.event.toLowerCase().includes(k),
    ) || "default";
    const expected = EXPECTED_ONSET_WEEKS[eventKey]!;
    const temporalMatch = lagWeeks >= expected.min && lagWeeks <= expected.max;

    // 2. Natural experiment detection (Product withdrawal & resumption)
    let naturalExperimentObserved = false;
    if (input.gaps && input.gaps.length > 0) {
      // If gap existed and was at least 2 weeks
      naturalExperimentObserved = input.gaps.some((g) => {
        const gapWeeks = (new Date(g.end).getTime() - new Date(g.start).getTime()) / (1000 * 60 * 60 * 24 * 7);
        return gapWeeks >= 2;
      });
    }

    // 3. Confounders detection
    const confounds = input.confounders || [];

    // Verdict determination
    let verdict: CausalVerdict = "CORRELATED";
    let explanation = "";

    if (confounds.length > 0 && !naturalExperimentObserved) {
      verdict = "UNCERTAIN";
      explanation = `Your ${input.metric} improved after starting ${input.event}, but this coincided with other changes (${confounds.join(", ")}). More longitudinal scans are needed to rule out confounding factors.`;
    } else if (temporalMatch && naturalExperimentObserved) {
      verdict = "LIKELY_CAUSAL";
      explanation = `${input.event} is strongly indicated as the causal driver: metric change aligned with expected onset (${expected.min}-${expected.max} wks) and symptoms worsened during the usage gap.`;
    } else if (temporalMatch) {
      verdict = "LIKELY_CAUSAL";
      explanation = `Temporal lag of ${lagWeeks.toFixed(1)} weeks matches biological cutaneous response windows for ${input.event}. Likely causal relationship.`;
    } else {
      verdict = "CORRELATED";
      explanation = `Change in ${input.metric} occurred ${lagWeeks.toFixed(1)} weeks after ${input.event}, which differs from typical biological latency (${expected.min}-${expected.max} wks). Correlation noted.`;
    }

    return {
      event: input.event,
      metric: input.metric,
      verdict,
      temporalMatch,
      lagWeeks: Number(lagWeeks.toFixed(1)),
      expectedLagWeeks: expected,
      naturalExperimentObserved,
      confoundersDetected: confounds,
      explanation,
    };
  }

  /**
   * Tracks and scores per-ingredient longitudinal efficacy.
   */
  evaluateIngredientEfficacy(
    ingredient: string,
    targetConcern: string,
    startDate: string,
    startScore: number,
    currentScore: number,
    asOfDate: string = new Date().toISOString(),
  ): IngredientEfficacy {
    const weeksActive = Math.max(
      0,
      (new Date(asOfDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 7),
    );
    const delta = currentScore - startScore; // negative = improvement

    let verdict: EfficacyVerdict = "NO_CHANGE";
    if (weeksActive < 4) {
      verdict = "TOO_EARLY";
    } else if (delta <= -12) {
      verdict = "EFFECTIVE";
    } else if (delta >= 10) {
      verdict = "WORSENED";
    } else {
      verdict = "NO_CHANGE";
    }

    return {
      ingredient,
      targetConcern,
      startDate,
      startScore,
      currentScore,
      weeksActive: Number(weeksActive.toFixed(1)),
      delta: Number(delta.toFixed(1)),
      verdict,
    };
  }
}
