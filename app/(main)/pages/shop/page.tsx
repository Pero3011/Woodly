"use client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/FilterSidebar";
import Heading from "@/components/Shop/Heading/Heading";
import Filters from "@/components/Shop/Items/Filters";
import ItemsGrid from "@/components/Shop/Items/ItemsGrid";
import { useState } from "react";

export default function page() {
  const [layout, setLayout] = useState<"grid-cols-3" | "grid-rows-3">(
    "grid-cols-3",
  );
  return (
    <div>
      <Navbar hasSearch={true} />
      <div className="flex bg-secondary">
        <aside>
          <Sidebar />
        </aside>
        <div className="flex-1 px-20">
          <Heading layout={layout} setLayout={setLayout} />
          <Filters />
          <ItemsGrid DisplaySetting={layout} />
        </div>
      </div>
    </div>
  );
}
