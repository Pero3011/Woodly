"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2, Lock, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

// Placeholder rates until real shipping/tax logic is wired up to the backend
const SHIPPING_COST = 18.5;
const TAX_RATE = 0.0738;

export default function CheckoutPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } =
    useCart();
  const { user } = useAuth();

  const [shipping, setShipping] = useState({
    firstName: user?.name?.split(" ")[0] ?? "",
    lastName: user?.name?.split(" ").slice(1).join(" ") ?? "",
    address: "",
    city: "",
    postcode: "",
  });

  const [selectedPayment, setSelectedPayment] = useState<"visa" | "applepay">(
    "visa",
  );
  const [discountCode, setDiscountCode] = useState("");

  const handleShippingChange = (
    field: keyof typeof shipping,
    value: string,
  ) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const tax = cartTotal * TAX_RATE;
  const total = cartTotal + SHIPPING_COST + tax;

  return (
    <div>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-semibold text-[#3A2E22]">
            Your Workshop Basket
          </h1>
          <span className="text-xs font-medium bg-[#E6D7C3] text-[#5A2D0C] px-3 py-1 rounded-full">
            {cartCount} Items
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <ShoppingBag className="w-10 h-10 text-[#6D5A4D]" />
            <p className="text-sm text-[#6D5A4D]">Your basket is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart items */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-[#EFE2D0] rounded-xl p-4 border border-neutral-300"
                  >
                    <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-secondary border border-neutral-300">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-[#3A2E22]">
                        {item.name}
                      </h3>

                      <div className="flex items-center gap-3 border border-neutral-300 bg-white rounded-full px-2 py-1 w-fit mt-3">
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
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch">
                      <span className="text-sm font-semibold text-[#3A2E22]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Details */}
              <div className="bg-secondary rounded-xl p-6 border border-neutral-300">
                <h2 className="text-lg font-semibold text-[#3A2E22] mb-4">
                  Shipping Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#6D5A4D]">First Name</label>
                    <input
                      value={shipping.firstName}
                      onChange={(e) =>
                        handleShippingChange("firstName", e.target.value)
                      }
                      className="border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white text-[#3A2E22] outline-none focus:border-[#5A2D0C]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#6D5A4D]">Last Name</label>
                    <input
                      value={shipping.lastName}
                      onChange={(e) =>
                        handleShippingChange("lastName", e.target.value)
                      }
                      className="border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white text-[#3A2E22] outline-none focus:border-[#5A2D0C]"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-xs text-[#6D5A4D]">
                      Shipping Address
                    </label>
                    <input
                      value={shipping.address}
                      onChange={(e) =>
                        handleShippingChange("address", e.target.value)
                      }
                      className="border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white text-[#3A2E22] outline-none focus:border-[#5A2D0C]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#6D5A4D]">City</label>
                    <input
                      value={shipping.city}
                      onChange={(e) =>
                        handleShippingChange("city", e.target.value)
                      }
                      className="border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white text-[#3A2E22] outline-none focus:border-[#5A2D0C]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#6D5A4D]">Postcode</label>
                    <input
                      value={shipping.postcode}
                      onChange={(e) =>
                        handleShippingChange("postcode", e.target.value)
                      }
                      className="border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white text-[#3A2E22] outline-none focus:border-[#5A2D0C]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-secondary rounded-xl p-6 border border-neutral-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#3A2E22]">
                    Payment Method
                  </h2>
                  <button className="text-sm text-[#5A2D0C] font-medium hover:underline">
                    + Add New
                  </button>
                </div>

                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-colors ${
                      selectedPayment === "visa"
                        ? "border-[#5A2D0C]"
                        : "border-neutral-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === "visa"}
                      onChange={() => setSelectedPayment("visa")}
                      className="accent-[#5A2D0C]"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#3A2E22]">
                        Visa ending in 4421
                      </p>
                      <p className="text-xs text-[#6D5A4D]">Expires 12/26</p>
                    </div>
                    <span className="text-[10px] font-semibold bg-[#E6D7C3] text-[#5A2D0C] px-2 py-1 rounded-full">
                      DEFAULT
                    </span>
                  </label>

                  <label
                    className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-colors ${
                      selectedPayment === "applepay"
                        ? "border-[#5A2D0C]"
                        : "border-neutral-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === "applepay"}
                      onChange={() => setSelectedPayment("applepay")}
                      className="accent-[#5A2D0C]"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#3A2E22]">
                        Apple Pay
                      </p>
                      <p className="text-xs text-[#6D5A4D]">
                        {user?.email ?? "your.email@icloud.com"}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-[#2A1B10] text-[#F5EFE4] rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 pb-4 border-b border-white/10 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Subtotal</span>
                    <span className="font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Shipping (Express)</span>
                    <span className="font-medium">
                      ${SHIPPING_COST.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Estimated Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-4">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-semibold">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <button className="w-full flex items-center justify-center gap-2 bg-[#5A2D0C] hover:bg-[#4A2409] transition-colors text-[#F5EFE4] text-sm font-semibold uppercase tracking-wider py-3.5 rounded-lg">
                  Place Order
                  <Lock className="w-4 h-4" />
                </button>

                <p className="text-center text-[11px] text-white/50 mt-3">
                  Secure transaction with Artisan encryption
                </p>
              </div>

              {/* Discount Code */}
              <div className="bg-secondary rounded-xl p-4 border border-neutral-300">
                <label className="text-xs text-[#6D5A4D]">
                  Artisan Discount Code
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white text-[#3A2E22] outline-none focus:border-[#5A2D0C]"
                  />
                  <button className="bg-[#3A2E22] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#2A1F17] transition-colors">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
