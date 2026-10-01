import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { ProductService } from "./product.service";
import { ProductFilterSchema, type ProductFilter } from "@skinsense/types";

@Controller("products")
@UseGuards(SupabaseAuthGuard)
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  findAll(@Query() query: Record<string, any>) {
    // Parse array query params if passed as string (e.g. concerns=ACNE,OILINESS or excludeIngredients=fragrance,alcohol)
    const formattedQuery: Record<string, any> = { ...query };
    if (typeof query["concerns"] === "string") {
      formattedQuery["concerns"] = query["concerns"].split(",").map((s: string) => s.trim());
    }
    if (typeof query["excludeIngredients"] === "string") {
      formattedQuery["excludeIngredients"] = query["excludeIngredients"]
        .split(",")
        .map((s: string) => s.trim());
    }

    const filter: ProductFilter = ProductFilterSchema.parse(formattedQuery);
    return this.productService.findAll(filter);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productService.findOne(id);
  }
}
