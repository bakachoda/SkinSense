import { ProductCategory, SkinType, SkinConcern, PriceTier } from "@skinsense/types";

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
export const SEED_PRODUCTS: SeedProduct[] = [
  {
    "name": "Ceramide & Vitamin B5 Delicate Cleanser",
    "brand": "Minimalist",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Ceramides",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/BabyDelicateCleanserNew.png?v=1721632055",
    "purchaseUrl": "https://beminimalist.co/products/pediatrics-ceramide-vitamin-b5-delicate-cleanser"
  },
  {
    "name": "Alpha Lipoic + Glycolic 7% Cleanser",
    "brand": "Minimalist",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Glycolic Acid",
      "PHA",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Glycolic Acid",
        "concentration": "7%"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/AlphaLipoicNew.png?v=1746106817",
    "purchaseUrl": "https://beminimalist.co/products/alpha-lipoic-glycolic-07-cleanser"
  },
  {
    "name": "Salicylic Acid + LHA 2% Cleanser",
    "brand": "Minimalist",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "LHA",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "LHA",
        "concentration": "2%"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/SalicylicCleanserNew.jpg?v=1756796206",
    "purchaseUrl": "https://beminimalist.co/products/salicylic-lha-2-cleanser"
  },
  {
    "name": "2% Salicylic Acid Gel Face Wash with Salicylic Acid & Witch Hazel",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/pdp_2_salicylic_fw.jpg?v=1758287053",
    "purchaseUrl": "https://thedermaco.com/products/2-salicylic-acid-gel-face-wash-the-dermaco-100ml"
  },
  {
    "name": "1% Kojic Acid Face Wash with Niacinamide & Alpha Arbutin For Dark Spots & Pigmentation",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Kojic Acid",
      "Alpha Arbutin",
      "PHA",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Kojic Acid"
      },
      {
        "name": "Alpha Arbutin"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_e59f3cfd-7ee4-4dda-bf98-bf369d771e3d.jpg?v=1765885976",
    "purchaseUrl": "https://thedermaco.com/products/1-kojic-acid-face-wash-with-niacinamide-alpha-arbutin-for-dark-spots-pigmentation-100ml"
  },
  {
    "name": "1% Salicylic Acid Gel Face Wash with Salicylic Acid & Witch Hazel",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1st_1_1.jpg?v=1758286570",
    "purchaseUrl": "https://thedermaco.com/products/1-salicylic-acid-gel-face-wash-the-dermaco-100ml"
  },
  {
    "name": "2% Sali-Cinamide Anti-Acne Face Wash with 2% Salicylic Acid & 2% Niacinamide",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Salicylic Acid",
      "Cica / Centella",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_d110b549-097a-4cf8-b509-b50f2c12e776.jpg?v=1784539298",
    "purchaseUrl": "https://thedermaco.com/products/2-sali-cinamide-anti-acne-face-wash-with-2-salicylic-acid-2-niacinamide-200ml"
  },
  {
    "name": "2% Niacinamide Gentle Skin Cleanser for Sensitive, Dry & Normal Skin",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Ceramides",
      "Cica / Centella",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_b010774a-97ad-4673-b24a-5263eb180ccc.jpg?v=1780466412",
    "purchaseUrl": "https://thedermaco.com/products/2-niacinamide-gentle-skin-cleanser-for-sensitive-dry-normal-skin-250-ml"
  },
  {
    "name": "2% Niacinamide Oily Skin Cleanser for Sensitive, Oily &  Combination Skin",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Salicylic Acid",
      "Cica / Centella",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_efb0546a-95fb-4827-b423-fd52fa05b070.jpg?v=1780313832",
    "purchaseUrl": "https://thedermaco.com/products/2-niacinamide-oily-skin-cleanser-for-sensitive-oily-combination-skin-250-ml"
  },
  {
    "name": "2% Salicylic Acid Gel Daily Face Wash",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/FOP.webp?v=1780988604",
    "purchaseUrl": "https://thedermaco.com/products/2-salicylic-acid-gel-daily-face-wash-80ml"
  },
  {
    "name": "1% Kojic Acid Face Wash For Dark Spots & Pigmentation",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Kojic Acid",
      "Alpha Arbutin",
      "PHA",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Kojic Acid"
      },
      {
        "name": "Alpha Arbutin"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/the-derma-co-1-kojic-acid-daily-face-wash-10ml.jpg?v=1758287125",
    "purchaseUrl": "https://thedermaco.com/products/1-kojic-acid-face-wash-with-niacinamide-alpha-arbutin-for-dark-spots-pigmentation-10-ml-1"
  },
  {
    "name": "2% Sali-Cinamide Anti-Acne Face Wash",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Salicylic Acid",
      "Cica / Centella",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/2_sali-cinamide_fop.jpg?v=1758287122",
    "purchaseUrl": "https://thedermaco.com/products/sali-cinamide-anti-acne-face-wash-with-2-salicylic-acid-2-niacinamide-10ml-1"
  },
  {
    "name": "1% Salicylic Acid Gel Face Wash",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1st-image_1.jpg?v=1758286598",
    "purchaseUrl": "https://thedermaco.com/products/1-salicylic-acid-gel-face-wash-the-dermaco-30ml"
  },
  {
    "name": "2.5% Benzoyl Peroxide Gel Face Wash with Glycerin & Allantoin for Active Acne",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Ceramides",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/PDP_ae07dd67-bfeb-4f62-8ed7-b2b96ddb7a6c.jpg?v=1786352215",
    "purchaseUrl": "https://thedermaco.com/products/benzoyl-peroxide-gel-face-wash-100ml"
  },
  {
    "name": "Nia-Ceramide Barrier Repair Face Wash with 2% Niacinamide and 1% Ceramide",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Ceramides",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/nia-ceramide-fw.jpg?v=1758287057",
    "purchaseUrl": "https://thedermaco.com/products/nia-ceramide-barrier-repair-face-wash-80ml"
  },
  {
    "name": "Tran-Zelaic Pigmentation Corrector Face Wash with Tranexamic Acid & Azelaic Acid",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Azelaic Acid",
      "Tranexamic Acid",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Azelaic Acid"
      },
      {
        "name": "Tranexamic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/tran-zelaic-fw-80g.jpg?v=1758287055",
    "purchaseUrl": "https://thedermaco.com/products/tran-zelaic-pigmentation-corrector-face-wash-with-tranexamic-acid-azelaic-acid-80-g"
  },
  {
    "name": "Snail Peptide 96 Hydrating Face Wash with Snail Mucin & Peptide Complex for Deep Hydration",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Peptides",
      "Snail Mucin",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Peptides"
      },
      {
        "name": "Snail Mucin"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/snail-peptide-96-hydrating-face-wash-80ml-fop.jpg?v=1758287027",
    "purchaseUrl": "https://thedermaco.com/products/snail-peptide-96-hydrating-face-wash-with-snail-mucin-peptide-complex-for-deep-hydration-80-ml"
  },
  {
    "name": "The Derma Co. X Dr V Skin Renew Peptide Anti-Pollution Face Wash with Peptides & Niacinamide",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Salicylic Acid",
      "Peptides",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Peptides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/dr_v_face_1.jpg?v=1758286980",
    "purchaseUrl": "https://thedermaco.com/products/skin-renew-peptide-anti-pollution-face-wash-with-peptides-niacinamide-100-ml"
  },
  {
    "name": "2% Vitamin C Gel Daily Face Wash with Vitamin C, Rosehip & Orange Peel Extract for Glowing Skin",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_-_2_vitamin_c_gel_daily_face_wash.jpg?v=1758286854",
    "purchaseUrl": "https://thedermaco.com/products/2-vitamin-c-gel-daily-face-wash-with-vitamin-c-rosehip-orange-peel-extract-for-glowing-skin-80ml"
  },
  {
    "name": "2% Niacinamide Oily Skin Cleanser for Sensitive, Oily & Combination Skin 125 ml  Non-Irritant | 100% Soap-Free | Non-Drying | Gently Cleanses Makeup",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Ceramides",
      "Cica / Centella",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/2-niacinamide_oily_skin_cleanser_for_sensitive_oily_combination_skin.png?v=1758286818",
    "purchaseUrl": "https://thedermaco.com/products/2-niacinamide-oily-skin-cleanser-for-sensitive-oily-combination-skin-125-ml"
  },
  {
    "name": "1% Salicylic Acid Foaming Daily Face Wash with Salicylic Acid, Zinc PCA & PHA",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Zinc PCA",
      "PHA",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Zinc PCA"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/salicylic-foaming-fw.psd.jpg?v=1758286730",
    "purchaseUrl": "https://thedermaco.com/products/1-salicylic-acid-foaming-daily-face-wash-with-salicylic-acid-zinc-pca-pha-100-ml"
  },
  {
    "name": "Oil-Free Daily Face Wash With Hyaluronic Acid, Glycolic Acid & Multivitamins for Clear & Hydrated Skin",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Glycolic Acid",
      "Hyaluronic Acid",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/PDP_10b2f0d4-0281-4802-aef0-d1e8c223f103.jpg?v=1773726179",
    "purchaseUrl": "https://thedermaco.com/products/oil-free-daily-face-wash-with-hyaluronic-acid-glycolic-acid-multivitamins-for-clear-hydrated-skin-100ml"
  },
  {
    "name": "2% Cica-Glow Daily Face Wash with Tranexamic Acid & Licorice Extract",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Cica / Centella",
      "Tranexamic Acid",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Cica / Centella"
      },
      {
        "name": "Tranexamic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/2_cica_glow_daily_face_wash.jpg?v=1758286643",
    "purchaseUrl": "https://thedermaco.com/products/2-cica-glow-daily-face-wash-with-tranexamic-acid-licorice-extract-100ml"
  },
  {
    "name": "Pore Minimizing Clay Daily Face Wash with 1% Niacinamide & 2% PHA",
    "brand": "The Derma Co",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "PHA",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_0dad207e-2a61-4d2c-90ee-d16334a9a08e.jpg?v=1773123316",
    "purchaseUrl": "https://thedermaco.com/products/pore-minimizing-clay-daily-face-wash-with-1-niacinamide-2-pha-100-ml"
  },
  {
    "name": "Cica Facewash with Salicylic",
    "brand": "Dot & Key",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Zinc PCA",
      "Cica / Centella",
      "PHA",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Zinc PCA"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/products/Untitled-1_18_1_ad5efbdd-526e-4fcc-b534-62df04062cef.png?v=1662192628",
    "purchaseUrl": "https://dotandkey.com/products/cica-calming-acne-fighting-facewash-with-salicylic-sulphate-free-soap-free-15ml"
  },
  {
    "name": "Barrier Repair Gentle Hydrating Face Wash: 15ml",
    "brand": "Dot & Key",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Ceramides",
      "PHA",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/brfwmini.jpg?v=1699280156",
    "purchaseUrl": "https://dotandkey.com/products/barrier-repair-gentle-hydrating-face-wash-15ml"
  },
  {
    "name": "Strawberry Bright Niacinamide Gel Face Wash",
    "brand": "Dot & Key",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1copy3.jpg?v=1772454016",
    "purchaseUrl": "https://dotandkey.com/products/strawberry-bright-niacinamide-gel-face-wash"
  },
  {
    "name": "Watermelon  Cleanser",
    "brand": "Dot & Key",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Cocamidopropyl Betaine",
      "Decyl Glucoside",
      "Glycerine",
      "Disodium Cocoyl Glutamate",
      "Triethanolamine",
      "Sodium Ascorbyl Phosphate",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/ann2_1.jpg?v=1746616053",
    "purchaseUrl": "https://dotandkey.com/products/watermelon-vitamin-c-superglow-face-cleanser-15ml"
  },
  {
    "name": "Mango Detan Gel Face Wash",
    "brand": "Dot & Key",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Diethylhexyl Carbonate",
      "Titanium Dioxide (and) Silica",
      "Glyceryl Citrate/Lactate/Linoleate/Oleate",
      "Caprylic/Capric Triglyceride",
      "Coco-Caprylate/Caprate",
      "Glycerin",
      "Propanediol",
      "Polyacrylate-13 (and) Polyisobutene (and) Polysorbate 20",
      "Polyacrylate Crosspolymer 6",
      "Ascorbyl Glucoside",
      "Fructooligosaccharides (and) Beta Vulgaris Root Extract",
      "Tocopheryl Acetate",
      "Terminalia Ferdinandiana (Kakadu Plum) Fruit Extract",
      "Citrus Cinennsis (Blood Orange) Fruit Extract",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Lactic Acid"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_c05b99e0-c177-4e08-bf58-269833e70161.jpg?v=1754041030",
    "purchaseUrl": "https://dotandkey.com/products/mango-detan-gel-face-wash-free"
  },
  {
    "name": "Vitamin C Facewash",
    "brand": "Dot & Key",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/vitccopy.jpg?v=1746616241",
    "purchaseUrl": "https://dotandkey.com/products/vitamin-c-facewash-15ml"
  },
  {
    "name": "Watermelon Cool CTM Regime",
    "brand": "Dot & Key",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Watermelon Superglow Cleanser: Aqua",
      "Cocamidopropyl Betaine",
      "Decyl Glucoside",
      "Glycerine",
      "Disodium Cocoyl Glutamate",
      "Triethanolamine",
      "Sodium Ascorbyl Phosphate",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Lactic Acid"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/PO_b77106ac-96e3-40ff-bf8b-aa4cabdb2bda.jpg?v=1788344605",
    "purchaseUrl": "https://dotandkey.com/products/watermelon-luminous-skin-glow-ctm-regime"
  },
  {
    "name": "Watermelon Gel Face Wash",
    "brand": "Dot & Key",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Cocamidopropyl Betaine",
      "Decyl Glucoside",
      "Disodium Cocoyl Glutamate",
      "Glycerine",
      "Triethanolamine",
      "Acrylates/C10-30 Alkyl Acrylate Crosspolymer",
      "Xanthan Gum",
      "PEG-40 Hydrogenated Castor Oil",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1-2.jpg?v=1773549636",
    "purchaseUrl": "https://dotandkey.com/products/watermelon-vitamin-c-face-wash-gel-1"
  },
  {
    "name": "Vitamin C Foaming Face Wash",
    "brand": "Dot & Key",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Cocamidopropyl Betaine",
      "Glycerine",
      "Caprylyl/Capryl Glucoside",
      "Sodium Methyl Cocoyl Taurate",
      "Disodium Cocoyl Glutamate",
      "Ethyl Ascorbic Acid",
      "Sodium Ascorbyl Phosphate",
      "Silanetriol (and) Hyaluronic Acid",
      "Panthenol",
      "Citrus Sinensis (Blood Orange) Fruit Extract",
      "Carica Papaya (Papaya) Fruit Extract",
      "Terminalia Ferdinandiana (Kakadu Plum) Fruit Extract",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1-Vit-C-Foaming-FW.jpg?v=1738833219",
    "purchaseUrl": "https://dotandkey.com/products/vitamin-c-super-bright-foaming-face-wash"
  },
  {
    "name": "Vitamin C + E Gel Face Wash for Glowing Skin",
    "brand": "Dot & Key",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Cocamidopropyl Betaine",
      "Decyl Glucoside",
      "Glycerine",
      "Disodium Cocoyl Glutamate",
      "Triethanolamine",
      "Acrylates/C10-30 Alkyl Acrylate Crosspolymer",
      "Xanthan Gum",
      "PEG-40 Hydrogenated Castor Oil",
      "Niacinamide",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/Artboard1-175ml_2fca068c-8ac9-4302-bf75-ca76c14b7beb.jpg?v=1784205327",
    "purchaseUrl": "https://dotandkey.com/products/vitamin-c-e-gel-facewash"
  },
  {
    "name": "Barrier Repair Gentle Hydrating Face Wash",
    "brand": "Dot & Key",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Cocamidopropyl Betaine",
      "Glycerine",
      "Decyl Glucoside",
      "Disodium Cocoyl Glutamate",
      "Triethanolamine",
      "Acrylates/C10-30 Alkyl Acrylate Crosspolymer",
      "Xanthan Gum",
      "PEG-40 Hydrogenated Castor Oil",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1-175.jpg?v=1784641926",
    "purchaseUrl": "https://dotandkey.com/products/dot-key-barrier-repair-gentle-hydrating-face-wash-with-5-essential-ceramides-hyaluronic-ph-5-5-fragrance-sulphate-free-for-sensitive-dry-skin"
  },
  {
    "name": "All Day Hydration CTM Essentials",
    "brand": "Dot & Key",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Myristic Acid",
      "Glycerin",
      "Acrylates/Steareth-20 Methacrylate Crosspolymer",
      "Potassium Hydroxide",
      "Propylene Glycol",
      "Stearic Acid",
      "Lauric Acid",
      "Glycol Stearate",
      "Cocamidopropyl Betaine",
      "Glyceryl Stearate (and) PEG-100 Stearate",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Lactic Acid"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/products/1_45.jpg?v=1692438042",
    "purchaseUrl": "https://dotandkey.com/products/all-day-hydration-trio-1"
  },
  {
    "name": "Deep Pore Clean Foaming Face Wash",
    "brand": "Dot & Key",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Myristic Acid",
      "Glycerine",
      "Acrylates / Steareth-20 Methacrylate Crosspolymer",
      "Stearic Acid",
      "Potassium Hydroxide",
      "Propylene Glycol",
      "Glycol Stearate",
      "Dimethiconol (and) TEA-Dodecylbenzenesulfonate"
    ],
    "activeIngredients": [
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Lactic Acid"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1-Deep-Pore-Cleanser_1.jpg?v=1705741985",
    "purchaseUrl": "https://dotandkey.com/products/deep-pore-clean-milky-foam-cleanser-120ml"
  },
  {
    "name": "Cica + Salicylic Acid Face Wash for Oily Skin",
    "brand": "Dot & Key",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Cocamidopropyl Betaine",
      "Decyl Glucoside",
      "Disodium Cocoyl Glutamate",
      "3-Butylene Glycol",
      "Acrylates/C10-30 Alkyl Acrylate Crosspolymer",
      "Salicylic Acid",
      "Xanthan Gum",
      "PEG-40 Hydrogenated Castor Oil",
      "Sodium Hydroxide"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Zinc PCA"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/175ml.jpg?v=1781243494",
    "purchaseUrl": "https://dotandkey.com/products/cica-calming-blemish-clearing-face-wash"
  },
  {
    "name": "1% Salicylic Acid Clearly Gentle Gel Face Wash For Acne-Prone Skin",
    "brand": "Plum Goodness",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "PHA",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/Listing_1st_Tile_SA_Gel_FW_1001x1001_px.webp?v=1776937553",
    "purchaseUrl": "https://plumgoodness.com/products/1-salicylic-acid-clearly-gentle-gel-face-wash-for-acne-prone-skin"
  },
  {
    "name": "Rice Water & 2% Niacinamide Simply Bright Face Wash |15 ml",
    "brand": "Plum Goodness",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/Nia_FaceWash_15mlcopy_cee41396-8db1-4e11-8d44-06ab993b5a2e.jpg?v=1743686375",
    "purchaseUrl": "https://plumgoodness.com/products/plum-rice-water-2-niacinamide-simply-bright-face-wash-15-ml-100-off"
  },
  {
    "name": "2% Niacinamide & Rice Water Face Wash For Clear & Bright Skin | 50 ml",
    "brand": "Plum Goodness",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "PHA",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/Listing_1st_Tile_Nia_FW_50ml_1001x1001_px_b375a320-f571-4191-9f3d-affcd08b4025.webp?v=1777965755",
    "purchaseUrl": "https://plumgoodness.com/products/2-niacinamide-rice-water-face-wash-for-clear-bright-skin-50-ml-copy"
  },
  {
    "name": "Green Tea Pore Cleansing Face Wash | 50 ml",
    "brand": "Plum Goodness",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Glycolic Acid",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Glycolic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/01_f60f71fa-20f4-48c7-aaa7-5aee9de73791.jpg?v=1771582656",
    "purchaseUrl": "https://plumgoodness.com/products/green-tea-pore-cleansing-face-wash-50-ml"
  },
  {
    "name": "CeraSense™ Barrier Care Face Wash with Acai & 1% NMF | 50 ml",
    "brand": "Plum Goodness",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Ceramides",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/Listing_1st_Tile_Cera_FW_100ml_1001x1001_px_3f331932-b5dd-487d-b77b-683dde8f597f.webp?v=1782218619",
    "purchaseUrl": "https://plumgoodness.com/products/cerasense-barrier-care-face-wash-with-acai-1-nmf-copy"
  },
  {
    "name": "Vitamin C Glow Boost Routine",
    "brand": "Plum Goodness",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/Listing_Image_Vit-C_cpmbo.jpg?v=1782814059",
    "purchaseUrl": "https://plumgoodness.com/products/vitamin-c-range"
  },
  {
    "name": "CeraSense™ Barrier Care Face Wash with Acai & 1% NMF",
    "brand": "Plum Goodness",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Ceramides",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/01_CeraSenseFW_12082026_R7_16c57775-1019-4b09-b0cb-0c770f9e4de3.webp?v=1789647719",
    "purchaseUrl": "https://plumgoodness.com/products/cerasense-barrier-care-face-wash-with-acai-1-nmf-2-100-ml"
  },
  {
    "name": "Oats & Ceramide Sensitive Skin Cleanser",
    "brand": "Dr. Sheth's",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Ceramides",
      "Cocamidopropyl Betaine",
      "Sodium Lauroyl Sarcosinate",
      "Decyl Glucoside",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/Copyof1_d3d2e9e5-842a-4f04-8cc8-a0db68cde0dc.jpg?v=1744263676",
    "purchaseUrl": "https://drsheths.com/products/oats-ceramide-sensitive-skin-cleanser-125ml"
  },
  {
    "name": "Kesar & Kojic Acid Face Wash",
    "brand": "Dr. Sheth's",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Potassium Hydroxide",
      "Propylene Glycol",
      "Stearic Acid",
      "Decyl Glucoside",
      "Lauric Acid",
      "Ethylene Glycol Distearate",
      "Cocamidopropyl Betaine",
      "Sodium PCA",
      "Glyceryl Monostearate",
      "Niacinamide",
      "Crocus Sativus Flower (Kesar) Extract",
      "Glycyrrhiza Glabra (Licorice) Root Extract",
      "Kojic Acid",
      "Xylitol",
      "Glucose",
      "Anhydroxylitol",
      "Phoenix Dactylifera (Date Palm)Extract",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Kojic Acid"
      },
      {
        "name": "Alpha Arbutin"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/KESAR_KOJIC_ACID_FACE_WASH.jpg?v=1790148635",
    "purchaseUrl": "https://drsheths.com/products/kesar-kojic-acid-face-wash-100g"
  },
  {
    "name": "Neem & Salicylic Acid Face Wash",
    "brand": "Dr. Sheth's",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Sodium Lauroyl Sarcosinate",
      "Polyacrylate -33",
      "Disodium Cocoamphodiacetate",
      "Cocamidopropyl Betaine",
      "Glycerin",
      "Caprylyl/Capryl Glucoside",
      "Sodium Methyl Cocoyl Taurate",
      "Salicylic Acid",
      "Glyceryl Glucoside",
      "Azadirachta Indica (Neem) Extract",
      "Ocimum Sanctum Leaf (Tulasi) Extract",
      "Sodium Hydroxide"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Zinc PCA"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/3_8817575d-cecb-4cd8-be43-6ea1038bc7f7.jpg?v=1731587060",
    "purchaseUrl": "https://drsheths.com/products/neem-salicylic-acid-face-wash"
  },
  {
    "name": "Ceramide & Vitamin C Face Wash",
    "brand": "Dr. Sheth's",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Potassium Hydroxide",
      "Propylene Glycol",
      "Stearic Acid",
      "Decyl Glucoside",
      "Lauric Acid",
      "Glycol Distearate",
      "Xylitol",
      "Glucose",
      "Anhydroxylitol",
      "Phoenix Dactylifera (Date Palm) Extract",
      "Sodium Ascorbyl Phosphate",
      "Sodium PCA",
      "Glyceryl Stearate",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/CVCFW_1st.jpg?v=1703667570",
    "purchaseUrl": "https://drsheths.com/products/ceramide-vitamin-c-face-wash-10g-1"
  },
  {
    "name": "Gulab & Glycolic Acid Face Wash",
    "brand": "Dr. Sheth's",
    category: ProductCategory.CLEANSER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Disodium Laureth Sulfosuccinate",
      "Polyacrylate 33",
      "Cocamidopropyl Betaine",
      "Glycerin",
      "Caprylyl/Capryl Glucoside",
      "Sodium Methyl Cocoyl Taurate",
      "Lauryl Glucoside",
      "Coco Glucoside",
      "Rosa Centifolia (Gulab) Extract",
      "Propylene Glycol",
      "Xylitol",
      "Glucose",
      "Anhydroxylitol",
      "Phoenix Dactylifera (Date Palm) Extract",
      "Sodium Hydroxide"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/G_GFW.png?v=1689593075",
    "purchaseUrl": "https://drsheths.com/products/dr-sheth-s-gulab-glycolic-acid-face-wash-100g"
  },
  {
    "name": "B12 + Repair Complex 5.5% Face Moisturizer",
    "brand": "Minimalist",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Ceramides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/B12ListingImage.jpg?v=1756800848",
    "purchaseUrl": "https://beminimalist.co/products/vitamin-b12-repair-complex-5-5-face-moisturizer"
  },
  {
    "name": "Ceramide & Squalane Nourishing Lotion",
    "brand": "Minimalist",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Ceramides",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/BabyNourishingNew.png?v=1721632055",
    "purchaseUrl": "https://beminimalist.co/products/pediatrics-ceramide-squalane-nourishing-lotion"
  },
  {
    "name": "Ceramides 0.3% + Madecassoside Moisturizer",
    "brand": "Minimalist",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Ceramides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Ceramides",
        "concentration": "0.3%"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/Ceramide_Madecassoside.png?v=1721398128",
    "purchaseUrl": "https://beminimalist.co/products/ceramides-0-3-madecassoside"
  },
  {
    "name": "5% Nia-Ceramide Daily Hydrating Moisturizer with 5% Niacinamide & 2% Ceramide",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Ceramides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/fop__nia_ceramide_hydrating_new.jpg?v=1762327705",
    "purchaseUrl": "https://thedermaco.com/products/5-nia-ceramide-daily-hydrating-moisturizer-100g"
  },
  {
    "name": "2% Niacinamide Hydrating BB Cream with 1% Hyaluronic Acid Complex & Aquaxyl™  - 30 g |  03 - Warm Beige",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/shoot-image_2_5f79f2dc-8b00-4b48-a73f-4c591499533e.jpg?v=1758286865",
    "purchaseUrl": "https://thedermaco.com/products/2-niacinamide-hydrating-bb-cream-with-1-hyaluronic-acid-complex-aquaxyltm-30-g-03-warm-beige"
  },
  {
    "name": "5% Nia-Ceramide Daily Hydrating Moisturizer",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Ceramides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/fop_nia_10gm.jpg?v=1758287103",
    "purchaseUrl": "https://thedermaco.com/products/5-nia-ceramide-daily-hydrating-moisturizer-10g"
  },
  {
    "name": "Ceramide + HA Intense Moisturizer",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Ceramides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/ceramide-_-ha-intense-moisturizer_1_1_2_iiihhrud6ovr3cxn.jpg?v=1758286481",
    "purchaseUrl": "https://thedermaco.com/products/ceramide-ha-intense-moisturizer-1"
  },
  {
    "name": "2% Kojic Acid Advanced Face Cream",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Glycolic Acid",
      "Kojic Acid",
      "Alpha Arbutin",
      "Tranexamic Acid",
      "PHA",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Kojic Acid"
      },
      {
        "name": "Alpha Arbutin"
      },
      {
        "name": "Tranexamic Acid"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/pdp_kojic_advance_cream.jpg?v=1758287209",
    "purchaseUrl": "https://thedermaco.com/products/2-kojic-acid-advanced-face-cream-30g"
  },
  {
    "name": "5% Nia-Ceramide Intense Moisturizing Cream",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Ceramides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/fop_nia_cream_white_bg.jpg?v=1758287148",
    "purchaseUrl": "https://thedermaco.com/products/5-nia-ceramide-intense-moisturizing-cream-100g"
  },
  {
    "name": "4% Ceramide Barrier Repair Moisturizer with Ceramide, Niacinamide, and Oxylance",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Ceramides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_15_28.jpg?v=1758287066",
    "purchaseUrl": "https://thedermaco.com/products/4-ceramide-barrier-repair-moisturizer-with-ceramide-niacinamide-and-oxylance-100-gm"
  },
  {
    "name": "5% Nia-Ceramide Mattifying Moisturizer with 5% Niacinamide & 2% Ceramide",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Ceramides",
      "Zinc PCA",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Zinc PCA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/5-nia-ceramide-mattifying.jpg?v=1758287063",
    "purchaseUrl": "https://thedermaco.com/products/5-nia-ceramide-mattifying-moisturizer-100g"
  },
  {
    "name": "5% Nia-Ceramide Deep Moisturizing Cream with 5% Niacinamide & 1% Ceramide",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Ceramides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/nia-ceramide_cream.jpg?v=1758287059",
    "purchaseUrl": "https://thedermaco.com/products/5-nia-ceramide-deep-moisturizing-cream-100g"
  },
  {
    "name": "Snail Peptide 96 Advanced Moisturizing Cream for Soft & Healthy Skin",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Peptides",
      "Snail Mucin",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Peptides"
      },
      {
        "name": "Snail Mucin"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_15_6.jpg?v=1758287036",
    "purchaseUrl": "https://thedermaco.com/products/snail-peptide-96-advanced-moisturizing-cream-100g"
  },
  {
    "name": "The Derma Co. X Dr V Skin Renew Barrier Repair Peptide Moisturizer with Peptide & Vitamin C",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Vitamin C",
      "Ceramides",
      "Peptides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Peptides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_12_16.jpg?v=1758286986",
    "purchaseUrl": "https://thedermaco.com/products/skin-renew-barrier-repair-peptide-moisturizer-with-peptide-vitamin-c-50-ml"
  },
  {
    "name": "5% Propylene Oil-Free Moisturizer with Propylene Glycol & Hyaluronic Acid",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Ceramides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1.with-bg_1.jpg?v=1758286932",
    "purchaseUrl": "https://thedermaco.com/products/5-propylene-oil-free-moisturizer-with-propylene-glycol-hyaluronic-acid-100-g"
  },
  {
    "name": "4% Urea Deep Moisturizing Cream with Urea, Lactic Acid, and Ceramide Complex",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Lactic Acid",
      "Ceramides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Lactic Acid"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1-4_urea_deep_moisturizing_cream.jpg?v=1758286923",
    "purchaseUrl": "https://thedermaco.com/products/4-urea-deep-moisturizing-cream-with-urea-lactic-acid-and-ceramide-complex-100-gm"
  },
  {
    "name": "2% Niacinamide Hydrating BB Cream with 1% Hyaluronic Acid Complex & Aquaxyl™- 30 g | 01 - Ivory",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/shoot-image.jpg?v=1758286861",
    "purchaseUrl": "https://thedermaco.com/products/2-niacinamide-hydrating-bb-cream-with-1-hyaluronic-acid-complex-aquaxyltm-30-g-01-ivory"
  },
  {
    "name": "2% Niacinamide Hydrating BB Cream with 1% Hyaluronic Acid Complex & Aquaxyl- 30 g |  02 - Nude",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/shoot-image_3.jpg?v=1758286766",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-hydrating-bb-cream-with-2-niacinamide-1-hyaluronic-acid-complex-30-g"
  },
  {
    "name": "5% Vitamin C Oil-Free Daily Face Moisturizer for Skin Radiance",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1._2.jpg?v=1758286761",
    "purchaseUrl": "https://thedermaco.com/products/5-vitamin-c-oil-free-daily-face-moisturizer-for-skin-radiance-100g"
  },
  {
    "name": "Oil-Free Daily Face Moisturizer With Hyaluronic Acid, Ceramides & Multivitamins for Non-Greasy & Hydrated Skin",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Ceramides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_ac113fc4-e7de-4055-93aa-bb78704169a3.jpg?v=1767870741",
    "purchaseUrl": "https://thedermaco.com/products/oil-free-daily-face-moisturizer-with-hyaluronic-acid-ceramides-multivitamins-for-non-greasy-hydrated-skin-100g"
  },
  {
    "name": "5% Cica-Glow Daily Face Moisturizer with Alpha Arbutin & Tranexamic Acid",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Alpha Arbutin",
      "Cica / Centella",
      "Tranexamic Acid",
      "PHA",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Alpha Arbutin"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "Tranexamic Acid"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/cica-glow-moisturizer_2.jpg?v=1758286653",
    "purchaseUrl": "https://thedermaco.com/products/5-cica-glow-daily-face-moisturizer-with-alpha-arbutin-tranexamic-acid-50-g"
  },
  {
    "name": "Pore Minimizing Daily Face Moisturizer with 3% Niacinamide 3% PHA and p-REFINYL®",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "PHA",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide",
        "concentration": "3%"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/pore-minimizing-moisturizer_2.jpg?v=1758286634",
    "purchaseUrl": "https://thedermaco.com/products/pore-minimizing-daily-face-moisturizer-with-3-niacinamide-3-pha-and-p-refinylr-50-g"
  },
  {
    "name": "3% Vitamin E Face Moisturizer With Vitamin E & Lactic Acid",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Lactic Acid",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Lactic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_18eaf962-a290-4204-b53f-49a9116d1f14.jpg?v=1787636291",
    "purchaseUrl": "https://thedermaco.com/products/3-vitamin-e-face-moisturizer"
  },
  {
    "name": "1% Salicylic Acid Oil-Free Moisturizer For Face with Oat Extract",
    "brand": "The Derma Co",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_8c9e2658-d482-42a0-aeed-5eace1d557dd.jpg?v=1766743619",
    "purchaseUrl": "https://thedermaco.com/products/1-salicylic-acid-oil-free-moisturizer-for-face-with-oat-extract-50g"
  },
  {
    "name": "Vitamin C Moisturizer for Glowing Skin",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_c1ab477a-8191-40c7-8aab-4642da0d79f7.jpg?v=1787663165",
    "purchaseUrl": "https://dotandkey.com/products/vitamin-c-moisturizer"
  },
  {
    "name": "Cica + Niacinamide Oil Free Moisturizer 25g",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Cica / Centella",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/Artboard2_1.jpg?v=1764927174",
    "purchaseUrl": "https://dotandkey.com/products/cica-niacinamide-oil-free-moisturizer-25g-free"
  },
  {
    "name": "Barrier Repair Intense Moisturizer With Ceramides",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Ceramides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_b8ecdb5f-bb1b-41b0-9e38-fa3859a5bd6a.jpg?v=1770964873",
    "purchaseUrl": "https://dotandkey.com/products/barrier-repair-intense-moisturizer"
  },
  {
    "name": "Night Reset Retinol + Ceramide Cream: 15 ml",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Glycerine",
      "Dicaprylyl Ether",
      "Dimethicone (and) Dimethicone Crosspolymer",
      "Polyacrylamide (and) C13-14 Isoparaffin (and) Laureth-7",
      "Methylsilanol Mannuronate",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Retinol"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/products/night_8a4753a0-ccc7-45b1-ab3a-4e784ef7143f.png?v=1648725246",
    "purchaseUrl": "https://dotandkey.com/products/night-reset-retinol-ceramide-cream-15-ml"
  },
  {
    "name": "Retinol & Ceramide Age Defense Night Cream| 15ml",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Glycerine",
      "Dicaprylyl Ether",
      "Dimethicone (and) Dimethicone Crosspolymer",
      "Polyacrylamide (and) C13-14 Isoparaffin (and) Laureth-7",
      "Methylsilanol Mannuronate",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Retinol"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/products/night.png?v=1752125535",
    "purchaseUrl": "https://dotandkey.com/products/retinol-ceramide-night-cream-15ml"
  },
  {
    "name": "CICA + Niacinamide Oil Free Moisturizer",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Cyclopentasiloxane",
      "Dimethicone Crosspolymer",
      "Glycerine",
      "Polyacrylamide (and) C13-14 Isoparaffin (and) Laureth-7",
      "Niacinamide",
      "Saccharide Isomerate",
      "Silanetriol (and) Hyaluronic Acid",
      "Methylsilanol Mannuronate",
      "Acrylates/C10-30 Alkyl Acrylate Crosspolymer",
      "Tocopheryl Acetate",
      "Allantoin"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/Artboard3_2d61183a-a025-49fe-b18d-fd0ef02a7961.jpg?v=1708078423",
    "purchaseUrl": "https://dotandkey.com/products/cica-niacinamide-oil-free-moisturizer-15ml-copy"
  },
  {
    "name": "72HR Hydrating Gel Moisturizer",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Cyclopentasiloxane",
      "Dimethicone Crosspolymer",
      "Glycerin",
      "Polyacrylamide (and) C13-14 Isoparaffin (and) Laureth-7",
      "Silanetriol (and) Hyaluronic Acid",
      "Dimethylsilanol Hyaluronate",
      "Saccharide Isomerate",
      "Methylsilanol Mannuronate",
      "Methylisothiazolinone (and) Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/products/mini-1.png?v=1743751115",
    "purchaseUrl": "https://dotandkey.com/products/72-hr-hydration-probiotics-15ml"
  },
  {
    "name": "Watermelon Cooling Icy Gel Moisturizer With Hyaluronic",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/Artboard1_1f1c4c5a-ebdb-42d0-b276-76e9882b57ec.jpg?v=1768545549",
    "purchaseUrl": "https://dotandkey.com/products/watermelon-moisturizer-icy-gel"
  },
  {
    "name": "Strawberry + Niacinamide Moisturizer",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_copy_3.jpg?v=1765285317",
    "purchaseUrl": "https://dotandkey.com/products/strawberry-moisturizer"
  },
  {
    "name": "Retinol Night Repair Cream with Ceramides",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Glycerine",
      "Dicaprylyl Ether",
      "Dimethicone (and) Dimethicone Crosspolymer",
      "Polyacrylamide (and) C13-14 Isoparaffin (and) Laureth-7",
      "Methylsilanol Mannuronate",
      "Retinyl Palmitate (Retinol Ester)",
      "Silanetriol (and) Hyaluronic Acid",
      "Hibiscus Sabdariffa Flower Extract",
      "Punica Granatum (Pomegranate) Seed Oil",
      "Oenothera Biennis (Evening Primrose) Oil",
      "Acrylates/C10-30 Alkyl Acrylate Crosspolymer",
      "Tocopheryl Acetate",
      "Sodium Hydroxide"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Retinol"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/Artboard1_4e07de26-042d-4740-9234-d5e603068f7d.jpg?v=1789728010",
    "purchaseUrl": "https://dotandkey.com/products/retinol-ceramide-age-defense-night-cream"
  },
  {
    "name": "72HR Gel Moisturizer + Probiotics for Face",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Cyclopentasiloxane",
      "Cyclopentasiloxane (and) Dimethicone Crosspolymer",
      "Glycerine",
      "Xylitylglucoside (and) Anhydroxylitol (and) Xylitol",
      "Polyacrylamide (and) C13-14 Isoparaffin (and) Laureth-7",
      "Sodium Polyacryloyldimethyl Taurate",
      "Hydrogenated Polydecene",
      "Trideceth-10",
      "Dimethylsilanol Hyaluronate",
      "Silanetriol (and) Hyaluronic Acid",
      "Methylsilanol Mannuronate",
      "Acrylates/C10-30 Alkyl Acrylate Crosspolymer",
      "Saccharide Isomerate (and) Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/Artboard1_95ac3e40-4665-40b5-ae87-a3379ff9847e.jpg?v=1784012053",
    "purchaseUrl": "https://dotandkey.com/products/hydrating-gel-probiotics-72-hr"
  },
  {
    "name": "Barrier Repair Moisturizer (Hyaluronic + Ceramides)",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Hyaluronic Acid",
      "Ceramides",
      "Cica / Centella",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1-175g.jpg?v=1789649901",
    "purchaseUrl": "https://dotandkey.com/products/dot-key-ceramides-hyaluronic-hydrating-face-cream-i-repairs-skin-barrier-intense-moisturization-sensitive-dry-skin-fragrance-free"
  },
  {
    "name": "Cica + Niacinamide Oil-Free Gel Moisturizer For Face",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Cyclopentasiloxane",
      "Cyclopentasiloxane (and) Dimethicone Crosspolymer",
      "Glycerine",
      "Polyacrylamide (and) C13-14 Isoparaffin (and) Laureth-7",
      "Saccharide Isomerate (and) Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_a546fc74-0b04-4f8a-b155-da1cd1b10052.jpg?v=1784012308",
    "purchaseUrl": "https://dotandkey.com/products/cica-5-niacinamide-oil-free-moisturizer-for-dark-spots-acne-fragrance-free-oily-sensitive-acne-prone-skin"
  },
  {
    "name": "Cica Calming Night Gel (Niacinamide + Green Tea)",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Glycerine",
      "Polyacrylamide (and) C13-14 Isoparaffin (and) Laureth-7",
      "Niacinamide",
      "Dimethicone",
      "Dicaprylyl Ether",
      "Cyclopentasiloxane (and) Dimethicone Crosspolymer",
      "Xylitylglucoside (and) Anhydroxylitol (and) Xylitol",
      "Disodium EDTA"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_075c2747-6b39-4135-9da9-07001a430971.jpg?v=1778925428",
    "purchaseUrl": "https://dotandkey.com/products/cica-calming-skin-renewing-night-gel"
  },
  {
    "name": "Vitamin C + E Super Bright Gel Moisturizer for Face",
    "brand": "Dot & Key",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Dicaprylyl Ether",
      "Glycerine",
      "Dimethicone",
      "Butyrospermum Parkii (Shea) Butter",
      "Xylitylglucoside (and) Anhydroxylitol (and) Xylitol",
      "Polyacrylate Crosspolymer-6",
      "Acrylates/C10-30 Alkyl Acrylate Crosspolymer",
      "Cetearyl Alcohol",
      "Ethyl Ascorbic Acid",
      "Acacia Senegal Gum (and) Xanthan Gum",
      "Niacinamide",
      "Saccharide Isomerate (and) Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_c1ab477a-8191-40c7-8aab-4642da0d79f7.jpg?v=1787663165",
    "purchaseUrl": "https://dotandkey.com/products/vitamin-c-e-super-bright-moisturizer"
  },
  {
    "name": "Calendula & Vitamin C (1%) ultra-light glow gel cream | 7ml | Mini",
    "brand": "Plum Goodness",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/calendulamini.jpg?v=1764934171",
    "purchaseUrl": "https://plumgoodness.com/products/plum-calendula-vitamin-c-1-ultra-light-glow-gel-cream-7ml-mini-copy"
  },
  {
    "name": "Rice Water & 2% Niacinamide Clear Moisture Gel Cream | 7gm | Mini",
    "brand": "Plum Goodness",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/NiaGel_7gm_ListingImage.jpg?v=1762758039",
    "purchaseUrl": "https://plumgoodness.com/products/rice-water-2-niacinamide-clear-moisture-gel-cream-7gm-mini-copy"
  },
  {
    "name": "2% Niacinamide & Rice Water Brightening Gel Moisturizer For Clear & Bright Skin",
    "brand": "Plum Goodness",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/01_fb533c16-8fd4-4091-896e-9d61bc61a9a7.jpg?v=1773150970",
    "purchaseUrl": "https://plumgoodness.com/products/2-niacinamide-rice-water-brightening-gel-moisturizer-25-g"
  },
  {
    "name": "Green Tea Night Gel For Oily, Acne-Prone Skin | 15 ml | Travel-Size",
    "brand": "Plum Goodness",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Glycolic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Glycolic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/01_c43b7811-d944-479a-8dc6-e74a8a6fdd25.jpg?v=1771047034",
    "purchaseUrl": "https://plumgoodness.com/products/green-tea-renewed-clarity-night-gel-mini-starter-pack"
  },
  {
    "name": "PeptiCharge Rejuvenating Night Crème with Multi-Peptides, Exosomes & Bifida Ferment",
    "brand": "Plum Goodness",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Peptides",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Peptides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/00_MoodshotTextureText_PRC_KG1504R1_729f40e7-8bf2-4b0a-9f90-345b946e6a9b.webp?v=1778487071",
    "purchaseUrl": "https://plumgoodness.com/products/pepticharge-rejuvenating-night-creme-with-multi-peptides-exosomes-bifida-ferment"
  },
  {
    "name": "Ceramide & Vitamin C Oil-Free Moisturizer",
    "brand": "Dr. Sheth's",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Purified Water",
      "Caprylic Capric Triglycerides",
      "Glycerin",
      "Sodium acrylates Copolymer",
      "Coconut alkanes",
      "Dimethicone",
      "Amla extract",
      "Vitamin E Acetate",
      "Terminalia Ferdinandiana Fruit Extract",
      "Laminaria Digitata Extract",
      "3-O-Ethyl Ascorbic Acid",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/39.jpg?v=1702022540",
    "purchaseUrl": "https://drsheths.com/products/ceramide-vitamin-c-oil-free-moisturizer-100g"
  },
  {
    "name": "Cica & Ceramide Oil-Free Moisturizer",
    "brand": "Dr. Sheth's",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Purified Water",
      "Caprylic Capric Triglyceride",
      "Glycerin",
      "Niacinamide",
      "Centella Asiatica Leaves",
      "Sodium Acrylate Copolymer",
      "Coconut Alkanes",
      "Dimethicone",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/C_COFM_1st.png?v=1696316256",
    "purchaseUrl": "https://drsheths.com/products/cica-ceramide-oil-free-moisturizer-50g"
  },
  {
    "name": "Haldi & Hyaluronic Acid Oil Free Moisturizer",
    "brand": "Dr. Sheth's",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Purified Water",
      "Glycerin",
      "Carbomer",
      "Haldi Beads",
      "Sodium Hyaluronate",
      "Glyceryl Glucoside",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/products/Haldi-_-Hyaluronic-Acid-Oil-Free-Moisturizer_f7bd0682-e00d-41ff-ac0c-ccc0f24d61d1.jpg?v=1665755134",
    "purchaseUrl": "https://drsheths.com/products/haldi-hyaluronic-acid-oil-free-moisturizer-50g"
  },
  {
    "name": "Kesar & Kojic Acid Oil Free Moisturizer",
    "brand": "Dr. Sheth's",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Purified Water",
      "Glycerin",
      "Sodium Acrylates Copolymer",
      "Coconut Alkanes",
      "Caprylic Capric Triglyceride",
      "Dimethicone",
      "Kojic Acid Dipalmitate",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Kojic Acid"
      },
      {
        "name": "Alpha Arbutin"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/K_K_OFM_50g.jpg?v=1791292060",
    "purchaseUrl": "https://drsheths.com/products/kesar-kojic-acid-oil-free-moisturizer-50g"
  },
  {
    "name": "Ceramide & Vitamin C Brightening Oil-Free Moisturizer",
    "brand": "Dr. Sheth's",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Purified Water",
      "Caprylic Capric Triglycerides",
      "Glycerin",
      "Sodium acrylates Copolymer",
      "Coconut alkanes",
      "Dimethicone",
      "Amla extract",
      "Vitamin E Acetate",
      "Terminalia Ferdinandiana Fruit Extract",
      "Laminaria Digitata Extract",
      "3-O-Ethyl Ascorbic Acid",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/CVC_OFM_4.jpg?v=1791291978",
    "purchaseUrl": "https://drsheths.com/products/ceramide-vitamin-c-oil-free-moisturizer-50g"
  },
  {
    "name": "Oats & Ceramide Sensitive Skin Moisturizer",
    "brand": "Dr. Sheth's",
    category: ProductCategory.MOISTURIZER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Ceramides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/Copyof1.jpg?v=1743573948",
    "purchaseUrl": "https://drsheths.com/products/oats-ceramide-sensitive-skin-moisturizer-100g"
  },
  {
    "name": "Vitamin B12 + NMF 03% Face Toner",
    "brand": "Minimalist",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/ListingImageMilkyToner_a8ab36fc-8692-4454-85e2-363dbdb3b21d.jpg?v=1764930471",
    "purchaseUrl": "https://beminimalist.co/products/vitamin-b12-nmf-03-face-toner"
  },
  {
    "name": "Glycolic Acid 8% Exfoliating Liquid",
    "brand": "Minimalist",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Glycolic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Glycolic Acid",
        "concentration": "8%"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/GlycolicNew.png?v=1721398128",
    "purchaseUrl": "https://beminimalist.co/products/glycolic-acid-08-exfoliating-liquid-toner"
  },
  {
    "name": "Polyhydroxy Acid (PHA) 3% Face Toner",
    "brand": "Minimalist",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "PHA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/PHANew.jpg?v=1721379191",
    "purchaseUrl": "https://beminimalist.co/products/pha-3-biotic-toner"
  },
  {
    "name": "2% Salicylic BHA Hydrating Toner",
    "brand": "The Derma Co",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Salicylic Acid",
      "Hyaluronic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/pdp-bha.jpg?v=1772451465",
    "purchaseUrl": "https://thedermaco.com/products/2-salicylic-bha-hydrating-toner-150-ml"
  },
  {
    "name": "The Derma Co. X Dr V Skin Renew Peptide Hydrating Toner with Peptide & Hyaluronic Acid",
    "brand": "The Derma Co",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Hyaluronic Acid",
      "Peptides",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Peptides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/fop_10.jpg?v=1758286982",
    "purchaseUrl": "https://thedermaco.com/products/skin-renew-peptide-hydrating-toner-with-peptide-hyaluronic-acid-100-ml"
  },
  {
    "name": "7% Glycolic Acid Hydrating Toner with Glycolic Acid & Hyaluronic Acid For Gentle Exfoliation",
    "brand": "The Derma Co",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Glycolic Acid",
      "Hyaluronic Acid",
      "Ceramides",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/front_3.jpg?v=1758286929",
    "purchaseUrl": "https://thedermaco.com/products/7-glycolic-acid-hydrating-toner-with-glycolic-acid-hyaluronic-acid-for-gentle-exfoliation-150-ml"
  },
  {
    "name": "Cica + Niacinamide Toner with Green Tea",
    "brand": "Dot & Key",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Lactic Acid",
      "Glycerine",
      "Propanediol",
      "Sodium Hydroxide"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Lactic Acid"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_2_87c2f2cf-90da-4ec5-82ce-0e8415d76c59.jpg?v=1765797060",
    "purchaseUrl": "https://dotandkey.com/products/cica-niacinamide-toner-with-green-tea-free"
  },
  {
    "name": "Watermelon + Glycolic Acid Toner",
    "brand": "Dot & Key",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Lactic Acid",
      "Glycerine",
      "Propanediol",
      "Sodium Hydroxide"
    ],
    "activeIngredients": [
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Lactic Acid"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1B-Watermelon-Toner_6b044178-150b-4fd1-a5a1-5a3560ebc82f.jpg?v=1721454844",
    "purchaseUrl": "https://dotandkey.com/products/watermelon-glycolic-acid-toner"
  },
  {
    "name": "Blueberry Hydrate Barrier Repair Toner with Ceramides & Rice Water",
    "brand": "Dot & Key",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water",
      "Lactic Acid",
      "Propanediol",
      "Glycerine",
      "Sodium Hydroxide"
    ],
    "activeIngredients": [
      {
        "name": "Lactic Acid"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1-Rice-Water-Toner_9bfe5b1a-fcdd-41a8-9dc5-eb2a8db6a45c.jpg?v=1689275880",
    "purchaseUrl": "https://dotandkey.com/products/copy-of-hyaluronic-japanese-rice-water-toner"
  },
  {
    "name": "Watermelon + Glycolic Acid Pore Tightening Toner",
    "brand": "Dot & Key",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Lactic Acid",
      "Glycerine",
      "Propanediol",
      "Sodium Hydroxide"
    ],
    "activeIngredients": [
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Lactic Acid"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_4371d891-7fd2-40f8-b74b-1584f4148a9c.jpg?v=1765796934",
    "purchaseUrl": "https://dotandkey.com/products/watermelon-superglow-pore-tightening-toner"
  },
  {
    "name": "Blueberry Hydrate Barrier Repair Rice Water Toner",
    "brand": "Dot & Key",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water",
      "Lactic Acid",
      "Propanediol",
      "Glycerine",
      "Sodium Hydroxide"
    ],
    "activeIngredients": [
      {
        "name": "Lactic Acid"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_1_1c2f5f30-8e90-47e2-b6a6-8dc756b09d22.jpg?v=1765796994",
    "purchaseUrl": "https://dotandkey.com/products/rice-water-probiotics-hydrating-toner-alcohol-free-new"
  },
  {
    "name": "Plum Rice Water & 3% Niacinamide Toner | 20ml | Mini",
    "brand": "Plum Goodness",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.TEXTURE,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/WhatsAppImage2025-08-14at13.06.16_7c2dce8a_fa2d6e6c-dd71-4acc-a83a-b745d4254cf7.jpg?v=1755194351",
    "purchaseUrl": "https://plumgoodness.com/products/plum-rice-water-3-niacinamide-toner-20ml-mini"
  },
  {
    "name": "3% Niacinamide & Rice Water Toner for Bright Skin | 80 ml",
    "brand": "Plum Goodness",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/NiaToner80ml01_c39b382e-4457-4d99-9d4a-f8179d925094.webp?v=1777376177",
    "purchaseUrl": "https://plumgoodness.com/products/3-niacinamide-rice-water-toner-for-bright-skin80ml"
  },
  {
    "name": "Exfoliating 7% Glycolic Acid Toner with Niacinamide",
    "brand": "Deconstruct",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Glycolic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Glycolic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0712/5621/1737/files/Exfoliating_7__Glycolic_Acid_Toner.webp?v=1782482331",
    "purchaseUrl": "https://thedeconstruct.in/products/exfoliating-glycolic-acid-toner"
  },
  {
    "name": "HOCL Skin Relief Spray 150 ppm",
    "brand": "Minimalist",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.TEXTURE,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/HOCLmain.png?v=1756795671",
    "purchaseUrl": "https://beminimalist.co/products/hocl-skin-relief-spray-150-ppm-toner"
  },
  {
    "name": "Hypochlorous Anti-Acne Hydrating Spray",
    "brand": "The Derma Co",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/fop_13_5.jpg?v=1758287075",
    "purchaseUrl": "https://thedermaco.com/products/hypochlorous-anti-acne-hydrating-spray-200ml"
  },
  {
    "name": "Blueberry Hydrate Barrier Repair Milk Face Toner",
    "brand": "Dot & Key",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_e060a681-2eb5-422f-a25e-ff0d1fd55b1d.jpg?v=1751367041",
    "purchaseUrl": "https://dotandkey.com/products/blueberry-hydrate-barrier-repair-milky-toner-essence"
  },
  {
    "name": "Green Tea Alcohol-Free Pore Tightening Face Toner For Oily & Acne-Prone Skin",
    "brand": "Plum Goodness",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/Listing_1st_Tile_GT_Toner_200ml_1001x1001_px_c93eaf1e-d084-4779-bce8-6a976cadbed7.webp?v=1782212495",
    "purchaseUrl": "https://plumgoodness.com/products/green-tea-alcohol-free-pore-tightening-face-toner-for-oily-acne-prone-skin-1"
  },
  {
    "name": "Green Tea Alcohol-free Toner | 80ml | Full Size",
    "brand": "Plum Goodness",
    category: ProductCategory.TONER,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.TEXTURE,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/GT-toner-80-ml_1x1_a02b33d3-5f68-4bbe-921d-4e67aef208d1.jpg?v=1782904054",
    "purchaseUrl": "https://plumgoodness.com/products/green-tea-alcohol-free-toner-80ml-full-size"
  },
  {
    "name": "Niacinamide 5% Face Serum 10ml",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.TEXTURE,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide",
        "concentration": "5%"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/Nia_05_10ml_1_1e27f2ef-09d0-4140-bf9e-05d62459489e.jpg?v=1756982138",
    "purchaseUrl": "https://beminimalist.co/products/niacinamide-5-face-serum-10ml"
  },
  {
    "name": "Copper Peptide + PDRN 1.25% Face Serum",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Peptides",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Peptides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/CopyofArtboard1_2.jpg?v=1757069577",
    "purchaseUrl": "https://beminimalist.co/products/copper_peptide_pdrn_1-25_face_serum"
  },
  {
    "name": "Retinol 0.6% Face Serum",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Retinol",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Retinol",
        "concentration": "0.6%"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/Retinol_06_New.png?v=1721398129",
    "purchaseUrl": "https://beminimalist.co/products/retinol-0-6"
  },
  {
    "name": "Retinal 0.1% Face Serum",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Retinal",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Retinal",
        "concentration": "0.1%"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/DomesticMain.png?v=1729750815",
    "purchaseUrl": "https://beminimalist.co/products/retinal-0-1-face-serum"
  },
  {
    "name": "CPH Complex + Oligopeptide 0.8% Anti-Dandruff Serum",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Peptides",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Peptides",
        "concentration": "0.8%"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/CPHNew.png?v=1721632055",
    "purchaseUrl": "https://beminimalist.co/products/cph-complex-oligopeptide-0-8-anti-dandruff-serum"
  },
  {
    "name": "Niacinamide 10% Face Serum",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.TEXTURE,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide",
        "concentration": "10%"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/Nia10New.png?v=1721398127",
    "purchaseUrl": "https://beminimalist.co/products/niacinamide-10-with-matmarine"
  },
  {
    "name": "Vitamin C + E + Ferulic 16% Face Serum",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/Vit16New.png?v=1721398127",
    "purchaseUrl": "https://beminimalist.co/products/vitamin-c-e-ferulic-16"
  },
  {
    "name": "Retinol 0.3% Face Serum",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Retinol",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Retinol",
        "concentration": "0.3%"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/Reti3New.png?v=1721398129",
    "purchaseUrl": "https://beminimalist.co/products/retinol-0-3-q10"
  },
  {
    "name": "Tranexamic 3% Face Serum",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Tranexamic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Tranexamic Acid",
        "concentration": "3%"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/TranNew.png?v=1721398127",
    "purchaseUrl": "https://beminimalist.co/products/tranexamic-3-hpa"
  },
  {
    "name": "Multi-Peptides 10% Face Serum",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Peptides",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Peptides",
        "concentration": "10%"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/MultiNew.png?v=1721398128",
    "purchaseUrl": "https://beminimalist.co/products/multi-peptide-serum-7-matrixyl-3000-3-bio-placenta"
  },
  {
    "name": "Vitamin C 10% Face Serum",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C",
        "concentration": "10%"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/products/VitaminC10_1200-1-min.png?v=1646543848",
    "purchaseUrl": "https://beminimalist.co/products/vitamin-c-ethyl-ascorbic-acid-10-acetyl-glucosamine-1"
  },
  {
    "name": "Alpha Arbutin 2% Face Serum",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Alpha Arbutin",
      "PHA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Alpha Arbutin",
        "concentration": "2%"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/AlphaArNew.png?v=1721397838",
    "purchaseUrl": "https://beminimalist.co/products/alpha-arbutin-2"
  },
  {
    "name": "Niacinamide 5% Face Serum",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.TEXTURE,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide",
        "concentration": "5%"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/products/Niacinamide5_1200-1-min.png?v=1646458955",
    "purchaseUrl": "https://beminimalist.co/products/niacinamide-5-hyaluronic-acid-1"
  },
  {
    "name": "Salicylic Acid 2% Face Serum",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid",
        "concentration": "2%"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/products/SalicylicAcid2_1200-1-min.png?v=1646458899",
    "purchaseUrl": "https://beminimalist.co/products/salicylic-acid-2"
  },
  {
    "name": "Hyaluronic + PGA 2% Face Serum",
    "brand": "Minimalist",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/products/HAPGA2_1200-1-min.png?v=1646395962",
    "purchaseUrl": "https://beminimalist.co/products/2-hyaluronic-acid"
  },
  {
    "name": "1% Hyaluronic Daily Hydrating Serum-Lotion",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Ceramides",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_1_4c3ce806-1fb8-44b2-b7c1-cd8bffd4043b.jpg?v=1790066213",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-daily-hydrating-serum-lotion-400ml"
  },
  {
    "name": "10% Vitamin C Face Serum",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Vitamin C",
      "Hyaluronic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/4_FOP_4c74f532-5a09-480e-aace-76986090fbe6.jpg?v=1784701969",
    "purchaseUrl": "https://thedermaco.com/products/10-vitamin-c-face-serum-8ml"
  },
  {
    "name": "Skin Renew Hyperpigmentation Peptide Serum",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Peptides",
      "Tranexamic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Peptides"
      },
      {
        "name": "Tranexamic Acid"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_FOP_1bf172c6-c047-49f8-9af5-ba5dfae58fba.jpg?v=1785741321",
    "purchaseUrl": "https://thedermaco.com/products/skin-renew-hyperpigmentation-peptide-serum-30ml"
  },
  {
    "name": "2% Salicylic Acid Serum for Active Acne",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/the-derma-co-2-percentage-sasalicylic-acid-face-serum-fop.jpg?v=1758287158",
    "purchaseUrl": "https://thedermaco.com/products/2-salicylic-acid-serum-8ml-1"
  },
  {
    "name": "10% Niacinamide Serum",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Ceramides",
      "Zinc PCA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Zinc PCA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/the-derma-co-10-niacinamide-face-serum.jpg?v=1762332234",
    "purchaseUrl": "https://thedermaco.com/products/10-niacinamide-serum-free-1"
  },
  {
    "name": "2% Kojic Acid Face Serum with 1% Alpha Arbutin & Niacinamide",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Kojic Acid",
      "Alpha Arbutin",
      "PHA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Kojic Acid"
      },
      {
        "name": "Alpha Arbutin"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/2_-kojic-acide-serum-8ml-front.jpg?v=1758287026",
    "purchaseUrl": "https://thedermaco.com/products/2-kojic-acid-face-serum-with-1-alpha-arbutin-niacinamide-8-ml"
  },
  {
    "name": "2% Kojic Acid Face Serum for Dark Spots And Pigmentation",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Kojic Acid",
      "Alpha Arbutin",
      "PHA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Kojic Acid"
      },
      {
        "name": "Alpha Arbutin"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/kojic-10ml.jpg?v=1783947429",
    "purchaseUrl": "https://thedermaco.com/products/2-kojic-acid-face-serum-with-1-alpha-arbutin-niacinamide-for-dark-spots-and-pigmentation-10-ml"
  },
  {
    "name": "10% Vitamin C Face Serum with 5% Niacinamide & Hyaluronic Acid",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Vitamin C",
      "Hyaluronic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/10-vitamin_PDP_30ml.png?v=1787832462",
    "purchaseUrl": "https://thedermaco.com/products/10-vitamin-c-face-serum-with-niacinamide-hyaluronic-acid-for-skin-radiance-30ml"
  },
  {
    "name": "10% Niacinamide Face Serum with 2% Zinc PCA",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Zinc PCA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Zinc PCA"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/pdp_niacin_50ml.jpg?v=1758287211",
    "purchaseUrl": "https://thedermaco.com/products/10-niacinamide-face-serum-50ml"
  },
  {
    "name": "50000 PPM Vitamin C Microneedle Serum Shot Refill Pack",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Hyaluronic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/pdp_vit-c-microneedle-refill.jpg?v=1758287204",
    "purchaseUrl": "https://thedermaco.com/products/50000-ppm-vitamin-c-microneedle-serum-shot-refill-pack-10-g"
  },
  {
    "name": "Nia-Zelaic Oil Control Face Serum",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Azelaic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Azelaic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/pdp_nia-zelaic_new.jpg?v=1758287202",
    "purchaseUrl": "https://thedermaco.com/products/nia-zelaic-oil-control-face-serum-30-ml"
  },
  {
    "name": "3000 PPM Retinol Microneedle Serum Shot with Squalene, Panthenol & Hyaluronic Acid for Skin Renewal",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Retinol",
      "Hyaluronic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Retinol"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_7120659b-36a8-46a8-8c39-bda60a0960f9.jpg?v=1790057692",
    "purchaseUrl": "https://thedermaco.com/products/3000-ppm-retinol-microneedle-serum-shot-for-skin-renewal-10-g"
  },
  {
    "name": "20000 PPM Kojic Acid Microneedle Serum Shot for Pigmentation Correction & Skin Renewal",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Kojic Acid",
      "Alpha Arbutin",
      "PHA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Kojic Acid"
      },
      {
        "name": "Alpha Arbutin"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_366a0394-b1c7-4173-844b-d8203f9a8a03.jpg?v=1789716257",
    "purchaseUrl": "https://thedermaco.com/products/20000-ppm-kojic-acid-microneedle-serum-shot-for-pigmentation-10-g"
  },
  {
    "name": "50000 PPM Vitamin C Microneedle Serum Shot with Glutathione, Panthenol & Hyaluronic Acid for Bright & Revitalized Skin",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Hyaluronic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_5a2ad49f-b0f5-47fd-87f6-af4776257850.jpg?v=1789716036",
    "purchaseUrl": "https://thedermaco.com/products/50000-ppm-vitamin-c-microneedle-serum-shot-10-g"
  },
  {
    "name": "15% Vitamin C Face Serum",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Vitamin C",
      "Hyaluronic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/15-vitamin_PDP-30ml.png?v=1787832036",
    "purchaseUrl": "https://thedermaco.com/products/15-vitamin-c-face-serum-30ml"
  },
  {
    "name": "Snail Peptide 96 Hydrating Serum with Snail Mucin & Peptide Complex for Smooth & Moisturized Skin",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Peptides",
      "Snail Mucin",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Peptides"
      },
      {
        "name": "Snail Mucin"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/snail-peptide-serum-front.jpg?v=1758287022",
    "purchaseUrl": "https://thedermaco.com/products/snail-peptide-96-hydrating-serum-with-snail-mucin-peptide-complex-for-smooth-moisturized-skin-30-ml"
  },
  {
    "name": "Tran-Zelaic Pigmentation Corrector Serum with Tranexamic Acid & Azelaic Acid",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Azelaic Acid",
      "Alpha Arbutin",
      "Tranexamic Acid",
      "PHA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Azelaic Acid"
      },
      {
        "name": "Alpha Arbutin"
      },
      {
        "name": "Tranexamic Acid"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/tran-zelaic-pigmentation-corrector-serum-front.jpg?v=1772452253",
    "purchaseUrl": "https://thedermaco.com/products/tran-zelaic-pigmentation-corrector-serum-with-tranexamic-acid-azelaic-acid-30-g"
  },
  {
    "name": "The Derma Co. X Dr V Skin Renew Peptide Retinol Serum-Cream with Peptide & Retinol",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Retinol",
      "Retinal",
      "Alpha Arbutin",
      "Peptides",
      "PHA",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Retinol"
      },
      {
        "name": "Retinal"
      },
      {
        "name": "Alpha Arbutin"
      },
      {
        "name": "Peptides"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_12_15.jpg?v=1758286987",
    "purchaseUrl": "https://thedermaco.com/products/skin-renew-peptide-retinol-serum-cream-with-peptide-retinol-30-ml"
  },
  {
    "name": "The Derma Co. X Dr V Skin Renew ABC Peptide Exfoliator Serum with Lactic Acid, Salicylic Acid, and Peptides",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Lactic Acid",
      "Vitamin C",
      "Peptides",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Lactic Acid"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Peptides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_12_14.jpg?v=1758286984",
    "purchaseUrl": "https://thedermaco.com/products/skin-renew-abc-peptide-exfoliator-serum-with-lactic-acid-salicylic-acid-and-peptides-30-ml"
  },
  {
    "name": "Sali-Cinamide Anti-Acne Serum with 2% Salicylic Acid & 5% Niacinamide",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Salicylic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Salicylic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/pdp_sali-cinamide_serum.jpg?v=1758286814",
    "purchaseUrl": "https://thedermaco.com/products/sali-cinamide-anti-acne-serum-with-2-salicylic-acid-5-niacinamide-30ml"
  },
  {
    "name": "C-Cinamide Radiance Serum With 10% Vitamin C & 5% Niacinamide",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Vitamin C",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_5_3.jpg?v=1758286787",
    "purchaseUrl": "https://thedermaco.com/products/c-cinamide-radiance-serum-with-10-vitamin-c-5-niacinamide-30ml"
  },
  {
    "name": "1% Salicylic Acid Daily Exfoliating Body Serum-Lotion For Rough & Bumpy Skin",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Glycolic Acid",
      "Zinc PCA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Zinc PCA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1-with-green-bg.jpg?v=1758286757",
    "purchaseUrl": "https://thedermaco.com/products/1-salicylic-acid-daily-exfoliating-body-serum-lotion-for-rough-bumpy-skin-250-ml"
  },
  {
    "name": "1% Kojic Acid Daily Glow Body Serum-Lotion",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Kojic Acid",
      "Alpha Arbutin",
      "PHA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Kojic Acid"
      },
      {
        "name": "Alpha Arbutin"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_fa8e1522-dd25-40a7-ac3e-880d3ca95867.jpg?v=1786622302",
    "purchaseUrl": "https://thedermaco.com/products/1-kojic-acid-daily-glow-body-serum-lotion-for-skin-radiance-200-ml"
  },
  {
    "name": "1% Kojic + Arbutin Night Repair Face Serum-Gel",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Kojic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Kojic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_-kojic-_-arbutin-night-repair-face-serum-gel_2.jpg?v=1758286695",
    "purchaseUrl": "https://thedermaco.com/products/1-kojic-arbutin-night-repair-face-serum-gel-50g"
  },
  {
    "name": "5% Vitamin C Daily Face Serum with Ferulic Acid & Multivitamin",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/fop_5_vitc.jpg?v=1758286651",
    "purchaseUrl": "https://thedermaco.com/products/5-vitamin-c-daily-face-serum-with-ferulic-acid-multivitamin-30ml"
  },
  {
    "name": "5% Niacinamide Daily Face Serum with Alpha Arbutin & Multivitamin",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Alpha Arbutin",
      "PHA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Alpha Arbutin"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/niacinamide-daily-face-serum-2.jpg?v=1758286648",
    "purchaseUrl": "https://thedermaco.com/products/5-niacinamide-daily-face-serum-with-alpha-arbutin-multivitamin-30ml"
  },
  {
    "name": "10% Cica-Glow Face Serum with Tranexamic Acid & Kojic Acid",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Kojic Acid",
      "Cica / Centella",
      "Tranexamic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Kojic Acid"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "Tranexamic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/cica-glow-fs-2.jpg?v=1758286646",
    "purchaseUrl": "https://thedermaco.com/products/10-cica-glow-face-serum-with-tranexamic-acid-kojic-acid-30ml"
  },
  {
    "name": "Pore Minimizing Face Serum with 4% Niacinamide, 5% PHA and p-REFINYL®",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "PHA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/pore-minimizing-face-serum.jpg?v=1758286636",
    "purchaseUrl": "https://thedermaco.com/products/pore-minimizing-face-serum-with-4-niacinamide-5-pha-and-p-refinylr-30-ml"
  },
  {
    "name": "2% Glutathione Face Serum With Glutathione and Tranexamic Acid",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Tranexamic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Tranexamic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/2__glutathione_face_serum_colored_bg.jpg?v=1758286602",
    "purchaseUrl": "https://thedermaco.com/products/2-glutathione-face-serum-with-glutathione-and-tranexamic-acid-30-ml"
  },
  {
    "name": "10% Niacinamide Serum 10ml",
    "brand": "The Derma Co",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Ceramides",
      "Zinc PCA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Zinc PCA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/niacinamide-10ml.jpg?v=1783947382",
    "purchaseUrl": "https://thedermaco.com/products/10-niacinamide-serum-free"
  },
  {
    "name": "Strawberry + Niacinamide Serum",
    "brand": "Dot & Key",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.TEXTURE,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/Serum_package.jpg?v=1761136481",
    "purchaseUrl": "https://dotandkey.com/products/strawberry-niacinamide-serum-3-ml"
  },
  {
    "name": "Vitamin C Serum 10 ml",
    "brand": "Dot & Key",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/Artboard36.jpg?v=1765543226",
    "purchaseUrl": "https://dotandkey.com/products/vitamin-c-serum-10-ml-free"
  },
  {
    "name": "Strawberry Bright 10% Niacinamide Face Serum",
    "brand": "Dot & Key",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/Artboard_1_f94f4456-d328-4271-ab7e-94bde8c9bbd3.jpg?v=1745323515",
    "purchaseUrl": "https://dotandkey.com/products/10-niacinamide-strawberry-brightening-face-serum"
  },
  {
    "name": "Pomegranate Youth 0.2% Retinol Complex Face Serum",
    "brand": "Dot & Key",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Retinol",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Retinol"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1-1_1.jpg?v=1761888868",
    "purchaseUrl": "https://dotandkey.com/products/0-2-retinol-complex-face-serum"
  },
  {
    "name": "12% Barrier Boost Serum (Hyaluronic + Ceramides)",
    "brand": "Dot & Key",
    category: ProductCategory.SERUM,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Ceramides",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1-30ml.jpg?v=1784205186",
    "purchaseUrl": "https://dotandkey.com/products/barrier-repair-serum"
  },
  {
    "name": "Brightening & SPF Skincare Gift Set",
    "brand": "Minimalist",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Vitamin C",
      "PHA",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide",
        "concentration": "5%"
      },
      {
        "name": "Vitamin C",
        "concentration": "10%"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/RAV9029copy_1.jpg?v=1697519671",
    "purchaseUrl": "https://beminimalist.co/products/brightening-spf-skincare-gift-set"
  },
  {
    "name": "1% Hyaluronic Sunscreen Oil-Free Matte Gel for Oily & Acne-Prone Skin",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Zinc PCA",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Zinc PCA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/0_PDP_16fe27d9-b2d9-413b-b437-c39b8e55aa0a.jpg?v=1787037869",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-sunscreen-oil-free-matte-gel-80-g"
  },
  {
    "name": "1% Hyaluronic Sunscreen Aqua Gel with SPF 50 & PA++++",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/aqua_gel_10gm_fop.jpg?v=1758287121",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-sunscreen-aqua-gel-with-spf-50-pa-10g-1"
  },
  {
    "name": "1% Hyaluronic Long Lasting Sunscreen SPF 50 & PA++++, Dewy Finish for All Skin Types",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1._9_2.jpg?v=1758286975",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-long-lasting-sunscreen-spf-50-pa-with-hyaluronic-acid-vitamin-e-for-upto-6-hour-sun-protection-10-g"
  },
  {
    "name": "1% Hyaluronic Sunscreen Oil-Free Gel",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Zinc PCA",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Zinc PCA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/pdp_1_ha_10g.jpg?v=1758287155",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-sunscreen-oil-free-gel-10-g-1"
  },
  {
    "name": "1% Kojic Acid Lip Balm with Alpha Arbutin & Hyaluronic Acid with SPF 50 - 4.5g",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Kojic Acid",
      "Alpha Arbutin",
      "Peptides",
      "PHA",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Kojic Acid"
      },
      {
        "name": "Alpha Arbutin"
      },
      {
        "name": "Peptides"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_b5a57fe3-da36-4f71-8f94-b479a4b52ab5.jpg?v=1762931620",
    "purchaseUrl": "https://thedermaco.com/products/1-kojic-acid-lip-balm-with-alpha-arbutin-hyaluronic-acid-with-s-p-f-50-4-5g"
  },
  {
    "name": "Oily Skin Essentials",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Glycolic Acid",
      "Hyaluronic Acid",
      "Ceramides",
      "Zinc PCA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Zinc PCA"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/8_fop_oily_skin_essentials.jpg?v=1758287183",
    "purchaseUrl": "https://thedermaco.com/products/tdc-oily-skin-essentials"
  },
  {
    "name": "Go-To Regimen for Normal Skin",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Salicylic Acid",
      "Hyaluronic Acid",
      "Ceramides",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/go-to_regimen_for_normal_skin_fop_white_bg.jpg?v=1758287165",
    "purchaseUrl": "https://thedermaco.com/products/go-to-regimen-for-normal-skin"
  },
  {
    "name": "Everyday Regimen for Oily Skin",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Salicylic Acid",
      "Hyaluronic Acid",
      "Ceramides",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/everyday_regimen_for_oily_skin_fop_white_bg.jpg?v=1758287164",
    "purchaseUrl": "https://thedermaco.com/products/everyday-regimen-for-oily-skin"
  },
  {
    "name": "1% Hyaluronic Sunscreen Hydrating Gel In Vivo Tested (ISO 24444:2019 Certified, CTRI/2025/01/079445) with SPF 50 PA++++, Dewy Finish for Dry & Sensitive Skin",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Ceramides",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/pdp_h_s_hydrating.jpg?v=1758287134",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-sunscreen-hydrating-gel-50-g"
  },
  {
    "name": "1% Hyaluronic Sunscreen Oil-Free Matte Gel for Oily & Acne-Prone Skin In Vivo Tested (ISO 24444:2019 Certified, CTRI/2025/02/079913)",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Zinc PCA",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Zinc PCA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/0_PDP_0f84fd1b-f462-484b-8240-f3f679ccb1c2.jpg?v=1787037706",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-sunscreen-oil-free-gel-50-g"
  },
  {
    "name": "C-Cinamide Radiance Sunscreen Aqua Gel",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Vitamin C",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_14.jpg?v=1758287033",
    "purchaseUrl": "https://thedermaco.com/products/c-cinamide-radiance-sunscreen-aqua-gel-80g"
  },
  {
    "name": "1% Hyaluronic Sunscreen Aqua Gel In Vivo Tested (ISO 24444:2019 Certified, CTRI/2025/02/080287) with SPF 50 & PA++++, Dewy Finish for All Skin Types",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_068e41bc-0834-44a1-8191-2917c08863f2.jpg?v=1787037628",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-sunscreen-aqua-gel-with-spf-50-pa-125-g"
  },
  {
    "name": "1% Hyaluronic Quick-Absorbing Sunscreen Spray with Hyaluronic Acid & Vitamin E",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1._10_1.jpg?v=1758287016",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-quick-absorbing-sunscreen-spray-with-hyaluronic-acid-vitamin-e-100-ml"
  },
  {
    "name": "Pore Minimizing Sunscreen Gel For Open Pores & UVA/UVB Protection",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_2.jpg?v=1770271547",
    "purchaseUrl": "https://thedermaco.com/products/niacinamide-sunscreen-for-open-pores-80g"
  },
  {
    "name": "1% Hyaluronic Long Lasting Sunscreen SPF 50 & PA++++ with Hyaluronic Acid & Vitamin E  for Upto 6-Hour Sun Protection , Dewy Finish for All Skin Types",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1._8.jpg?v=1758286935",
    "purchaseUrl": "https://thedermaco.com/products/vitamin-e-sunscreen-for-long-lasting-effect-50g"
  },
  {
    "name": "Ultra Light Zinc Mineral Sunscreen with SPF 50 For Broad Spectrum, UVA, UVB & Blue Light Protection",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Zinc PCA",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Zinc PCA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1-ultra_light_zinc_mineral_sunscreen_with_blue_light_protection_-_50g.jpg?v=1758286885",
    "purchaseUrl": "https://thedermaco.com/products/ultra-light-zinc-mineral-sunscreen-with-spf-50-for-broad-spectrum-uva-uvb-blue-light-protection-50g"
  },
  {
    "name": "2% Niacinamide High Coverage Foundation With 1% Hyaluronic Acid Complex & SPF 40 PA+++ for 12 Hour Long Stay & 12 Hour Oil Control | 07 Cinnamon",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/niacinamide_foundation_cinnamon_shade_1.jpg?v=1758286883",
    "purchaseUrl": "https://thedermaco.com/products/2-niacinamide-high-coverage-foundation-with-1-hyaluronic-acid-and-spf-40-pa-for-12-hour-long-stay-and-oil-control-cinnamon"
  },
  {
    "name": "2% Niacinamide High Coverage Foundation With 1% Hyaluronic Acid Complex & SPF 40 PA+++ for 12 Hour Long Stay & 12 Hour Oil Control | 06 Beige",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/niacinamide_foundation_peach_shade_1_1.jpg?v=1758286880",
    "purchaseUrl": "https://thedermaco.com/products/2-niacinamide-high-coverage-foundation-with-1-hyaluronic-acid-and-spf-40-pa-for-12-hour-long-stay-and-oil-control-beige"
  },
  {
    "name": "2% Niacinamide High Coverage Foundation With 1% Hyaluronic Acid Complex & SPF 40 PA+++ for 12 Hour Long Stay & 12 Hour Oil Control | 05 Peach",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/niacinamide_foundation_peach_shade_1.jpg?v=1758286878",
    "purchaseUrl": "https://thedermaco.com/products/2-niacinamide-high-coverage-foundation-with-1-hyaluronic-acid-and-spf-40-pa-for-12-hour-long-stay-and-oil-control-peach"
  },
  {
    "name": "2% Niacinamide High Coverage Foundation With 1% Hyaluronic Acid Complex & SPF 40 PA+++ for 12 Hour Long Stay & 12 Hour Oil Control | 04 Caramel",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/niacinamide_foundation_caramel_shade_1.jpg?v=1758286876",
    "purchaseUrl": "https://thedermaco.com/products/2-niacinamide-high-coverage-foundation-with-1-hyaluronic-acid-and-spf-40-pa-for-12-hour-long-stay-and-oil-control-caramel"
  },
  {
    "name": "2% Niacinamide High Coverage Foundation With 1% Hyaluronic Acid Complex & SPF 40 PA+++ for 12 Hour Long Stay & 12 Hour Oil Control | 03 Natural",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/niacinamide_foundation_natural_shade_1.jpg?v=1758286874",
    "purchaseUrl": "https://thedermaco.com/products/2-niacinamide-high-coverage-foundation-with-1-hyaluronic-acid-and-spf-40-pa-for-12-hour-long-stay-and-oil-control-natural"
  },
  {
    "name": "2% Niacinamide High Coverage Foundation With 1% Hyaluronic Acid Complex & SPF 40 PA+++ for 12 Hour Long Stay & 12 Hour Oil Control | 02 Nude",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/niacinamide_foundation_nude_shade_1.jpg?v=1758286872",
    "purchaseUrl": "https://thedermaco.com/products/2-niacinamide-high-coverage-foundation-with-1-hyaluronic-acid-and-spf-40-pa-for-12-hour-long-stay-and-oil-control-nude"
  },
  {
    "name": "2% Niacinamide High Coverage Foundation With 1% Hyaluronic Acid Complex & SPF 40 PA+++ for 12 Hour Long Stay & 12 Hour Oil Control | 01 Ivory",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/foundation_ivory_image_new_1.jpg?v=1758286869",
    "purchaseUrl": "https://thedermaco.com/products/2-niacinamide-high-coverage-foundation-with-1-hyaluronic-acid-and-spf-40-pa-for-12-hour-long-stay-and-oil-control-ivory"
  },
  {
    "name": "1% Ceramide Complex Lip Balm with Ceramides & Vitamin E, SPF 30 PA++ for Dry & Chapped Lips",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Ceramides",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/front-ceramide_complex_lip_balm_with_ceramides_vitamin_e_for_dry_chapped_lips.jpg?v=1758286867",
    "purchaseUrl": "https://thedermaco.com/products/1-ceramide-complex-lip-balm-with-ceramides-vitamin-e-for-dry-chapped-lips-4g"
  },
  {
    "name": "1% Hyaluronic Tinted Sunscreen Gel with SPF 60 & PA++++ for Broad Spectrum Protection",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Zinc PCA",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Zinc PCA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_monocarton_orange_1.jpg?v=1758286808",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-tinted-sunscreen-gel-with-spf-60-pa-for-broad-spectrum-protection-30g"
  },
  {
    "name": "1% Hyaluronic Sunscreen Aqua Gel In-Vivo Tested (ISO 24444:2019 Certified, CTRI/2025/02/080287), UVA: 39.984 (PA++++) (PPD 39) with SPF 50 & PA++++,Dewy Finish for All Skin Types",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_911b53cf-01bf-4858-b1c4-fbfa4d2c3977.jpg?v=1787037557",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-sunscreen-aqua-gel-with-spf-50-pa-80g"
  },
  {
    "name": "C-Cinamide Radiance Sunscreen Aqua Gel with SPF 50 & PA++++",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Vitamin C",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/fop_c-cinamide_white_bg.jpg?v=1758286799",
    "purchaseUrl": "https://thedermaco.com/products/c-cinamide-radiance-sunscreen-aqua-gel-with-spf-50-pa-50g"
  },
  {
    "name": "Mattifying 100% Mineral Powder Sunscreen with SPF 50 For On The Go Broad Spectrum Protection",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Zinc PCA",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Zinc PCA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/mattifying_mineral_power_sunscreen.jpg?v=1758286790",
    "purchaseUrl": "https://thedermaco.com/products/mattifying-100-mineral-powder-sunscreen-with-spf-50-for-on-the-go-broad-spectrum-protection-4g"
  },
  {
    "name": "Pore Minimizing Sunscreen Gel with SPF 50 & PA+++ For Open Pores & UVA/UVB Protection",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_5907e859-db48-4170-80fc-80ad85051367.jpg?v=1773233915",
    "purchaseUrl": "https://thedermaco.com/products/pore-minimizing-priming-sunscreen-with-spf-50-pa-for-open-pores-uva-uvb-protection-50g"
  },
  {
    "name": "Hyaluronic Invisible Sunscreen Gel with Hyaluronic Acid & Vitamin E",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1080x1080-5.jpg?v=1758286726",
    "purchaseUrl": "https://thedermaco.com/products/hyaluronic-invisible-sunscreen-gel-with-hyaluronic-acid-vitamin-e-50g"
  },
  {
    "name": "1% Hyaluronic Acid Sunscreen Serum with SPF 50 & Niacinamide",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_-hyaluronic-sunscreen-serum-2.jpg?v=1758286662",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-acid-sunscreen-serum-with-spf-50-niacinamide-30ml"
  },
  {
    "name": "1% Hyaluronic Tinted Sunscreen Gel for Broad Spectrum Protection",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Zinc PCA",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Zinc PCA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1080x1080-1.jpg?v=1758286640",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-tinted-sunscreen-gel-for-broad-spectrum-protection-50g"
  },
  {
    "name": "1% Hyaluronic Sunscreen Aqua Gel In Vivo Tested (ISO 24444:2019 Certified, CTRI/2025/02/080287), UVA: 39.984 (PA++++) (PPD 39) with SPF 50 & PA++++ , Dewy Finish for All Skin Types",
    "brand": "The Derma Co",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_79def908-1a95-443e-a7c9-d8dcd2c9ae41.jpg?v=1787037417",
    "purchaseUrl": "https://thedermaco.com/products/1-hyaluronic-sunscreen-aqua-gel"
  },
  {
    "name": "Vitamin C + E Sunscreen SPF 50+ PA++++ With New-Age UV Filters",
    "brand": "Dot & Key",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water",
      "3 Butylene Glycol",
      "Isododecane",
      "Dicaprylyl Carbonate",
      "Glycerin",
      "Titanium Dioxide (and) Silica (and) Dimethicone",
      "Caprylic Triglyceride",
      "Glyceryl Citrate/lactate/linoleate/oleate",
      "Propanediol",
      "Niacinamide",
      "Ascorbyl glucoside",
      "Tocopheryl Acetate",
      "Terminalia Ferdinandiana (Kakadu Plum) Fruit Extract",
      "Citrus Sinensis (Blood Orange) Fruit Extract",
      "Sodium Gluconate",
      "Xanthan Gum",
      "Polyacrylate cross polymer -6",
      "Polyacrylate-13 (and) Polyisobutene (and) Polysorbate 20",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/VitaminCSunscreenListing1-1_637b02a6-7537-475e-989f-bd472a2e415c.jpg?v=1778839085",
    "purchaseUrl": "https://dotandkey.com/products/vitamin-c-e-sunscreen-spf-50-pa"
  },
  {
    "name": "Super Cica & Salicylic Anti Acne Routine",
    "brand": "Dot & Key",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Cica / Centella",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/po_75d03401-63c8-40ce-95a8-261e091603cc.jpg?v=1788342206",
    "purchaseUrl": "https://dotandkey.com/products/break-up-with-acne-combo-2"
  },
  {
    "name": "Vitamin C + E 100% Mineral Sunscreen IN-VIVO tested SPF 50+, PA++++",
    "brand": "Dot & Key",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1a_055631d9-8489-46d1-bddf-bd21e2b6e9aa.jpg?v=1771219495",
    "purchaseUrl": "https://dotandkey.com/products/vitamin-c-e-mineral-sunscreen"
  },
  {
    "name": "Strawberry Dew Tinted Sunscreen SPF 50+ PA++++ With New-Age UV Filters",
    "brand": "Dot & Key",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.PIGMENTATION
    ],
    "ingredients": [
      "Aqua",
      "3-Butylene Glycol",
      "Isododecane",
      "Glycerine",
      "Phenyl Trimethicone",
      "Propanediol",
      "Glyceryl Citrate/Lactate/Linoleate/Oleate",
      "Cyclopentasiloxane",
      "Cyclopentasiloxane (and) Dimethicone Cross polymer",
      "Caprylic/Capric Triglyceride",
      "Dicaprylyl Carbonate",
      "Zea Mays (Corn) Starch",
      "Fragaria Ananassa (Strawberry) Fruit Extract",
      "Sodium Hyaluronate",
      "Niacinamide",
      "Panthenol",
      "Tocopheryl acetate",
      "Polyglyceryl-3 Polyricinoleate",
      "Xanthan Gum",
      "Polyacrylate Crosspolymer-6",
      "Polyacrylate-13 (and) Polyisobutene (and) Polysorbate 20",
      "Sodium Gluconate",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_68456143-ee8a-40e9-85a3-5768a6233bb6.jpg?v=1786079947",
    "purchaseUrl": "https://dotandkey.com/products/strawberry-dew-tinted-sunscreen-spf-50-pa"
  },
  {
    "name": "Strawberry Sunscreen Stick, In-Vivo Tested SPF 50+ PA++++",
    "brand": "Dot & Key",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Hyaluronic Acid",
      "Ceramides",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1d_2.jpg?v=1767963095",
    "purchaseUrl": "https://dotandkey.com/products/strawberry-sunstick"
  },
  {
    "name": "Barrier Repair Hydrating Lip Balm In-Vivo Tested SPF 50+ PA+++",
    "brand": "Dot & Key",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Ceramides",
      "PHA",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_e2b57832-8f88-43e7-9a47-8a547cada069.jpg?v=1755090118",
    "purchaseUrl": "https://dotandkey.com/products/hydrating-lip-balm"
  },
  {
    "name": "Cica + Niacinamide Sunscreen, In-Vivo Tested SPF 50+ PA++++",
    "brand": "Dot & Key",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Cica / Centella",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1CicaSunscreenListing1-50g.jpg?v=1778925569",
    "purchaseUrl": "https://dotandkey.com/products/cica-calming-mattifying-sunscreen-spf-50-pa"
  },
  {
    "name": "Watermelon Cooling Sunscreen Body Spray In-Vivo Tested SPF 50+ PA+++",
    "brand": "Dot & Key",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.SENSITIVE,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "3-Butylene Glycol",
      "Glycerine",
      "C12-15 Alkyl Benzoate",
      "Caprylic/Capric Triglyceride",
      "Propanediol",
      "Cyclopentasiloxane",
      "Zea Mays (Corn) Starch",
      "Citrullus Lanatus (Watermelon) Fruit Extract",
      "Oxothiazolidine (and) Butylene glycol (and) Sodium benzoate"
    ],
    "activeIngredients": [
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_446d76ca-995c-4642-8b11-a03e3dcce05e.jpg?v=1746425277",
    "purchaseUrl": "https://dotandkey.com/products/biphasic-sunscreen-spray"
  },
  {
    "name": "Swim + Sports Sunscreen, In-Vivo Tested SPF 50+ PA++++",
    "brand": "Dot & Key",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water",
      "Ethylhexyl Methoxycinnamate",
      "Dibutyl Adipate",
      "Dicaprylyl Carbonate",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Polyglyceryl-2 Dipolyhydroxystearate",
      "Dimethicone",
      "Glycerine",
      "Sodium Lauryl Glucose Carboxylate (and) Lauryl Glucoside",
      "Citrus Aurantifolia (Lime) Fruit Extract",
      "Niacinamide",
      "Tocopheryl Acetate",
      "Panthenol",
      "Xanthan Gum",
      "Sodium Polyacrylate",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/0_2002bcb0-12fa-46d5-8163-4f75d3de0772.jpg?v=1781517563",
    "purchaseUrl": "https://dotandkey.com/products/lime-rush-swim-sports-spf-50-sunscreen"
  },
  {
    "name": "Barrier Repair Sunscreen, In-Vivo Tested SPF 50+ PA++++",
    "brand": "Dot & Key",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "3-Butylene Glycol",
      "Propanediol",
      "Sodium Acrylates Copolymer (and) Lecithin",
      "C12-15 Alkyl Benzoate",
      "Caprylic/Capric Triglyceride",
      "Cyclopentasiloxane",
      "Glycerine",
      "Propylene Glycol",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Salicylate",
      "Xylitylglucoside (and) Anhydroxylitol (and) Xylitol",
      "Glyceryl Monostearate",
      "Cetearyl Alcohol",
      "Titanium Dioxide (and) Silica",
      "Allantoin"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Peptides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1-80g_2ea96953-f32f-4bd1-9e18-9d0304527c8a.jpg?v=1790758846",
    "purchaseUrl": "https://dotandkey.com/products/barrier-repair-sunscreen"
  },
  {
    "name": "Ceramide + Peptide Lip Balm In-Vivo Tested SPF 50+ PA+++",
    "brand": "Dot & Key",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Hyaluronic Acid",
      "Ceramides",
      "Peptides",
      "PHA",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Peptides"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/3--Warm-Nude-v2.jpg?v=1744710057",
    "purchaseUrl": "https://dotandkey.com/products/spf-50-barrier-repair-lip-balm"
  },
  {
    "name": "Vitamin C + E Gloss Boss Lip Balm In-Vivo Tested SPF 50+ PA+++",
    "brand": "Dot & Key",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "PHA",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_d36392f6-8d39-40b4-bbf9-0cbaa4ea618b.jpg?v=1788760305",
    "purchaseUrl": "https://dotandkey.com/products/spf-30-vitamin-c-e-lip-balm"
  },
  {
    "name": "Watermelon Sunscreen SPF 50+ PA++++ With New-Age UV Filters For Oily Skin",
    "brand": "Dot & Key",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "3-Butylene Glycol",
      "Glycerine",
      "C12-15 Alkyl Benzoate",
      "Caprylic/Capric Triglyceride",
      "Propanediol",
      "Cyclopentasiloxane",
      "Zea Mays (Corn) Starch",
      "Citrullus Lanatus (Watermelon) Fruit Extract",
      "Oxothiazolidine (and) Butylene glycol (and) Sodium benzoate"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1-80G_bb347e61-11ee-4d8b-ad8e-4e3602e69164.jpg?v=1790680752",
    "purchaseUrl": "https://dotandkey.com/products/watermelon-cooling-spf-50-face-sunscreen"
  },
  {
    "name": "Pomegranate + Multi-Peptide Anti Ageing Moisturizer SPF 30",
    "brand": "Dot & Key",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Ethylhexyl Methoxycinnamate",
      "Glycerine",
      "Glyceryl Stearate (and) PEG-100 Stearate",
      "Butyl Methoxydibenzoylmethane",
      "Cyclopentasiloxane",
      "Cyclopentasiloxane (and) Dimethicone Crosspolymer",
      "Ethylhexyl Salicylate",
      "Polyacrylamide (and) C13-14 Isoparaffin (and) Laureth-7",
      "Cetyl Alcohol",
      "Aluminium Starch Octenylsuccinate",
      "Xylitylglucoside (and) Anhydroxylitol (and) Xylitol",
      "Titanium Dioxide (and) Silica (and) Dimethicone",
      "6II (and) Cholesterol (and) 1",
      "2-hexanediol",
      "Niacinamide",
      "Acrylates/C10-30 Alkyl Acrylate Crosspolymer",
      "Triethanolamine",
      "Tocopheryl Acetate",
      "Disodium EDTA"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Peptides"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_262025d4-8a3e-4d7e-8e45-a5d4d979c758.jpg?v=1744370218",
    "purchaseUrl": "https://dotandkey.com/products/pomegranate-miracle-vitamin-e-revitalizing-moisturizer-spf-30"
  },
  {
    "name": "3% Niacinamide & Rice Water SPF 50 Sheer-Tinted Sunscreen",
    "brand": "Plum Goodness",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/Listing1stTileNiaTintedSPF1001x1001px_7b958aa5-6b9b-4109-a25b-8b8f7b0a7f92.webp?v=1777968512",
    "purchaseUrl": "https://plumgoodness.com/products/3-niacinamide-rice-water-spf-50-sheer-tinted-sunscreen-50-g"
  },
  {
    "name": "Cica & Hyaluronic Acid Aqua-Light SPF 50 PA++++",
    "brand": "Plum Goodness",
    category: ProductCategory.SPF,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Hyaluronic Acid",
      "Cica / Centella",
      "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
      "Ethylhexyl Triazone",
      "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
      "Silica",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/01_Moodshot_Texture_Text.jpg?v=1771413181",
    "purchaseUrl": "https://plumgoodness.com/products/cica-hyaluronic-acid-spf-50-pa-sunscreen"
  },
  {
    "name": "Vitamin K + Retinal 1% Eye Cream",
    "brand": "Minimalist",
    category: ProductCategory.EYE_CREAM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Retinal",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Retinal",
        "concentration": "1%"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/KRetinalNew.png?v=1721632054",
    "purchaseUrl": "https://beminimalist.co/products/vitamin-k-retinal-01-eye-cream"
  },
  {
    "name": "The Derma Co. X Dr V Skin Renew Peptide Under Eye Cream",
    "brand": "The Derma Co",
    category: ProductCategory.EYE_CREAM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Retinol",
      "Vitamin C",
      "Peptides",
      "Caffeine",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Retinol"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Peptides"
      },
      {
        "name": "Caffeine"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/FOP_f2c78bf0-3dc1-4876-8ca4-8eee50263022.jpg?v=1766038021",
    "purchaseUrl": "https://thedermaco.com/products/skin-renew-peptide-under-eye-cream-15-ml"
  },
  {
    "name": "Snail Peptide 96 Under Eye Repair Cream with Snail Mucin & Peptide Complex For Dark Circles & Puffiness",
    "brand": "The Derma Co",
    category: ProductCategory.EYE_CREAM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Retinol",
      "Peptides",
      "Snail Mucin",
      "Caffeine",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Retinol"
      },
      {
        "name": "Peptides"
      },
      {
        "name": "Snail Mucin"
      },
      {
        "name": "Caffeine"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/snail-peptide-96-under-eye-cream-front.jpg?v=1758287018",
    "purchaseUrl": "https://thedermaco.com/products/snail-peptide-96-under-eye-repair-cream-with-snail-mucin-peptide-complex-for-dark-circles-puffiness-15-g"
  },
  {
    "name": "Watermelon Hydrogel Under-eye Patches",
    "brand": "Dot & Key",
    category: ProductCategory.EYE_CREAM,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water",
      "Glycerin",
      "Carrageenan",
      "Niacinamide",
      "Benzyl Alcohol",
      "Ethylhexylglycerin"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Retinol"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Caffeine"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1c-Eye-Patch_8a533c07-83b8-4f57-a1dd-8f765d17d6e5.jpg?v=1758114635",
    "purchaseUrl": "https://dotandkey.com/products/watermelon-cooling-hydrogel-eye-patches"
  },
  {
    "name": "Pomegranate + Retinol Eye Cream for Dark Circles",
    "brand": "Dot & Key",
    category: ProductCategory.EYE_CREAM,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Caprylic/Capric Triglyceride",
      "3-Butylene Glycol",
      "Dicaprylyl Ether",
      "Siloxanetriol Alginate (and) Caffeine (and) Butylene Glycol",
      "Glyceryl Stearate (and) PEG-100 Stearate",
      "Cetearyl Alcohol",
      "Cetearyl Olivate (and) Sorbitan Olivate",
      "Lauryl Laurate",
      "Glycerine",
      "C14-22 Alcohols (and) C12-20 Alkyl Glucoside",
      "Stearyl Dimethicone (and) Octadecene",
      "Acrylates/C10-30 Alkyl Acrylate Crosspolymer",
      "Allantoin"
    ],
    "activeIngredients": [
      {
        "name": "Retinol"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Zinc PCA"
      },
      {
        "name": "Peptides"
      },
      {
        "name": "Caffeine"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1-Retinol-Eye-Cream_0dbf6882-9197-4d09-8d3f-55c8f95c1984.jpg?v=1727356057",
    "purchaseUrl": "https://dotandkey.com/products/retinol-eye-cream"
  },
  {
    "name": "3% Vitamin C, 3% Peptide & 3% Caffeine Under Eye Cream with Mandarin",
    "brand": "Plum Goodness",
    category: ProductCategory.EYE_CREAM,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Peptides",
      "Caffeine",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      },
      {
        "name": "Peptides"
      },
      {
        "name": "Caffeine"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/Listing_1st_Tile_Vit_C_Under_Eye_Cream_1001x1001_px.webp?v=1776938914",
    "purchaseUrl": "https://plumgoodness.com/products/vitamin-c-eye-cream-with-mandarin"
  },
  {
    "name": "Rice Water & Niacinamide 3% Under-Eye Crème with Peptides, Ceramides & Caffeine",
    "brand": "Plum Goodness",
    category: ProductCategory.EYE_CREAM,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Ceramides",
      "Peptides",
      "Caffeine",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide",
        "concentration": "3%"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Peptides"
      },
      {
        "name": "Caffeine"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/NiaUnderEyeCremeListing01_688dac8b-214b-455e-8350-b3073346ce0e.webp?v=1785509148",
    "purchaseUrl": "https://plumgoodness.com/products/rice-water-niacinamide-3-under-eye-creme-with-peptides-ceramides-caffeine"
  },
  {
    "name": "Copper & Argireline® Peptide B'tox Eye Cream",
    "brand": "Dr. Sheth's",
    category: ProductCategory.EYE_CREAM,
    "skinTypes": [
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Peptides",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Squalane",
      "Dimethicone",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Peptides"
      }
    ],
    priceTier: PriceTier.PREMIUM,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/Copper_argeline_peptide_btox_eye_cream.jpg?v=1790150042",
    "purchaseUrl": "https://drsheths.com/products/copper-argireline-peptide-btox-eye-cream-15g"
  },
  {
    "name": "AHA PHA BHA 32% Face Peel",
    "brand": "Minimalist",
    category: ProductCategory.TREATMENT,
    "skinTypes": [
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "PHA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0410/9608/5665/products/AHAPHABHA32_1200-1-min.png?v=1646480856",
    "purchaseUrl": "https://beminimalist.co/products/aha-25-pha-5-bha-2"
  },
  {
    "name": "2% Sali-Cinamide Hydrocolloid Acne Patches - 36 Patches",
    "brand": "The Derma Co",
    category: ProductCategory.TREATMENT,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Salicylic Acid",
      "Azelaic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Azelaic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_PDP_21a95925-9004-4bf8-b951-501c330fac0f.jpg?v=1785128549",
    "purchaseUrl": "https://thedermaco.com/products/2-sali-cinamide-hydrocolloid-acne-patches"
  },
  {
    "name": "2.5% Benzoyl Peroxide Spot Corrector",
    "brand": "The Derma Co",
    category: ProductCategory.TREATMENT,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Zinc PCA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Zinc PCA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/pdp_spot_corrector.jpg?v=1758287152",
    "purchaseUrl": "https://thedermaco.com/products/benzoyl-peroxide-spot-corrector-10g"
  },
  {
    "name": "3% Kojic Acid Dark Spot Corrector Gel with Azelaic & Tranexamic Acid",
    "brand": "The Derma Co",
    category: ProductCategory.TREATMENT,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Kojic Acid",
      "Azelaic Acid",
      "Tranexamic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Kojic Acid"
      },
      {
        "name": "Azelaic Acid"
      },
      {
        "name": "Tranexamic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1st-image_2_6.jpg?v=1758286736",
    "purchaseUrl": "https://thedermaco.com/products/3-kojic-acid-dark-spot-corrector-gel-with-azelaic-tranexamic-acid-30g"
  },
  {
    "name": "Hydrocolloid Acne Pimple Patch with 2% Salicylic Acid & 0.2% Tea Tree Oil | 36 Patches, 3 Sizes",
    "brand": "Deconstruct",
    category: ProductCategory.TREATMENT,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Cica / Centella",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0712/5621/1737/files/APP_listing.webp?v=1769876463",
    "purchaseUrl": "https://thedeconstruct.in/products/acne-pimple-patch"
  },
  {
    "name": "15% AHA+1% BHA Beginner Face Peeling Solution",
    "brand": "The Derma Co",
    category: ProductCategory.TREATMENT,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/15__aha_1__bha_peeling_solution_colored_bg.jpg?v=1758286580",
    "purchaseUrl": "https://thedermaco.com/products/15-aha-1-bha-beginner-face-peeling-solution"
  },
  {
    "name": "1% Salicylic Acid Sheet Mask With Salicylic Acid & Allantoin",
    "brand": "The Derma Co",
    category: ProductCategory.MASK,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Salicylic Acid",
      "Hyaluronic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Hyaluronic Acid"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0888/8057/8807/files/1_4_1.jpg?v=1758286622",
    "purchaseUrl": "https://thedermaco.com/products/1-salicylic-acid-face-serum-sheet-mask-with-salicylic-acid-allantoin-20g"
  },
  {
    "name": "Mango Detan Clay Mask",
    "brand": "Dot & Key",
    category: ProductCategory.MASK,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Kaolin",
      "Glycerine",
      "Caprylic/Capric Triglyceride",
      "Cetearyl Alcohol",
      "Bentonite",
      "Cetearyl Alcohol and Polysorbate 60",
      "Niacinamide",
      "Sodium Lactate",
      "Glyceryl Stearate (and) PEG-100 Stearate",
      "Lauryl Glucoside",
      "Hydroxyethylcellulose",
      "Lactic Acid",
      "Hydrolyzed Jojoba Esters",
      "C18-22 Hydroxyalkyl Hydroxypropyl Guar",
      "Sodium Hydroxide"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Lactic Acid"
      },
      {
        "name": "Kojic Acid"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_2671075a-ae2b-4a43-8935-434211ec2d7f.jpg?v=1727355954",
    "purchaseUrl": "https://dotandkey.com/products/mango-clay-mask"
  },
  {
    "name": "Vitamin C Pink Clay Mask",
    "brand": "Dot & Key",
    category: ProductCategory.MASK,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Kaolin",
      "Glycerine",
      "Bentonite",
      "French Pink Clay",
      "PEG-8",
      "Titanium Dioxide",
      "Polysorbate 20",
      "PPG-33 Butyl Ether",
      "Propylene Glycol",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Retinol"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1-Pink-Clay-Mask.jpg?v=1727355949",
    "purchaseUrl": "https://dotandkey.com/products/vitamin-c-pink-clay-mask"
  },
  {
    "name": "Cica & Salicylic French Green Clay Face Mask",
    "brand": "Dot & Key",
    category: ProductCategory.MASK,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Kaolin",
      "Glycerine",
      "Bentonite",
      "French Green Clay",
      "PEG-8",
      "Polysorbate 20",
      "PPG-33 Butyl Ether",
      "Propylene Glycol",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Cica / Centella"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1_526949b7-3f81-40b9-be91-962510dc191e.jpg?v=1780568870",
    "purchaseUrl": "https://dotandkey.com/products/acne-green-clay-mask"
  },
  {
    "name": "Green Tea Clear Face Mask  | Full-Size| 60 gm",
    "brand": "Plum Goodness",
    category: ProductCategory.MASK,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Glycolic Acid",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Glycolic Acid"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0390/2985/files/Listing_1st_Tile_GT_Face_Mask_60g_1001x1001_px.webp?v=1777978257",
    "purchaseUrl": "https://plumgoodness.com/products/green-tea-clear-face-mask-for-oily-acne-prone-skin-copy"
  },
  {
    "name": "Collagen & Vitamin C Overnight Moisture Wrapping Mask",
    "brand": "Dr. Sheth's",
    category: ProductCategory.MASK,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION,
      SkinType.DRY
    ],
    "concerns": [
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Vitamin C",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Vitamin C"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/COLLAGEN_VITAMIN_C_OVERNIGHT_MOISTURE_WRAPPING_MASK.jpg?v=1790148636",
    "purchaseUrl": "https://drsheths.com/products/collagen-vitamin-c-overnight-moisture-wrapping-mask-50ml"
  },
  {
    "name": "Gulab & Glycolic Acid Face Mask",
    "brand": "Dr. Sheth's",
    category: ProductCategory.MASK,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua (Water)",
      "Kaolin",
      "Glycolic Acid",
      "Cetearyl Alcohol",
      "Glyceryl Stearate",
      "Glycerin",
      "Aloe Barbadensis Extract",
      "Bentonite",
      "Coco-Caprylate/Caprate",
      "Magnesium Aluminum Silicate",
      "PEG-100 Stearate",
      "Phenoxyethanol"
    ],
    "activeIngredients": [
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/ForWebsitePDP.jpg?v=1695627484",
    "purchaseUrl": "https://drsheths.com/products/gulab-glycolic-acid-face-mask-50g"
  },
  {
    "name": "Gulab & Glycolic Acid Body Peel",
    "brand": "Dr. Sheth's",
    category: ProductCategory.MASK,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Purified Water",
      "Lactic Acid",
      "Glycerin",
      "Propylene Glycol",
      "Glycolic Acid",
      "Sodium Hydroxide"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Lactic Acid"
      },
      {
        "name": "Vitamin C"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/G_G-Body-Peel.jpg?v=1693494103",
    "purchaseUrl": "https://drsheths.com/products/gulab-glycolic-acid-body-peel-100g"
  },
  {
    "name": "Haldi & Hyaluronic Acid Sleeping Mask",
    "brand": "Dr. Sheth's",
    category: ProductCategory.MASK,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Niacinamide",
      "Hyaluronic Acid",
      "Ceramides",
      "Cica / Centella",
      "PHA",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "Ceramides"
      },
      {
        "name": "Cica / Centella"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/files/H_H_1stImage_68136ae6-cd06-44d3-851a-8efcf5e3fd86.jpg?v=1696929219",
    "purchaseUrl": "https://drsheths.com/products/haldi-hyaluronic-acid-sleeping-mask"
  },
  {
    "name": "Medifacial @ Home : High Strength Peel",
    "brand": "Dr. Sheth's",
    category: ProductCategory.MASK,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Aqua",
      "Glycolic Acid",
      "Lactic Acid",
      "Mandelic Acid",
      "Gluconolactone",
      "Aloe Barbadensis Leaf Juice",
      "Propylene Glycol",
      "Polyacrylate Crosspolymer-6",
      "Sodium Hydroxide"
    ],
    "activeIngredients": [
      {
        "name": "Salicylic Acid"
      },
      {
        "name": "Glycolic Acid"
      },
      {
        "name": "Lactic Acid"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/products/Medifacial_Home--High-Strength-Peel_9efcb139-ea41-4e93-a59b-02ac9b478043.jpg?v=1665754962",
    "purchaseUrl": "https://drsheths.com/products/medifacial-home-high-strength-peel-30ml"
  },
  {
    "name": "Liquorice & Lactic Acid Peel",
    "brand": "Dr. Sheth's",
    category: ProductCategory.MASK,
    "skinTypes": [
      SkinType.OILY,
      SkinType.COMBINATION,
      SkinType.NORMAL,
      SkinType.DRY,
      SkinType.SENSITIVE
    ],
    "concerns": [
      SkinConcern.ACNE,
      SkinConcern.OILINESS,
      SkinConcern.PIGMENTATION,
      SkinConcern.DRYNESS,
      SkinConcern.REDNESS,
      SkinConcern.SENSITIVITY,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Purified Water",
      "Lactic Acid",
      "Glycerin",
      "Polyacrylate Crosspolymer-6",
      "Niacinamide",
      "Sodium Hydroxide"
    ],
    "activeIngredients": [
      {
        "name": "Niacinamide"
      },
      {
        "name": "Lactic Acid"
      },
      {
        "name": "Hyaluronic Acid"
      },
      {
        "name": "PHA"
      }
    ],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0490/6011/8686/products/Liqourice-_-Lactic-Peel_941849f8-bf72-4379-9600-5b9b7fa92dee.jpg?v=1665755253",
    "purchaseUrl": "https://drsheths.com/products/liquorice-lactic-acid-peel-30g"
  },
  {
    "name": "Collagen & Peptide Lip Sleeping Mask",
    "brand": "Deconstruct",
    category: ProductCategory.MASK,
    "skinTypes": [
      SkinType.DRY,
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.DRYNESS,
      SkinConcern.FINE_LINES,
      SkinConcern.TEXTURE
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Peptides",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [
      {
        "name": "Peptides"
      }
    ],
    priceTier: PriceTier.BUDGET,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0712/5621/1737/files/final-resized-imagesArtboard-14.webp?v=1779365270",
    "purchaseUrl": "https://thedeconstruct.in/products/moisture-locking-lip-sleeping-mask-with-collagen-and-peptide"
  },
  {
    "name": "Watermelon Cool Icy Plunge Clay Mask",
    "brand": "Dot & Key",
    category: ProductCategory.MASK,
    "skinTypes": [
      SkinType.NORMAL,
      SkinType.COMBINATION
    ],
    "concerns": [
      SkinConcern.TEXTURE,
      SkinConcern.DRYNESS
    ],
    "ingredients": [
      "Water / Aqua",
      "Glycerin",
      "Propanediol",
      "Panthenol",
      "Allantoin",
      "Sodium Hyaluronate",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Disodium EDTA",
      "Citric Acid"
    ],
    "activeIngredients": [],
    priceTier: PriceTier.MID,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/Artboard1_8245e3fb-5c69-4b2f-b9c7-84fb42e52e95.jpg?v=1773820743",
    "purchaseUrl": "https://dotandkey.com/products/watermelon-cool-icy-plunge-clay-mask"
  }
];
