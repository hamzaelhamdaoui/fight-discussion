"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Loader2,
  MessageSquare,
  Swords,
  ChevronLeft,
  Settings,
  Edit3,
} from "lucide-react";
import { useWizardStore } from "@/stores/wizard-store";
import { useTranslations, t as translate } from "@/hooks/use-translations";
import { battleApi } from "@/services/api/battle-api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

export function ReviewStep() {
  const { participants, nextStep, prevStep, setTimeline, timeline, images, setIsProcessing } =
    useWizardStore();
  const t = useTranslations();

  const [isAnalyzing, setIsAnalyzing] = useState(!timeline);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Reconstruct timeline using API
  const reconstructTimeline = useCallback(async () => {
    const extractions = images
      .filter((img) => img.extractionResult)
      .map((img) => img.extractionResult!);

    if (extractions.length === 0) {
      setError(t.errors.noImagesAnalyzed);
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    // Simulate progress while waiting for API
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 300);

    try {
      const reconstructedTimeline = await battleApi.reconstructTimeline({ extractions });
      clearInterval(progressInterval);
      setProgress(100);
      setTimeline(reconstructedTimeline);
      setIsAnalyzing(false);
    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      setIsAnalyzing(false);
      toast({
        title: t.review.reconstructionFailed,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [images, setTimeline, setIsProcessing, t]);

  // Call reconstruct on mount if no timeline exists
  useEffect(() => {
    if (!timeline && !error) {
      reconstructTimeline();
    } else if (timeline) {
      setIsAnalyzing(false);
      setProgress(100);
    }
  }, [timeline, error, reconstructTimeline]);

  const handleRetry = () => {
    setError(null);
    reconstructTimeline();
  };

  // Fallback for display if no timeline yet
  const displayTimeline = timeline;
  const confidencePercent = displayTimeline
    ? Math.round(displayTimeline.overallConfidence * 100)
    : 0;

  return (
    <div className="min-h-screen bg-cinder">
      {/* Main Container - Figma exact design */}
      <div className="relative max-w-[375px] mx-auto bg-cinder border-x border-white/5 shadow-2xl overflow-hidden">

        {/* Header - matches Figma exactly */}
        <div className="flex items-center justify-between px-4 py-6">
          <button
            onClick={prevStep}
            disabled={isAnalyzing}
            className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-white/80" />
          </button>

          {/* Progress indicator - matches Figma */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div
              className="w-8 h-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={{
                background: "linear-gradient(to right, #22d3ee 0%, white 50%, #f97316 100%)"
              }}
            />
          </div>

          <button className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Title Section - matches Figma exactly */}
        <div className="px-6 pb-2">
          <h1 className="text-2xl font-bold text-white tracking-[-0.6px]">{t.review.title}</h1>
          <p className="mt-1 text-sm text-white/50">
            {t.review.subtitle}
          </p>
        </div>

        {/* Content States */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 py-6 space-y-4"
            >
              {/* Error Card - matches Figma */}
              <div className="rounded-2xl bg-cinder-light border border-red-500/30 p-6">
                <div className="flex flex-col items-center text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500" />
                  <h3 className="mt-4 font-semibold text-red-500">{t.review.reconstructionFailed}</h3>
                  <p className="mt-2 text-sm text-white/50 max-w-xs">
                    {error}
                  </p>
                  <button
                    onClick={handleRetry}
                    className="mt-6 px-6 py-3 rounded-xl bg-blue hover:bg-blue-600 text-white font-semibold transition-colors"
                  >
                    {t.review.tryAgain}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : isAnalyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 py-6 space-y-4"
            >
              {/* Loading Card - matches Figma */}
              <div className="rounded-2xl bg-cinder-light border border-white/10 p-6">
                <div className="flex flex-col items-center text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-blue" />
                  <h3 className="mt-4 font-semibold text-white">{t.review.reconstructing}</h3>
                  <p className="mt-1 text-sm text-white/50">
                    {translate(t.review.processingImages, { count: images.length })}
                  </p>
                  <div className="w-full max-w-xs mt-6">
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: "linear-gradient(to right, #22d3ee 0%, #3b82f6 100%)"
                        }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs text-white/40">
                      {progress < 30
                        ? t.review.progressCombining
                        : progress < 60
                        ? t.review.progressOrdering
                        : progress < 90
                        ? t.review.progressAnalyzing
                        : t.review.progressFinalizing}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : displayTimeline ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Confidence Card - matches Figma exactly */}
              <div className="mx-6">
                <div
                  className="rounded-2xl p-4 backdrop-blur-[10px] border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
                  style={{ background: "rgba(20,20,30,0.7)" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-white/40 tracking-[1px] uppercase">
                        Confianza del Análisis
                      </p>
                      <p className="text-xs text-white/70 mt-1">
                        Interpretación IA de emociones
                      </p>
                    </div>
                    {/* Circular progress - matches Figma */}
                    <div className="relative w-14 h-14">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                        <circle
                          cx="28"
                          cy="28"
                          r="22"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="4"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="22"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${confidencePercent * 1.38} 138`}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#f97316" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                        {confidencePercent}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gaps Warning Card - matches Figma exactly */}
              {displayTimeline.gaps.length > 0 && (
                <div className="mx-6">
                  <div className="rounded-xl bg-cinder-light border border-gold/30 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gold tracking-wider uppercase">
                          {t.review.possibleGaps}
                        </p>
                        <p className="mt-1 text-xs text-white/50">
                          {t.review.gapsDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages Section - matches Figma exactly (Chat-like view) */}
              <div
                className="relative mx-4 rounded-t-none overflow-hidden"
                style={{
                  maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)"
                }}
              >
                {/* Date badge */}
                <div className="flex justify-center mb-4 opacity-50">
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5">
                    <span className="text-[10px] text-white/60">
                      Ayer, 10:42 PM
                    </span>
                  </div>
                </div>

                {/* Messages List */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto px-2 pb-24">
                  {displayTimeline.messages.map((message, index) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      participantName={participants[message.speaker].name}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-6 py-6 space-y-4"
            >
              {/* Empty State Card */}
              <div className="rounded-2xl bg-cinder-light border border-white/10 p-6">
                <div className="flex flex-col items-center text-center">
                  <MessageSquare className="h-12 w-12 text-white/40" />
                  <h3 className="mt-4 font-semibold text-white">{t.review.noMessagesFound}</h3>
                  <p className="mt-2 text-sm text-white/50">
                    {t.review.noMessagesDescription}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation - Fixed with gradient fade */}
        <div
          className="fixed bottom-0 left-0 right-0 max-w-[375px] mx-auto px-6 pb-6 pt-4"
          style={{
            background: "linear-gradient(to top, #0a0a0f 0%, rgba(10,10,15,0.95) 50%, transparent 100%)"
          }}
        >
          {/* Edit log button */}
          <div className="flex items-center justify-between mb-4 px-1">
            <button className="flex items-center gap-1 text-white/50 hover:text-white/70 transition-colors">
              <Edit3 className="w-4 h-4" />
              <span className="text-xs">Editar Log</span>
            </button>
            {/* Participant avatars */}
            <div className="flex items-center -space-x-2">
              <div className="w-6 h-6 rounded-full bg-cyan/20 border border-cinder" />
              <div className="w-6 h-6 rounded-full bg-orange/20 border border-cinder" />
              <div className="w-6 h-6 rounded-full bg-white/10 border border-cinder flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">+2</span>
              </div>
            </div>
          </div>

          {/* Start Battle Button - matches Figma exactly */}
          <button
            disabled={isAnalyzing || !displayTimeline}
            onClick={nextStep}
            className={cn(
              "w-full h-14 rounded-xl relative overflow-hidden flex items-center justify-center gap-3 transition-all",
              !isAnalyzing && displayTimeline
                ? "bg-black border border-white/20 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5)]"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            )}
          >
            {/* Gradient glow effects */}
            {!isAnalyzing && displayTimeline && (
              <>
                <div
                  className="absolute left-0 top-0 bottom-0 w-1/2 opacity-60 blur-[5px]"
                  style={{
                    background: "linear-gradient(to right, rgba(34,211,238,0.4) 0%, transparent 100%)"
                  }}
                />
                <div
                  className="absolute right-0 top-0 bottom-0 w-1/2 opacity-60 blur-[5px]"
                  style={{
                    background: "linear-gradient(to left, rgba(249,115,22,0.4) 0%, transparent 100%)"
                  }}
                />
              </>
            )}

            <Swords className="w-6 h-6 text-white relative z-10" />
            <span
              className="text-lg font-bold tracking-[0.9px] uppercase relative z-10"
              style={{
                background: !isAnalyzing && displayTimeline
                  ? "linear-gradient(to right, white 0%, white 50%, rgba(255,255,255,0.7) 100%)"
                  : "none",
                WebkitBackgroundClip: !isAnalyzing && displayTimeline ? "text" : undefined,
                WebkitTextFillColor: !isAnalyzing && displayTimeline ? "transparent" : undefined,
                color: isAnalyzing || !displayTimeline ? "rgba(255,255,255,0.4)" : undefined,
              }}
            >
              ¡Iniciar Batalla!
            </span>
            <Swords className="w-6 h-6 text-white relative z-10 -scale-x-100" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  participantName,
  index,
}: {
  message: Message;
  participantName: string;
  index: number;
}) {
  const isA = message.speaker === "A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn("flex flex-col gap-1", isA ? "items-start" : "items-end")}
    >
      {/* Speaker Label - matches Figma exactly */}
      <div className={cn(
        "flex items-center gap-2 mb-1",
        !isA && "flex-row-reverse"
      )}>
        {/* Avatar with border glow */}
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center border bg-cover bg-center",
            isA
              ? "border-cyan shadow-[0_0_10px_rgba(34,211,238,0.4)]"
              : "border-orange shadow-[0_0_10px_rgba(249,115,22,0.4)]"
          )}
        >
          <span className={cn(
            "text-[10px] font-bold",
            isA ? "text-cyan" : "text-orange"
          )}>
            {participantName.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className={cn(
          "text-[10px] font-bold tracking-[0.25px] uppercase",
          isA ? "text-cyan" : "text-orange"
        )}>
          {participantName}
        </span>
      </div>

      {/* Message Bubble - matches Figma exactly with gradient background */}
      <div
        className={cn(
          "max-w-[290px] px-4 py-4 backdrop-blur-sm shadow-[0_0_15px] rounded-2xl",
          isA
            ? "rounded-tl-sm border border-cyan/30 shadow-cyan/10"
            : "rounded-tr-sm border border-orange/30 shadow-orange/10"
        )}
        style={{
          background: isA
            ? "linear-gradient(134deg, rgba(34,211,238,0.15) 0%, rgba(14,116,144,0.25) 100%)"
            : "linear-gradient(134deg, rgba(249,115,22,0.15) 0%, rgba(194,65,12,0.25) 100%)",
          boxShadow: isA
            ? "0 0 15px rgba(34,211,238,0.1), inset 0 0 10px rgba(34,211,238,0.05)"
            : "0 0 15px rgba(249,115,22,0.1), inset 0 0 10px rgba(249,115,22,0.05)"
        }}
      >
        <p className="text-sm text-white/90 leading-[19.25px]">{message.text}</p>
      </div>

      {/* Timestamp */}
      {message.timestamp && (
        <div className={cn(
          "flex items-center gap-2 mt-1",
          !isA && "flex-row-reverse"
        )}>
          <span className="text-[9px] text-white/30">
            {message.timestamp}
          </span>
        </div>
      )}
    </motion.div>
  );
}
