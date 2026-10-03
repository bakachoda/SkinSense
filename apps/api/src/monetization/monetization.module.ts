import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SubscriptionService } from "./subscription.service";
import { MonetizationController } from "./monetization.controller";
import { EntitlementGuard } from "./entitlement.guard";

@Module({
  imports: [PrismaModule],
  controllers: [MonetizationController],
  providers: [SubscriptionService, EntitlementGuard],
  exports: [SubscriptionService, EntitlementGuard],
})
export class MonetizationModule {}
