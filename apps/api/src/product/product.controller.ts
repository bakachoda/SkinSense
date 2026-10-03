import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ProductService } from "./product.service";
import { ProductFilterSchema, type ProductFilter } from "@skinsense/types";

@Controller()
@UseGuards(SupabaseAuthGuard)
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get("products")
  findAll(@Query() query: Record<string, any>) {
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

  @Post("products/scan-barcode")
  scanBarcode(@Body() body: { barcode: string }) {
    return this.productService.scanBarcode(body.barcode || "");
  }

  @Post("products/scan-ocr")
  scanOcr(@Body() body: { rawText?: string; imageKey?: string }) {
    return this.productService.scanOcr(body.rawText, body.imageKey);
  }

  @Get("products/:id")
  findOne(@Param("id") id: string) {
    return this.productService.findOne(id);
  }

  // User Product Library Endpoints (Phase 4, Section 13.3)
  @Get("user-products")
  getUserProducts(@CurrentUser("supabaseId") supabaseId: string) {
    return this.productService.getUserProducts(supabaseId);
  }

  @Post("user-products")
  addUserProduct(
    @CurrentUser("supabaseId") supabaseId: string,
    @Body() body: any,
  ) {
    return this.productService.addUserProduct(supabaseId, body);
  }

  @Delete("user-products/:id")
  deleteUserProduct(
    @CurrentUser("supabaseId") supabaseId: string,
    @Param("id") id: string,
  ) {
    return this.productService.deleteUserProduct(supabaseId, id);
  }
}
