import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SubscriptionService } from "./subscription.service";
import type { EntitlementKey } from "@skinsense/types";

export const ENTITLEMENT_KEY = "required_entitlement";
export const RequireEntitlement = (entitlement: EntitlementKey) =>
  SetMetadata(ENTITLEMENT_KEY, entitlement);

@Injectable()
export class EntitlementGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredEntitlement = this.reflector.getAllAndOverride<EntitlementKey>(
      ENTITLEMENT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredEntitlement) {
      return true; // No special entitlement required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userId = user?.id || user?.sub || request.headers["x-user-id"] || "user-1";

    const entitlements = await this.subscriptionService.getUserEntitlements(userId);

    const hasEntitlement = entitlements.entitlements[requiredEntitlement];

    if (!hasEntitlement) {
      throw new ForbiddenException({
        statusCode: 403,
        error: "Entitlement Required",
        message: `Feature requires '${requiredEntitlement}' entitlement. Please upgrade your subscription tier.`,
        requiredEntitlement,
        currentTier: entitlements.tier,
      });
    }

    return true;
  }
}
