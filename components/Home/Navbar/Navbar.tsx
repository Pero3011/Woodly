"use client";

import Image from "next/image";
import { Bell, ShoppingCart, CircleUser, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface NavbarProps {
  hasSearch?: boolean;
}

export default function Navbar({ hasSearch = false }: NavbarProps) {
  return (
    <nav className="flex justify-between items-center px-6 md:px-16 lg:px-24 bg-secondary text-primary border-b border-neutral-300 w-full h-18">
      {/* LHS */}
      <div className="flex items-center gap-6 md:gap-10">
        {/* Logo */}
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

        {/* Links */}
        <ul className="hidden md:flex items-center gap-5 font-semibold">
          <li className="cursor-pointer hover:font-bold transition-opacity">
            <Link href="/auth">Home</Link>
          </li>
          <li className="cursor-pointer hover:font-bold transition-opacity">
            <Link href="/products/shop">Shop</Link>
          </li>
          <li className="cursor-pointer hover:font-bold transition-opacity">
            <Link href="/products/customize">Customize</Link>
          </li>
        </ul>
      </div>

      {/* RHS */}
      <div className="flex items-center gap-5">
        {/* Smooth Expandable Search Bar Container */}
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
              {/* Search Icon */}
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                <Search
                  className="h-5 w-5 text-stone-500 shrink-0"
                  strokeWidth={2.5}
                />
              </div>

              {/* Input Field */}
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
        <button
          aria-label="User Profile"
          className="p-1 hover:opacity-80 transition-opacity"
        >
          <a href="/products/profile/profileSettings">
            <CircleUser className="w-6 h-6" />
          </a>
        </button>
      </div>
    </nav>
  );
}
