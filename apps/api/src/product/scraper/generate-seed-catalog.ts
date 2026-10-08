import * as fs from "fs";
import * as path from "path";
import { IndianSkincareScraperService, ScrapedProduct } from "./indian-skincare.scraper";

async function main() {
  console.log("Starting Indian Skincare Catalog generation...");
  const scraper = new IndianSkincareScraperService();
  const products = await scraper.scrapeAllBrands();

  console.log(`Total scraped candidates: ${products.length}`);

  // Count by category
  const byCategory: Record<string, ScrapedProduct[]> = {};
  for (const p of products) {
    const list = byCategory[p.category] ?? [];
    list.push(p);
    byCategory[p.category] = list;
  }

  for (const [cat, list] of Object.entries(byCategory)) {
    console.log(`- ${cat}: ${list.length} products`);
  }

  // Deduplicate and select balanced collection of 200+ products
  // Ensure every category has strong representation
  const selected: ScrapedProduct[] = [];
  const maxPerCat = 50; // Target ~200-250 total products

  for (const [cat, list] of Object.entries(byCategory)) {
    // Sort so items with actives and images are prioritized
    const sorted = [...list].sort((a, b) => {
      const aScore = (a.activeIngredients.length > 0 ? 2 : 0) + (a.imageUrl ? 1 : 0);
      const bScore = (b.activeIngredients.length > 0 ? 2 : 0) + (b.imageUrl ? 1 : 0);
      return bScore - aScore;
    });

    const chosen = sorted.slice(0, maxPerCat);
    selected.push(...chosen);
    console.log(`Selected ${chosen.length} products for ${cat}`);
  }

  console.log(`Total chosen curated Indian products: ${selected.length}`);

  // Generate TypeScript code for products-data.ts
  const tsContent = `import { ProductCategory, SkinType, SkinConcern, PriceTier } from "@skinsense/types";

export interface SeedProduct {
  name: string;
  brand: string;
  category: ProductCategory;
  skinTypes: SkinType[];
  concerns: SkinConcern[];
  ingredients: string[];
  activeIngredients: { name: string; concentration?: string }[];
  priceTier: PriceTier;
  imageUrl?: string;
  purchaseUrl?: string;
}

/**
 * Authentic Indian Skincare Catalog scraped directly from official brand storefronts
 * Brands: Minimalist, The Derma Co, Dot & Key, Plum Goodness, Dr. Sheth's, Deconstruct
 * Prices strictly reflect official site INR pricing.
 */
export const SEED_PRODUCTS: SeedProduct[] = ${JSON.stringify(
    selected.map((p) => ({
      name: p.name,
      brand: p.brand,
      category: p.category,
      skinTypes: p.skinTypes,
      concerns: p.concerns,
      ingredients: p.ingredients,
      activeIngredients: p.activeIngredients,
      priceTier: p.priceTier,
      imageUrl: p.imageUrl,
      purchaseUrl: p.purchaseUrl,
    })),
    null,
    2,
  )
    .replace(/"category": "([^"]+)"/g, 'category: ProductCategory.$1')
    .replace(/"skinTypes": \[\s*([\s\S]*?)\s*\]/g, (match) => {
      return match.replace(/"(OILY|DRY|COMBINATION|NORMAL|SENSITIVE)"/g, "SkinType.$1");
    })
    .replace(/"concerns": \[\s*([\s\S]*?)\s*\]/g, (match) => {
      return match.replace(
        /"(ACNE|REDNESS|PIGMENTATION|DRYNESS|FINE_LINES|OILINESS|SENSITIVITY|TEXTURE)"/g,
        "SkinConcern.$1",
      );
    })
    .replace(/"priceTier": "([^"]+)"/g, 'priceTier: PriceTier.$1')};
`;

  const outputPath = path.resolve(__dirname, "../../prisma/products-data.ts");
  // If running from src/product/scraper, prisma is at ../../prisma
  const targetFile = fs.existsSync(outputPath)
    ? outputPath
    : path.resolve(__dirname, "../../../prisma/products-data.ts");

  fs.writeFileSync(targetFile, tsContent, "utf-8");
  console.log(`Successfully wrote ${selected.length} products to ${targetFile}!`);
}

main().catch((e) => {
  console.error("Scraper execution failed:", e);
  process.exit(1);
});
