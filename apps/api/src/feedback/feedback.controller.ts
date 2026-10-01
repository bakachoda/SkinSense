import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { FeedbackService } from "./feedback.service";
import { CreateFeedbackSchema } from "@skinsense/types";

@Controller("feedback")
@UseGuards(SupabaseAuthGuard)
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  async submitFeedback(
    @CurrentUser("supabaseId") supabaseId: string,
    @Body() body: unknown,
  ) {
    const parsed = CreateFeedbackSchema.parse(body);
    const feedback = await this.feedbackService.createFeedback(supabaseId, parsed);
    return { feedback, success: true };
  }

  @Get()
  async getMyFeedback(@CurrentUser("supabaseId") supabaseId: string) {
    const feedbackList = await this.feedbackService.getFeedbackForUser(supabaseId);
    return { feedback: feedbackList };
  }
}
