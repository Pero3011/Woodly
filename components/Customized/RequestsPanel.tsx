import Image from "next/image";
import { useEffect, useState } from "react";

// Update type to include all statuses coming from your backend
type RequestStatus = "pending" | "approved" | "rejected";

const STATUS_STYLES: Record<RequestStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-primary/10 text-primary",
  rejected: "bg-red-100 text-red-700",
};

// Fallback style for safety if a status doesn't match any key
const DEFAULT_STATUS_STYLE = "bg-neutral/10 text-neutral";

export default function RequestsPanel() {
  const [myRequests, setMyRequests] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/customized", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setMyRequests(data.orders ?? []);
      });
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* My Requests */}
      <div className="bg-secondary rounded-2xl p-5 shadow-sm border border-primary/5">
        <h3 className="font-serif text-lg text-primary mb-4">My Requests</h3>

        <div className="flex flex-col gap-3">
          {myRequests.map((req) => {
            // Safely retrieve the style string based on status
            const statusKey =
              req.CUSTOMIZED_STATUS?.toLowerCase() as RequestStatus;
            const statusBadgeStyle =
              STATUS_STYLES[statusKey] ?? DEFAULT_STATUS_STYLE;

            return (
              <div
                key={req.REQ_TITLE}
                className="rounded-xl bg-canvas border border-primary/5 p-3.5"
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                    <Image
                      src={req.CUSTOM_IMAGE}
                      alt="Custom Image"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-primary text-sm truncate">
                        {req.REQ_TITLE}
                      </span>
                      {/* Applied dynamic styles here */}
                      <span
                        className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadgeStyle}`}
                      >
                        {req.CUSTOMIZED_STATUS}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-primary mt-1">
                      <p className="text-neutral">{req.REQ_DESCRIPTION}</p>
                      {req.QUOTED_PRICE != 0 && <span>{req.QUOTED_PRICE}</span>}
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
