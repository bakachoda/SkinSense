import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IndianSkincareScraperService } from "../../product/scraper/indian-skincare.scraper";

@Processor("catalog-sync")
@Injectable()
export class CatalogSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(CatalogSyncProcessor.name);

  constructor(
    private prisma: PrismaService,
    private scraperService: IndianSkincareScraperService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Starting Catalog Sync Job ${job.id} (name: ${job.name})...`);

    try {
      const scrapedProducts = await this.scraperService.scrapeAllBrands();
      this.logger.log(`Scraped ${scrapedProducts.length} items from official Indian brand sites.`);

      let createdCount = 0;
      let updatedCount = 0;

      for (const prod of scrapedProducts) {
        // Look up by brand and name (case-insensitive)
        const existing = await this.prisma.product.findFirst({
          where: {
            brand: { equals: prod.brand, mode: "insensitive" },
            name: { equals: prod.name, mode: "insensitive" },
          },
        });

        if (existing) {
          await this.prisma.product.update({
            where: { id: existing.id },
            data: {
              category: prod.category as any,
              skinTypes: prod.skinTypes as any,
              concerns: prod.concerns as any,
              ingredients: prod.ingredients,
              activeIngredients: prod.activeIngredients,
              priceTier: prod.priceTier as any,
              imageUrl: prod.imageUrl ?? existing.imageUrl,
              purchaseUrl: prod.purchaseUrl ?? existing.purchaseUrl,
              isActive: true,
            },
          });
          updatedCount++;
        } else {
          await this.prisma.product.create({
            data: {
              name: prod.name,
              brand: prod.brand,
              category: prod.category as any,
              skinTypes: prod.skinTypes as any,
              concerns: prod.concerns as any,
              ingredients: prod.ingredients,
              activeIngredients: prod.activeIngredients,
              priceTier: prod.priceTier as any,
              imageUrl: prod.imageUrl ?? null,
              purchaseUrl: prod.purchaseUrl ?? null,
              isActive: true,
            },
          });
          createdCount++;
        }
      }

      this.logger.log(
        `Catalog sync complete. Created: ${createdCount}, Updated: ${updatedCount}, Total: ${scrapedProducts.length}`,
      );

      return {
        success: true,
        totalScraped: scrapedProducts.length,
        createdCount,
        updatedCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error(`Catalog sync failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
