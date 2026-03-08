"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Swords, Lightbulb } from "lucide-react";
import { useWizardStore } from "@/stores/wizard-store";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";

export function ParticipantsStep() {
  const { participants, setParticipantName, nextStep, prevStep } = useWizardStore();
  const t = useTranslations();

  const canProceed = participants.A.name.trim().length > 0 && participants.B.name.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white font-space-grotesk">{t.participants.title}</h1>
        <p className="mt-2 text-sm text-white/60 font-inter">
          {t.participants.subtitle}
        </p>
      </div>

      {/* VS Indicator */}
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan/30 to-cyan/10" />
        <div className="w-10 h-10 rounded-full bg-cinder-light border border-white/10 flex items-center justify-center">
          <span className="text-xs font-bold text-white/60">VS</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-orange/30 to-orange/10" />
      </div>

      {/* Fighter A Card - Cyan theme */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        <label className="text-xs text-cyan/80 font-semibold tracking-wider uppercase font-inter">
          Persona A (izquierda)
        </label>
        <div className="rounded-2xl bg-gradient-to-br from-cinder-light to-cinder border border-cyan/20 p-4 relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-cyan/10 blur-2xl rounded-full -translate-x-1/2 -translate-y-1/2" />

          <div className="relative flex items-center gap-4">
            {/* Avatar A - Cyan */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan/20 to-cyan/5 border-2 border-cyan flex items-center justify-center shadow-lg shadow-cyan/20">
              <span className="text-xl font-bold text-cyan font-space-grotesk">
                {participants.A.name ? participants.A.name.charAt(0).toUpperCase() : "A"}
              </span>
            </div>

            {/* Input */}
            <input
              type="text"
              placeholder={t.participants.fighterA.placeholder}
              value={participants.A.name}
              onChange={(e) => setParticipantName("A", e.target.value)}
              maxLength={30}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-base font-medium font-space-grotesk focus:ring-0"
            />
          </div>
        </div>
      </motion.div>

      {/* Fighter B Card - Orange theme */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <label className="text-xs text-orange/80 font-semibold tracking-wider uppercase font-inter text-right block">
          Persona B (derecha)
        </label>
        <div className="rounded-2xl bg-gradient-to-br from-cinder-light to-cinder border border-orange/20 p-4 relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />

          <div className="relative flex items-center gap-4">
            {/* Avatar B - Orange */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange/20 to-orange/5 border-2 border-orange flex items-center justify-center shadow-lg shadow-orange/20">
              <span className="text-xl font-bold text-orange font-space-grotesk">
                {participants.B.name ? participants.B.name.charAt(0).toUpperCase() : "B"}
              </span>
            </div>

            {/* Input */}
            <input
              type="text"
              placeholder={t.participants.fighterB.placeholder}
              value={participants.B.name}
              onChange={(e) => setParticipantName("B", e.target.value)}
              maxLength={30}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-base font-medium font-space-grotesk focus:ring-0"
            />
          </div>
        </div>
      </motion.div>

      {/* Tip Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-cinder-light border border-gold/20 p-4"
      >
        <div className="flex gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-gold" />
          </div>

          {/* Content */}
          <div>
            <p className="text-sm font-semibold text-gold font-space-grotesk">Consejo</p>
            <p className="mt-1 text-xs text-white/50 leading-relaxed font-inter">
              Asigna los nombres basándote en la posición de cada persona en la conversación.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        {/* Back Button */}
        <button
          onClick={prevStep}
          className="flex-1 py-4 rounded-xl bg-cinder-light border border-white/10 text-white font-medium flex items-center justify-center gap-2 hover:bg-cinder-medium hover:border-white/20 transition-all font-space-grotesk"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.participants.back}
        </button>

        {/* Continue Button */}
        <button
          disabled={!canProceed}
          onClick={nextStep}
          className={cn(
            "flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all font-space-grotesk",
            canProceed
              ? "bg-blue hover:bg-blue/90 text-white shadow-lg shadow-blue/30"
              : "bg-white/10 text-white/40 cursor-not-allowed"
          )}
        >
          {t.participants.analyzeChat}
          <Swords className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
