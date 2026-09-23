"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import type { ReceiptOrderData } from "./Receipt";

// Reuses the exact same shape Receipt uses — this modal shows a preview
// of the order, so it needs the same data Receipt will eventually show,
// just with "Confirm" / "Go back" instead of "Continue Shopping".

interface ConfirmOrderProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  orderData: ReceiptOrderData | null;
  isSubmitting?: boolean;
}


export default function ConfirmOrder({
  isOpen,
  onCancel,
  onConfirm,
  orderData,
  isSubmitting = false,
}: ConfirmOrderProps) {
  if (!orderData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
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
                  <AlertCircle className="text-[#5A2D0C]" size={28} />
                  <div>
                    <h2 className="text-lg font-semibold text-[#3A2E22]">
                      Review your order
                    </h2>
                    <p className="text-sm text-[#6D5A4D]">
                      Nothing is charged until you confirm
                    </p>
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  disabled={isSubmitting}
                  aria-label="Close and go back"
                  className="text-[#6D5A4D] hover:text-[#5A2D0C] transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Items — same layout as Receipt */}
              <div className="px-6 py-4 max-h-[35vh] overflow-y-auto space-y-3">
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

              {/* Totals — same layout as Receipt */}
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

              {/* Shipping + payment — same layout as Receipt */}
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

              {/* Actions — this is what makes it a confirmation step and
                  not just a second receipt */}
              <div className="px-6 py-4 border-t border-neutral-300 flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex-1 rounded-md border border-neutral-300 text-[#3A2E22] py-2.5 text-sm font-medium hover:bg-neutral-100 transition-colors disabled:opacity-50"
                >
                  Go back
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isSubmitting}
                  className="flex-1 rounded-md bg-[#5A2D0C] text-white py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? "Placing..." : "Confirm order"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
