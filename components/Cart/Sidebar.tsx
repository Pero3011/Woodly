"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReceiptText, X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface CartSideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSideBar({ isOpen, onClose }: CartSideBarProps) {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Sliding panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-screen w-full max-w-md bg-secondary border-l border-neutral-300 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-300">
              <h2 className="text-xl font-semibold text-[#5A2D0C]">
                Your Cart
              </h2>
              <button
                onClick={onClose}
                aria-label="Close cart"
                className="p-1.5 rounded-full hover:bg-[#E6D7C3] transition-colors"
              >
                <X className="w-5 h-5 text-[#5A2D0C]" />
              </button>
            </div>

            {/* Items list */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <ShoppingBag className="w-10 h-10 text-[#6D5A4D]" />
                <p className="text-sm text-[#6D5A4D]">Your cart is empty.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-neutral-300 last:border-b-0"
                  >
                    <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-[#FFF8F3] border border-neutral-300">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-contain"
                        />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-[#3A2E22] leading-snug">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                          className="text-[#6D5A4D] hover:text-red-600 transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity stepper */}
                        <div className="flex items-center gap-3 border border-neutral-300 rounded-full px-2 py-1">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                            className="hover:opacity-70 transition-opacity"
                          >
                            <Minus className="w-3.5 h-3.5 text-[#5A2D0C]" />
                          </button>
                          <span className="text-sm font-medium text-[#3A2E22] w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            className="hover:opacity-70 transition-opacity"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#5A2D0C]" />
                          </button>
                        </div>

                        <span className="text-sm font-semibold text-[#5A2D0C]">
                          {item.price * item.quantity} EGP
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-300 px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#6D5A4D] uppercase tracking-wider">
                    Subtotal
                  </span>
                  <span className="text-lg font-semibold text-[#5A2D0C]">
                    {cartTotal} EGP
                  </span>
                </div>

                <button className="w-full flex items-center justify-center gap-2 bg-[#5A2D0C] hover:bg-[#4A2409] transition-colors text-[#F5EFE4] text-sm font-semibold uppercase tracking-wider py-3.5 rounded-lg">
                  <span>Checkout</span>
                  <ReceiptText className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
