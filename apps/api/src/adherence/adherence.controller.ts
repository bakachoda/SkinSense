import { Controller, Post, Get, Body, Query, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AdherenceService } from "./adherence.service";
import { CreateAdherenceLogSchema, type CreateAdherenceLog } from "@skinsense/types";

@Controller("adherence")
@UseGuards(SupabaseAuthGuard)
export class AdherenceController {
  constructor(private adherenceService: AdherenceService) {}

  @Post()
  logAdherence(
    @CurrentUser("supabaseId") supabaseId: string,
    @Body() body: unknown,
  ) {
    const parsed: CreateAdherenceLog = CreateAdherenceLogSchema.parse(body);
    return this.adherenceService.logAdherence(supabaseId, parsed);
  }

  @Get()
  getLogs(
    @CurrentUser("supabaseId") supabaseId: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.adherenceService.getLogs(supabaseId, from, to);
  }
}
