import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "Woodly",
  description: "Handcrafted Wood Furniture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <Toaster
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  "flex items-center gap-3 w-full rounded-lg border p-4 shadow-lg text-sm bg-white",
                title: "font-medium",
                description: "text-xs opacity-80",
                success: "border-green-500 bg-green-50 text-green-900",
                error: "border-red-500 bg-red-50 text-red-900",
              },
            }}
          />
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
