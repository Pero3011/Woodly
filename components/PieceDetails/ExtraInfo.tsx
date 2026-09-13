"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TABS = ["Story", "Craft", "Shipping"] as const;
type Tab = (typeof TABS)[number];

const TAB_CONTENT: Record<
  Tab,
  {
    heading: string;
    body: string;
    stats: { value: string; label: string }[];
    image: string;
  }
> = {
  Story: {
    heading: "Digital Precision, Analog Soul",
    body: "Our process begins with 3D modeling to ensure mathematical perfection in the curves, but the final execution is purely by hand. Each edge is hand-planed, and each surface is hand-sanded through twelve grits of paper until it feels like silk.",
    stats: [
      { value: "12+", label: "Hours Sanding" },
      { value: "100%", label: "Sustainable" },
    ],
    image: "/craft-1.jpg",
  },
  Craft: {
    heading: "Every Cut, Considered",
    body: "Fretwork this dense demands a steady hand and a sharper eye. Each lattice opening is scroll-sawn individually, then eased and burnished so no edge feels machine-made.",
    stats: [
      { value: "6", label: "Master Artisans" },
      { value: "0", label: "Shortcuts Taken" },
    ],
    image: "/craft-2.jpg",
  },
  Shipping: {
    heading: "Built to Travel Well",
    body: "Each piece is crated by hand in a custom-fitted enclosure and insured door to door. White-glove delivery and placement is available at checkout for an additional fee.",
    stats: [
      { value: "4-6", label: "Weeks Lead Time" },
      { value: "1", label: "Year Warranty" },
    ],
    image: "/craft-3.jpg",
  },
};

const PAIRINGS = [
  {
    name: "Geometric Lattice Panel",
    material: "Cherry Wood",
    price: 1450,
    image: "/2.png",
  },
  {
    name: "Floral Scrollwork Screen",
    material: "Maple",
    price: 2100,
    image: "/3.png",
  },
  {
    name: "Miniature Fretwork Study",
    material: "Walnut",
    price: 950,
    image: "/4.png",
  },
];

export default function ExtraInfo() {
  const [activeTab, setActiveTab] = useState<Tab>("Story");
  const content = TAB_CONTENT[activeTab];

  return (
    <div className="max-w-6xl mx-auto px-5">
      {/* Tabs */}
      <div className="flex gap-8 border-b border-[#E5D9C7] mb-10">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
              activeTab === tab
                ? "text-[#2A1E17] border-b-2 border-[#2A1E17]"
                : "text-[#B5A794] hover:text-[#8A7A68]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Story / Craft / Shipping content */}
      <div className="grid grid-cols-2 gap-16 items-center mb-20">
        <div>
          <h2 className="font-serif text-3xl text-[#2A1E17] mb-4">
            {content.heading}
          </h2>
          <p className="text-sm leading-relaxed text-[#5A4C3F] mb-8 max-w-md">
            {content.body}
          </p>
          <div className="flex gap-10">
            {content.stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-serif text-4xl text-[#3A2E22]">
                  {stat.value}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#8A7A68] mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden">
          <Image
            src={content.image}
            alt={content.heading}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover grayscale"
          />
        </div>
      </div>

      {/* Artisanal Pairings */}
      <div className="mb-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl text-[#2A1E17] mb-1">
              Artisanal Pairings
            </h2>
            <p className="text-sm text-[#8A7A68]">
              Pieces for your curated space.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              aria-label="Previous"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#E5D9C7] text-[#5A4C3F] hover:bg-[#F5EFE4] transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              aria-label="Next"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#E5D9C7] text-[#5A4C3F] hover:bg-[#F5EFE4] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {PAIRINGS.map((item) => (
            <div key={item.name} className="cursor-pointer group">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 33vw, 360px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-3 right-3 bg-[#D98A3D] text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                  ${item.price.toLocaleString()}
                </span>
              </div>
              <h3 className="text-sm font-medium text-[#2A1E17]">
                {item.name}
              </h3>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8A7A68] mt-0.5">
                {item.material}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
