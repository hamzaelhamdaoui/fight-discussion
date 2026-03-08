"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Share2,
  Copy,
  Check,
  ChevronDown,
  Lightbulb,
  Swords,
  Target,
  Loader2,
  Save,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { toPng } from "html-to-image";
import { useWizardStore } from "@/stores/wizard-store";
import { useBattleStore } from "@/stores/battle-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslations } from "@/hooks/use-translations";
import { persistenceService } from "@/services/supabase/persistence";
import { cn } from "@/lib/utils";
import type { AnalysisResult, Speaker } from "@/types";
import { toast } from "@/hooks/use-toast";

// Mock analysis for demo
const mockAnalysis: AnalysisResult = {
  winner: "B",
  winnerReason:
    "Persona B mantuvo la compostura y aportó evidencia concreta para apoyar su posición, resolviendo el conflicto de manera constructiva.",
  criteria: [
    {
      name: "Claridad de argumentos",
      scoreA: 6,
      scoreB: 8,
      explanation:
        "B comunicó sus intenciones claramente una vez tuvo oportunidad, mientras A saltó a conclusiones.",
    },
    {
      name: "Control emocional",
      scoreA: 5,
      scoreB: 7,
      explanation:
        "B se mantuvo calmado bajo acusación, A mostró signos de pánico y frustración.",
    },
    {
      name: "Uso de evidencia",
      scoreA: 3,
      scoreB: 9,
      explanation:
        "B proporcionó pruebas concretas (confirmación de reserva), A se basó en suposiciones.",
    },
    {
      name: "Enfoque en resolución",
      scoreA: 6,
      scoreB: 8,
      explanation:
        "Ambos trabajaron hacia la resolución, pero B ofreció activamente un resultado positivo.",
    },
    {
      name: "Tono respetuoso",
      scoreA: 5,
      scoreB: 7,
      explanation:
        "A usó lenguaje acusatorio inicialmente, B mantuvo el respeto durante toda la conversación.",
    },
  ],
  recommendations: [
    "Has mantenido una postura lógica y válida. En el próximo round, intenta no responder de inmediato para aumentar tu control emocional.",
  ],
  keyMoments: [
    {
      messageId: "4",
      description: "B proporciona evidencia con confirmación de reserva",
      impact: "positive",
    },
    {
      messageId: "1",
      description: "A abre con acusación sin verificación",
      impact: "negative",
    },
    {
      messageId: "8",
      description: "Ambos llegan a un acuerdo y resultado positivo",
      impact: "positive",
    },
  ],
};

