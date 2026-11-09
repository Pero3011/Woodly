import Image from "next/image";
import { formatMoney } from "@/lib/money";
import { useEffect, useState } from "react";

type RequestStatus = "pending" | "approved" | "rejected";

interface CustomRequest {
  id: string;
  title: string;
  status: RequestStatus;
  quotedPrice: number | null;
  description: string | null;
  image: string | null;
}

const STATUS_STYLES: Record<RequestStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-primary/10 text-primary",
  rejected: "bg-red-100 text-red-700",
};

const DEFAULT_STATUS_STYLE = "bg-neutral/10 text-neutral";

export default function RequestsPanel() {
  const [myRequests, setMyRequests] = useState<CustomRequest[]>([]);

  useEffect(() => {
    fetch("/api/customized", { method: "GET" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMyRequests([]);
          return;
        }
        setMyRequests(data.orders ?? []);
      })
      .catch(() => setMyRequests([]));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-secondary rounded-2xl p-5 shadow-sm border border-primary/5">
        <h3 className="font-serif text-lg text-primary mb-4">My Requests</h3>

        <div className="flex flex-col gap-3">
          {myRequests.length === 0 && (
            <p className="text-sm text-neutral">No custom requests yet.</p>
          )}

          {myRequests.map((req) => {
            const statusKey = req.status?.toLowerCase() as RequestStatus;
            const statusBadgeStyle =
              STATUS_STYLES[statusKey] ?? DEFAULT_STATUS_STYLE;

            return (
              <div
                key={req.id}
                className="rounded-xl bg-canvas border border-primary/5 p-3.5"
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                    {req.image && !req.image.toLowerCase().endsWith(".pdf") ? (
                      <Image
                        src={req.image}
                        alt="Custom sketch"
                        fill
                        className="object-contain"
                        sizes="36px"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-primary text-sm truncate">
                        {req.title}
                      </span>
                      <span
                        className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusBadgeStyle}`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-primary mt-1">
                      {req.description ? (
                        <p className="text-neutral truncate">{req.description}</p>
                      ) : null}
                      {req.quotedPrice != null && (
                        <span>{formatMoney(req.quotedPrice)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
