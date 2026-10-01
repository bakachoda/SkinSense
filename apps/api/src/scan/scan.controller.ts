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
import { CreateScanRequestSchema } from "@skinsense/types";

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
