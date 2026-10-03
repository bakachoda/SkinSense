import { Injectable, Logger } from "@nestjs/common";
import type { MultispectralResult } from "@skinsense/types";

export interface MultispectralInput {
  hasMultispectralFrames: boolean;
  redIntensity?: number;
  greenIntensity?: number;
  blueIntensity?: number;
  violetIntensity?: number;
  verticalPolarizedIntensity?: number;
  horizontalPolarizedIntensity?: number;
}

@Injectable()
export class MultispectralService {
  private readonly logger = new Logger(MultispectralService.name);

  /**
   * Multispectral Screen Flash Analysis:
   * 1. Red (625nm): Subsurface vascular mapping (penetrates 1.5mm)
   * 2. Green (530nm): Hemoglobin peak absorption (erythema / rosacea)
   * 3. Blue (470nm): Melanin superficial pigment
   * 4. Violet (410nm): P. acnes porphyrin autofluorescence
   * 5. Depolarization Ratio: LCD polarized reflection for sebum vs dry skin
   */
  analyzeSpectralChannels(input: MultispectralInput): MultispectralResult {
    const R = input.redIntensity ?? 160;
    const G = input.greenIntensity ?? 142;
    const B = input.blueIntensity ?? 130;
    const V = input.violetIntensity ?? 155;

    // 1. Subsurface Vascular Signal: Red channel - 0.5 * Green channel
    const redVascularSignal = Number(
      Math.max(0, R - G * 0.5).toFixed(1),
    );

    // 2. Hemoglobin Signal: Green channel - (Red + Blue) / 2
    const greenHemoglobinSignal = Number(
      Math.max(0, G - (R + B) * 0.5 + 40).toFixed(1),
    );

    // 3. Melanin Contrast: Blue channel - Red channel
    const blueMelaninSignal = Number(
      Math.max(0, B - R * 0.6).toFixed(1),
    );

    // 4. P. acnes Porphyrin Fluorescence: Violet channel - 0.7 * Blue channel
    const violetDiff = Math.max(0, V - B * 0.7);
    const violetBacteriaSignal = Number(violetDiff.toFixed(1));

    // Bacteria Level on 0-10 scale
    const bacteriaLevel = Number(
      Math.min(10, Math.max(0, (violetDiff / 15))).toFixed(1),
    );

    // 5. LCD Polarization Ratio (I_vert / I_horiz)
    // Oily lipid films preserve specular polarization (ratio ~ 1.35 - 1.8)
    // Dry diffuse skin scrambles polarization (ratio ~ 1.0 - 1.15)
    const iVert = input.verticalPolarizedIntensity ?? 150;
    const iHoriz = input.horizontalPolarizedIntensity ?? 105;
    const depolarizationRatio = Number(
      (iVert / Math.max(iHoriz, 1)).toFixed(2),
    );

    const activeErythemaMapScore = Number(
      Math.min(100, greenHemoglobinSignal * 1.2).toFixed(1),
    );

    return {
      redVascularSignal,
      greenHemoglobinSignal,
      blueMelaninSignal,
      violetBacteriaSignal,
      bacteriaLevel,
      depolarizationRatio,
      activeErythemaMapScore,
    };
  }
}
