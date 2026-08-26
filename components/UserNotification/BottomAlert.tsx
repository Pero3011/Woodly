"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import {motion} from "framer-motion"

interface AlertProps {
  message?: string;
  isVisible?: boolean;
  duration?: number;
  onClose: () => void;
}

export default function BottomAlert({
  message,
  isVisible,
  duration = 5000,
  onClose,
}: AlertProps) {
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <motion.div initial={{opacity: 0, x: 20}} animate={{opacity:1, x:0}} className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-slate-950 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <span>{message}</span>
      <button
        onClick={onClose}
        className="hover:text-gray-400 font-bold ml-2 focus:outline-none"
      >
        <X />
      </button>
    </motion.div>
  );
}
