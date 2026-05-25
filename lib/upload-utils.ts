export interface UploadResult {
  url: string;
  publicId: string;
  type: "image" | "video";
}

export async function uploadToCloudinary(files: File[]): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const file of files) {
    const isVideo = file.type.startsWith("video/");
    const resourceType = isVideo ? "video" : "image";

    // 1. Get signed parameters from our server route
    const signRes = await fetch("/api/cloudinary-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceType }),
    });

    if (!signRes.ok) {
      throw new Error(`Failed to get upload signature for "${file.name}"`);
    }

    const { signature, timestamp, cloudName, apiKey, folder } = await signRes.json();

    // 2. Upload the file directly to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    if (folder) {
      formData.append("folder", folder);
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      const errData = await uploadRes.json().catch(() => ({}));
      throw new Error(
        errData.error?.message || `Failed to upload "${file.name}" to Cloudinary`,
      );
    }

    const uploadData = await uploadRes.json();
    
    results.push({
      url: uploadData.secure_url,
      publicId: uploadData.public_id,
      type: resourceType,
    });
  }

  return results;
}
