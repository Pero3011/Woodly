export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
] as const;

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
