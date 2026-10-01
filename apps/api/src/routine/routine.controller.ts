import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { RoutineService } from "./routine.service";

@Controller("routines")
@UseGuards(SupabaseAuthGuard)
export class RoutineController {
  constructor(private routineService: RoutineService) {}

  @Get()
  findAll(@CurrentUser("supabaseId") supabaseId: string) {
    return this.routineService.findByUserId(supabaseId);
  }

  @Get("latest")
  findLatest(@CurrentUser("supabaseId") supabaseId: string) {
    return this.routineService.findLatest(supabaseId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.routineService.findOne(id);
  }
}
