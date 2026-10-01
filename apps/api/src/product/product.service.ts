import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { ProductFilter } from "@skinsense/types";
import { Prisma, SkinType, SkinConcern, ProductCategory, PriceTier } from "@prisma/client";

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: ProductFilter = { limit: 20, offset: 0 }) {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (filter.skinType) {
      where.skinTypes = {
        has: filter.skinType as SkinType,
      };
    }

    if (filter.category) {
      where.category = filter.category as ProductCategory;
    }

    if (filter.priceTier) {
      where.priceTier = filter.priceTier as PriceTier;
    }

    if (filter.concerns && filter.concerns.length > 0) {
      where.concerns = {
        hasSome: filter.concerns as SkinConcern[],
      };
    }

    if (filter.search && filter.search.trim().length > 0) {
      const term = filter.search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { brand: { contains: term, mode: "insensitive" } },
      ];
    }

    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const offset = Math.max(0, Number(filter.offset) || 0);

    // If excludeIngredients is provided, filter either via query or in memory
    const [rawProducts, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
      }),
      this.prisma.product.count({ where }),
    ]);

    let filtered = rawProducts;
    if (filter.excludeIngredients && filter.excludeIngredients.length > 0) {
      const excludedLower = filter.excludeIngredients.map((i) => i.toLowerCase().trim());
      filtered = rawProducts.filter((product) => {
        return !product.ingredients.some((ing) => {
          const ingLower = ing.toLowerCase();
          return excludedLower.some((ex) => ex.length > 2 && ingLower.includes(ex));
        });
      });
    }

    const paginated = filtered.slice(offset, offset + limit);

    return {
      products: paginated,
      total: filtered.length,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return { product };
  }
}
