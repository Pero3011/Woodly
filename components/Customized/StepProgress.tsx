import { Upload, PenLine, Eye, CheckCircle2 } from "lucide-react";

export type CustomizeStep = "upload" | "details" | "review" | "submit";

interface StepProgressProps {
  currentStep: CustomizeStep;
}

const STEPS: { id: CustomizeStep; label: string; icon: typeof Upload }[] = [
  { id: "upload", label: "Upload", icon: Upload },
  { id: "details", label: "Details", icon: PenLine },
  { id: "review", label: "Review", icon: Eye },
  { id: "submit", label: "Submit", icon: CheckCircle2 },
];

export default function StepProgress({ currentStep }: StepProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isActive = index === currentIndex;
        const Icon = step.icon;

        return (
          <div
            key={step.id}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center border transition-colors ${
                  isActive || isComplete
                    ? "bg-primary text-secondary border-primary"
                    : "bg-transparent text-neutral border-neutral/40"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-primary" : "text-neutral"
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-3 mb-6 ${
                  isComplete ? "bg-primary" : "bg-primary/15"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
