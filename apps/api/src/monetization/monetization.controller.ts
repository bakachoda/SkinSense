import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";
import {
  UpgradeSubscriptionRequestSchema,
  BillingWebhookPayloadSchema,
  type UpgradeSubscriptionRequest,
  type BillingWebhookPayload,
  type UserEntitlements,
  type SubscriptionProduct,
  type RestorePurchasesResponse,
} from "@skinsense/types";

@Controller("monetization")
export class MonetizationController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get("plans")
  getPlans(): SubscriptionProduct[] {
    return this.subscriptionService.getAvailablePlans();
  }

  @Get("entitlements")
  async getEntitlements(
    @Headers("x-user-id") headerUserId?: string,
  ): Promise<UserEntitlements> {
    const userId = headerUserId || "user-1";
    return this.subscriptionService.getUserEntitlements(userId);
  }

  @Post("upgrade")
  @HttpCode(HttpStatus.OK)
  async upgradeSubscription(
    @Body() body: UpgradeSubscriptionRequest,
    @Headers("x-user-id") headerUserId?: string,
  ): Promise<UserEntitlements> {
    const validated = UpgradeSubscriptionRequestSchema.parse(body);
    const userId = headerUserId || "user-1";
    return this.subscriptionService.upgradeTier(
      userId,
      validated.tier,
      validated.provider,
    );
  }

  @Post("restore")
  @HttpCode(HttpStatus.OK)
  async restorePurchases(
    @Headers("x-user-id") headerUserId?: string,
  ): Promise<RestorePurchasesResponse> {
    const userId = headerUserId || "user-1";
    const entitlements = await this.subscriptionService.restorePurchases(userId);
    return {
      restored: true,
      entitlements,
      message: "Subscription successfully restored.",
    };
  }

  @Post("cancel")
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(
    @Headers("x-user-id") headerUserId?: string,
  ): Promise<UserEntitlements> {
    const userId = headerUserId || "user-1";
    return this.subscriptionService.cancelSubscription(userId);
  }

  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: any): Promise<{ received: boolean }> {
    const validated = BillingWebhookPayloadSchema.parse(body);
    return this.subscriptionService.handleWebhook(validated);
  }
}
