"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/FooterPage";
import StepProgress, { CustomizeStep } from "@/components/Customized/StepProgress";
import UploadSketch from "@/components/Customized/UploadSketch";
import PieceSpecifications, { PieceSpec } from "@/components/Customized/PieceSpecifications";
import RequestsPanel from "@/components/Customized/RequestsPanel";
import InspiredByOthers from "@/components/Customized/InspiredByOthers";

const DEFAULT_SPEC: PieceSpec = {
  timberVariety: "Black Walnut (Dark & Rich)",
  width: "",
  height: "",
  unit: "cm",
  instructions: "",
};

export default function CustomizePage() {
  const [step, setStep] = useState<CustomizeStep>("upload");
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [spec, setSpec] = useState<PieceSpec>(DEFAULT_SPEC);

  function handleClearDraft() {
    setSketchFile(null);
    setSpec(DEFAULT_SPEC);
  }

  function handleNextStep() {
    setStep("details");
  }

  return (
    <div className="min-h-full flex flex-col bg-secondary">
      <Navbar/>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-14 pb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-primary/60">
              Bespoke Studio
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-primary leading-tight mt-2 max-w-lg">
              Bring Your Vision to Life in Rare Timber.
            </h1>
          </div>
          <p className="text-sm text-neutral max-w-xs md:text-right">
            Collaborate with our master artisans to create functional art pieces
            that last generations.
          </p>
        </section>

        {/* Step progress */}
        <section className="max-w-5xl mx-auto px-6 pb-10">
          <StepProgress currentStep={step} />
        </section>

        {/* Main workspace */}
        <section className="max-w-5xl mx-auto px-6 grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="flex flex-col gap-6">
            <UploadSketch file={sketchFile} onFileSelect={setSketchFile} />
            <PieceSpecifications
              spec={spec}
              onChange={setSpec}
              onClearDraft={handleClearDraft}
              onNextStep={handleNextStep}
            />
          </div>

          <RequestsPanel />
        </section>

        {/* Carousel dots (visual pagination between studio and inspiration) */}
        <div className="flex items-center justify-center gap-2 py-16">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
          <span className="w-6 h-1.5 rounded-full bg-primary" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
        </div>

        <InspiredByOthers />
      </main>

      <Footer />
    </div>
  );
}
