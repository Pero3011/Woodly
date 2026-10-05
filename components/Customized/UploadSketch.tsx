"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { ALLOWED_TYPES, validateSketch } from "@/lib/uploadRules";

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
  const [error, setError] = useState<string | null>(null);

  function handleFile(picked: File | undefined) {
    if (!picked) return;

    const problem = validateSketch(picked);
    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    onFileSelect(picked);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div>
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
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && e.key === "Enter") {
            inputRef.current?.click();
          }
        }}
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
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
