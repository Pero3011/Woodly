"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Bell, ShoppingCart, CircleUser, LogOut} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";


interface SessionUser {
  id: number;
  name: string;
  role: string;
}

export default function Navbar() {
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
                <Link
                  href="/pages/profile/profileSettings"
                  aria-label="User Profile"
                  className="flex items-center gap-2"
                >
                  <span className="font-semibold text-sm hidden sm:inline">
                    {user.name}
                  </span>
                  <CircleUser className="w-6 h-6" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-semibold hover:opacity-80 transition-opacity flex items-center gap-2"
                >
                  Sign Out
                  <LogOut size={20} />
                </button>
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
