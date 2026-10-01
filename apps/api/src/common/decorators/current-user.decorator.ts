import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

export const CurrentUser = createParamDecorator(
  (data: "supabaseId" | "userId" | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (data) {
      return request[data];
    }
    return { supabaseId: request.supabaseId, userId: request.userId };
  },
);
