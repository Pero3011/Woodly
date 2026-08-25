import Image from "next/image";
import { Sparkles } from "lucide-react";

interface InspirationPiece {
  id: string;
  title: string;
  detail: string;
  image: string;
}

const PIECES: InspirationPiece[] = [
  {
    id: "1",
    title: "The Horizon Coffee Table",
    detail: "White Oak · Custom Dimensions",
    image: "/Test1.png",
  },
  {
    id: "2",
    title: "The Scribe's Bureau",
    detail: "Black Walnut · Inscribed",
    image: "/Test2.png",
  },
  {
    id: "3",
    title: "Lattice Wall Sculptures",
    detail: "Hinoki · Modular Set",
    image: "/Hero1.png",
  },
];

export default function InspiredByOthers() {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-24">
      <h2 className="font-serif text-3xl text-primary text-center mb-8">
        Inspired by Others
      </h2>

      <div className="grid sm:grid-cols-3 gap-5">
        {PIECES.map((piece) => (
          <div
            key={piece.id}
            className="bg-canvas rounded-xl overflow-hidden group cursor-pointer"
          >
            <div className="relative aspect-4/3">
              <Image
                src={piece.image}
                alt={piece.title}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute top-3 right-3 flex items-center gap-1 bg-secondary/90 text-primary text-[11px] font-semibold px-2 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                Artisan
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-primary text-sm">
                {piece.title}
              </h3>
              <p className="text-xs text-neutral mt-0.5">{piece.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
