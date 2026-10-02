import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ScanService } from "./scan.service";
import { CreateScanRequestSchema, CreateSelfAssessmentSchema } from "@skinsense/types";

@Controller("scans")
@UseGuards(SupabaseAuthGuard)
export class ScanController {
  constructor(private scanService: ScanService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  create(
    @CurrentUser("supabaseId") supabaseId: string,
    @Body() body: unknown,
  ) {
    const parsed = CreateScanRequestSchema.parse(body);
    return this.scanService.create(supabaseId, parsed);
  }

  @Post(":id/self-assessment")
  @HttpCode(HttpStatus.OK)
  submitSelfAssessment(
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    const parsed = CreateSelfAssessmentSchema.parse(body);
    return this.scanService.submitSelfAssessment(id, parsed);
  }

  @Get()
  findAll(@CurrentUser("supabaseId") supabaseId: string) {
    return this.scanService.findAllByUser(supabaseId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.scanService.findOne(id);
  }

  @Get(":id/result")
  getResult(@Param("id") id: string) {
    return this.scanService.getResult(id);
  }
}

