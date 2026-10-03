import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { MedicationService } from "./medication.service";

@Controller("medications")
@UseGuards(SupabaseAuthGuard)
export class MedicationController {
  constructor(private medicationService: MedicationService) {}

  @Get()
  getMedications(@CurrentUser("supabaseId") supabaseId: string) {
    return this.medicationService.getMedications(supabaseId);
  }

  @Post()
  addMedication(
    @CurrentUser("supabaseId") supabaseId: string,
    @Body() body: { name: string; startDate?: string },
  ) {
    return this.medicationService.addMedication(supabaseId, body);
  }

  @Delete(":id")
  deleteMedication(
    @CurrentUser("supabaseId") supabaseId: string,
    @Param("id") id: string,
  ) {
    return this.medicationService.deleteMedication(supabaseId, id);
  }
}
