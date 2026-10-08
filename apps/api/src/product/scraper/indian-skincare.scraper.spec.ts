import { IndianSkincareScraperService } from "./indian-skincare.scraper";
import { ProductCategory, PriceTier, SkinType, SkinConcern } from "@skinsense/types";

describe("IndianSkincareScraperService", () => {
  let scraper: IndianSkincareScraperService;

  beforeEach(() => {
    scraper = new IndianSkincareScraperService();
  });

  describe("cleanProductTitle", () => {
    it("should strip gift emoji and promotional markers", () => {
      const cleaned = scraper.cleanProductTitle("🎁 Salicylic + LHA 02% Cleanser 20ml");
      expect(cleaned).toBe("Salicylic + LHA 02% Cleanser");
    });

    it("should strip FREE prefixes and size suffixes", () => {
      const cleaned = scraper.cleanProductTitle("FREE - Cica Facewash with Salicylic - 15ML");
      expect(cleaned).toBe("Cica Facewash with Salicylic");
    });

    it("should filter out bundles, kits, and combos", () => {
      expect(scraper.cleanProductTitle("Break Up With Acne Combo")).toBeNull();
      expect(scraper.cleanProductTitle("Pigmentation Treatment Kit")).toBeNull();
      expect(scraper.cleanProductTitle("Minimalist Custom Bundle")).toBeNull();
      expect(scraper.cleanProductTitle("Moisturizer & Toner Duo")).toBeNull();
    });

    it("should filter out haircare and body-only products", () => {
      expect(scraper.cleanProductTitle("Triple Actives Anti Dandruff Shampoo 50ml")).toBeNull();
      expect(scraper.cleanProductTitle("6% AHA-BHA Daily Exfoliating Body Wash")).toBeNull();
      expect(scraper.cleanProductTitle("Olive & Macadamia Hair Mask")).toBeNull();
    });
  });

  describe("classifyCategory", () => {
    it("should correctly classify all 8 SkinSense categories", () => {
      expect(scraper.classifyCategory("Salicylic Acid + LHA 2% Cleanser")).toBe(
        ProductCategory.CLEANSER,
      );
      expect(scraper.classifyCategory("Vitamin B12 + NMF 03% Face Toner")).toBe(
        ProductCategory.TONER,
      );
      expect(scraper.classifyCategory("Niacinamide 10% Face Serum")).toBe(
        ProductCategory.SERUM,
      );
      expect(scraper.classifyCategory("Dragon Fruit Bounce Jelly Moisturizer")).toBe(
        ProductCategory.MOISTURIZER,
      );
      expect(scraper.classifyCategory("1% Hyaluronic Sunscreen Aqua Gel SPF 50")).toBe(
        ProductCategory.SPF,
      );
      expect(scraper.classifyCategory("15% AHA + 1% BHA Face Peeling Solution")).toBe(
        ProductCategory.TREATMENT,
      );
      expect(scraper.classifyCategory("Watermelon Cool Icy Plunge Clay Mask")).toBe(
        ProductCategory.MASK,
      );
      expect(scraper.classifyCategory("Vitamin K + Retinal 1% Eye Cream")).toBe(
        ProductCategory.EYE_CREAM,
      );
    });
  });

  describe("determinePriceTier (strictly official INR prices)", () => {
    it("should classify prices under 400 INR as BUDGET", () => {
      expect(scraper.determinePriceTier(269)).toBe(PriceTier.BUDGET);
      expect(scraper.determinePriceTier(359)).toBe(PriceTier.BUDGET);
      expect(scraper.determinePriceTier(399)).toBe(PriceTier.BUDGET);
    });

    it("should classify prices between 400 and 799 INR as MID", () => {
      expect(scraper.determinePriceTier(449)).toBe(PriceTier.MID);
      expect(scraper.determinePriceTier(499)).toBe(PriceTier.MID);
      expect(scraper.determinePriceTier(749)).toBe(PriceTier.MID);
    });

    it("should classify prices 800 INR or above as PREMIUM", () => {
      expect(scraper.determinePriceTier(809)).toBe(PriceTier.PREMIUM);
      expect(scraper.determinePriceTier(999)).toBe(PriceTier.PREMIUM);
      expect(scraper.determinePriceTier(1299)).toBe(PriceTier.PREMIUM);
    });
  });

  describe("extractActiveIngredients", () => {
    it("should extract active ingredients and percentages", () => {
      const actives = scraper.extractActiveIngredients(
        "Niacinamide 10% Face Serum with Zinc PCA 1% and Hyaluronic Acid",
      );
      const names = actives.map((a) => a.name);
      expect(names).toContain("Niacinamide");
      expect(names).toContain("Zinc PCA");
      expect(names).toContain("Hyaluronic Acid");

      const niacinamide = actives.find((a) => a.name === "Niacinamide");
      expect(niacinamide?.concentration).toBe("10%");
    });
  });

  describe("classifySkinTypesAndConcerns", () => {
    it("should identify acne and oiliness for salicylic acid actives", () => {
      const { skinTypes, concerns } = scraper.classifySkinTypesAndConcerns(
        "Salicylic Acid 2% Cleanser for acne control",
        [{ name: "Salicylic Acid", concentration: "2%" }],
      );
      expect(concerns).toContain(SkinConcern.ACNE);
      expect(concerns).toContain(SkinConcern.OILINESS);
      expect(skinTypes).toContain(SkinType.OILY);
    });

    it("should identify dryness and barrier repair for ceramides", () => {
      const { skinTypes, concerns } = scraper.classifySkinTypesAndConcerns(
        "Ceramide & Hyaluronic Acid barrier repair cream",
        [{ name: "Ceramides" }, { name: "Hyaluronic Acid" }],
      );
      expect(concerns).toContain(SkinConcern.DRYNESS);
      expect(skinTypes).toContain(SkinType.DRY);
    });
  });
});
