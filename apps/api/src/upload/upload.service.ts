import {
  Injectable,
  BadRequestException,
  PayloadTooLargeException,
} from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/heic", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const PRESIGN_EXPIRES_IN = 900; // 15 minutes

@Injectable()
export class UploadService {
  private s3: S3Client;
  private hasRealCredentials: boolean;

  constructor() {
    const key = process.env["AWS_ACCESS_KEY_ID"] || "";
    this.hasRealCredentials = key.length > 5 && !key.includes("mock");

    this.s3 = new S3Client({
      region: process.env["AWS_REGION"] ?? "us-east-1",
      credentials: {
        accessKeyId: key || "mock-key",
        secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"] ?? "mock-secret",
      },
    });
  }

  async generatePresignedUrl(contentType = "image/jpeg", fileSize?: number) {
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      throw new BadRequestException(
        `Invalid content type. Allowed: ${ALLOWED_CONTENT_TYPES.join(", ")}`,
      );
    }

    if (fileSize && fileSize > MAX_FILE_SIZE) {
      throw new PayloadTooLargeException("File size exceeds 5MB limit");
    }

    const key = `scans/${uuidv4()}.jpg`;
    const expiresAt = new Date(Date.now() + PRESIGN_EXPIRES_IN * 1000).toISOString();

    if (!this.hasRealCredentials) {
      // Local dev mock URL
      const mockUrl = `http://localhost:3000/api/upload/mock-s3/${key}`;
      return {
        uploadUrl: mockUrl,
        url: mockUrl,
        key,
        expiresAt,
      };
    }

    const command = new PutObjectCommand({
      Bucket: process.env["S3_BUCKET_NAME"] ?? "skinsense-uploads",
      Key: key,
      ContentType: contentType,
      ServerSideEncryption: "AES256",
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: PRESIGN_EXPIRES_IN,
    });

    return {
      uploadUrl,
      url: uploadUrl,
      key,
      expiresAt,
    };
  }
}
