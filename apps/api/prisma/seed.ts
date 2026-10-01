import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import { PrismaClient, SkinType } from "@prisma/client";
import { SEED_PRODUCTS } from "./products-data";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env["DATABASE_URL"],
    },
  },
});

async function main() {
  console.log("Starting database seed...");

  // 1. Seed or update test user
  const user = await prisma.user.upsert({
    where: { email: "test@skinsense.dev" },
    update: {
      ageRange: "TWENTIES",
      concerns: ["ACNE", "OILINESS", "REDNESS"],
    },
    create: {
      supabaseId: "test-supabase-id-000",
      email: "test@skinsense.dev",
      skinType: SkinType.COMBINATION,
      fitzpatrick: 3,
      birthYear: 1998,
      ageRange: "TWENTIES",
      concerns: ["ACNE", "OILINESS", "REDNESS"],
      allergies: ["Fragrance / Parfum"],
      isPregnant: false,
    },
  });
  console.log(`Seeded user: ${user.email} (${user.id})`);

  // 2. Clear existing products and seed 200 catalog products
  await prisma.product.deleteMany({});
  console.log(`Cleared existing products. Seeding ${SEED_PRODUCTS.length} curated products...`);

  for (const product of SEED_PRODUCTS) {
    await prisma.product.create({
      data: {
        name: product.name,
        brand: product.brand,
        category: product.category,
        skinTypes: product.skinTypes,
        concerns: product.concerns,
        ingredients: product.ingredients,
        activeIngredients: product.activeIngredients,
        priceTier: product.priceTier,
        imageUrl: product.imageUrl ?? null,
        purchaseUrl: product.purchaseUrl ?? null,
        isActive: true,
      },
    });
  }
  console.log(`Successfully seeded ${SEED_PRODUCTS.length} products across all categories.`);

  // 3. Clear existing scans & seed sample completed scan
  await prisma.adherenceLog.deleteMany({});
  await prisma.routine.deleteMany({});
  await prisma.scanResult.deleteMany({});
  await prisma.scan.deleteMany({});

  const scan = await prisma.scan.create({
    data: {
      userId: user.id,
      status: "COMPLETED",
      imageKeys: ["scans/test-user/sample-scan-001.jpg"],
      questionnaire: {
        skinType: "COMBINATION",
        concerns: ["ACNE", "OILINESS", "REDNESS"],
        allergies: ["Fragrance / Parfum"],
        ageRange: "TWENTIES",
        isPregnant: false,
      },
    },
  });

  const scanResult = await prisma.scanResult.create({
    data: {
      scanId: scan.id,
      version: 1,
      skinHealthScore: 72,
      zoneScores: {
        forehead: { acne: 45, redness: 20, pigmentation: 15, texture: 30, dryness: 10, oiliness: 55 },
        nose: { acne: 35, redness: 15, pigmentation: 10, texture: 40, dryness: 5, oiliness: 70 },
        left_cheek: { acne: 65, redness: 40, pigmentation: 20, texture: 25, dryness: 15, oiliness: 35 },
        right_cheek: { acne: 60, redness: 38, pigmentation: 22, texture: 25, dryness: 15, oiliness: 35 },
        chin: { acne: 50, redness: 25, pigmentation: 18, texture: 30, dryness: 10, oiliness: 45 },
        periorbital: { acne: 0, redness: 15, pigmentation: 35, texture: 15, dryness: 25, oiliness: 10 },
      },
      findings: [
        {
          id: "f-001",
          type: "papule",
          zone: "left_cheek",
          severity: 65,
          confidence: 0.92,
          boundingBox: { x: 0.35, y: 0.52, w: 0.08, h: 0.08 },
          description: "Inflammatory papule on left cheek",
        },
        {
          id: "f-002",
          type: "comedone",
          zone: "nose",
          severity: 45,
          confidence: 0.88,
          boundingBox: { x: 0.48, y: 0.45, w: 0.05, h: 0.05 },
          description: "Open comedones visible on nasal bridge",
        },
        {
          id: "f-003",
          type: "redness_patch",
          zone: "right_cheek",
          severity: 38,
          confidence: 0.85,
          boundingBox: { x: 0.62, y: 0.55, w: 0.12, h: 0.14 },
          description: "Mild erythema on right mid-cheek",
        },
      ],
      metadata: {
        modelVersion: "v1.0",
        processingTimeMs: 1240,
        imageQualityScore: 94,
        blurVariance: 182.5,
        exposureCheckPassed: true,
      },
      modelVersion: "v1.0",
      processingTimeMs: 1240,
    },
  });

  // 4. Seed Routine
  const routine = await prisma.routine.create({
    data: {
      userId: user.id,
      scanResultId: scanResult.id,
      version: 1,
      amSteps: [
        {
          order: 1,
          stepType: "CLEANSER",
          productId: "p-cleanser-1",
          productName: "Foaming Facial Cleanser",
          productBrand: "CeraVe",
          targetIngredients: ["Niacinamide", "Ceramides"],
          whyChosen: "Cleanses oil and strengthens barrier without stripping skin",
          applicationNote: "Massage gently with lukewarm water for 60 seconds",
        },
        {
          order: 2,
          stepType: "SERUM",
          productId: "p-serum-1",
          productName: "Niacinamide 10% + Zinc 1%",
          productBrand: "The Ordinary",
          targetIngredients: ["Niacinamide", "Zinc PCA"],
          whyChosen: "Targets active acne breakouts and regulates sebum production",
          applicationNote: "Apply 3-4 drops across entire face before moisturizer",
        },
        {
          order: 3,
          stepType: "MOISTURIZER",
          productId: "p-moisturizer-1",
          productName: "Hydro Boost Water Gel",
          productBrand: "Neutrogena",
          targetIngredients: ["Hyaluronic Acid"],
          whyChosen: "Lightweight hydration suitable for combination and oily zones",
          applicationNote: "Smooth evenly over face and neck",
        },
        {
          order: 4,
          stepType: "SPF",
          productId: "p-spf-1",
          productName: "Anthelios Clear Skin Dry Touch Sunscreen SPF 60",
          productBrand: "La Roche-Posay",
          targetIngredients: ["Perlite", "Silica"],
          whyChosen: "Broad spectrum protection with oil-absorbing matte finish",
          applicationNote: "Apply generously 15 minutes before sun exposure",
        },
      ],
      pmSteps: [
        {
          order: 1,
          stepType: "CLEANSER",
          productId: "p-cleanser-1",
          productName: "Foaming Facial Cleanser",
          productBrand: "CeraVe",
          targetIngredients: ["Niacinamide", "Ceramides"],
          whyChosen: "Removes SPF, pollution, and daily impurities",
          applicationNote: "Cleanse face thoroughly",
        },
        {
          order: 2,
          stepType: "TREATMENT",
          productId: "p-treatment-1",
          productName: "Salicylic Acid 2% Solution",
          productBrand: "The Ordinary",
          targetIngredients: ["Salicylic Acid"],
          whyChosen: "Exfoliates inside pore walls to clear inflammatory papules and comedones",
          applicationNote: "Apply small dot directly on blemish zones or thin layer over T-zone",
        },
        {
          order: 3,
          stepType: "MOISTURIZER",
          productId: "p-moisturizer-2",
          productName: "PM Facial Moisturizing Lotion",
          productBrand: "CeraVe",
          targetIngredients: ["Ceramides", "Niacinamide", "Hyaluronic Acid"],
          whyChosen: "Nighttime barrier restoration with ceramides and calming niacinamide",
          applicationNote: "Apply liberally to face and neck before bed",
        },
      ],
    },
  });

  console.log(`Seeded sample scan ${scan.id} and routine ${routine.id}.`);
  console.log("Database seed complete! ✨");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
