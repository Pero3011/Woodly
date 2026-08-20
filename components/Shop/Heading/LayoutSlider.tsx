"use client";

import { Grid2x2, List } from "lucide-react";
import { useState } from "react";

export default function LayoutSlider() {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const activeStyles = "bg-white shadow-sm rounded p-1";
  const inactiveStyles = "p-1 opacity-60 hover:opacity-100 transition-opacity";

  return (
    <div className="bg-secondary rounded-md inline-block shadow-[inset_1px_1px_5px_0px_gray]">
      <div className="flex gap-1 p-2">
        <button
          onClick={() => setLayout("grid")}
          className={layout === "grid" ? activeStyles : inactiveStyles}
          aria-label="Grid view"
        >
          <Grid2x2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => setLayout("list")}
          className={layout === "list" ? activeStyles : inactiveStyles}
          aria-label="List view"
        >
          <List className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
