"use client";

import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";

// The 3D library is big, so it is only downloaded when the Review step opens
const TimberPreview = dynamic(() => import("./TimberPreview"), {
  ssr: false,
  loading: () => (
    <div className="bg-canvas rounded-2xl p-7 text-sm text-neutral">
      Loading preview...
    </div>
  ),
});
import type { PieceSpec } from "./PieceSpecifications";

interface ReviewStepProps {
  spec: PieceSpec;
  file: File | null;
  error: string | null;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ReviewStep({
  spec,
  file,
  error,
  isSubmitting,
  onBack,
  onSubmit,
}: ReviewStepProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Request title", value: spec.title },
    { label: "Timber variety", value: spec.timberVariety },
    {
      label: "Approximate size",
      value: `${spec.width} x ${spec.height} ${spec.unit}`,
    },
    {
      label: "Carving instructions",
      value: spec.instructions.trim() || "No extra instructions.",
    },
    {
      label: "Concept sketch",
      value: file ? `${file.name} (${formatFileSize(file.size)})` : "None",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Section 1: simulation */}
      <TimberPreview file={file} timberVariety={spec.timberVariety} />

      {/* Section 2: details review */}
      <div className="bg-canvas rounded-2xl p-6 md:p-7">
        <h3 className="font-serif text-lg text-primary mb-5">
          Your Request Details
        </h3>

        <dl className="divide-y divide-primary/10">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid sm:grid-cols-[160px_1fr] gap-1 sm:gap-4 py-3 first:pt-0"
            >
              <dt className="text-sm text-neutral">{row.label}</dt>
              <dd className="text-sm text-primary font-medium wrap-break-word whitespace-pre-wrap">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 text-sm font-medium text-primary/70 hover:text-primary transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Edit details
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-primary text-secondary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send request"}
          </button>
        </div>
      </div>
    </div>
  );
}
