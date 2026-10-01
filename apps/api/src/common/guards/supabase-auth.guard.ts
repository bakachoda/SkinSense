import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { createClient } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      supabaseId?: string;
    }
  }
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase = createClient(
    process.env["SUPABASE_URL"] ?? "",
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "",
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid authorization header");
    }

    const token = authHeader.slice(7);

    // Development / Test mock token bypass
    if (
      process.env["NODE_ENV"] !== "production" &&
      (token === "mock-dev-token" || token === "dev-token" || token.startsWith("test-"))
    ) {
      request.supabaseId = "test-supabase-id-000";
      return true;
    }

    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    request.supabaseId = user.id;
    return true;
  }
}
