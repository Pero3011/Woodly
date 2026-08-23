import { ShoppingCart } from "lucide-react";
import Image from "next/image";

// ItemsCards.tsx
interface ItemCardProps {
  image: string;
  category: string;
  price: string;
  title: string;
  description: string;
  layout?: "grid" | "list";
}

export default function ItemsCards({
  image,
  category,
  price,
  title,
  description,
  layout = "grid",
}: ItemCardProps) {
  const fretworkPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='%238A7F72' stroke-width='1' stroke-opacity='0.12'%3E%3Cpath d='M0 0h20v20H0zm20 20h20v20H20z'/%3E%3Cpath stroke='%236B4226' stroke-opacity='0.08' d='M0 20l20-20M20 40l20-20M0 20l20 20M20 0l20 20'/%3E%3C/g%3E%3C/svg%3E")`;

  const isList = layout === "list";

  return (
    <div
      className={`group bg-[#EFE6D8] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${
        isList ? "flex flex-row items-stretch" : ""
      }`}
    >
      {/* Image Container */}
      <div
        className={`relative flex items-center justify-center overflow-hidden shrink-0 ${
          isList ? "w-48 aspect-square" : "w-full aspect-square"
        }`}
        style={{
          backgroundColor: "#FFF8F3",
          backgroundImage: fretworkPattern,
          backgroundRepeat: "repeat",
        }}
      >
        <div className="relative w-11/12 h-5/6 z-10 transition-transform duration-500 group-hover:scale-[1.03]">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain drop-shadow-[0_10px_20px_rgba(107,66,38,0.15)]"
          />
        </div>
      </div>

      {/* Content */}
      <div
        className={`px-6 pt-5 pb-6 flex flex-col ${
          isList ? "flex-1 justify-center" : ""
        }`}
      >
        <div
          className={`flex items-center justify-between mb-4 ${
            isList ? "flex-row-reverse justify-end gap-3" : ""
          }`}
        >
          <span className="inline-flex items-center gap-1.5 bg-[#3A3530] text-[#F5EFE4] text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full">
            <span className="w-1 h-1 rounded-full bg-[#C97A3D]" />
            {category}
          </span>
          <span className="bg-[#D98A3D] text-white text-base font-semibold px-4 py-1.5 rounded-lg">
            {price}
          </span>
        </div>

        <h2 className="font-serif text-2xl text-[#3A2E22] leading-snug mb-2">
          {title}
        </h2>

        <p className="text-sm text-[#6B5F52] leading-relaxed mb-5">
          {description}
        </p>

        <button
          className={`flex items-center justify-center gap-2 bg-[#5C4530] hover:bg-[#4A3826] transition-colors text-[#F5EFE4] text-xs font-semibold uppercase tracking-wider py-3.5 rounded-lg ${
            isList ? "w-fit px-6" : "w-full"
          }`}
        >
          <ShoppingCart size={16} />
          Add to Collection
        </button>
      </div>
    </div>
  );
}
