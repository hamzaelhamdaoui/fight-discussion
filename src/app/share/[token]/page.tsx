"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Swords, BarChart3, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdSlot } from "@/components/ads/ad-slot";
import { createClient } from "@/services/supabase/client";
import { getInitials, cn } from "@/lib/utils";
import type { BattleResult, AnalysisResult, Speaker } from "@/types";

interface ShareData {
  battleId: string;
  participantA: string;
  participantB: string;
  battleResult: BattleResult;
  analysisResult: AnalysisResult;
  createdAt: string;
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<ShareData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShareData() {
      if (!token) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        // Fetch share card with public token
        const { data: shareCard, error: shareError } = await supabase
          .from("share_cards")
          .select("*, battles(*)")
          .eq("public_token", token)
          .eq("is_public", true)
          .single();

        if (shareError || !shareCard) {
          setError("Share link not found or has expired");
          setIsLoading(false);
          return;
        }

        // Check if expired
        if (shareCard.expires_at && new Date(shareCard.expires_at) < new Date()) {
          setError("This share link has expired");
          setIsLoading(false);
          return;
        }

        const battle = shareCard.battles;
        if (!battle) {
          setError("Battle data not found");
          setIsLoading(false);
          return;
        }

        setData({
          battleId: battle.id,
          participantA: battle.participant_a_name,
          participantB: battle.participant_b_name,
          battleResult: battle.attacks_json as unknown as BattleResult,
          analysisResult: battle.analysis_json as unknown as AnalysisResult,
          createdAt: shareCard.created_at,
        });
      } catch (err) {
        console.error("Error fetching share data:", err);
        setError("Failed to load battle results");
      } finally {
        setIsLoading(false);
      }
    }

    fetchShareData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading battle results...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-bold">Not Found</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error || "Battle not found"}</p>
            <Button asChild className="mt-6">
              <Link href="/">Create Your Own Battle</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { battleResult, analysisResult, participantA, participantB } = data;
  const winner = analysisResult.winner;
  const winnerName = winner === "A" ? participantA : winner === "B" ? participantB : "Draw";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary font-semibold"
          >
            <Swords className="h-5 w-5" />
            <span>FightReplay</span>
          </Link>
        </div>

        {/* Winner Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6"
        >
          <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/20 px-4 py-2 mb-4">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold">WINNER</span>
              </div>
              <h1 className="text-2xl font-bold text-white">{winnerName}</h1>
              <p className="mt-2 text-sm text-white/60">{analysisResult.winnerReason}</p>

              {/* Fighter Comparison */}
              <div className="flex items-center justify-between gap-4 py-6 mt-4">
                <FighterDisplay
                  speaker="A"
                  name={participantA}
                  hp={battleResult.finalHpA}
                  isWinner={winner === "A"}
                />
                <div className="text-white/30 font-bold">VS</div>
                <FighterDisplay
                  speaker="B"
                  name={participantB}
                  hp={battleResult.finalHpB}
                  isWinner={winner === "B"}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-center border-t border-white/10 pt-4">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-white/50">Attacks</p>
                  <p className="font-bold text-white">
                    {battleResult.stats.totalAttacksA} vs {battleResult.stats.totalAttacksB}
                  </p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-white/50">Total Damage</p>
                  <p className="font-bold text-white">
                    {battleResult.stats.totalDamageDealtA} vs {battleResult.stats.totalDamageDealtB}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analysis */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Battle Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResult.criteria.map((criterion) => (
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
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ad slot */}
        <AdSlot placement="share_bottom" className="mb-6" />

        {/* CTA */}
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-bold">Want to analyze your own conversation?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your chat screenshots and find out who won!
            </p>
            <Button asChild size="lg" className="mt-4 w-full">
              <Link href="/battle">
                <Swords className="mr-2 h-4 w-4" />
                Start Your Battle
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          FightReplay - For entertainment purposes only.
        </p>
      </div>
    </div>
  );
}

function FighterDisplay({
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

