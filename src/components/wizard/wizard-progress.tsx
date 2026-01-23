"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { WizardStep } from "@/types";

const steps: { key: WizardStep; label: string; shortLabel: string }[] = [
  { key: "upload", label: "Upload", shortLabel: "1" },
  { key: "participants", label: "Names", shortLabel: "2" },
  { key: "review", label: "Review", shortLabel: "3" },
  { key: "battle", label: "Battle", shortLabel: "4" },
  { key: "results", label: "Results", shortLabel: "5" },
];

export function WizardProgress() {
  const { currentStep } = useWizardStore();
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="border-b bg-muted/30 px-4 py-3">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                      isActive &&
                        "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
                      isCompleted && "bg-primary/80 text-primary-foreground",
                      !isActive &&
                        !isCompleted &&
                        "bg-muted text-muted-foreground"
                    )}
                    initial={false}
                    animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isCompleted ? (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="sm:hidden">{step.shortLabel}</span>
                    )}
                    <span className="hidden sm:inline">{step.shortLabel}</span>
                  </motion.div>
                  <span
                    className={cn(
                      "mt-1 text-[10px] font-medium sm:text-xs",
                      isActive && "text-primary",
                      !isActive && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="mx-1 h-0.5 w-4 sm:mx-2 sm:w-8">
                    <div
                      className={cn(
                        "h-full rounded-full transition-colors",
                        index < currentIndex
                          ? "bg-primary/80"
                          : "bg-muted-foreground/20"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
