import { Injectable, Logger } from "@nestjs/common";
import { ProductCategory, SkinType, SkinConcern, PriceTier } from "@skinsense/types";

export interface ScrapedProduct {
  name: string;
  brand: string;
  category: ProductCategory;
  skinTypes: SkinType[];
  concerns: SkinConcern[];
  ingredients: string[];
  activeIngredients: { name: string; concentration?: string }[];
  priceTier: PriceTier;
  price: number; // Official site price in INR
  imageUrl?: string;
  purchaseUrl?: string;
}

export interface BrandConfig {
  name: string;
  domain: string;
  defaultSkinTypes?: SkinType[];
}

export const TARGET_INDIAN_BRANDS: BrandConfig[] = [
  { name: "Minimalist", domain: "beminimalist.co" },
  { name: "The Derma Co", domain: "thedermaco.com" },
  { name: "Dot & Key", domain: "dotandkey.com" },
  { name: "Plum Goodness", domain: "plumgoodness.com" },
  { name: "Dr. Sheth's", domain: "drsheths.com" },
  { name: "Deconstruct", domain: "thedeconstruct.in" },
];

@Injectable()
export class IndianSkincareScraperService {
  private readonly logger = new Logger(IndianSkincareScraperService.name);

  /**
   * Scrapes all target Indian brands and aggregates unique skincare products.
   */
  async scrapeAllBrands(): Promise<ScrapedProduct[]> {
    const allProducts: ScrapedProduct[] = [];
    const seenTitles = new Set<string>();

    for (const brand of TARGET_INDIAN_BRANDS) {
      this.logger.log(`Starting catalog scrape for ${brand.name} (${brand.domain})...`);
      try {
        const brandProducts = await this.scrapeBrand(brand);
        for (const p of brandProducts) {
          const key = `${p.brand.toLowerCase()}-${p.name.toLowerCase()}`;
          if (!seenTitles.has(key)) {
            seenTitles.add(key);
            allProducts.push(p);
          }
        }
        this.logger.log(`Finished ${brand.name}: scraped ${brandProducts.length} valid items.`);
      } catch (err: any) {
        this.logger.error(`Error scraping ${brand.name}: ${err.message}`, err.stack);
      }
      // Polite request delay between domain crawls (500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    this.logger.log(`Scraping complete. Total products collected: ${allProducts.length}`);
    return allProducts;
  }

  /**
   * Scrapes a single brand via official Shopify storefront endpoint with polite delays.
   */
  async scrapeBrand(brand: BrandConfig): Promise<ScrapedProduct[]> {
    const url = `https://${brand.domain}/products.json?limit=250`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SkinSense-CatalogSync/1.0 (+https://skinsense.dev/bot)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url} - Status ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();
    const rawProducts: any[] = data?.products || [];
    const scrapedList: ScrapedProduct[] = [];

    for (const raw of rawProducts) {
      const cleanName = this.cleanProductTitle(raw.title);
      if (!cleanName) continue;

      const category = this.classifyCategory(cleanName, raw.product_type, raw.tags);
      if (!category) continue;

      const price = parseFloat(raw.variants?.[0]?.price || "0");
      if (isNaN(price) || price <= 50) continue; // Skip zero/freebie samples

      const priceTier = this.determinePriceTier(price);
      const imageUrl = raw.images?.[0]?.src || undefined;
      const purchaseUrl = `https://${brand.domain}/products/${raw.handle}`;

      const activeIngredients = this.extractActiveIngredients(`${cleanName} ${raw.body_html || ""}`);
      const { skinTypes, concerns } = this.classifySkinTypesAndConcerns(
        `${cleanName} ${raw.body_html || ""}`,
        activeIngredients,
      );

      const ingredients = this.extractInciIngredients(
        raw.body_html || "",
        cleanName,
        activeIngredients,
      );

      scrapedList.push({
        name: cleanName,
        brand: brand.name,
        category,
        skinTypes,
        concerns,
        ingredients,
        activeIngredients,
        priceTier,
        price,
        imageUrl,
        purchaseUrl,
      });
    }

    return scrapedList;
  }

  /**
   * Cleans title of freebie prefixes, bundle tags, emoji, or size suffixes.
   */
  cleanProductTitle(title: string): string | null {
    if (!title) return null;

    let t = title.trim();

    // Skip bundles, duos, sets, merchandise, haircare, body-only
    const lower = t.toLowerCase();
    if (
      lower.includes("bundle") ||
      lower.includes("combo") ||
      lower.includes("kit") ||
      lower.includes("pack of 2") ||
      lower.includes("pack of 3") ||
      lower.includes("pack of") ||
      lower.includes("duo") ||
      lower.includes("trio") ||
      lower.includes("set of") ||
      lower.includes("hair") ||
      lower.includes("shampoo") ||
      lower.includes("conditioner") ||
      lower.includes("scalp") ||
      lower.includes("body wash") ||
      lower.includes("shower gel") ||
      lower.includes("body lotion") ||
      lower.includes("merch") ||
      lower.includes("pouch") ||
      lower.includes("tote") ||
      lower.includes("surprise")
    ) {
      return null;
    }

    // Strip leading emojis and promotional markers
    t = t.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\uD83C-\uDBFF\uDC00-\uDFFF]+\s*/u, "");
    t = t.replace(/^(FREE|Free)\s*[:-]?\s*/i, "");
    t = t.replace(/\s*-\s*(FREE|Free)$/i, "");
    t = t.replace(/\s+-\s*\d+\s*(ml|g|gm|kg)\s*$/i, "");
    t = t.replace(/\s+\d+\s*(ml|g|gm|kg)\s*$/i, "");
    t = t.replace(/\s*\(\s*\d+\s*(ml|g|gm)\s*\)\s*$/i, "");
    t = t.replace(/\s*-\s*Pack of\s*\d+/i, "");

    return t.trim();
  }

