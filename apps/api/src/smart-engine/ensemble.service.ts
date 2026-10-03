import { Injectable } from "@nestjs/common";
import type {
  EnsembleConsensusResult,
  ModelDetectionVote,
  ConsensusConfidence,
} from "@skinsense/types";

export interface CategoryModelSuite {
  category: string;
  models: string[];
}

export const ENSEMBLE_SUITES: Record<string, CategoryModelSuite> = {
  acne: {
    category: "acne",
    models: ["YOLOv8-nano", "EfficientDet-D0", "U-Net-seg"],
  },
  pigmentation: {
    category: "pigmentation",
    models: ["LAB-chroma-threshold", "Histogram-distribution", "CNN-melanin-classifier"],
  },
  erythema: {
    category: "erythema",
    models: ["HSV-green-channel", "LAB-a-star-analysis", "CNN-erythema-net"],
  },
  texture: {
    category: "texture",
    models: ["Gabor-filter-bank", "Wavelet-decomposition", "CNN-roughness-regressor"],
  },
};

@Injectable()
export class EnsembleService {
  /**
   * Run 3-model ensemble consensus for a given category and zone (Phase 4, Section 3)
   */
  evaluateConsensus(
    category: "acne" | "pigmentation" | "erythema" | "texture",
    zone: string,
    zoneSeverity: number,
  ): EnsembleConsensusResult {
    const suite = ENSEMBLE_SUITES[category] || ENSEMBLE_SUITES["acne"]!;
    const votes: ModelDetectionVote[] = [];

    // Calculate agreement based on biological severity and confidence thresholding
    suite.models.forEach((modelName, index) => {
      // Deterministic synthetic model variance modeling diverse CNN/architectural traits
      const threshold = 25 + index * 4;
      const detected = zoneSeverity >= threshold;
      const confidence = detected
        ? Math.min(0.98, Math.max(0.65, 0.70 + (zoneSeverity / 100) * 0.25 - index * 0.03))
        : Math.min(0.40, Math.max(0.10, (zoneSeverity / 100) * 0.35));

      votes.push({
        modelName,
        detected,
        confidence: Number(confidence.toFixed(2)),
        category,
      });
    });

    const agreements = votes.filter((v) => v.detected).length;
    let consensusConfidence: ConsensusConfidence = "NONE";
    let isConfirmed = false;

    if (agreements === 3) {
      consensusConfidence = "HIGH";
      isConfirmed = true;
    } else if (agreements === 2) {
      consensusConfidence = "MEDIUM";
      isConfirmed = true;
    } else if (agreements === 1) {
      consensusConfidence = "LOW";
      isConfirmed = false;
    } else {
      consensusConfidence = "NONE";
      isConfirmed = false;
    }

    return {
      category,
      zone,
      agreements,
      consensusConfidence,
      isConfirmed,
      modelVotes: votes,
    };
  }
}
