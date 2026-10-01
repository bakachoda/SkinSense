import { LoggerService, Injectable } from "@nestjs/common";

@Injectable()
export class StructuredLogger implements LoggerService {
  log(message: string, context?: string) {
    this.emit("info", message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.emit("error", message, context, { trace });
  }

  warn(message: string, context?: string) {
    this.emit("warn", message, context);
  }

  debug(message: string, context?: string) {
    this.emit("debug", message, context);
  }

  verbose(message: string, context?: string) {
    this.emit("verbose", message, context);
  }

  private emit(
    level: string,
    message: string,
    context?: string,
    extra?: Record<string, unknown>,
  ) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      context: context ?? "Application",
      message,
      ...extra,
    };
    process.stdout.write(JSON.stringify(entry) + "\n");
  }
}
