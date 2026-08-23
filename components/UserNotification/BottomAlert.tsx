"use client";

import { X } from "lucide-react";

interface AlertProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function BottomAlert({
  message,
  isVisible,
  onClose,
}: AlertProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-slate-950 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-5 duration-300">

      <span>{message}</span>
      <button
        onClick={onClose}
        className="hover:text-gray-400 font-bold ml-2 focus:outline-none"
      >
        <X />
      </button>
    </div>
  );
}