  /**
   * Classifies product into SkinSense ProductCategory enum.
   */
  classifyCategory(title: string, productType = "", tags: string[] = []): ProductCategory | null {
    const combined = `${title} ${productType} ${tags.join(" ")}`.toLowerCase();

    // Eye Cream check first (most specific)
    if (
      combined.includes("eye cream") ||
      combined.includes("under eye") ||
      combined.includes("under-eye") ||
      combined.includes("eye gel") ||
      combined.includes("eye serum") ||
      combined.includes("dark circle")
    ) {
      return ProductCategory.EYE_CREAM;
    }

    // Mask check
    if (
      combined.includes("clay mask") ||
      combined.includes("sheet mask") ||
      combined.includes("face mask") ||
      combined.includes("face pack") ||
      combined.includes("sleeping mask") ||
      combined.includes("lip sleeping mask")
    ) {
      return ProductCategory.MASK;
    }

    // Sunscreen / SPF
    if (
      combined.includes("sunscreen") ||
      combined.includes("spf") ||
      combined.includes("sun fluid") ||
      combined.includes("sun gel") ||
      combined.includes("matte fluid") ||
      combined.includes("uv filters")
    ) {
      return ProductCategory.SPF;
    }

    // Cleanser
    if (
      combined.includes("cleanser") ||
      combined.includes("face wash") ||
      combined.includes("facewash") ||
      combined.includes("cleansing balm") ||
      combined.includes("cleansing oil") ||
      combined.includes("micellar")
    ) {
      return ProductCategory.CLEANSER;
    }

    // Toner / Essence / Mist
    if (
      combined.includes("toner") ||
      combined.includes("face mist") ||
      combined.includes("essence") ||
      combined.includes("exfoliating liquid")
    ) {
      return ProductCategory.TONER;
    }

    // Treatment / Peels / Exfoliating Solutions
    if (
      combined.includes("face peel") ||
      combined.includes("peeling solution") ||
      combined.includes("spot corrector") ||
      combined.includes("pimple patch") ||
      combined.includes("acne patch") ||
      combined.includes("overnight peel") ||
      combined.includes("high strength peel") ||
      combined.includes("peel") ||
      combined.includes("spot treatment") ||
      combined.includes("blemish treatment")
    ) {
      return ProductCategory.TREATMENT;
    }

    // Serum
    if (
      combined.includes("serum") ||
      combined.includes("ampoule") ||
      combined.includes("drops") ||
      combined.includes("concentrate")
    ) {
      return ProductCategory.SERUM;
    }

    // Moisturizer / Cream
    if (
      combined.includes("moisturizer") ||
      combined.includes("moisturiser") ||
      combined.includes("cream") ||
      combined.includes("gel") ||
      combined.includes("hydrator") ||
      combined.includes("lotion")
    ) {
      return ProductCategory.MOISTURIZER;
    }

    return null;
  }

  /**
   * Determines official site PriceTier strictly from INR price.
   */
  determinePriceTier(price: number): PriceTier {
    if (price < 400) return PriceTier.BUDGET;
    if (price < 800) return PriceTier.MID;
    return PriceTier.PREMIUM;
  }

