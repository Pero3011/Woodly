"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <main className="fixed inset-0 z-9999 flex min-h-screen items-center justify-center overflow-hidden">
      {/* Ambient background glow */}
      <motion.div
        className="pointer-events-none absolute h-125 w-125 rounded-full bg-amber-950/40 blur-[80px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative flex flex-col items-center">
        {/* Logo container */}
        <motion.div
          className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* Rotating outer ring */}
          <motion.div
            className="absolute inset-5 rounded-full border border-amber-700/20 border-t-amber-500/80"
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Second subtle ring */}
          <motion.div
            className="absolute inset-10 rounded-full border border-amber-600/10"
            animate={{
              scale: [1, 1.04, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Logo */}
          <motion.img
            src="/MiniLogo.png"
            alt="Woodly"
            className="relative z-10 h-full w-full object-contain"
            animate={{
              scale: [1, 1.025, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Loading message */}
        <motion.p
          className="mt-6 text-[10px] font-medium tracking-[0.45em] text-amber-950/40"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.6,
            duration: 0.8,
          }}
        >
          CRAFTING YOUR EXPERIENCE
        </motion.p>

        {/* Loading dots */}
        <div className="mt-5 flex gap-2">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-1.5 w-1.5 rounded-full bg-amber-600"
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: dot * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
