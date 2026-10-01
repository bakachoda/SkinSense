import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";
import * as Sentry from "@sentry/node";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : ((exceptionResponse as Record<string, unknown>)["message"] as string) ?? message;
      details = typeof exceptionResponse === "object" ? exceptionResponse : undefined;
    } else {
      // Report unexpected errors to Sentry
      Sentry.captureException(exception);
    }

    const body = {
      statusCode: status,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.requestId,
    };

    // Log the error as structured JSON
    const logEntry = {
      timestamp: body.timestamp,
      level: "error",
      context: "ExceptionFilter",
      requestId: request.requestId,
      method: request.method,
      path: request.url,
      statusCode: status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    };
    process.stdout.write(JSON.stringify(logEntry) + "\n");

    response.status(status).json(body);
  }
}
