"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Filter,
  Wrench,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
} from "lucide-react";

// TODO: change this to the real path of your orders route
const ORDERS_API_URL = "/api/profile/orders";
const PAGE_SIZE = 10;

// The exact shape the route sends back
interface ApiOrder {
  type: "marketplace" | "custom";
  id: string;
  title: string;
  image: string | null;
  woodType: string | null;
  date: string; // dates arrive as text (ISO format) in JSON
  status: string;
  total: number | null; // null = custom order with no quote yet
  extraItems: number;
}

// Real statuses from your database check constraints:
// ORDERS:            pending, shipped, delivered
// CUSTOMIZED_ORDERS: pending, approved, rejected
const STATUS_META: Record<string, { icon: typeof Wrench; color: string }> = {
  pending: { icon: Clock, color: "text-stone-600" },
  approved: { icon: Wrench, color: "text-amber-700" },
  rejected: { icon: XCircle, color: "text-red-700" },
  shipped: { icon: Truck, color: "text-blue-700" },
  delivered: { icon: CheckCircle2, color: "text-green-700" },
};

// Safety net for a status we don't know yet
const DEFAULT_STATUS_META = { icon: Clock, color: "text-stone-600" };

const FILTER_OPTIONS = [
  ["all", "All orders"],
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
  ["shipped", "Shipped"],
  ["delivered", "Delivered"],
] as const;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatDate(iso: string, type: ApiOrder["type"]) {
  const text = new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return type === "custom" ? `Commissioned on ${text}` : `Purchased on ${text}`;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function formatPrice(order: ApiOrder) {
  if (order.total !== null) return currency.format(order.total);
  return order.status.toLowerCase() === "rejected"
    ? "No quote"
    : "Awaiting quote";
}

async function fetchOrders(offset: number): Promise<ApiOrder[]> {
  const res = await fetch(
    `${ORDERS_API_URL}?limit=${PAGE_SIZE}&offset=${offset}`,
  );
  if (!res.ok) throw new Error("Failed to load orders");
  const data = await res.json();
  return data.orders as ApiOrder[];
}

function TypeBadge({ type }: { type: ApiOrder["type"] }) {
  const isCommission = type === "custom";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase ${
        isCommission
          ? "bg-[#3d2b1f] text-[#f4ece1]"
          : "bg-[#e4d9c8] text-[#5c4a35]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {isCommission ? "Custom Commission" : "Marketplace"}
    </span>
  );
}

function OrderCard({ order, index }: { order: ApiOrder; index: number }) {
  const meta = STATUS_META[order.status.toLowerCase()] ?? DEFAULT_STATUS_META;
  const StatusIcon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index % PAGE_SIZE) * 0.1 }}
      viewport={{ once: true, amount: 0.25 }}
      className="flex flex-col gap-4 rounded-2xl border border-[#e7dcc9] p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5"
    >
      {order.image ? (
        <img
          src={order.image}
          alt={order.title}
          className="h-32 w-32 shrink-0 rounded-xl object-cover sm:h-28 sm:w-28"
        />
      ) : (
        <div className="h-32 w-32 shrink-0 rounded-xl bg-[#e4d9c8] sm:h-28 sm:w-28" />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <TypeBadge type={order.type} />
          <span className="text-xs text-[#9c8b74]">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <h2 className="font-serif text-xl text-[#3d2b1f] sm:text-2xl">
          {order.title}
          {order.type === "marketplace" && order.extraItems > 0 && (
            <span className="ml-2 text-sm text-[#8a7a63]">
              +{order.extraItems} more
            </span>
          )}
        </h2>

        <p className="text-sm text-[#8a7a63]">
          {formatDate(order.date, order.type)}
          {order.woodType && ` • ${order.woodType}`}
        </p>

        <div className="mt-1 flex items-center gap-1.5 text-sm">
          <StatusIcon className={`h-4 w-4 ${meta.color}`} />
          <span className={`font-medium ${meta.color}`}>
            {capitalize(order.status)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-3">
        <span className="font-serif text-2xl text-[#3d2b1f]">
          {formatPrice(order)}
        </span>
      </div>
    </motion.div>
  );
}

export default function OrdersHistory() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  // First page: runs once when the component appears
  useEffect(() => {
    let ignore = false;

    fetchOrders(0)
      .then((first) => {
        if (ignore) return;
        setOrders(first);
        setHasMore(first.length === PAGE_SIZE);
      })
      .catch(() => {
        if (!ignore)
          setError("We could not load your orders. Please try again.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Next pages: skip the orders we already have
  async function handleLoadMore() {
    setLoadingMore(true);
    setError(null);
    try {
      const next = await fetchOrders(orders.length);
      setOrders((prev) => [...prev, ...next]);
      setHasMore(next.length === PAGE_SIZE);
    } catch {
      setError("We could not load more orders. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  const filtered =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status.toLowerCase() === filter);

  return (
    <div className="min-h-screen max-w-5xl m-auto px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-start justify-between gap-4"
        >
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
                {FILTER_OPTIONS.map(([value, label]) => (
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
        </motion.div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {loading && (
            <div className="rounded-2xl border border-dashed border-[#e7dcc9] p-10 text-center text-[#8a7a63]">
              Loading your orders...
            </div>
          )}

          {!loading &&
            filtered.map((order, index) => (
              <OrderCard
                key={`${order.type}-${order.id}`}
                order={order}
                index={index}
              />
            ))}

          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#e7dcc9] p-10 text-center text-[#8a7a63]">
              {orders.length === 0
                ? "You have no orders yet."
                : "No orders match this filter."}
            </div>
          )}

          {!loading && hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="mx-auto rounded-lg border border-[#3d2b1f] px-6 py-2 text-sm font-medium text-[#3d2b1f] transition hover:bg-[#3d2b1f] hover:text-[#f4ece1] disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
