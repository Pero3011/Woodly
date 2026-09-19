"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

// How many milliseconds are in 7 days
// 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
const CART_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

// 1. Creating an empty box
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { user } = useAuth();

  // Check if the user has anything in the cart before and pull it
  useEffect(() => {
    if (user) {
      const savedRaw = localStorage.getItem(user.id);
      console.log(savedRaw)

      if (savedRaw) {
        try {
          const savedBundle = JSON.parse(savedRaw);
          const savedCart: CartItem[] = savedBundle.cart;
          const savedAt: number = savedBundle.timestamp;

          // How much time has passed since we last saved this cart
          const elapsed = Date.now() - savedAt;

          if (elapsed > CART_EXPIRY_MS) {
            setCart([]);
          } else {
            // Still fresh — safe to use
            setCart(savedCart);
          }
        } catch (error) {
          console.error("Failed to parse cart storage data:", error);
          setCart([]);
        }
      } else {
        setCart([]);
      }
    } else {
      setCart([]);
    }

    setIsHydrated(true);
  }, [user]);

  // Save the cart back to the correct drawer whenever it changes
  // Watch list now includes "user" too, so it never tries to save under a missing label
  useEffect(() => {
    if (user && isHydrated) {
      // Bundle the cart together with a fresh "saved at" timestamp
      // so the 7-day countdown restarts every time the cart changes
      const bundle = {
        cart: cart,
        timestamp: Date.now(),
      };
      localStorage.setItem(user.id, JSON.stringify(bundle));
    }
  }, [cart, isHydrated, user]);

  const addToCart = (newItem: Omit<CartItem, "quantity">) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === newItem.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...prevCart, { ...newItem, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => setCart([]);

  // Memoized aggregations to compute dynamically
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
