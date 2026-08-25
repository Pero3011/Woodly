"use client";

import { useEffect, useState } from "react";
import {
  CircleDollarSign,
  Store,
  Hammer,
  ArrowRight,
  CheckCircle2,
  X,
} from "lucide-react";
import Image from "next/image";

interface SessionUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function ProfileSettings() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  // Editable form state — separate from `user` so the modal has its own
  // draft that only overwrites `user` once the save succeeds.
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  // Seed the draft fields whenever we (re)load the user or open the modal.
  useEffect(() => {
    if (user) {
      setFormName(user.name ?? "");
      setFormPhone(user.phone ?? "");
      setFormEmail(user.email ?? "");
    }
  }, [user, isEditOpen]);

  const stats = [
    {
      name: "Total Investements",
      icon: CircleDollarSign,
      value: "4,250$",
    },
    {
      name: "Pieces Owned",
      icon: Store,
      value: "12",
    },
    {
      name: "Custom Commisions",
      icon: Hammer,
      value: "3",
    },
  ];

  const recentAcquisitions = [
    {
      id: "1",
      image: "/logo.png",
      title: "Geometric Forest Panel",
      variant: "Walnut · Large",
      date: "Oct 12, 2023",
      status: "Delivered",
      total: "$450",
    },
    {
      id: "2",
      image: "/logo.png",
      title: "Minimalist Organizer",
      variant: "Oak · Standard",
      date: "Sep 05, 2023",
      status: "Delivered",
      total: "$120",
    },
  ];

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

      setUser(data.user);
      setIsEditOpen(false);
    } catch (err) {
      setFormError("Network error. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-5xl m-auto py-10">
      {/* Edit Profile Details Modal */}
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
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 flex items-center gap-6">
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
      </div>

      {/* Stats Cards */}
      <div className="mt-10">
        <h2 className="font-serif text-2xl text-[#2A1E17] mb-4">
          Account Stats
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[#EFE6D8] rounded-xl p-10">
              <div className="flex items-center gap-2 text-neutral-500 text-s uppercase tracking-wider font-medium mb-2">
                <stat.icon size={18} />
                <h1>{stat.name}</h1>
              </div>
              <h1 className="font-serif text-3xl text-[#2A1E17]">
                {stat.value}
              </h1>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl text-[#2A1E17]">
            Recent Acquisitions
          </h2>
          <a
            href="/products/profile/ordersHistory"
            className="flex items-center gap-1 text-sm font-medium text-[#5C4530] hover:underline"
          >
            View All <ArrowRight size={14} />
          </a>
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
              {recentAcquisitions.map((item) => (
                <tr key={item.id} className="border-t border-neutral-100">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#EFE6D8] shrink-0">
                        <Image
                          src={item.image}
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
                          {item.variant}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-neutral-600">{item.date}</td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                      <CheckCircle2 size={14} />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right font-semibold text-[#2A1E17]">
                    {item.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone */}
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
        <button className="bg-red-700 hover:bg-red-800 transition-colors text-white text-sm font-medium px-5 py-2.5 rounded-lg shrink-0">
          Delete Account
        </button>
      </div>
    </div>
  );
}
