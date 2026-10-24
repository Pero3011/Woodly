"use client";
import { ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    id: "profile",
    label: "Profile Settings",
    icon: User,
    path: "/pages/profile/profileSettings",
  },
  {
    id: "orders",
    label: "Order History",
    icon: ShoppingBag,
    path: "/pages/profile/ordersHistory",
  },
] as const;

export default function ProfileSidebar() {
  const pathname = usePathname();

  const baseStyles =
    "flex items-center gap-2 p-2 rounded-lg font-medium transition-colors whitespace-nowrap";
  const activeStyles = "bg-primary text-neutral-100";
  const inactiveStyles = "text-[#2A1E17] hover:bg-primary/10";

  return (
    <aside
      className="
        w-full bg-secondary p-4 border-b border-neutral-300
        md:w-64 md:min-h-screen md:p-6 md:border-b-0 md:border-r
      "
    >
      <h1 className="text-xl md:text-2xl font-bold mb-3 md:mb-6 text-[#5A2D0C] hidden sm:block">
        Account Settings
      </h1>

      <nav>
        <ul className="flex flex-row gap-2 overflow-x-auto md:flex-col md:gap-0">
          {tabs.map(({ id, label, icon: Icon, path }) => {
            const isActive = pathname === path;
            return (
              <li key={id} className="flex-shrink-0 md:mb-2">
                <Link
                  href={path}
                  className={`${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