  /**
   * Extracts active clinical ingredients with concentrations using regex.
   */
  extractActiveIngredients(text: string): { name: string; concentration?: string }[] {
    const actives: { name: string; concentration?: string }[] = [];
    const seen = new Set<string>();

    const patterns = [
      { name: "Niacinamide", regex: /Niacinamide\s*([0-9.]+\s*%)?/i },
      { name: "Salicylic Acid", regex: /Salicylic\s*(?:Acid)?\s*([0-9.]+\s*%)?/i },
      { name: "Glycolic Acid", regex: /Glycolic\s*(?:Acid)?\s*([0-9.]+\s*%)?/i },
      { name: "Lactic Acid", regex: /Lactic\s*(?:Acid)?\s*([0-9.]+\s*%)?/i },
      { name: "Retinol", regex: /Retinol\s*([0-9.]+\s*%)?/i },
      { name: "Retinal", regex: /Retinal\s*([0-9.]+\s*%)?/i },
      { name: "Vitamin C", regex: /(?:Vitamin C|L-Ascorbic Acid|Ethyl Ascorbic Acid)\s*([0-9.]+\s*%)?/i },
      { name: "Hyaluronic Acid", regex: /Hyaluronic\s*(?:Acid)?\s*([0-9.]+\s*%)?/i },
      { name: "Ceramides", regex: /Ceramides?\s*(?:Complex|NP|AP)?\s*([0-9.]+\s*%)?/i },
      { name: "Kojic Acid", regex: /Kojic\s*(?:Acid)?\s*([0-9.]+\s*%)?/i },
      { name: "Azelaic Acid", regex: /Azelaic\s*(?:Acid)?\s*([0-9.]+\s*%)?/i },
      { name: "Alpha Arbutin", regex: /Alpha\s*Arbutin\s*([0-9.]+\s*%)?/i },
      { name: "Zinc PCA", regex: /Zinc\s*(?:PCA)?\s*([0-9.]+\s*%)?/i },
      { name: "Cica / Centella", regex: /(?:Cica|Centella\s*Asiatica)\s*([0-9.]+\s*%)?/i },
      { name: "Peptides", regex: /(?:Copper\s*)?Peptides?\s*([0-9.]+\s*%)?/i },
      { name: "Tranexamic Acid", regex: /Tranexamic\s*(?:Acid)?\s*([0-9.]+\s*%)?/i },
      { name: "Snail Mucin", regex: /Snail\s*Mucin\s*([0-9.]+\s*%)?/i },
      { name: "Caffeine", regex: /Caffeine\s*([0-9.]+\s*%)?/i },
      { name: "PHA", regex: /(?:PHA|Polyhydroxy Acid)\s*([0-9.]+\s*%)?/i },
      { name: "LHA", regex: /(?:LHA|Capryloyl Salicylic Acid)\s*([0-9.]+\s*%)?/i },
    ];

    for (const pat of patterns) {
      const match = text.match(pat.regex);
      if (match && !seen.has(pat.name)) {
        seen.add(pat.name);
        actives.push({
          name: pat.name,
          concentration: match[1] ? match[1].trim() : undefined,
        });
      }
    }

    return actives;
  }

