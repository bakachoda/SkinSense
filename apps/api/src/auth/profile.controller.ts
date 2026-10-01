import { Controller, Get, Patch, Body, UseGuards, NotFoundException } from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthService } from "./auth.service";
import { UpdateProfileSchema, type UpdateProfile } from "@skinsense/types";

@Controller("profile")
@UseGuards(SupabaseAuthGuard)
export class ProfileController {
  constructor(private authService: AuthService) {}

  @Get()
  async getProfile(@CurrentUser("supabaseId") supabaseId: string) {
    const user = await this.authService.getUserBySupabaseId(supabaseId);
    if (!user) {
      throw new NotFoundException("Profile not found");
    }
    return { user };
  }

  @Patch()
  async updateProfile(
    @CurrentUser("supabaseId") supabaseId: string,
    @Body() body: unknown,
  ) {
    const parsed = UpdateProfileSchema.parse(body);
    const user = await this.authService.updateProfile(supabaseId, parsed);
    return { user };
  }
}
