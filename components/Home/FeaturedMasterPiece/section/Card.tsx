import Image from "next/image";
import { ShoppingCart } from "lucide-react"

interface cards {
  URL: string;
  Title: string;
  Description: string;
  Price: number;
}

export default function Card({ URL, Title, Description, Price }: cards) {
  // A bulletproof, interlocking lattice fretwork pattern using your exact palette colors
  const fretworkPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='%238A7F72' stroke-width='1' stroke-opacity='0.12'%3E%3Cpath d='M0 0h20v20H0zm20 20h20v20H20z'/%3E%3Cpath stroke='%236B4226' stroke-opacity='0.08' d='M0 20l20-20M20 40l20-20M0 20l20 20M20 0l20 20'/%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Image Container */}
      <div
        className="relative w-full aspect-video flex items-center justify-center overflow-hidden border-b border-gray-50"
        style={{
          backgroundColor: "#FFF8F3", // --color-secondary (Light Cream Base)
          backgroundImage: fretworkPattern,
          backgroundRepeat: "repeat",
        }}
      >
        {/* The Main Image: Fully contained */}
        <div className="relative w-11/12 h-5/6 z-10 transition-transform duration-500 group-hover:scale-[1.03]">
          <Image
            src={URL}
            alt={Title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain drop-shadow-[0_10px_20px_rgba(107,66,38,0.15)]"
          />
        </div>

        {/* Studio Tag with Deep Teal accent color */}
        <span className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-sm text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md border border-gray-100 text-tertiary">
          Masterpiece
        </span>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col grow justify-between">
        <div>
          <h3 className="font-semibold text-lg tracking-tight transition-colors duration-200 group-hover:text-primary text-gray-900 line-clamp-1">
            {Title}
          </h3>
          <p className="text-sm text-neutral mt-1.5 leading-relaxed line-clamp-2">
            {Description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-100">
          <span className="text-xl font-bold text-tertiary">${Price}.00</span>
          <span className="cursor-pointer bg-primary text-secondary rounded-full p-2 hover:p-3 transition-normal duration-200">
            <ShoppingCart size={16}/>
          </span>
        </div>
      </div>
    </div>
  );
}
