"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Bell, ShoppingCart, CircleUser, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarProps {
  hasSearch?: boolean;
}

interface SessionUser {
  id: number;
  name: string;
  role: string;
}

export default function Navbar({ hasSearch = false }: NavbarProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/signOut", { method: "POST" });
    setUser(null);
    router.push("/auth");
    router.refresh();
  }

  return (
    <nav className="flex justify-between items-center px-6 md:px-16 lg:px-24 bg-secondary text-primary border-b border-neutral-300 w-full h-18">
      {/* LHS */}
      <div className="flex items-center gap-6 md:gap-10">
        <div className="relative w-18.75 h-18.75">
          <Image
            src="/logo.png"
            alt="logo"
            fill
            sizes="75px"
            priority
            className="object-contain"
          />
        </div>

        <ul className="hidden md:flex items-center gap-5 font-semibold">
          <li className="cursor-pointer hover:font-bold transition-opacity">
            <Link href="/">Home</Link>
          </li>
          <li className="cursor-pointer hover:font-bold transition-opacity">
            <Link href="/pages/shop">Shop</Link>
          </li>
          <li className="cursor-pointer hover:font-bold transition-opacity">
            <Link href="/pages/customized">Customize</Link>
          </li>
        </ul>
      </div>

      {/* RHS */}
      <div className="flex items-center gap-5">
        <AnimatePresence>
          {hasSearch && (
            <motion.form
              initial={{ width: 44, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 44, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="relative hidden sm:block h-11"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                <Search
                  className="h-5 w-5 text-stone-500 shrink-0"
                  strokeWidth={2.5}
                />
              </div>
              <input
                type="text"
                placeholder="Find your piece..."
                className="w-60 h-full pl-10 pr-4 bg-white text-stone-800 placeholder-stone-400 text-[14px] font-body rounded-lg border border-stone-300 shadow-sm focus:outline-none focus:border-amber-700 transition-colors whitespace-nowrap"
              />
            </motion.form>
          )}
        </AnimatePresence>

        <button
          aria-label="Notifications"
          className="p-1 hover:opacity-80 transition-opacity"
        >
          <Bell className="w-6 h-6" />
        </button>
        <button
          aria-label="Shopping Cart"
          className="p-1 hover:opacity-80 transition-opacity"
        >
          <ShoppingCart className="w-6 h-6" />
        </button>

        {!loading && (
          <>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm hidden sm:inline">
                  {user.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-semibold hover:opacity-80 transition-opacity"
                >
                  Sign Out
                </button>
                <Link
                  href="/pages/profile/profileSettings"
                  aria-label="User Profile"
                >
                  <CircleUser className="w-6 h-6" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth"
                  className="text-sm font-semibold hover:opacity-80 transition-opacity"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth"
                  className="text-sm font-semibold hover:opacity-80 transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
