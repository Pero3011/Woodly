"use client";

import { useEffect, useState } from "react";
import {
  CircleDollarSign,
  Store,
  Hammer,
  ArrowRight,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

type ProfileStats = {
  Investements: number;
  PiecesOwned: number;
  CustomCommissions: number;
};

type RecentOrder = {
  id: string;
  title: string;
  image: string | null;
  woodType: string | null;
  date: string;
  status: string;
  total: number;
  extraItems: number;
};

// Entrance animation "recipes". Each one has two states:
// "hidden" (where an element starts) and "show" (where it ends up).

// The page: does not move itself, it only makes its children start
// one after another, 0.12 seconds apart.
const pageVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

// The stats grid: same idea, but faster, so the 3 cards pop in quickly.
const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

// Fade in while sliding up 20px.
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Fade in only, with no movement.
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ProfileSettings() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { user } = useAuth();

  // Editable form state — separate from `user` so the modal has its own
  // draft that only overwrites `user` once the save succeeds.
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Account stats state: the numbers, the waiting flag, and the error message.
  const [statsData, setStatsData] = useState<ProfileStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Recent orders state: the list, the waiting flag, and the error message.
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Seed the draft fields whenever we (re)load the user or open the modal.
  useEffect(() => {
    if (user) {
      setFormName(user.name ?? "");
      setFormPhone(user.phone ?? "");
      setFormEmail(user.email ?? "");
    }
  }, [user, isEditOpen]);

  // Ask the server for the stats once, right after the page first shows.
  useEffect(() => {
    let ignore = false;

    async function loadStats() {
      try {
        const response = await fetch("/api/profile/stats");
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          if (!ignore) {
            setStatsError(data?.error || "Could not load your stats.");
          }
          return;
        }

        if (!ignore) setStatsData(data);
      } catch (err) {
        if (!ignore) {
          setStatsError("Network error. Please check your connection.");
        }
      } finally {
        if (!ignore) setIsStatsLoading(false);
      }
    }

    loadStats();

    // Cleanup: if the user leaves the page early, ignore the late answer.
    return () => {
      ignore = true;
    };
  }, []);

  // Ask the server for the last 5 orders once, right after the page first shows.
  useEffect(() => {
    let ignore = false;

    async function loadRecentOrders() {
      try {
        const response = await fetch("/api/profile/recent-orders");
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          if (!ignore) {
            setOrdersError(data?.error || "Could not load your orders.");
          }
          return;
        }

        if (!ignore) setRecentOrders(data?.orders ?? []);
      } catch (err) {
        if (!ignore) {
          setOrdersError("Network error. Please check your connection.");
        }
      } finally {
        if (!ignore) setIsOrdersLoading(false);
      }
    }

    loadRecentOrders();

    return () => {
      ignore = true;
    };
  }, []);

  const placeholder = isStatsLoading ? "..." : "—";

  const stats = [
    {
      name: "Total Investements",
      icon: CircleDollarSign,
      value: statsData
        ? `${statsData.Investements.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}$`
        : placeholder,
    },
    {
      name: "Pieces Owned",
      icon: Store,
      value: statsData ? String(statsData.PiecesOwned) : placeholder,
    },
    {
      name: "Custom Commisions",
      icon: Hammer,
      value: statsData ? String(statsData.CustomCommissions) : placeholder,
    },
  ];

  function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

  function formatMoney(value: number) {
    return `$${Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          email: formEmail,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setFormError(data?.error || "Something went wrong. Please try again.");
        return;
      }

      setIsEditOpen(false);
    } catch (err) {
      setFormError("Network error. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "This will permanently delete your account. This cannot be undone. Continue?",
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/profile", { method: "DELETE" });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        return;
      }

      // Session cookie is cleared server-side; redirect to logged-out state.
      window.location.href = "/";
    } catch (err) {
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <motion.div
      className="max-w-5xl m-auto py-10"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      {/* Edit Profile Details Modal.
          It is NOT wrapped in a moving element on purpose: an element with a
          transform becomes the "frame" for fixed children and would break
          the full-screen overlay. */}
      {isEditOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setIsEditOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-[#2A1E17]">
                Edit profile
              </h2>
              <button
                onClick={() => setIsEditOpen(false)}
                aria-label="Close"
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {formError && (
                <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {formError}
                </p>
              )}

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[#2A1E17]">Name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-[#2A1E17] placeholder:text-neutral-400 outline-none transition-colors focus:border-[#5C4530] focus:ring-1 focus:ring-[#5C4530]"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[#2A1E17]">
                  Phone
                </span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-[#2A1E17] placeholder:text-neutral-400 outline-none transition-colors focus:border-[#5C4530] focus:ring-1 focus:ring-[#5C4530]"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[#2A1E17]">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-[#2A1E17] placeholder:text-neutral-400 outline-none transition-colors focus:border-[#5C4530] focus:ring-1 focus:ring-[#5C4530]"
                />
              </label>

              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#3A2E22] hover:bg-[#2A1E17] transition-colors text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Apply changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* profile Card */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-2xl border border-neutral-200 p-8 flex items-center gap-6"
      >
        <div className="relative w-24 h-24 shrink-0 rounded-full overflow-hidden border-4 border-white shadow-sm">
          <Image
            src={"/logo.png"}
            alt={"AvatarImage"}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="font-serif text-4xl text-[#2A1E17]">{user?.name}</h1>
          <button
            onClick={() => setIsEditOpen(true)}
            className="mt-4 flex items-center gap-2 bg-[#EFE1CC] hover:bg-[#E5D4B8] text-[#5C4530] font-medium text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Edit profile settings
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeIn} className="mt-10">
        <h2 className="font-serif text-2xl text-[#2A1E17] mb-4">
          Account Stats
        </h2>
        {statsError && (
          <p className="mb-3 text-sm text-red-700">{statsError}</p>
        )}
        <motion.div variants={gridVariants} className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              className="bg-[#EFE6D8] rounded-xl p-10"
            >
              <div className="flex items-center gap-2 text-neutral-500 text-s uppercase tracking-wider font-medium mb-2">
                <stat.icon size={18} />
                <h1>{stat.name}</h1>
              </div>
              <h1 className="font-serif text-3xl text-[#2A1E17]">
                {stat.value}
              </h1>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div variants={fadeUp} className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl text-[#2A1E17]">
            Recent Acquisitions
          </h2>
          <Link
            href="/pages/profile/ordersHistory"
            className="flex items-center gap-1 text-sm font-medium text-[#5C4530] hover:underline"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#3A2E22] text-[#F5EFE4] text-sm">
                <th className="font-medium py-3 px-5">Piece</th>
                <th className="font-medium py-3 px-5">Date</th>
                <th className="font-medium py-3 px-5">Status</th>
                <th className="font-medium py-3 px-5 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {isOrdersLoading ? (
                <tr className="border-t border-neutral-100">
                  <td
                    colSpan={4}
                    className="py-8 px-5 text-center text-neutral-500"
                  >
                    Loading your orders...
                  </td>
                </tr>
              ) : ordersError ? (
                <tr className="border-t border-neutral-100">
                  <td
                    colSpan={4}
                    className="py-8 px-5 text-center text-red-700"
                  >
                    {ordersError}
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr className="border-t border-neutral-100">
                  <td
                    colSpan={4}
                    className="py-8 px-5 text-center text-neutral-500"
                  >
                    No orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((item) => {
                  const isDelivered =
                    item.status?.toLowerCase() === "delivered";

                  return (
                    <tr key={item.id} className="border-t border-neutral-100">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#EFE6D8] shrink-0">
                            <Image
                              src={item.image || "/logo.png"}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-[#2A1E17]">
                              {item.title}
                            </div>
                            <div className="text-sm text-neutral-500">
                              <span className="capitalize">
                                {item.woodType}
                              </span>
                              {item.extraItems > 0 && (
                                <span> · +{item.extraItems} more</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-neutral-600">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full capitalize ${
                            isDelivered
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {isDelivered ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Clock size={14} />
                          )}
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right font-semibold text-[#2A1E17]">
                        {formatMoney(item.total)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={fadeUp}>
        <hr className="mt-10 border-neutral-200" />
        <h2 className="font-serif text-2xl text-red-700 mt-10 mb-4">
          Danger Zone
        </h2>
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-5">
          <div>
            <p className="font-semibold text-[#2A1E17]">Delete Account</p>
            <p className="text-sm text-neutral-600">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="bg-red-700 hover:bg-red-800 transition-colors text-white text-sm font-medium px-5 py-2.5 rounded-lg shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
