"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";

// ---- Types ------------------------------------------------------------
// Lined up 1:1 with what CheckoutPage actually has in scope: cart items,
// the `shipping` state object, and the derived subtotal/shippingCost/tax/total.

export interface ReceiptItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Matches the `shipping` useState shape in CheckoutPage exactly —
// firstName / lastName / address / city / postcode. No `fullName`,
// no `phone` (CheckoutPage doesn't collect one).
export interface ReceiptShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postcode: string;
}

export interface ReceiptOrderData {
  orderId: string;
  orderDate: string; // pass an already-formatted string, e.g. new Date().toLocaleDateString()
  items: ReceiptItem[];
  shipping: ReceiptShippingInfo;
  // CheckoutPage stores the raw selection as "visa" | "applepay".
  // Pass the human-readable label here (e.g. "Visa ending in 4421"),
  // built once at "Place Order" time — the modal just displays a string.
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

interface ReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: ReceiptOrderData | null;
}

// ---- Component ----------------------------------------------------------

export default function Receipt({ isOpen, onClose, orderData }: ReceiptProps) {
  // Guard clause: if there's no order data yet (e.g. modal mounted before
  // "Place Order" was ever clicked), there's nothing to show.
  if (!orderData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — click it to close, same pattern as CartSideBar */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal card */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-lg bg-secondary border border-neutral-300 shadow-xl overflow-hidden"
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-300">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#5A2D0C]" size={28} />
                  <div>
                    <h2 className="text-lg font-semibold text-[#3A2E22]">
                      Order Confirmed
                    </h2>
                    <p className="text-sm text-[#6D5A4D]">
                      Order #{orderData.orderId} · {orderData.orderDate}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close receipt"
                  className="text-[#6D5A4D] hover:text-[#5A2D0C] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body — scrolls internally if the order has many items */}
              <div className="px-6 py-4 max-h-[40vh] overflow-y-auto space-y-3">
                {orderData.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="text-[#3A2E22]">{item.name}</p>
                      <p className="text-[#6D5A4D]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[#3A2E22]">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-6 py-4 border-t border-neutral-300 space-y-1 text-sm">
                <div className="flex justify-between text-[#6D5A4D]">
                  <span>Subtotal</span>
                  <span>${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#6D5A4D]">
                  <span>Shipping</span>
                  <span>${orderData.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#6D5A4D]">
                  <span>Tax</span>
                  <span>${orderData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-[#5A2D0C] pt-2 text-base">
                  <span>Total</span>
                  <span>${orderData.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping + payment summary */}
              <div className="px-6 py-4 border-t border-neutral-300 text-sm text-[#6D5A4D] space-y-1">
                <p className="text-[#3A2E22] font-medium">Ship to</p>
                <p>
                  {orderData.shipping.firstName} {orderData.shipping.lastName}
                </p>
                <p>
                  {orderData.shipping.address}, {orderData.shipping.city}{" "}
                  {orderData.shipping.postcode}
                </p>
                <p className="pt-2 text-[#3A2E22] font-medium">Payment</p>
                <p>{orderData.paymentMethod}</p>
              </div>

              {/* Footer action */}
              <div className="px-6 py-4 border-t border-neutral-300">
                <button
                  onClick={onClose}
                  className="w-full rounded-md bg-[#5A2D0C] text-white py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
