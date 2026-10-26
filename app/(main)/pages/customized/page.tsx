"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
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

// ---------------- Animation Variants ----------------
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const stepTransition: Variants = {
  hidden: { opacity: 0, x: -15, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: 15,
    scale: 0.98,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

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

  async function handleSubmit() {
    if (isSubmitting || !sketchFile) return;
    setError(null);
    setIsSubmitting(true);

    try {
      let img = uploadedPath;

      if (!img) {
        const formData = new FormData();
        formData.append("sketch", sketchFile);

        const uploadRes = await fetch("/api/customized/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error(await readError(uploadRes));

        img = (await uploadRes.json()).path as string;
        setUploadedPath(img);
      }

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
      setPanelKey((k) => k + 1);
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
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="max-w-5xl mx-auto px-6 pt-14 pb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
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
        </motion.section>

        {/* Step progress */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="max-w-5xl mx-auto px-6 pb-10"
        >
          <StepProgress currentStep={step} />
        </motion.section>

        {/* Main workspace */}
        <section className="max-w-5xl mx-auto px-6 grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {step === "upload" && (
                <motion.div
                  key="upload-step"
                  variants={stepTransition}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col gap-6"
                >
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
                </motion.div>
              )}

              {step === "review" && (
                <motion.div
                  key="review-step"
                  variants={stepTransition}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <ReviewStep
                    spec={spec}
                    file={sketchFile}
                    error={error}
                    isSubmitting={isSubmitting}
                    onBack={handleBackToEdit}
                    onSubmit={handleSubmit}
                  />
                </motion.div>
              )}

              {step === "submit" && (
                <motion.div
                  key="submit-step"
                  variants={stepTransition}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-canvas rounded-2xl p-8 text-center shadow-sm"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  >
                    <h3 className="font-serif text-2xl text-primary mb-2">
                      Request sent
                    </h3>
                    <p className="text-sm text-neutral mb-6">
                      Our artisans will review your sketch and send you a quote.
                      You can follow it in My Requests.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep("upload")}
                      className="px-6 py-2.5 rounded-lg bg-primary text-secondary text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Start a new request
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Requests Side Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <RequestsPanel key={panelKey} />
          </motion.div>
        </section>

        {/* Carousel dots */}
        <div className="flex items-center justify-center gap-2 py-16">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
          <motion.span
            layoutId="activeDot"
            className="w-6 h-1.5 rounded-full bg-primary"
          />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
