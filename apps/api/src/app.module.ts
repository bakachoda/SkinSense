import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { APP_FILTER } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ScanModule } from "./scan/scan.module";
import { ProductModule } from "./product/product.module";
import { RoutineModule } from "./routine/routine.module";
import { UploadModule } from "./upload/upload.module";
import { QueueModule } from "./queue/queue.module";
import { HealthModule } from "./health/health.module";
import { AdherenceModule } from "./adherence/adherence.module";
import { GatewayModule } from "./gateway/gateway.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env["REDIS_HOST"] ?? "localhost",
        port: parseInt(process.env["REDIS_PORT"] ?? "6379", 10),
        password: process.env["REDIS_PASSWORD"],
      },
    }),
    PrismaModule,
    GatewayModule,
    AuthModule,
    ScanModule,
    ProductModule,
    RoutineModule,
    UploadModule,
    QueueModule,
    HealthModule,
    AdherenceModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
