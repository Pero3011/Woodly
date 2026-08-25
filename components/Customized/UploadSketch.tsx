"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

interface UploadSketchProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

export default function UploadSketch({
  file,
  onFileSelect,
}: UploadSketchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      aria-label="Upload concept sketch"
      className={`flex flex-col items-center justify-center text-center border-2 border-dashed rounded-2xl px-8 py-14 cursor-pointer transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-primary/25 bg-secondary hover:bg-primary/5"
      }`}
    >
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <ImagePlus className="w-6 h-6 text-primary" strokeWidth={1.75} />
      </div>

      <h3 className="font-serif text-lg text-primary mb-1">
        {file ? file.name : "Upload Concept Sketch"}
      </h3>
      <p className="text-sm text-neutral max-w-xs">
        Drag your reference image here or click to browse.
        <br />
        We accept PNG, JPG, or PDF (Max 20MB).
      </p>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
        className="mt-6 px-6 py-2.5 rounded-lg bg-primary text-secondary text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Select File
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        className="hidden"
        onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
