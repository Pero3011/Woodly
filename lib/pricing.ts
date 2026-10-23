import { roundMoney } from "@/lib/money";

export const SHIPPING_RATE = 0.18;
export const TAX_RATE = 0.0738;

export interface OrderTotals {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
}

export function calculateTotals(subtotal: number): OrderTotals {
  const roundedSubtotal = roundMoney(subtotal);
  const shippingCost = roundMoney(roundedSubtotal * SHIPPING_RATE);
  const taxAmount = roundMoney(roundedSubtotal * TAX_RATE);

  return {
    subtotal: roundedSubtotal,
    shippingCost,
    taxAmount,
    totalAmount: roundMoney(roundedSubtotal + shippingCost + taxAmount),
  };
}
