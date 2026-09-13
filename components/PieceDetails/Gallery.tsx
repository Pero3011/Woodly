import Image from "next/image";

export default function Gallery() {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* Hero image */}
      <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden shadow-sm group">
        <Image
          src="/Test1.png"
          alt="Gallery hero image"
          fill
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-contain"
          priority
        />
      </div>

      {/* Thumbnail strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          "/Nsoo7y360viewFace.png",
          "/Nsoo7y360viewLeft.png",
          "/Nsoo7y360viewSide.png",
          "/Nsoo7y360viewBack.png",
        ].map((src, i) => (
          <div
            key={src}
            className="relative aspect-square rounded-lg overflow-hidden shadow-sm cursor-pointer group" // Added 'group'
          >
            <Image
              src={src}
              alt={`Gallery thumbnail ${i + 1}`}
              fill
              sizes="(max-width: 768px) 25vw, 220px"
              className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
