"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

// A lightweight snapshot just for the confirmation step — it doesn't need
// the full item list, only enough for the person to sanity-check what
// they're about to pay before the order is actually placed.
export interface ConfirmOrderSummary {
  itemCount: number;
  shippingCity: string;
  total: number;
}

interface ConfirmOrderProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  summary: ConfirmOrderSummary | null;
  isSubmitting?: boolean;
}

export default function ConfirmOrder({
  isOpen,
  onCancel,
  onConfirm,
  summary,
  isSubmitting = false,
}: ConfirmOrderProps) {
  if (!summary) return null;

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
              className="w-full max-w-sm rounded-lg bg-secondary border border-neutral-300 shadow-xl overflow-hidden"
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-neutral-300 flex items-center gap-3">
                <AlertCircle className="text-[#5A2D0C]" size={24} />
                <h2 className="text-lg font-semibold text-[#3A2E22]">
                  Confirm your order
                </h2>
              </div>

              <div className="px-6 py-5 text-sm text-[#6D5A4D] space-y-2">
                <p>
                  You're about to place an order for{" "}
                  <span className="text-[#3A2E22] font-medium">
                    {summary.itemCount}{" "}
                    {summary.itemCount === 1 ? "item" : "items"}
                  </span>
                  , shipping to{" "}
                  <span className="text-[#3A2E22] font-medium">
                    {summary.shippingCity || "the address you entered"}
                  </span>
                  .
                </p>
                <p>
                  Total charge:{" "}
                  <span className="text-[#5A2D0C] font-semibold">
                    ${summary.total.toFixed(2)}
                  </span>
                </p>
                <p className="text-xs pt-1">
                  Double check your shipping details and payment method
                  before continuing — this can't be undone once placed.
                </p>
              </div>

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
