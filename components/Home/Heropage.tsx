"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { easeIn, motion, AnimatePresence } from "framer-motion";

export default function Heropage() {
  // Array of your images in the public folder
  const images = ["/Hero.png", "/Hero1.png", "/Hero2.png"];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatically cycle through images every 5000ms (5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [images.length]);

  return (
    <div>
      {/* Hero Image Container */}
      <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-[85vh] overflow-hidden bg-muted">
        {/* Animated Image Slider using AnimatePresence */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            // Starts off-screen to the left, transparent, and zoomed IN (scale: 1.25)
            initial={{ opacity: 0, x: "-100%", scale: 1.25 }}
            // Slides to the center, fades in, and smoothly zooms OUT to normal size (scale: 1)
            animate={{ opacity: 1, x: 0, scale: 1 }}
            // Exits off-screen to the right and fades out
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={images[currentIndex]}
              alt={`Hero banner ${currentIndex + 1}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/25 z-10" aria-hidden="true" />

        {/* Hero Content Box (Perfectly Centered) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: easeIn }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 font-body"
        >
          <h1 className="text-[24px] md:text-[32px] lg:text-[48px] font-bold text-secondary max-w-3xl drop-shadow-md font-headline">
            Intricate Artistry, Carved by Hand
          </h1>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 bg-primary text-secondary rounded-lg shadow-md hover:scale-110 transition-transform uppercase text-[16px]">
              Shop Pieces
            </button>
            <button className="px-10 py-3 bg-transparent border-2 border-secondary text-secondary rounded-lg hover:bg-neutral-200 hover:text-black transition uppercase text-[16px]">
              Customize Your Own
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
