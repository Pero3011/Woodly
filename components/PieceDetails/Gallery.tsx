import Image from "next/image";

export default function Gallery() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
      {/* Hero image */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
        <Image
          src="/1.png"
          alt="Gallery hero image"
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnail strip */}
      <div className="grid grid-cols-4 gap-3">
        {["/2.png", "/3.png", "/4.png", "/5.png"].map((src, i) => (
          <div
            key={src}
            className="relative aspect-square rounded-lg overflow-hidden shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Image
              src={src}
              alt={`Gallery thumbnail ${i + 1}`}
              fill
              sizes="(max-width: 768px) 25vw, 200px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
