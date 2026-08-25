import Image from "next/image";
import { Table2, LayoutPanelTop, Paintbrush } from "lucide-react";

type RequestStatus = "In Progress" | "Quoted" | "Pending Review";

interface CustomRequest {
  id: string;
  title: string;
  requestId?: string;
  status: RequestStatus;
  detail: string;
  icon: typeof Table2;
}

const REQUESTS: CustomRequest[] = [
  {
    id: "1",
    title: "Dining Table",
    requestId: "#WDLY-8821",
    status: "In Progress",
    detail: "Request ID: #WDLY-8821",
    icon: Table2,
  },
  {
    id: "2",
    title: "Floating Shelves",
    status: "Quoted",
    detail: "Price: $450.00",
    icon: LayoutPanelTop,
  },
  {
    id: "3",
    title: "Wall Relief",
    status: "Pending Review",
    detail: "Submitted 2 days ago",
    icon: Paintbrush,
  },
];

const STATUS_STYLES: Record<RequestStatus, string> = {
  "In Progress": "bg-tertiary text-secondary",
  Quoted: "bg-primary/10 text-primary",
  "Pending Review": "bg-neutral/20 text-primary",
};

export default function RequestsPanel() {
  return (
    <div className="flex flex-col gap-5">
      {/* My Requests */}
      <div className="bg-secondary rounded-2xl p-5 shadow-sm border border-primary/5">
        <h3 className="font-serif text-lg text-primary mb-4">My Requests</h3>

        <div className="flex flex-col gap-3">
          {REQUESTS.map((request) => {
            const Icon = request.icon;
            return (
              <div
                key={request.id}
                className="rounded-xl bg-canvas border border-primary/5 p-3.5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon
                      className="w-4.5 h-4.5 text-primary"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-primary text-sm truncate">
                        {request.title}
                      </span>
                      <span
                        className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          STATUS_STYLES[request.status]
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral mt-1">
                      {request.detail}
                    </p>

                    {request.status === "Quoted" && (
                      <button className="mt-2 text-xs font-semibold text-primary underline underline-offset-2 hover:opacity-80">
                        Accept Quote
                      </button>
                    )}

                    {request.status === "In Progress" && (
                      <div className="mt-2 h-1 rounded-full bg-primary/10 overflow-hidden">
                        <div className="h-full w-1/2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Material Spotlight */}
      <div className="relative rounded-2xl overflow-hidden h-52">
        <Image
          src="/Hero2.png"
          alt="Walnut timber grain close-up"
          fill
          sizes="320px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-secondary">
          <span className="text-[11px] font-semibold tracking-wide uppercase text-secondary/80">
            Material Spotlight
          </span>
          <h4 className="font-serif text-lg leading-tight mt-0.5">
            The Walnut Heart
          </h4>
          <p className="text-xs text-secondary/80 mt-1">
            Experience the richness of sustainably harvested American Walnut.
          </p>
        </div>
      </div>
    </div>
  );
}
