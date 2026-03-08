"use client";

import Link from "next/link";
import { Swords, ChevronLeft, User } from "lucide-react";
import { useWizardStore } from "@/stores/wizard-store";
import { useTranslations } from "@/hooks/use-translations";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function WizardHeader() {
  const { reset, currentStep, prevStep } = useWizardStore();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const t = useTranslations();

  const handleReset = () => {
    reset();
    setShowResetDialog(false);
  };

  const canGoBack = currentStep !== "upload";

  return (
    <header className="sticky top-0 z-40 bg-cinder/90 backdrop-blur-md border-b border-white/5">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        {/* Back Button */}
        <button
          onClick={canGoBack ? prevStep : undefined}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-full transition-all",
            canGoBack
              ? "hover:bg-white/10 text-white"
              : "text-white/20 cursor-default"
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold font-space-grotesk"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan/20 to-cyan/5 border border-cyan/30 flex items-center justify-center">
            <Swords className="h-4 w-4 text-cyan" />
          </div>
          <span className="text-white">FightReplay</span>
        </Link>

        {/* User Button */}
        <Link
          href="/auth"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <User className="w-5 h-5 text-white/60" />
        </Link>
      </div>

      {/* Reset Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-cinder-light border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white font-space-grotesk">{t.wizard.header.startOver}</h3>
            <p className="mt-2 text-sm text-white/50 font-inter">
              {t.wizard.header.startOverDescription}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowResetDialog(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors font-space-grotesk"
              >
                {t.wizard.header.cancel}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors font-space-grotesk"
              >
                {t.wizard.header.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
