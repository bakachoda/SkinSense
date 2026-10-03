import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SyncService } from "./sync.service";
import { SyncController } from "./sync.controller";

@Module({
  imports: [PrismaModule],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
