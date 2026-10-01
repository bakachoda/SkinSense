import { Controller, Post, Put, Body, Param, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { UploadService } from "./upload.service";

@Controller("upload")
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post("presign")
  @UseGuards(SupabaseAuthGuard)
  presign(
    @Body() body: { contentType?: string; fileSize?: number; fileExtension?: string },
  ) {
    return this.uploadService.generatePresignedUrl(
      body.contentType || "image/jpeg",
      body.fileSize,
    );
  }

  // Local dev endpoint to accept mock S3 PUT uploads
  @Put("mock-s3/*")
  @HttpCode(HttpStatus.OK)
  mockUpload(@Param() params: any) {
    return { status: "success", message: "Mock upload received", path: params };
  }
}
