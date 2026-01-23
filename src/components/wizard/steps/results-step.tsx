"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Download,
  Share2,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  BarChart3,
} from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useWizardStore } from "@/stores/wizard-store";
import { useBattleStore } from "@/stores/battle-store";
import { AdSlot } from "@/components/ads/ad-slot";
import { cn, getInitials } from "@/lib/utils";
import type { AnalysisResult, Speaker } from "@/types";
import { toast } from "@/hooks/use-toast";

// Mock analysis for demo
const mockAnalysis: AnalysisResult = {
  winner: "B",
  winnerReason:
    "Person B maintained composure and provided concrete evidence to support their position, ultimately resolving the conflict constructively.",
  criteria: [
    {
      name: "Clarity of Communication",
      scoreA: 6,
      scoreB: 8,
      explanation:
        "B communicated intentions clearly once given the chance, while A jumped to conclusions.",
    },
    {
      name: "Emotional Control",
      scoreA: 5,
      scoreB: 7,
      explanation:
        "B remained calm under accusation, A showed signs of panic and frustration.",
    },
    {
      name: "Use of Evidence",
      scoreA: 3,
      scoreB: 9,
      explanation:
        "B provided concrete proof (reservation confirmation), A relied on assumptions.",
    },
    {
      name: "Resolution Focus",
      scoreA: 6,
      scoreB: 8,
      explanation:
        "Both worked towards resolution, but B actively offered a positive outcome.",
    },
    {
      name: "Respectful Tone",
      scoreA: 5,
      scoreB: 7,
      explanation:
        "A used accusatory language initially, B remained respectful throughout.",
    },
  ],
  recommendations: [
    "Person A: Try asking questions before making accusations. A simple 'Did you remember our anniversary?' would have avoided the conflict.",
    "Person B: Consider giving a small hint next time to prevent worry, even if planning a surprise.",
    "Both: Establish a communication pattern for special occasions to avoid misunderstandings.",
  ],
  keyMoments: [
    {
      messageId: "4",
      description: "B provides evidence with reservation confirmation",
      impact: "positive",
    },
    {
      messageId: "1",
      description: "A opens with accusation without verification",
      impact: "negative",
    },
    {
      messageId: "8",
      description: "Both reach agreement and positive outcome",
      impact: "positive",
    },
  ],
};

export function ResultsStep() {
  const { participants, battleResult, analysisResult, reset } = useWizardStore();
  const { hpA, hpB } = useBattleStore();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const analysis = analysisResult || mockAnalysis;
  const winner = analysis.winner;
  const winnerName = winner ? participants[winner].name : "Draw";

  const handleDownload = async () => {
    if (!shareCardRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#0f172a",
      });

      const link = document.createElement("a");
      link.download = `fight-replay-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Downloaded!",
        description: "Share card saved to your device.",
      });
    } catch (err) {
      console.error("Download error:", err);
      toast({
        title: "Download failed",
        description: "Could not generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `${winnerName} won our argument battle on FightReplay AI! ${
      winner === "A" ? hpA : hpB
    } HP remaining.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "FightReplay AI Results",
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
      title: "Link copied!",
      description: "Share link copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Share Card (for download) */}
      <div
        ref={shareCardRef}
        className="rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4"
      >
        {/* Winner Banner */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/20 px-4 py-2 mb-3">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold">WINNER</span>
          </div>
          <h2 className="text-2xl font-bold text-white">{winnerName}</h2>
          <p className="text-sm text-white/60 mt-1">{analysis.winnerReason}</p>
        </motion.div>

        {/* Fighter Comparison */}
        <div className="flex items-center justify-between gap-4 py-4">
          <FighterResult
            speaker="A"
            name={participants.A.name}
            hp={hpA}
            isWinner={winner === "A"}
          />
          <div className="text-white/30 font-bold">VS</div>
          <FighterResult
            speaker="B"
            name={participants.B.name}
            hp={hpB}
            isWinner={winner === "B"}
          />
        </div>

        {/* Stats */}
        {battleResult && (
          <div className="grid grid-cols-2 gap-2 mt-4 text-center">
            <div className="rounded-lg bg-white/5 p-2">
              <p className="text-xs text-white/50">Attacks</p>
              <p className="font-bold text-white">
                {battleResult.stats.totalAttacksA} vs{" "}
                {battleResult.stats.totalAttacksB}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <p className="text-xs text-white/50">Total Damage</p>
              <p className="font-bold text-white">
                {battleResult.stats.totalDamageDealtA} vs{" "}
                {battleResult.stats.totalDamageDealtB}
              </p>
            </div>
          </div>
        )}

        {/* Branding */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <p className="text-xs text-white/40">
            Created with FightReplay AI
          </p>
        </div>
      </div>

      {/* Ad - Winner */}
      <AdSlot placement="results_winner" />

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Saving..." : "Save Image"}
        </Button>
        <Button className="flex-1" onClick={handleShare}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </>
          )}
        </Button>
      </div>

      {/* Detailed Analysis Toggle */}
      <Button
        variant="ghost"
        className="w-full justify-between"
        onClick={() => setShowDetails(!showDetails)}
      >
        <span className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Detailed Analysis
        </span>
        {showDetails ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4"
        >
          {/* Criteria Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.criteria.map((criterion) => (
                <div key={criterion.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{criterion.name}</span>
                    <span className="text-muted-foreground">
                      {criterion.scoreA} vs {criterion.scoreB}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Progress
                        value={criterion.scoreA * 10}
                        className="h-2"
                        indicatorClassName="bg-fighter-a"
                      />
                    </div>
                    <div className="flex-1">
                      <Progress
                        value={criterion.scoreB * 10}
                        className="h-2"
                        indicatorClassName="bg-fighter-b"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {criterion.explanation}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Ad - Mid */}
          <AdSlot placement="results_mid" />

          {/* Recommendations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Ad - Bottom */}
      <AdSlot placement="results_bottom" />

      {/* Start Over */}
      <Separator className="my-6" />
      <Button variant="outline" className="w-full" onClick={reset}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Analyze Another Conversation
      </Button>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground">
        This analysis is for entertainment purposes only and should not be
        considered professional relationship advice.
      </p>
    </div>
  );
}

function FighterResult({
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
  return (
    <div className={cn("flex-1 text-center", isWinner && "relative")}>
      {isWinner && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 left-1/2 -translate-x-1/2"
        >
          <Trophy className="h-4 w-4 text-yellow-400" />
        </motion.div>
      )}
      <Avatar
        className={cn(
          "h-14 w-14 mx-auto border-2",
          speaker === "A"
            ? "bg-fighter-a border-fighter-a"
            : "bg-fighter-b border-fighter-b",
          isWinner && "ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900"
        )}
      >
        <AvatarFallback className="bg-transparent text-white font-bold">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <p className="mt-2 text-sm font-medium text-white truncate">{name}</p>
      <p
        className={cn(
          "text-lg font-bold",
          hp > 50 ? "text-green-400" : hp > 25 ? "text-yellow-400" : "text-red-400"
        )}
      >
        {Math.round(hp)} HP
      </p>
    </div>
  );
}
