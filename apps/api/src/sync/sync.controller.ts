import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { SyncService } from "./sync.service";
import {
  BatchSyncRequestSchema,
  type BatchSyncRequest,
  type BatchSyncResponse,
} from "@skinsense/types";

@Controller("sync")
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post("batch")
  @HttpCode(HttpStatus.OK)
  async batchSync(
    @Body() body: BatchSyncRequest,
    @Headers("x-user-id") headerUserId?: string,
  ): Promise<BatchSyncResponse> {
    const validated = BatchSyncRequestSchema.parse(body);
    const userId = headerUserId || validated.userId || "user-1";
    return this.syncService.processBatchSync(userId, validated);
  }
}
