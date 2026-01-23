"use client";

import { useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWizardStore } from "@/stores/wizard-store";
import { useBattleStore } from "@/stores/battle-store";
import { cn, getInitials, calculateHPColor } from "@/lib/utils";
import type { Attack, BattleResult, Speaker } from "@/types";

// Mock battle result for demo
const mockBattleResult: BattleResult = {
  winner: "B",
  finalHpA: 35,
  finalHpB: 58,
  attacks: [
    {
      id: "atk1",
      messageId: "1",
      attacker: "A",
      target: "B",
      damage: 15,
      attackType: "emotional_appeal",
      text: "I can't believe you forgot our anniversary again!",
      rationale: "Strong emotional accusation that puts B on the defensive",
      isCritical: false,
    },
    {
      id: "atk2",
      messageId: "2",
      attacker: "B",
      target: "A",
      damage: 12,
      attackType: "deflection",
      text: "I didn't forget! I was planning a surprise!",
      rationale: "Quick defense that redirects the narrative",
      isCritical: false,
    },
    {
      id: "atk3",
      messageId: "3",
      attacker: "A",
      target: "B",
      damage: 10,
      attackType: "sarcasm",
      text: "That's what you always say. Just admit you forgot.",
      rationale: "Dismissive response that escalates tension",
      isCritical: false,
    },
    {
      id: "atk4",
      messageId: "4",
      attacker: "B",
      target: "A",
      damage: 22,
      attackType: "logical_argument",
      text: "I have the restaurant reservation confirmation right here!",
      rationale: "Concrete evidence that proves their point",
      isCritical: true,
    },
    {
      id: "atk5",
      messageId: "5",
      attacker: "A",
      target: "B",
      damage: 8,
      attackType: "passive_aggressive",
      text: "Oh... well you could have told me earlier instead of letting me worry",
      rationale: "Shifts blame but acknowledges being wrong",
      isCritical: false,
    },
    {
      id: "atk6",
      messageId: "6",
      attacker: "B",
      target: "A",
      damage: 10,
      attackType: "logical_argument",
      text: "That's why it's called a SURPRISE. I was going to tell you tonight!",
      rationale: "Reasonable explanation that reinforces their position",
      isCritical: false,
    },
    {
      id: "atk7",
      messageId: "7",
      attacker: "A",
      target: "B",
      damage: 5,
      attackType: "resolution_attempt",
      text: "Fine. But next time at least give me a hint so I don't panic all day",
      rationale: "Concedes the point while setting boundaries",
      isCritical: false,
    },
    {
      id: "atk8",
      messageId: "8",
      attacker: "B",
      target: "A",
      damage: 0,
      attackType: "resolution_attempt",
      text: "Deal. Now go get ready, reservation is at 8!",
      rationale: "Positive conclusion that ends the conflict",
      isCritical: false,
    },
  ],
  stats: {
    totalAttacksA: 4,
    totalAttacksB: 4,
    totalDamageDealtA: 38,
    totalDamageDealtB: 44,
    criticalHitsA: 0,
    criticalHitsB: 1,
    mostUsedTypeA: "emotional_appeal",
    mostUsedTypeB: "logical_argument",
  },
};

