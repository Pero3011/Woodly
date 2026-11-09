export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
] as const;

export const SKETCH_EXTENSIONS: Record<(typeof ALLOWED_TYPES)[number], string> =
  {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "application/pdf": ".pdf",
  };

const SKETCH_BLOB_PATH = /^sketches\/[0-9a-f-]{36}\.(png|jpg|pdf)$/i;
const LEGACY_SKETCH_PATH =
  /^\/uploads\/sketches\/[0-9a-f-]{36}\.(png|jpg|pdf)$/i;
const BLOB_SKETCH_URL =
  /^https:\/\/[a-z0-9.-]+\.(public\.)?blob\.vercel-storage\.com\/sketches\/[A-Za-z0-9._-]+\.(png|jpg|pdf)$/i;

export function sketchBlobPathname(file: File): string {
  const ext = SKETCH_EXTENSIONS[file.type as (typeof ALLOWED_TYPES)[number]];
  if (!ext) {
    throw new Error("Only PNG, JPG, or PDF allowed.");
  }
  return `sketches/${crypto.randomUUID()}${ext}`;
}

export function isAllowedSketchPathname(pathname: string): boolean {
  return SKETCH_BLOB_PATH.test(pathname);
}

export function isUploadedSketchUrl(url: string): boolean {
  return BLOB_SKETCH_URL.test(url) || LEGACY_SKETCH_PATH.test(url);
}

// Returns an error message, or null if the file is fine
export function validateSketch(file: File): string | null {
  if (file.size === 0) return "This file is empty.";

  if (file.size > MAX_FILE_SIZE) {
    return `File is too big. Max is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
  }

  if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return "Only PNG, JPG, or PDF allowed.";
  }

  return null;
}
