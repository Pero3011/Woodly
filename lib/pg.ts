/** Shared helpers for node-pg result shapes (UUID objects, numeric strings). */

export function asUuid(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

export function asFiniteNumber(value: unknown, field = "value"): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`Database returned an invalid ${field}.`);
  }
  return number;
}

export function asMoney(value: unknown): number {
  return asFiniteNumber(value, "amount");
}

export function asMoneyOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return asMoney(value);
}

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  );
}
