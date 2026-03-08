"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, RotateCcw, Loader2, AlertTriangle, Settings, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/stores/wizard-store";
import { useBattleStore } from "@/stores/battle-store";
import { useTranslations, t as translate } from "@/hooks/use-translations";
import { battleApi } from "@/services/api/battle-api";
import { toast } from "@/hooks/use-toast";
import { cn, getInitials } from "@/lib/utils";

export function BattleStep() {
  const { participants, nextStep, setBattleResult, setAnalysisResult, battleResult, timeline, setIsProcessing } =
    useWizardStore();
  const t = useTranslations();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const {
    isPlaying,
    currentAttackIndex,
    hpA,
    hpB,
    maxHp,
    lastAttack,
    isAnimatingDamage,
    damagedFighter,
    playbackSpeed,
    setIsPlaying,
    nextAttack,
    dealDamage,
    setLastAttack,
    setIsAnimatingDamage,
    setPlaybackSpeed,
    reset: resetBattle,
    initBattle,
  } = useBattleStore();

  const attacks = useMemo(() => battleResult?.attacks || [], [battleResult]);
  const isComplete = attacks.length > 0 && currentAttackIndex >= attacks.length;

  // Generate battle on mount if not exists
  const generateBattle = useCallback(async () => {
    if (!timeline) {
      setError(t.errors.noTimelineAvailable);
      return;
    }

    setIsGenerating(true);
    setIsProcessing(true);
    setGenerateProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setGenerateProgress((prev) => Math.min(prev + 8, 90));
    }, 200);

    try {
      const { battleResult: result, analysisResult } = await battleApi.generateBattle({
        timeline,
        participantNames: {
          A: participants.A.name,
          B: participants.B.name,
        },
      });

      clearInterval(progressInterval);
      setGenerateProgress(100);
      setBattleResult(result);
      setAnalysisResult(analysisResult);
      initBattle(100);
      setIsGenerating(false);
    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      setIsGenerating(false);
      toast({
        title: t.battle.generationFailed,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [timeline, participants, setBattleResult, setAnalysisResult, initBattle, setIsProcessing, t]);

  useEffect(() => {
    if (!battleResult && !isGenerating && !error) {
      generateBattle();
    } else if (battleResult) {
      initBattle(100);
    }
  }, [battleResult, isGenerating, error, generateBattle, initBattle]);

  // Battle loop
  useEffect(() => {
    if (!isPlaying || isComplete || isAnimatingDamage) return;

    const baseDelay = 2000 / playbackSpeed;
    const timer = setTimeout(() => {
      const attackIndex = currentAttackIndex + 1;
      if (attackIndex < attacks.length) {
        const attack = attacks[attackIndex];
        setLastAttack(attack);
        setIsAnimatingDamage(true, attack.target);

        setTimeout(() => {
          dealDamage(attack.target, attack.damage);
          setIsAnimatingDamage(false);
          nextAttack();
        }, 500 / playbackSpeed);
      }
    }, baseDelay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentAttackIndex, isComplete, isAnimatingDamage, attacks, playbackSpeed, setLastAttack, setIsAnimatingDamage, dealDamage, nextAttack]);

  const handlePlayPause = useCallback(() => {
    if (isComplete) {
      resetBattle();
      initBattle(100);
    }
    setIsPlaying(!isPlaying);
  }, [isComplete, isPlaying, resetBattle, initBattle, setIsPlaying]);

  const handleSkip = useCallback(() => {
    for (let i = currentAttackIndex + 1; i < attacks.length; i++) {
      const attack = attacks[i];
      dealDamage(attack.target, attack.damage);
    }
    useBattleStore.setState({ currentAttackIndex: attacks.length });
    setIsPlaying(false);
  }, [currentAttackIndex, attacks, dealDamage, setIsPlaying]);

  const handleRestart = useCallback(() => {
    resetBattle();
    initBattle(100);
  }, [resetBattle, initBattle]);

  const attackTypeLabels: Record<string, string> = {
    logical_argument: t.battle.attackTypes.logical_argument,
    emotional_appeal: t.battle.attackTypes.emotional_appeal,
    sarcasm: t.battle.attackTypes.sarcasm,
    deflection: t.battle.attackTypes.deflection,
    insult: t.battle.attackTypes.insult,
    manipulation: t.battle.attackTypes.manipulation,
    support: t.battle.attackTypes.support,
    resolution_attempt: t.battle.attackTypes.resolution_attempt,
    escalation: t.battle.attackTypes.escalation,
    passive_aggressive: t.battle.attackTypes.passive_aggressive,
  };

  // Loading state - matches Figma
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-cinder flex flex-col items-center justify-center p-6">
        <Loader2 className="h-16 w-16 animate-spin text-blue" />
        <h3 className="mt-6 text-xl font-bold text-white">{t.battle.preparing}</h3>
        <p className="mt-2 text-sm text-white/60">{t.battle.preparingDescription}</p>
        <div className="mt-8 w-full max-w-xs">
          <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(to right, #22d3ee 0%, #3b82f6 100%)"
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${generateProgress}%` }}
            />
          </div>
          <p className="mt-3 text-center text-xs text-white/40">
            {generateProgress < 30 ? t.battle.progressAnalyzing : generateProgress < 60 ? t.battle.progressCalculating : generateProgress < 90 ? t.battle.progressDetermining : t.battle.progressFinalizing}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-cinder flex flex-col items-center justify-center p-6">
        <AlertTriangle className="h-16 w-16 text-red-500" />
        <h3 className="mt-6 text-xl font-bold text-red-500">{t.battle.generationFailed}</h3>
        <p className="mt-2 text-sm text-white/60 max-w-xs text-center">{error}</p>
        <Button onClick={generateBattle} className="mt-8 bg-blue hover:bg-blue-600 text-white">
          {t.review.tryAgain}
        </Button>
      </div>
    );
  }

  // Waiting state
  if (attacks.length === 0) {
    return (
      <div className="min-h-screen bg-cinder flex flex-col items-center justify-center p-6">
        <Loader2 className="h-16 w-16 animate-spin text-blue" />
        <h3 className="mt-4 text-lg font-semibold text-white">{t.battle.loadingBattle}</h3>
      </div>
    );
  }

  // Calculate HP bar colors - matches Figma
  const getHPColor = (hp: number, max: number) => {
    const percent = (hp / max) * 100;
    if (percent > 60) return "bg-green-500";
    if (percent > 30) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-cinder">
      {/* Main Container - Figma exact design */}
      <div className="relative max-w-[375px] mx-auto bg-cinder border-x border-white/5 shadow-2xl overflow-hidden">

        {/* Gradient overlays - matches Figma */}
        <div className="absolute top-0 left-0 w-[261px] h-[312px] opacity-100" style={{
          background: "radial-gradient(circle at 0% 0%, rgba(34,211,238,0.15) 0%, transparent 70%)"
        }} />
        <div className="absolute bottom-0 right-0 w-[261px] h-[312px] opacity-100" style={{
          background: "radial-gradient(circle at 100% 100%, rgba(249,115,22,0.15) 0%, transparent 70%)"
        }} />

        {/* Header - matches Figma exactly */}
        <div className="relative z-10 flex items-center justify-between px-4 py-6">
          <button className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
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

          <button className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Title Section - matches Figma exactly */}
        <div className="relative z-10 px-6 pb-2">
          <h1 className="text-2xl font-bold text-white tracking-[-0.6px]">Revisar Batalla</h1>
          <p className="mt-1 text-sm text-white/50">
            Confirma la línea de tiempo antes de luchar.
          </p>
        </div>

        {/* Confidence Card - matches Figma exactly */}
        <div className="relative z-10 mx-6 mb-6">
          <div
            className="rounded-2xl p-4 backdrop-blur-[10px] border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            style={{ background: "rgba(20,20,30,0.7)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-white/40 tracking-[1px] uppercase">
                  Intensidad de Batalla
                </p>
                <p className="text-xs text-white/70 mt-1">
                  {attacks.length} ataques detectados
                </p>
              </div>
              {/* Progress ring */}
              <div className="relative w-14 h-14">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <circle
                    cx="28" cy="28" r="22" fill="none"
                    stroke="url(#battleGradient)" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${Math.min(((currentAttackIndex + 1) / attacks.length) * 138, 138)} 138`}
                  />
                  <defs>
                    <linearGradient id="battleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                  {Math.round(((currentAttackIndex + 1) / attacks.length) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fighters Section - matches Figma */}
        <div className="relative z-10 px-4">
          {/* Fighter avatars and VS */}
          <div className="flex items-center justify-between">
            {/* Fighter A */}
            <motion.div
              className="flex flex-col items-center"
              animate={damagedFighter === "A" && isAnimatingDamage ? { x: [0, -8, 8, -8, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className={cn(
                "relative w-20 h-20 rounded-full border-2 border-cyan flex items-center justify-center",
                "shadow-[0_0_20px_rgba(34,211,238,0.4)]",
                damagedFighter === "A" && isAnimatingDamage && "animate-pulse"
              )}>
                <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan/20 to-cinder flex items-center justify-center">
                  <span className="text-2xl font-bold text-cyan">{getInitials(participants.A.name)}</span>
                </div>
              </div>
              <p className="mt-2 text-sm font-bold text-white">{participants.A.name.toUpperCase()}</p>
              <p className="text-[10px] text-cyan font-semibold">LVL 24</p>
            </motion.div>

            {/* VS */}
            <div className="text-3xl font-black text-white/30 italic">VS</div>

            {/* Fighter B */}
            <motion.div
              className="flex flex-col items-center"
              animate={damagedFighter === "B" && isAnimatingDamage ? { x: [0, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className={cn(
                "relative w-20 h-20 rounded-full border-2 border-orange flex items-center justify-center",
                "shadow-[0_0_20px_rgba(249,115,22,0.4)]",
                damagedFighter === "B" && isAnimatingDamage && "animate-pulse"
              )}>
                <div className="w-full h-full rounded-full bg-gradient-to-br from-orange/20 to-cinder flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange">{getInitials(participants.B.name)}</span>
                </div>
              </div>
              <p className="mt-2 text-sm font-bold text-white">{participants.B.name.toUpperCase()}</p>
              <p className="text-[10px] text-orange font-semibold">LVL 22</p>
            </motion.div>
          </div>

          {/* HP Bars - matches Figma */}
          <div className="mt-6 flex justify-between gap-4">
            {/* HP Bar A */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-cyan font-semibold">FIGHTER A HP</span>
                <span className="text-[10px] text-white/60">{Math.round(hpA)}/{maxHp}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", getHPColor(hpA, maxHp))}
                  initial={{ width: "100%" }}
                  animate={{ width: `${(hpA / maxHp) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* HP Bar B */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-orange font-semibold">FIGHTER B HP</span>
                <span className="text-[10px] text-white/60">{Math.round(hpB)}/{maxHp}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", getHPColor(hpB, maxHp))}
                  initial={{ width: "100%" }}
                  animate={{ width: `${(hpB / maxHp) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Damage Display */}
          <AnimatePresence>
            {lastAttack && isAnimatingDamage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="mt-6 text-center"
              >
                <p className="text-4xl font-black text-orange">-{lastAttack.damage} HP</p>
                {lastAttack.isCritical && (
                  <span className="inline-block mt-1 px-3 py-1 bg-orange/20 text-orange text-xs font-bold rounded-full">
                    ¡CRÍTICO!
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attack Message Card - matches Figma */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              {lastAttack && !isComplete && (
                <motion.div
                  key={lastAttack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-2xl backdrop-blur-xl border border-white/5 p-4"
                  style={{ background: "rgba(18,18,26,0.8)" }}
                >
                  {/* Attacker badge */}
                  <div className="mb-3">
                    <span className={cn(
                      "inline-block px-3 py-1 rounded-full text-xs font-bold",
                      lastAttack.attacker === "A"
                        ? "bg-cyan/20 text-cyan"
                        : "bg-orange/20 text-orange"
                    )}>
                      {participants[lastAttack.attacker].name.toUpperCase()} ATACA
                    </span>
                  </div>

                  {/* Quote */}
                  <p className="text-white/90 text-sm leading-relaxed italic">
                    &quot;{lastAttack.text}&quot;
                  </p>

                  {/* Attack type and description */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-white/5 text-white/60 text-xs font-medium">
                      {attackTypeLabels[lastAttack.attackType]?.toUpperCase() || lastAttack.attackType.toUpperCase()}
                    </span>
                    <span className="text-white/40 text-xs">• Ataca directo al orgullo</span>
                  </div>
                </motion.div>
              )}

              {isComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-4xl font-black text-gold">
                    {hpA === hpB ? t.battle.draw : translate(t.battle.wins, { name: participants[hpA > hpB ? "A" : "B"].name })}
                  </p>
                </motion.div>
              )}

              {!lastAttack && !isComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-2xl font-black text-white">{isPlaying ? "¡PELEA!" : t.battle.readyToBattle}</p>
                  <p className="text-sm text-white/40 mt-2">{t.battle.pressPlay}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls Section - Fixed at bottom with gradient */}
        <div
          className="relative z-10 mt-8 px-6 pb-6 pt-4"
          style={{
            background: "linear-gradient(to top, #0a0a0f 0%, rgba(10,10,15,0.95) 50%, transparent 100%)"
          }}
        >
          {/* Progress */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/60 font-medium">ATAQUES</span>
            <span className="text-xs text-white/60">{Math.min(currentAttackIndex + 1, attacks.length)} / {attacks.length}</span>
          </div>
          <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-6">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(to right, #22d3ee 0%, #3b82f6 100%)"
              }}
              animate={{ width: `${((currentAttackIndex + 1) / attacks.length) * 100}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              disabled={currentAttackIndex === -1 && !isPlaying}
              className="w-12 h-12 rounded-xl bg-cinder-light border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-cinder-medium disabled:opacity-30 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handlePlayPause}
              className="w-32 h-12 rounded-xl bg-blue hover:brightness-110 flex items-center justify-center text-white font-medium transition-all"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : isComplete ? <RotateCcw className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <button
              onClick={handleSkip}
              disabled={isComplete}
              className="w-12 h-12 rounded-xl bg-cinder-light border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-cinder-medium disabled:opacity-30 transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="mt-4 flex items-center justify-center">
            <div className="inline-flex bg-cinder-light rounded-lg p-1">
              {[1, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={cn(
                    "px-4 py-2 text-xs font-medium rounded-md transition-colors",
                    playbackSpeed === speed
                      ? "bg-cinder-medium text-white"
                      : "text-white/40 hover:text-white/60"
                  )}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <button
                onClick={nextStep}
                className="w-full py-4 rounded-xl bg-blue hover:brightness-110 text-white font-semibold transition-all"
              >
                {t.battle.seeFullAnalysis}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
