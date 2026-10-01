import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as Sentry from "@sentry/nestjs";
import { StructuredLogger } from "./common/logger/structured-logger.service";

async function bootstrap() {
  // Initialize Sentry before anything else
  Sentry.init({
    dsn: process.env["SENTRY_DSN"] ?? "",
    environment: process.env["NODE_ENV"] ?? "development",
    tracesSampleRate: 1.0,
  });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.setGlobalPrefix("api");
  app.useLogger(new StructuredLogger());
  app.enableCors({
    origin: process.env["CORS_ORIGIN"] ?? "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  });

  const port = process.env["PORT"] ?? 3000;
  await app.listen(port);

  console.warn(`API running on port ${port} with prefix /api`);
}

void bootstrap();
