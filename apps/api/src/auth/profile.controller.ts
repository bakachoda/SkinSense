import { Controller, Get, Patch, Post, Delete, Body, UseGuards, NotFoundException } from "@nestjs/common";
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

  @Post("disclaimer")
  async acknowledgeDisclaimer(
    @CurrentUser("supabaseId") supabaseId: string,
    @Body() body: { version?: number },
  ) {
    const version = body?.version ?? 1;
    const user = await this.authService.acknowledgeDisclaimer(supabaseId, version);
    return { user, acknowledged: true };
  }

  @Patch("notifications")
  async updateNotifications(
    @CurrentUser("supabaseId") supabaseId: string,
    @Body() body: unknown,
  ) {
    const user = await this.authService.updateNotificationPreferences(
      supabaseId,
      body as any,
    );
    return { user };
  }

  @Post("export")
  async exportData(@CurrentUser("supabaseId") supabaseId: string) {
    const data = await this.authService.exportUserData(supabaseId);
    if (!data) {
      throw new NotFoundException("User not found");
    }
    return { export: data };
  }

  @Delete("data")
  async deleteData(@CurrentUser("supabaseId") supabaseId: string) {
    const success = await this.authService.deleteUserData(supabaseId);
    if (!success) {
      throw new NotFoundException("User not found");
    }
    return { success: true, message: "User data purged successfully" };
  }

  @Delete("account")
  async deleteAccount(@CurrentUser("supabaseId") supabaseId: string) {
    const success = await this.authService.deleteUserAccount(supabaseId);
    if (!success) {
      throw new NotFoundException("User not found");
    }
    return { success: true, message: "Account deleted successfully" };
  }
}

