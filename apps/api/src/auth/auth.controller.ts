import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("sync")
  @UseGuards(SupabaseAuthGuard)
  sync(
    @CurrentUser("supabaseId") supabaseId: string,
    @Body() body: { email: string },
  ) {
    return this.authService.findOrCreateUser(supabaseId, body.email);
  }

  @Get("me")
  @UseGuards(SupabaseAuthGuard)
  me(@CurrentUser("supabaseId") supabaseId: string) {
    return this.authService.getUserBySupabaseId(supabaseId);
  }
}
