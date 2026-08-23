"use client";

import { Grid2x2, List } from "lucide-react";
interface HeadingProps {
  layout: "grid-cols-3" | "grid-rows-3";
  setLayout: (layout: "grid-cols-3" | "grid-rows-3") => void;
}

export default function LayoutSlider({ layout, setLayout}:HeadingProps) {
  
  const activeStyles = "bg-white shadow-sm rounded p-1";
  const inactiveStyles = "p-1 opacity-60 hover:opacity-100 transition-opacity";

  return (
    <div className="bg-secondary rounded-md inline-block shadow-[inset_0.5px_0.5px_3px_0px_gray]">
      <div className="flex gap-1 p-2">
        <button
          onClick={() => setLayout("grid-cols-3")}
          className={layout === "grid-cols-3" ? activeStyles : inactiveStyles}
          aria-label="Grid view"
        >
          <Grid2x2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => setLayout("grid-rows-3")}
          className={layout === "grid-rows-3" ? activeStyles : inactiveStyles}
          aria-label="List view"
        >
          <List className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
