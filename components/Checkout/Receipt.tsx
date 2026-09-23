"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, Download, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


// ---- Types ------------------------------------------------------------
export interface ReceiptItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ReceiptShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postcode: string;
}

export interface ReceiptOrderData {
  orderId: string;
  orderDate: string;
  items: ReceiptItem[];
  shipping: ReceiptShippingInfo;
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
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { clearCart } = useCart()
  const route = useRouter();

  if (!orderData) return null;

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsExporting(true);

    try {
      // Convert element directly to image data URL using browser SVG rendering
      const imgData = await toPng(receiptRef.current, {
        quality: 0.95,
        pixelRatio: 2,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const imgWidth = pdfWidth - margin * 2;

      // Create an Image object to get dimensions for aspect ratio
      const img = new Image();
      img.src = imgData;
      await new Promise((resolve) => (img.onload = resolve));

      const imgHeight = (img.height * imgWidth) / img.width;

      pdf.addImage(imgData, "PNG", margin, 15, imgWidth, imgHeight);
      pdf.save(`Receipt-${orderData.orderId}.pdf`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleContinueShoppingbtn = () => {
    onClose()
    clearCart()
    route.push("/pages/shop")
    toast("Order Placed Successfully")
  }
    
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
              className="w-full max-w-md rounded-lg bg-secondary border border-neutral-300 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* PRINTABLE RECEIPT CONTENT AREA */}
              <div
                ref={receiptRef}
                className="bg-secondary flex-1 overflow-y-auto"
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
                </div>

                {/* Body — items list */}
                <div className="px-6 py-4 space-y-3">
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
              </div>

              {/* ACTION FOOTER (Outside the ref, won't appear on exported PDF) */}
              <div className="px-6 py-4 border-t border-neutral-300 bg-secondary flex flex-col gap-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 rounded-md border border-[#5A2D0C] text-[#5A2D0C] py-2.5 text-sm font-medium hover:bg-[#5A2D0C]/10 transition-colors disabled:opacity-50"
                >
                  {isExporting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Download size={18} />
                  )}
                  {isExporting ? "Generating PDF..." : "Download PDF Receipt"}
                </button>

                <button
                  onClick={handleContinueShoppingbtn}
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