export function BattleStep() {
  const { participants, nextStep, setBattleResult, battleResult } =
    useWizardStore();
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

  const attacks = useMemo(
    () => battleResult?.attacks || mockBattleResult.attacks,
    [battleResult]
  );

  const isComplete = currentAttackIndex >= attacks.length;

  // Initialize battle on mount
  useEffect(() => {
    if (!battleResult) {
      setBattleResult(mockBattleResult);
    }
    initBattle(100);
  }, [battleResult, setBattleResult, initBattle]);

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

        // Apply damage after animation
        setTimeout(() => {
          dealDamage(attack.target, attack.damage);
          setIsAnimatingDamage(false);
          nextAttack();
        }, 500 / playbackSpeed);
      }
    }, baseDelay);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    currentAttackIndex,
    isComplete,
    isAnimatingDamage,
    attacks,
    playbackSpeed,
    setLastAttack,
    setIsAnimatingDamage,
    dealDamage,
    nextAttack,
  ]);

  const handlePlayPause = useCallback(() => {
    if (isComplete) {
      resetBattle();
      initBattle(100);
    }
    setIsPlaying(!isPlaying);
  }, [isComplete, isPlaying, resetBattle, initBattle, setIsPlaying]);

  const handleSkip = useCallback(() => {
    // Apply all remaining damage instantly
    for (let i = currentAttackIndex + 1; i < attacks.length; i++) {
      const attack = attacks[i];
      dealDamage(attack.target, attack.damage);
    }
    // Set to complete
    useBattleStore.setState({ currentAttackIndex: attacks.length });
    setIsPlaying(false);
  }, [currentAttackIndex, attacks, dealDamage, setIsPlaying]);

  const handleRestart = useCallback(() => {
    resetBattle();
    initBattle(100);
  }, [resetBattle, initBattle]);

  return (
    <div className="space-y-4">
      {/* Battle Arena */}
      <Card className="overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
        <CardContent className="p-4">
          {/* Fighters */}
          <div className="flex items-start justify-between">
            <FighterDisplay
              speaker="A"
              name={participants.A.name}
              hp={hpA}
              maxHp={maxHp}
              isDamaged={damagedFighter === "A" && isAnimatingDamage}
              isWinner={isComplete && hpA > hpB}
            />
            <div className="flex flex-col items-center justify-center px-2">
              <span className="text-2xl font-bold text-white">VS</span>
            </div>
            <FighterDisplay
              speaker="B"
              name={participants.B.name}
              hp={hpB}
              maxHp={maxHp}
              isDamaged={damagedFighter === "B" && isAnimatingDamage}
              isWinner={isComplete && hpB > hpA}
              isReversed
            />
          </div>

          {/* Attack display */}
          <div className="mt-6 min-h-[100px]">
            <AnimatePresence mode="wait">
              {lastAttack && !isComplete && (
                <AttackDisplay
                  key={lastAttack.id}
                  attack={lastAttack}
                  attackerName={participants[lastAttack.attacker].name}
                />
              )}
              {isComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-4"
                >
                  <p className="text-3xl font-bold text-yellow-400 animate-bounce">
                    {hpA === hpB
                      ? "DRAW!"
                      : `${participants[hpA > hpB ? "A" : "B"].name} WINS!`}
                  </p>
                </motion.div>
              )}
              {!lastAttack && !isComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-4"
                >
                  <p className="text-xl font-bold text-white">
                    {isPlaying ? "FIGHT!" : "Ready to Battle?"}
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    Press play to start the battle
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <Progress
              value={((currentAttackIndex + 1) / attacks.length) * 100}
              className="h-1 bg-white/20"
              indicatorClassName="bg-primary"
            />
            <p className="mt-1 text-center text-xs text-white/50">
              {Math.min(currentAttackIndex + 1, attacks.length)} / {attacks.length} attacks
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRestart}
              disabled={currentAttackIndex === -1 && !isPlaying}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              size="lg"
              className="w-24"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : isComplete ? (
                <RotateCcw className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSkip}
              disabled={isComplete}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Speed control */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Speed:</span>
            <Slider
              value={[playbackSpeed]}
              onValueChange={([v]) => setPlaybackSpeed(v)}
              min={0.5}
              max={3}
              step={0.5}
              className="flex-1"
            />
            <span className="text-xs font-medium w-8">{playbackSpeed}x</span>
          </div>
        </CardContent>
      </Card>

      {/* Continue to results */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button size="lg" className="w-full" onClick={nextStep}>
            See Full Analysis
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function FighterDisplay({
  speaker,
  name,
  hp,
  maxHp,
  isDamaged,
  isWinner,
  isReversed,
}: {
  speaker: Speaker;
  name: string;
  hp: number;
  maxHp: number;
  isDamaged: boolean;
  isWinner: boolean;
  isReversed?: boolean;
}) {
  const hpPercent = (hp / maxHp) * 100;
  const colorClass = calculateHPColor(hp, maxHp);

  return (
    <motion.div
      className={cn(
        "flex flex-col items-center w-[40%]",
        isReversed && "items-center"
      )}
      animate={
        isDamaged
          ? { x: [0, -5, 5, -5, 5, 0] }
          : isWinner
          ? { scale: [1, 1.05, 1] }
          : {}
      }
      transition={{ duration: isDamaged ? 0.3 : 1, repeat: isWinner ? Infinity : 0 }}
    >
      <Avatar
        className={cn(
          "h-16 w-16 border-2",
          speaker === "A" ? "bg-fighter-a border-fighter-a" : "bg-fighter-b border-fighter-b",
          isDamaged && "animate-damage-flash",
          isWinner && "animate-victory-glow"
        )}
      >
        <AvatarFallback className="bg-transparent text-white text-xl font-bold">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <p className="mt-2 text-sm font-medium text-white truncate max-w-full">
        {name}
      </p>

      {/* HP Bar */}
      <div className="mt-2 w-full">
        <div className="flex justify-between text-[10px] text-white/70 mb-1">
          <span>HP</span>
          <span>{Math.round(hp)}/{maxHp}</span>
        </div>
        <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", colorClass)}
            initial={{ width: "100%" }}
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function AttackDisplay({
  attack,
  attackerName,
}: {
  attack: Attack;
  attackerName: string;
}) {
  const typeLabels: Record<string, string> = {
    logical_argument: "Logic",
    emotional_appeal: "Emotional",
    sarcasm: "Sarcasm",
    deflection: "Deflection",
    insult: "Insult",
    manipulation: "Manipulation",
    support: "Support",
    resolution_attempt: "Peace",
    escalation: "Escalation",
    passive_aggressive: "Passive Aggressive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-lg bg-white/10 backdrop-blur p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/60">{attackerName} attacks!</span>
        {attack.isCritical && (
          <span className="text-xs font-bold text-yellow-400">CRITICAL!</span>
        )}
      </div>
      <p className="text-sm text-white font-medium mb-2">
        &quot;{attack.text}&quot;
      </p>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            attack.attacker === "A"
              ? "bg-fighter-a/20 text-fighter-a"
              : "bg-fighter-b/20 text-fighter-b"
          )}
        >
          {typeLabels[attack.attackType] || attack.attackType}
        </span>
        <span
          className={cn(
            "text-sm font-bold",
            attack.damage >= 20
              ? "text-red-400"
              : attack.damage >= 10
              ? "text-orange-400"
              : "text-yellow-400"
          )}
        >
          -{attack.damage} HP
        </span>
      </div>
    </motion.div>
  );
}
