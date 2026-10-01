import type { PresignedUploadResponse } from "@skinsense/types";

export async function uploadImageToS3(
  presigned: PresignedUploadResponse,
  fileUri: string,
  contentType = "image/jpeg",
): Promise<void> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const targetUrl = presigned.uploadUrl || (presigned as any).url;

  const uploadResponse = await fetch(targetUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed with status ${uploadResponse.status}`);
  }
}