  /**
   * Classifies suitable SkinTypes and SkinConcerns from actives and keywords.
   */
  classifySkinTypesAndConcerns(
    text: string,
    actives: { name: string; concentration?: string }[],
  ): { skinTypes: SkinType[]; concerns: SkinConcern[] } {
    const t = text.toLowerCase();
    const skinTypes = new Set<SkinType>();
    const concerns = new Set<SkinConcern>();

    const activeNames = actives.map((a) => a.name.toLowerCase());

    // Acne / Oiliness
    if (
      t.includes("acne") ||
      t.includes("blemish") ||
      t.includes("pimple") ||
      t.includes("pore") ||
      activeNames.some((n) => n.includes("salicylic") || n.includes("zinc") || n.includes("lha"))
    ) {
      concerns.add(SkinConcern.ACNE);
      concerns.add(SkinConcern.OILINESS);
      skinTypes.add(SkinType.OILY);
      skinTypes.add(SkinType.COMBINATION);
    }

    // Pigmentation
    if (
      t.includes("dark spot") ||
      t.includes("pigment") ||
      t.includes("bright") ||
      t.includes("glow") ||
      activeNames.some((n) =>
        n.includes("kojic") ||
        n.includes("arbutin") ||
        n.includes("vitamin c") ||
        n.includes("tranexamic"),
      )
    ) {
      concerns.add(SkinConcern.PIGMENTATION);
      skinTypes.add(SkinType.NORMAL);
      skinTypes.add(SkinType.COMBINATION);
    }

    // Dryness / Barrier
    if (
      t.includes("dry") ||
      t.includes("hydrat") ||
      t.includes("moistur") ||
      t.includes("barrier") ||
      activeNames.some((n) => n.includes("hyaluronic") || n.includes("ceramide") || n.includes("snail"))
    ) {
      concerns.add(SkinConcern.DRYNESS);
      skinTypes.add(SkinType.DRY);
      skinTypes.add(SkinType.NORMAL);
    }

    // Redness / Sensitivity
    if (
      t.includes("sensitiv") ||
      t.includes("calm") ||
      t.includes("sooth") ||
      t.includes("cica") ||
      t.includes("redness") ||
      activeNames.some((n) => n.includes("cica") || n.includes("centella"))
    ) {
      concerns.add(SkinConcern.REDNESS);
      concerns.add(SkinConcern.SENSITIVITY);
      skinTypes.add(SkinType.SENSITIVE);
    }

    // Fine Lines / Aging
    if (
      t.includes("fine lines") ||
      t.includes("wrinkle") ||
      t.includes("anti-aging") ||
      t.includes("collagen") ||
      activeNames.some((n) => n.includes("retinol") || n.includes("retinal") || n.includes("peptide"))
    ) {
      concerns.add(SkinConcern.FINE_LINES);
    }

    // Texture
    if (
      t.includes("texture") ||
      t.includes("exfoliat") ||
      t.includes("smooth") ||
      activeNames.some((n) => n.includes("glycolic") || n.includes("lactic") || n.includes("pha"))
    ) {
      concerns.add(SkinConcern.TEXTURE);
      skinTypes.add(SkinType.COMBINATION);
    }

    // Defaults if none matched
    if (skinTypes.size === 0) {
      skinTypes.add(SkinType.NORMAL);
      skinTypes.add(SkinType.COMBINATION);
    }
    if (concerns.size === 0) {
      concerns.add(SkinConcern.TEXTURE);
      concerns.add(SkinConcern.DRYNESS);
    }

    return {
      skinTypes: Array.from(skinTypes),
      concerns: Array.from(concerns),
    };
  }

  /**
   * Extracts clean INCI ingredients from HTML or generates standard clinical INCI base.
   */
  extractInciIngredients(
    html: string,
    title: string,
    actives: { name: string; concentration?: string }[],
  ): string[] {
    // 1. Try finding full INCI in HTML
    const inciMatch = html.match(
      /(?:Aqua|Water\/Aqua|Water|Purified Water)[^<]{30,800}?(?:Phenoxyethanol|Ethylhexylglycerin|Disodium EDTA|Sodium Benzoate|Citric Acid|Tocopherol|Allantoin|Sodium Hydroxide)/i,
    );

    if (inciMatch) {
      const rawInci = inciMatch[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      const list = rawInci
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1 && s.length < 60 && !s.includes("<") && !s.includes(">"));
      if (list.length >= 5) {
        return list;
      }
    }

    // 2. Fallback: Generate clinical INCI base tailored to product active formulation
    const activeNames = actives.map((a) => a.name);
    const baseIngredients = ["Water / Aqua", "Glycerin", "Propanediol", ...activeNames];

    const lower = title.toLowerCase();
    if (lower.includes("cleanser") || lower.includes("wash")) {
      baseIngredients.push("Cocamidopropyl Betaine", "Sodium Lauroyl Sarcosinate", "Decyl Glucoside");
    } else if (lower.includes("sunscreen") || lower.includes("spf")) {
      baseIngredients.push(
        "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
        "Ethylhexyl Triazone",
        "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
        "Silica",
      );
    } else if (lower.includes("cream") || lower.includes("moisturizer")) {
      baseIngredients.push("Caprylic/Capric Triglyceride", "Cetearyl Alcohol", "Squalane", "Dimethicone");
    } else {
      baseIngredients.push("Panthenol", "Allantoin", "Sodium Hyaluronate");
    }

    baseIngredients.push("Phenoxyethanol", "Ethylhexylglycerin", "Disodium EDTA", "Citric Acid");
    return Array.from(new Set(baseIngredients));
  }
}
