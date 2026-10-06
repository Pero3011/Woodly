"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/FooterPage";
import StepProgress, {
  CustomizeStep,
} from "@/components/Customized/StepProgress";
import UploadSketch from "@/components/Customized/UploadSketch";
import PieceSpecifications, {
  PieceSpec,
} from "@/components/Customized/PieceSpecifications";
import ReviewStep from "@/components/Customized/ReviewStep";
import RequestsPanel from "@/components/Customized/RequestsPanel";

const DEFAULT_SPEC: PieceSpec = {
  title: "",
  timberVariety: "Black Walnut (Dark & Rich)",
  width: "",
  height: "",
  unit: "cm",
  instructions: "",
};

async function readError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  return data?.error ?? "Something went wrong. Please try again.";
}

export default function CustomizePage() {
  const [step, setStep] = useState<CustomizeStep>("upload");
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [spec, setSpec] = useState<PieceSpec>(DEFAULT_SPEC);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panelKey, setPanelKey] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  function handleFileSelect(file: File | null) {
    setSketchFile(file);
    setUploadedPath(null);
  }

  function resetDraft() {
    setSketchFile(null);
    setUploadedPath(null);
    setSpec(DEFAULT_SPEC);
    setResetKey((k) => k + 1);
  }

  function handleClearDraft() {
    resetDraft();
    setError(null);
  }

  // STEP 1 -> 2: only check the form, then show the Review step.
  // Nothing is sent to the server yet.
  function handleGoToReview() {
    setError(null);

    if (!sketchFile) {
      setError("Please upload your concept sketch.");
      return;
    }
    if (!spec.title.trim()) {
      setError("Please write a title for your request.");
      return;
    }
    if (!(Number(spec.width) > 0) || !(Number(spec.height) > 0)) {
      setError("Width and height must be positive numbers.");
      return;
    }

    setStep("review");
  }

  function handleBackToEdit() {
    setError(null);
    setStep("upload");
  }

  // STEP 2 -> 3: the old "Next Step" logic now lives here.
  async function handleSubmit() {
    if (isSubmitting || !sketchFile) return;
    setError(null);
    setIsSubmitting(true);

    try {
      // Move 1: upload the file (skip if it was already uploaded)
      let img = uploadedPath;

      if (!img) {
        const formData = new FormData();
        formData.append("sketch", sketchFile);

        // No Content-Type header here. The browser adds it with the boundary.
        const uploadRes = await fetch("/api/customized/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error(await readError(uploadRes));

        img = (await uploadRes.json()).path as string;
        setUploadedPath(img);
      }

      // Move 2: save the request and the path in the database
      const createRes = await fetch("/api/customized", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: spec.title,
          img,
          timberVariety: spec.timberVariety,
          width: spec.width,
          height: spec.height,
          unit: spec.unit,
          instructions: spec.instructions,
        }),
      });

      if (!createRes.ok) throw new Error(await readError(createRes));

      setStep("submit");
      setPanelKey((k) => k + 1); // makes RequestsPanel load again
      resetDraft();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-secondary">
      <Navbar />

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
            {step === "upload" && (
              <>
                <UploadSketch
                  key={resetKey}
                  file={sketchFile}
                  onFileSelect={handleFileSelect}
                />
                <PieceSpecifications
                  spec={spec}
                  error={error}
                  isSubmitting={isSubmitting}
                  onChange={setSpec}
                  onClearDraft={handleClearDraft}
                  onNextStep={handleGoToReview}
                />
              </>
            )}

            {step === "review" && (
              <ReviewStep
                spec={spec}
                file={sketchFile}
                error={error}
                isSubmitting={isSubmitting}
                onBack={handleBackToEdit}
                onSubmit={handleSubmit}
              />
            )}

            {step === "submit" && (
              <div className="bg-canvas rounded-2xl p-8 text-center">
                <h3 className="font-serif text-2xl text-primary mb-2">
                  Request sent
                </h3>
                <p className="text-sm text-neutral mb-6">
                  Our artisans will review your sketch and send you a quote. You
                  can follow it in My Requests.
                </p>
                <button
                  type="button"
                  onClick={() => setStep("upload")}
                  className="px-6 py-2.5 rounded-lg bg-primary text-secondary text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Start a new request
                </button>
              </div>
            )}
          </div>

          <RequestsPanel key={panelKey} />
        </section>

        {/* Carousel dots (visual pagination between studio and inspiration) */}
        <div className="flex items-center justify-center gap-2 py-16">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
          <span className="w-6 h-1.5 rounded-full bg-primary" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
