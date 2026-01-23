"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { UploadStep } from "./steps/upload-step";
import { ParticipantsStep } from "./steps/participants-step";
import { ReviewStep } from "./steps/review-step";
import { BattleStep } from "./steps/battle-step";
import { ResultsStep } from "./steps/results-step";
import { WizardHeader } from "./wizard-header";
import { WizardProgress } from "./wizard-progress";
import { motion, AnimatePresence } from "framer-motion";

const stepComponents = {
  upload: UploadStep,
  participants: ParticipantsStep,
  review: ReviewStep,
  battle: BattleStep,
  results: ResultsStep,
};

export function BattleWizard() {
  const { currentStep } = useWizardStore();
  const StepComponent = stepComponents[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <WizardHeader />
      <WizardProgress />

      <main className="px-4 pb-8 pt-4">
        <div className="mx-auto max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
