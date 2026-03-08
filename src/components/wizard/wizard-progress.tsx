"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { WizardStep } from "@/types";

export function WizardProgress() {
  const { currentStep } = useWizardStore();

  // Simplified 3-step progress
  const steps: { key: WizardStep; label: string }[] = [
    { key: "upload", label: "SUBIR" },
    { key: "participants", label: "PROCESAR" },
    { key: "review", label: "REVISAR" },
  ];

  // Map current step to simplified index
  const getStepIndex = (step: WizardStep) => {
    if (step === "upload") return 0;
    if (step === "participants") return 1;
    if (step === "review" || step === "battle" || step === "results") return 2;
    return 0;
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="bg-cinder px-4 py-3">
      <div className="mx-auto max-w-lg">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-3">
          {steps.map((step, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <motion.div
                key={step.key}
                className={cn(
                  "flex-1 h-1.5 rounded-full overflow-hidden",
                  !isActive && "bg-white/10"
                )}
                initial={false}
              >
                {isActive && (
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      isCurrent
                        ? "bg-gradient-to-r from-cyan via-cyan to-cyan/60"
                        : "bg-cyan"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <span
                key={step.key}
                className={cn(
                  "text-[10px] font-semibold tracking-wider uppercase font-inter transition-colors",
                  isActive
                    ? "text-cyan"
                    : isCompleted
                      ? "text-cyan/50"
                      : "text-white/30"
                )}
              >
                {step.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
