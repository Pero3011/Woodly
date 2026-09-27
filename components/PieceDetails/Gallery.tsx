"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryProps {
  images: string[];
}

export default function Gallery({ images = [] }: GalleryProps) {
  // Use the first image as the default active photo, or fallback if array is empty
  const [selectedImage, setSelectedImage] = useState<string>(
    images[0] || "/placeholder.png",
  );

  // If images change dynamically, sync the active selection
  const currentImage = images.includes(selectedImage)
    ? selectedImage
    : images[0] || "/placeholder.png";

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Hero (Main Big) Image */}
      <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden shadow-sm group bg-white/50">
        <Image
          src={currentImage}
          alt="Gallery main image"
          fill
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-contain"
          priority
        />
      </div>

      {/* Thumbnail Strip */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((src, i) => {
            const isSelected = src === currentImage;
            return (
              <div
                key={src + i}
                onClick={() => setSelectedImage(src)}
                className={`relative aspect-square rounded-lg overflow-hidden shadow-sm cursor-pointer group transition-all border-2 ${
                  isSelected
                    ? "border-amber-600 ring-2 ring-amber-600/20"
                    : "border-transparent hover:border-amber-300"
                }`}
              >
                <Image
                  src={src}
                  alt={`Gallery thumbnail ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 25vw, 220px"
                  className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
