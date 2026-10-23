export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("Money value must be a finite number.");
  }

  const sign = Math.sign(value);
  return sign * (Math.round((Math.abs(value) + Number.EPSILON) * 100) / 100);
}

export function formatMoney(value: number): string {
  return `${roundMoney(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;
}
