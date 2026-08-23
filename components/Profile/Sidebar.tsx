"use client";
import { ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    id: "profile",
    label: "Profile Settings",
    icon: User,
    path: "/products/profile/profileSettings",
  },
  {
    id: "orders",
    label: "Order History",
    icon: ShoppingBag,
    path: "/products/profile/ordersHistory",
  },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  const baseStyles =
    "w-full flex items-center gap-2 mb-5 p-2 rounded-lg font-medium transition-colors";
  const activeStyles = "bg-primary text-neutral-100";
  const inactiveStyles = "text-[#2A1E17] hover:bg-primary/10";

  return (
    <aside className="w-64 min-h-screen bg-secondary p-6 text-[#2A1E17] border-r border-neutral-300">
      <h1 className="text-2xl font-bold mb-6 text-[#5A2D0C]">
        Account Settings
      </h1>

      <div className="grid grid-rows-2">
        <ul>
          {tabs.map(({ id, label, icon: Icon, path }) => {
            const isActive = pathname === path;
            return (
              <li key={id}>
                <Link
                  href={path}
                  className={`${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
