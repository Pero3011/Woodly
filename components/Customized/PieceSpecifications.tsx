"use client";

import { X } from "lucide-react";

export interface PieceSpec {
  timberVariety: string;
  width: string;
  height: string;
  unit: "cm" | "in";
  instructions: string;
}

interface PieceSpecificationsProps {
  spec: PieceSpec;
  onChange: (spec: PieceSpec) => void;
  onClearDraft: () => void;
  onNextStep: () => void;
}

const TIMBER_OPTIONS = [
  "Black Walnut (Dark & Rich)",
  "White Oak (Light & Grained)",
  "Cherry (Warm & Smooth)",
  "Hinoki (Pale & Fragrant)",
];

export default function PieceSpecifications({
  spec,
  onChange,
  onClearDraft,
  onNextStep,
}: PieceSpecificationsProps) {
  return (
    <div className="bg-canvas rounded-2xl p-6 md:p-7">
      <h3 className="font-serif text-lg text-primary mb-5">
        Piece Specifications
      </h3>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">
            Timber Variety
          </label>
          <select
            value={spec.timberVariety}
            onChange={(e) =>
              onChange({ ...spec, timberVariety: e.target.value })
            }
            className="w-full rounded-lg border border-primary/15 bg-secondary text-primary text-sm px-3 py-2.5 focus:outline-none focus:border-primary/50"
          >
            {TIMBER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">
            Approximate Size
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Width"
              value={spec.width}
              onChange={(e) => onChange({ ...spec, width: e.target.value })}
              className="w-full rounded-lg border border-primary/15 bg-secondary text-primary text-sm placeholder-neutral px-3 py-2.5 focus:outline-none focus:border-primary/50"
            />
            <input
              type="text"
              placeholder="Height"
              value={spec.height}
              onChange={(e) => onChange({ ...spec, height: e.target.value })}
              className="w-full rounded-lg border border-primary/15 bg-secondary text-primary text-sm placeholder-neutral px-3 py-2.5 focus:outline-none focus:border-primary/50"
            />
            <select
              value={spec.unit}
              onChange={(e) =>
                onChange({ ...spec, unit: e.target.value as "cm" | "in" })
              }
              className="rounded-lg border border-primary/15 bg-secondary text-primary text-sm px-2 focus:outline-none focus:border-primary/50"
            >
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-primary mb-1.5">
          Artisan Carving Instructions
        </label>
        <textarea
          value={spec.instructions}
          onChange={(e) => onChange({ ...spec, instructions: e.target.value })}
          placeholder="Describe any specific patterns, edge profiles, or personal inscriptions..."
          rows={4}
          className="w-full rounded-lg border border-primary/15 bg-secondary text-primary text-sm placeholder-neutral px-3 py-2.5 resize-none focus:outline-none focus:border-primary/50"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onClearDraft}
          className="flex items-center gap-1.5 text-sm font-medium text-primary/70 hover:text-primary transition-colors"
        >
          <X className="w-4 h-4" />
          Clear Draft
        </button>

        <button
          type="button"
          onClick={onNextStep}
          className="px-6 py-2.5 rounded-lg bg-primary text-secondary text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
