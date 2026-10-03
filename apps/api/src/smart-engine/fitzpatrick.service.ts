import { Injectable } from "@nestjs/common";
import type {
  FitzpatrickType,
  FitzpatrickResult,
} from "@skinsense/types";

export interface ToneDetectionThresholds {
  erythemaThreshold: number;
  erythemaMethod: "STANDARD_HSV_LAB" | "GREEN_BOOST" | "NARROWBAND_GREEN_CHROMATICITY";
  pigmentationLThreshold: number;
  textureMethod: "STANDARD_GABOR" | "MELANIN_DENSITY_ADJUSTED";
  referencePhotoBucket: string;
}

@Injectable()
export class FitzpatrickService {
  /**
   * Classify Fitzpatrick Skin Type (I - VI) from facial L*a*b* composite values
   * L* represents lightness (0 = pure black, 100 = diffuse white)
   */
  classifyTone(
    lMeanOrObj: number | { l: number; a: number; b: number },
    aMean?: number,
    bMean?: number,
  ): FitzpatrickResult & {
    erythemaThresholdModifier: number;
    useNarrowbandGreen: boolean;
    narrowbandGreenShift: number;
  } {
    let lMean: number;
    let aVal: number;
    let bVal: number;

    if (typeof lMeanOrObj === "object") {
      lMean = lMeanOrObj.l;
      aVal = lMeanOrObj.a;
      bVal = lMeanOrObj.b;
    } else {
      lMean = lMeanOrObj;
      aVal = aMean ?? 10;
      bVal = bMean ?? 12;
    }

    let category: FitzpatrickType;
    let confidence = 0.92;

    if (lMean >= 68) {
      category = 1;
    } else if (lMean >= 60) {
      category = 2;
    } else if (lMean >= 52) {
      category = 3;
    } else if (lMean >= 42) {
      category = 4;
    } else if (lMean >= 32) {
      category = 5;
    } else {
      category = 6;
    }

    const erythemaThresholdModifier = category <= 2 ? 0.85 : category <= 4 ? 1.0 : 1.25;
    const useNarrowbandGreen = category >= 5;
    const narrowbandGreenShift = category >= 5 ? 14 : 0;

    return {
      category,
      lMean,
      chromaticityA: aVal,
      chromaticityB: bVal,
      confidence,
      erythemaThresholdModifier,
      useNarrowbandGreen,
      narrowbandGreenShift,
    };
  }

  /**
   * Retrieve tone-specific detection thresholds and algorithmic routing
   */
  getToneThresholds(tone: FitzpatrickType): ToneDetectionThresholds {
    switch (tone) {
      case 1:
      case 2:
        return {
          erythemaThreshold: 22,
          erythemaMethod: "STANDARD_HSV_LAB",
          pigmentationLThreshold: 18, // faint spots visible at lower L*
          textureMethod: "STANDARD_GABOR",
          referencePhotoBucket: "fitzpatrick_i_ii",
        };
      case 3:
      case 4:
        return {
          erythemaThreshold: 26,
          erythemaMethod: "GREEN_BOOST",
          pigmentationLThreshold: 24,
          textureMethod: "STANDARD_GABOR",
          referencePhotoBucket: "fitzpatrick_iii_iv",
        };
      case 5:
      case 6:
      default:
        return {
          erythemaThreshold: 30,
          erythemaMethod: "NARROWBAND_GREEN_CHROMATICITY",
          pigmentationLThreshold: 32, // relative L* rather than absolute
          textureMethod: "MELANIN_DENSITY_ADJUSTED",
          referencePhotoBucket: "fitzpatrick_v_vi",
        };
    }
  }

  /**
   * Detect erythema on dark skin (Fitzpatrick V-VI) using narrow-band green channel
   * hemoglobin absorption and L*a*b* chromaticity shifts (Phase 4, Section 1.2)
   */
  detectErythemaDarkSkin(greenMean: number, aDev: number): number {
    // Hemoglobin strongly absorbs green light; redness manifests as green absorption dip
    const greenAbsorption = Math.max(0, 255 - greenMean);
    const score = aDev * 0.6 + greenAbsorption * 0.4;
    return Math.min(100, Math.max(0, Math.round(score * 0.5)));
  }
}
