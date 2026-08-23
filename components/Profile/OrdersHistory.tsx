'use client'
import { useState } from "react";
import { Filter, Wrench, Truck, CheckCircle2, ChevronDown } from "lucide-react";

type OrderStatus = "crafting" | "shipped" | "delivered";

interface Order {
  id: string;
  type: string;
  title: string;
  date: string;
  price: string;
  image: string;
  status: OrderStatus;
  statusLabel: string;
}

const STATUS_META: Record<OrderStatus, { icon: typeof Wrench; color: string }> =
  {
    crafting: { icon: Wrench, color: "text-amber-700" },
    shipped: { icon: Truck, color: "text-blue-700" },
    delivered: { icon: CheckCircle2, color: "text-green-700" },
  };

const ORDERS: Order[] = [
  {
    id: "WD-8924-CC",
    type: "Custom Commission",
    title: "Intricate Fretwork Wall Art",
    date: "Commissioned on Oct 12, 2024",
    price: "$1,250.00",
    image:
      "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=300&h=300&fit=crop",
    status: "crafting",
    statusLabel: "Est. Completion: Nov 5",
  },
  {
    id: "WD-8801-MP",
    type: "Marketplace",
    title: "Hand-Turned Walnut Bowl",
    date: "Purchased on Sep 28, 2024",
    price: "$185.00",
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300&h=300&fit=crop",
    status: "shipped",
    statusLabel: "Arriving Oct 3",
  },
  {
    id: "WD-8654-CC",
    type: "Custom Commission",
    title: "Carved Oak Mantel Clock",
    date: "Commissioned on Aug 3, 2024",
    price: "$2,400.00",
    image:
      "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=300&h=300&fit=crop",
    status: "delivered",
    statusLabel: "Delivered Aug 30",
  },
];

function StatusBadge({ type }: { type: string }) {
  const isCommission = type === "Custom Commission";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase ${
        isCommission
          ? "bg-[#3d2b1f] text-[#f4ece1]"
          : "bg-[#e4d9c8] text-[#5c4a35]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {type}
    </span>
  );
}

function OrderCard({ order }: { order: Order }) {
  const meta = STATUS_META[order.status];
  const StatusIcon = meta.icon;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#e7dcc9] p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
      <img
        src={order.image}
        alt={order.title}
        className="h-32 w-32 shrink-0 rounded-xl object-cover sm:h-28 sm:w-28"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge type={order.type} />
          <span className="text-xs text-[#9c8b74]">#{order.id}</span>
        </div>

        <h2 className="font-serif text-xl text-[#3d2b1f] sm:text-2xl">
          {order.title}
        </h2>

        <p className="text-sm text-[#8a7a63]">{order.date}</p>

        <div className="mt-1 flex items-center gap-1.5 text-sm">
          <StatusIcon className={`h-4 w-4 ${meta.color}`} />
          <span className={`font-medium ${meta.color}`}>
            {order.status === "crafting"
              ? "Crafting"
              : order.status === "shipped"
                ? "Shipped"
                : "Delivered"}
          </span>
          <span className="text-[#c4b8a3]">•</span>
          <span className="text-[#8a7a63]">{order.statusLabel}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-3">
        <span className="font-serif text-2xl text-[#3d2b1f]">
          {order.price}
        </span>
        <button className="rounded-lg border border-[#3d2b1f] px-4 py-2 text-sm font-medium text-[#3d2b1f] transition hover:bg-[#3d2b1f] hover:text-[#f4ece1]">
          View Details
        </button>
      </div>
    </div>
  );
}

export default function OrdersHistory() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const filtered =
    filter === "all" ? ORDERS : ORDERS.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen max-w-5xl m-auto px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl text-[#3d2b1f] sm:text-5xl">
              Order History
            </h1>
            <p className="mt-2 text-[#8a7a63]">
              Review your past commissions and marketplace acquisitions.
            </p>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-[#e7dcc9] bg-white px-4 py-2 text-sm font-medium text-[#3d2b1f] shadow-sm transition hover:bg-[#faf3e7]"
            >
              <Filter className="h-4 w-4" />
              Filter
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {filterOpen && (
              <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-lg border border-[#e7dcc9] bg-white shadow-lg">
                {(
                  [
                    ["all", "All orders"],
                    ["crafting", "Crafting"],
                    ["shipped", "Shipped"],
                    ["delivered", "Delivered"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setFilter(value);
                      setFilterOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#faf3e7] ${
                      filter === value
                        ? "font-medium text-[#3d2b1f]"
                        : "text-[#8a7a63]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#e7dcc9] p-10 text-center text-[#8a7a63]">
              No orders match this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
