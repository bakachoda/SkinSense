import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { EnvironmentalService } from "./environmental.service";

@Controller("environmental-context")
@UseGuards(SupabaseAuthGuard)
export class EnvironmentalController {
  constructor(private environmentalService: EnvironmentalService) {}

  @Get()
  getEnvironmentalContext(@Query("postalCode") postalCode?: string) {
    return this.environmentalService.getEnvironmentalContext(postalCode);
  }
}