export function ResultsStep() {
  const { participants, battleResult, analysisResult, timeline, reset } = useWizardStore();
  const { hpA, hpB } = useBattleStore();
  const { user, isGuest } = useAuthStore();
  const t = useTranslations();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedBattleId, setSavedBattleId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [_isCreatingLink, setIsCreatingLink] = useState(false);

  const analysis = analysisResult || mockAnalysis;
  const winner = analysis.winner;
  const winnerName = winner ? participants[winner].name : t.results.draw;

  // Auto-save battle for logged in users
  useEffect(() => {
    if (user && !isGuest && battleResult && analysisResult && timeline && !savedBattleId) {
      handleSaveBattle();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isGuest, battleResult, analysisResult, timeline]);

  const handleSaveBattle = async () => {
    if (!battleResult || !analysisResult || !timeline) return;
    if (isSaving || savedBattleId) return;

    setIsSaving(true);
    try {
      const { battleId } = await persistenceService.saveBattle({
        userId: user?.id,
        participantAName: participants.A.name,
        participantBName: participants.B.name,
        timeline,
        battleResult,
        analysisResult,
      });
      setSavedBattleId(battleId);
      toast({
        title: t.results.battleSaved,
        description: t.results.savedToHistory,
      });
    } catch (err) {
      console.error("Save battle error:", err);
      if (user && !isGuest) {
        toast({
          title: t.results.saveFailed,
          description: t.results.couldNotSave,
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const _handleCreateShareLink = async () => {
    if (!savedBattleId && user) {
      await handleSaveBattle();
    }

    if (!savedBattleId) {
      toast({
        title: t.results.loginRequired,
        description: t.results.signInForLinks,
        variant: "destructive",
      });
      return;
    }

    setIsCreatingLink(true);
    try {
      const { shareUrl } = await persistenceService.createShareLink(
        savedBattleId,
        user?.id
      );
      setShareLink(shareUrl);
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: t.results.shareLinkCreated,
        description: t.results.linkCopiedToClipboard,
      });
    } catch (err) {
      console.error("Create share link error:", err);
      toast({
        title: t.results.failedToCreateLink,
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleDownload = async () => {
    if (!shareCardRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#0a0a0f",
      });

      const link = document.createElement("a");
      link.download = `fight-replay-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: t.results.downloaded,
        description: t.results.shareCardSaved,
      });
    } catch (err) {
      console.error("Download error:", err);
      toast({
        title: t.results.downloadFailed,
        description: t.results.couldNotGenerate,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `${winnerName} ${t.results.winner.toLowerCase()} - FightReplay! ${
      winner === "A" ? hpA : hpB
    } HP.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "FightReplay",
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: t.results.linkCopied,
      description: t.results.linkCopiedToClipboard,
    });
  };

  return (
    <div className="min-h-screen bg-cinder">
      {/* Main Container - Figma exact design */}
      <div className="relative max-w-[375px] mx-auto bg-gradient-to-b from-cinder to-cinder-light border-x border-white/5 shadow-2xl overflow-hidden">

        {/* Header - matches Figma exactly */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <button className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-white/60" />
          </button>
          <span className="text-[10px] font-bold text-white/40 tracking-[2px] uppercase">
            Resultado Final
          </span>
          <div className="w-10 h-10" /> {/* Spacer for alignment */}
        </div>

        {/* Victory Section - Share Card (for download) */}
        <div
          ref={shareCardRef}
          className="relative px-6 py-8"
        >
          {/* Gradient overlays for glow effect */}
          <div className="absolute top-0 left-0 w-full h-[520px] opacity-40" style={{
            background: "radial-gradient(circle at 50% 30%, rgba(34,211,238,0.2) 0%, transparent 70%)"
          }} />
          <div className="absolute bottom-0 right-0 w-full h-[260px] opacity-30" style={{
            background: "radial-gradient(circle at 50% 70%, rgba(249,115,22,0.1) 0%, transparent 70%)"
          }} />

          {/* Decorative sparkles - matches Figma */}
          <div className="absolute top-[156px] left-[56px] w-1 h-1 rounded-full bg-cyan opacity-80 shadow-[0_0_6px_#22d3ee]" />
          <div className="absolute top-[273px] right-[58px] w-0.5 h-0.5 rounded-full bg-white opacity-80 shadow-[0_0_4px_#a5f3fc]" />
          <div className="absolute top-[117px] right-[112px] w-[3px] h-[3px] rounded-full bg-cyan opacity-80 shadow-[0_0_5px_#0e7490]" />

          {/* Winner Banner - matches Figma exactly */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative text-center pt-4"
          >
            {/* Victory Text with glow - Figma exact */}
            <div className="relative mb-8">
              <div className="absolute inset-0 blur-[20px] bg-gold/20 rounded-full" />
              <h1
                className="relative text-[59px] font-bold tracking-[-3px] leading-[60px] -rotate-2"
                style={{
                  background: "linear-gradient(to bottom, #fef9c3 0%, #facc15 50%, #c2410c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ¡VICTORIA!
              </h1>
            </div>

            {/* Winner Avatar - matches Figma exactly */}
            <div className="relative mx-auto mb-4">
              {/* Glow effect */}
              <div className="absolute inset-0 blur-[12px] bg-cyan/20 rounded-full" />

              {/* Avatar with border */}
              <div className={cn(
                "relative w-40 h-40 mx-auto rounded-full border-4 flex items-center justify-center",
                winner === "A"
                  ? "border-gold shadow-[0_0_30px_rgba(250,204,21,0.4)]"
                  : "border-gold shadow-[0_0_30px_rgba(250,204,21,0.4)]"
              )}>
                <div className="w-full h-full rounded-full bg-gradient-to-br from-cinder-light to-cinder flex items-center justify-center">
                  <span className="text-5xl font-bold text-gold-bright">
                    {(winner ? participants[winner].name : "").charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Winner Name - below avatar */}
              <h2 className="mt-4 text-[30px] font-bold text-white tracking-[0.75px] uppercase">
                {winnerName}
              </h2>

              {/* XP Badge - matches Figma */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <Sparkles className="w-3.5 h-3.5 text-gold/80" />
                <span className="text-xs font-bold text-gold/80 tracking-[1.2px]">+450 XP</span>
              </div>

              {/* Ganadora Badge - matches Figma exactly */}
              <div className="inline-flex mt-3 px-7 py-2.5 rounded-full border border-gold-bright shadow-lg"
                style={{
                  background: "linear-gradient(to right, #a16207 0%, #eab308 50%, #a16207 100%)"
                }}
              >
                <span className="text-[13px] font-bold text-black tracking-[1.32px] uppercase">
                  Ganadora
                </span>
              </div>
            </div>

            {/* Loser Section - smaller, greyed out */}
            <div className="mt-8 opacity-70">
              <div className="relative mx-auto w-14 h-14 rounded-full border border-orange/50 overflow-hidden shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <div className="absolute inset-0 bg-black/40" />
                <div className="w-full h-full rounded-full bg-gradient-to-br from-cinder-light to-cinder flex items-center justify-center">
                  <span className="text-lg font-bold text-white/40">
                    {(winner === "A" ? participants.B.name : participants.A.name).charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs font-bold text-white/40 uppercase tracking-wide line-through">
                {winner === "A" ? participants.B.name : participants.A.name}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section with gradient fade - matches Figma */}
        <div
          className="px-6 pb-10 pt-6 space-y-4"
          style={{
            background: "linear-gradient(to top, #000 0%, rgba(0,0,0,0.8) 50%, transparent 100%)"
          }}
        >

          {/* Primary CTA Button - Ver análisis completo - matches Figma */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full py-4 rounded-xl relative overflow-hidden opacity-90"
            style={{
              background: "#0f1525",
              border: "1px solid rgba(251,191,36,0.6)",
              boxShadow: "0 0 25px rgba(59,130,246,0.4), inset 0 0 10px rgba(251,191,36,0.2)"
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <Swords className="w-6 h-6 text-gold/90" />
              <span className="text-sm font-bold text-[#fefce8] tracking-[1.4px] uppercase">
                Ver análisis completo
              </span>
              <ChevronDown className={cn(
                "w-5 h-5 text-gold/90 transition-transform",
                showDetails && "rotate-180"
              )} />
            </div>
          </button>

          {/* Battle ID - matches Figma */}
          <p className="text-center text-[10px] text-white/20 font-inter">
            ID DE BATALLA: #{savedBattleId?.slice(0, 4).toUpperCase() || "XXXX"}-{savedBattleId?.slice(-4).toUpperCase() || "XXXX"}
          </p>
        </div>

        {/* Expanded Analysis Section */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="px-4 pb-6 space-y-4"
          >
            {/* Fighter Stats Cards - Side by side like Figma */}
            <div className="flex gap-3">
              {/* Fighter A Stats */}
              <div className="flex-1 rounded-2xl p-4 backdrop-blur-lg border-t-2 border-cyan shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
                style={{ background: "rgba(20,20,30,0.6)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-cyan/20 border border-cyan flex items-center justify-center">
                    <Swords className="w-3 h-3 text-cyan" />
                  </div>
                  <span className="text-xs font-bold text-cyan tracking-[0.6px] uppercase">Hielo</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wide">Ataques</p>
                    <p className="text-xl font-bold text-white">{battleResult?.stats.totalAttacksA || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wide">Daño Total</p>
                    <p className="text-xl font-bold text-cyan">{battleResult?.stats.totalDamageDealtA || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wide">Precisión</p>
                    <p className="text-xl font-bold text-white">92%</p>
                  </div>
                </div>
              </div>

              {/* Fighter B Stats */}
              <div className="flex-1 rounded-2xl p-4 backdrop-blur-lg border-t-2 border-orange shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
                style={{ background: "rgba(20,20,30,0.6)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-orange/20 border border-orange flex items-center justify-center">
                    <Target className="w-3 h-3 text-orange" />
                  </div>
                  <span className="text-xs font-bold text-orange tracking-[0.6px] uppercase">Fuego</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wide">Ataques</p>
                    <p className="text-xl font-bold text-white">{battleResult?.stats.totalAttacksB || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wide">Daño Total</p>
                    <p className="text-xl font-bold text-orange">{battleResult?.stats.totalDamageDealtB || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wide">Precisión</p>
                    <p className="text-xl font-bold text-white">65%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Card - matches Figma exactly */}
            <div className="rounded-2xl p-5 backdrop-blur-lg border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
              style={{ background: "rgba(20,20,30,0.6)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold text-white tracking-[0.7px] uppercase">Análisis de Batalla</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/60">Detallado</span>
              </div>

              {/* Criteria Bars */}
              <div className="space-y-5">
                {analysis.criteria.slice(0, 2).map((criterion) => {
                  const totalScore = criterion.scoreA + criterion.scoreB;
                  const percentA = totalScore > 0 ? Math.round((criterion.scoreA / totalScore) * 100) : 50;
                  const percentB = 100 - percentA;

                  return (
                    <div key={criterion.name} className="space-y-2">
                      <p className="text-xs text-white/70">{criterion.name}</p>
                      <div className="h-2 rounded-full bg-black/40 flex overflow-hidden">
                        <div
                          className="h-full bg-cyan shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                          style={{ width: `${percentA}%` }}
                        />
                        <div className="w-px bg-white" />
                        <div
                          className="h-full bg-orange shadow-[0_0_10px_rgba(249,115,22,0.6)]"
                          style={{ width: `${percentB}%` }}
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] font-bold text-cyan">
                          {percentA}% ({participants.A.name})
                        </span>
                        <span className="text-[10px] font-bold text-orange">
                          {percentB}% ({participants.B.name})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Text */}
              <div className="mt-5 pt-5 border-t border-white/5">
                <p className="text-xs text-white/60 leading-[19.5px]">
                  {analysis.winnerReason}
                </p>
              </div>
            </div>

            {/* Recommendations Card */}
            <div className="rounded-xl bg-cinder-light border border-gold/30 p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gold tracking-wider uppercase mb-2">
                    RECOMENDACIONES
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {analysis.recommendations[0]}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Action Buttons - Fixed at bottom with gradient */}
        <div
          className="sticky bottom-0 px-5 py-5 space-y-4"
          style={{
            background: "linear-gradient(to top, #0a0a0f 0%, rgba(10,10,15,0.95) 50%, transparent 100%)"
          }}
        >
          {/* Save for guests prompt */}
          {isGuest && (
            <div className="rounded-xl bg-cinder-light border border-white/10 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Save className="w-5 h-5 text-white/60" />
                  <div>
                    <p className="text-sm font-medium text-white">¿Quieres guardar tus batallas?</p>
                    <p className="text-xs text-white/40">Crea una cuenta en tu historial</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-green-500/20 text-[10px] font-bold text-green-500 tracking-wider">
                  GRATIS
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons - matches Figma exactly */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              {isDownloading ? (
                <Loader2 className="w-6 h-6 animate-spin text-white/90" />
              ) : (
                <Download className="w-6 h-6 text-white/90" />
              )}
              <span className="text-sm font-bold text-white/90">Guardar</span>
            </button>
            <button
              onClick={handleShare}
              className="flex-1 h-12 rounded-xl bg-blue shadow-[0_10px_15px_-3px_rgba(59,131,247,0.2)] flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-6 h-6 text-white" />
                  <span className="text-sm font-bold text-white">Copiado</span>
                </>
              ) : (
                <>
                  <Share2 className="w-6 h-6 text-white" />
                  <span className="text-sm font-bold text-white">Compartir</span>
                </>
              )}
            </button>
          </div>

          {/* Analyze Another Button */}
          <button
            onClick={reset}
            className="w-full py-4 rounded-xl border-2 border-gold text-gold font-semibold tracking-wide uppercase text-sm hover:bg-gold/10 transition-colors"
          >
            Analizar otra conversación
          </button>

          {/* Create Share Link */}
          {shareLink && (
            <div className="rounded-xl bg-cinder-light border border-white/10 p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-white/60 truncate outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    toast({ title: t.results.copied, description: t.results.linkCopiedToClipboard });
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Copy className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function _FighterResult({
  speaker,
  name,
  hp,
  isWinner,
}: {
  speaker: Speaker;
  name: string;
  hp: number;
  isWinner: boolean;
}) {
  const isCyan = speaker === "A";

  return (
    <div className="flex flex-col items-center">
      {/* Avatar with badge */}
      <div className="relative">
        <div
          className={cn(
            "w-12 h-12 rounded-full border-2 flex items-center justify-center",
            isCyan
              ? "border-cyan bg-cyan/10 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
              : "border-orange bg-orange/10 shadow-[0_0_10px_rgba(249,115,22,0.4)]",
            isWinner && "border-gold shadow-[0_0_15px_rgba(250,204,21,0.5)]"
          )}
        >
          <span className={cn(
            "text-lg font-bold",
            isCyan ? "text-cyan" : "text-orange",
            isWinner && "text-gold"
          )}>
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        {/* Speaker badge */}
        <div className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider",
          isCyan
            ? "bg-cyan text-black"
            : "bg-orange text-white"
        )}>
          {isCyan ? "A" : "B"}
        </div>
      </div>

      {/* HP Display */}
      <p className={cn(
        "mt-3 text-lg font-bold",
        hp > 50 ? "text-green-500" : hp > 25 ? "text-amber-500" : "text-red-500"
      )}>
        {Math.round(hp)} HP
      </p>
    </div>
  );
}
