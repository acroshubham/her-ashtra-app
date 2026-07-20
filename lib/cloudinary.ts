// lib/cloudinary.ts
// Direct-from-device video upload to Cloudinary using an unsigned upload preset.
// This deliberately does NOT go through apiFetch (which is JSON-only): media is
// multipart/form-data, and React Native must set the multipart boundary itself,
// so we never set Content-Type manually.
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

/**
 * Upload a local video file URI to Cloudinary. Returns the secure_url on
 * success, or null on any failure (missing config, network, bad response) —
 * callers treat a null as "no media" and keep the location-only SOS intact.
 */
export async function uploadVideo(uri: string): Promise<string | null> {
  if (!isCloudinaryConfigured()) {
    console.warn("[cloudinary] EXPO_PUBLIC_CLOUDINARY_* not set — skipping video upload.");
    return null;
  }

  try {
    const form = new FormData();
    // RN file object shape. Name it .mp4 even if iOS captured a .mov so the
    // extension/type are consistent for Cloudinary.
    form.append("file", { uri, name: "sos.mp4", type: "video/mp4" } as unknown as Blob);
    form.append("upload_preset", UPLOAD_PRESET!);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
      method: "POST",
      body: form,
      // No Content-Type header on purpose — RN sets the multipart boundary.
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.secure_url) {
      console.error("[cloudinary] upload failed:", json?.error?.message || res.status);
      return null;
    }
    return json.secure_url as string;
  } catch (err) {
    console.error("[cloudinary] upload error:", (err as Error).message);
    return null;
  }
}
