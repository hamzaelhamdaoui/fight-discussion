"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Swords,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWizardStore } from "@/stores/wizard-store";
import { AdSlot } from "@/components/ads/ad-slot";
import { cn, getInitials, formatTimestamp } from "@/lib/utils";
import type { Message, ReconstructedTimeline } from "@/types";

// Mock data for demo purposes
const mockTimeline: ReconstructedTimeline = {
  messages: [
    {
      id: "1",
      speaker: "A",
      text: "I can't believe you forgot our anniversary again!",
      confidence: 0.95,
      timestamp: "2024-01-15T18:30:00",
    },
    {
      id: "2",
      speaker: "B",
      text: "I didn't forget! I was planning a surprise!",
      confidence: 0.92,
      timestamp: "2024-01-15T18:31:00",
    },
    {
      id: "3",
      speaker: "A",
      text: "That's what you always say. Just admit you forgot.",
      confidence: 0.88,
      timestamp: "2024-01-15T18:32:00",
    },
    {
      id: "4",
      speaker: "B",
      text: "I have the restaurant reservation confirmation right here!",
      confidence: 0.94,
      timestamp: "2024-01-15T18:33:00",
    },
    {
      id: "5",
      speaker: "A",
      text: "Oh... well you could have told me earlier instead of letting me worry",
      confidence: 0.91,
      timestamp: "2024-01-15T18:35:00",
    },
    {
      id: "6",
      speaker: "B",
      text: "That's why it's called a SURPRISE. I was going to tell you tonight!",
      confidence: 0.89,
      timestamp: "2024-01-15T18:36:00",
    },
    {
      id: "7",
      speaker: "A",
      text: "Fine. But next time at least give me a hint so I don't panic all day",
      confidence: 0.93,
      timestamp: "2024-01-15T18:38:00",
    },
    {
      id: "8",
      speaker: "B",
      text: "Deal. Now go get ready, reservation is at 8!",
      confidence: 0.96,
      timestamp: "2024-01-15T18:39:00",
    },
  ],
  overallConfidence: 0.91,
  explanationShort:
    "Conversation reconstructed with high confidence. Timeline order determined by message context and flow.",
  gaps: [],
  language: "en",
};

export function ReviewStep() {
  const { participants, nextStep, prevStep, setTimeline, timeline, images } =
    useWizardStore();

  const [isAnalyzing, setIsAnalyzing] = useState(!timeline);
  const [progress, setProgress] = useState(0);

  // Simulate analysis process
  useEffect(() => {
    if (timeline) {
      setIsAnalyzing(false);
      setProgress(100);
      return;
    }

    const steps = [
      { progress: 20, delay: 500 },
      { progress: 40, delay: 1000 },
      { progress: 60, delay: 1500 },
      { progress: 80, delay: 2000 },
      { progress: 100, delay: 2500 },
    ];

    const timers: NodeJS.Timeout[] = [];

    steps.forEach(({ progress, delay }) => {
      const timer = setTimeout(() => {
        setProgress(progress);
        if (progress === 100) {
          setTimeout(() => {
            setTimeline(mockTimeline);
            setIsAnalyzing(false);
          }, 300);
        }
      }, delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [timeline, setTimeline]);

  const displayTimeline = timeline || mockTimeline;
  const confidencePercent = Math.round(displayTimeline.overallConfidence * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Review Conversation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI has reconstructed the timeline. Verify it looks correct.
        </p>
      </div>

      {/* Analysis Progress */}
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Card>
              <CardContent className="py-8 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <h3 className="mt-4 font-semibold">Analyzing Screenshots</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Processing {images.length} image{images.length !== 1 && "s"}...
                </p>
                <div className="mx-auto mt-4 max-w-xs">
                  <Progress value={progress} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {progress < 30
                      ? "Extracting text..."
                      : progress < 60
                      ? "Identifying speakers..."
                      : progress < 90
                      ? "Reconstructing timeline..."
                      : "Finalizing..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Confidence indicator */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {confidencePercent >= 80 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {confidencePercent}% Confidence
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {displayTimeline.explanationShort}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Message timeline */}
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {displayTimeline.messages.length} Messages
                    </span>
                  </div>
                </div>

                <ScrollArea className="h-[300px]">
                  <div className="space-y-3 p-4">
                    {displayTimeline.messages.map((message, index) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        participantName={participants[message.speaker].name}
                        index={index}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Gaps warning */}
            {displayTimeline.gaps.length > 0 && (
              <Card className="border-yellow-500/50 bg-yellow-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                    <div>
                      <p className="font-medium text-yellow-700 dark:text-yellow-400">
                        Possible gaps detected
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Some messages might be missing. The battle will still
                        work but may not be complete.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ad slot */}
            <AdSlot placement="review_inline" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={prevStep}
          disabled={isAnalyzing}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          className="flex-1"
          disabled={isAnalyzing}
          onClick={nextStep}
        >
          <Swords className="mr-2 h-4 w-4" />
          Start Battle!
        </Button>
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
      initial={{ opacity: 0, x: isA ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn("flex items-start gap-2", !isA && "flex-row-reverse")}
    >
      <Avatar
        className={cn("h-8 w-8", isA ? "bg-fighter-a" : "bg-fighter-b")}
      >
        <AvatarFallback className="bg-transparent text-white text-xs font-bold">
          {getInitials(participantName)}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3 py-2",
          isA
            ? "rounded-bl-sm bg-fighter-a/10"
            : "rounded-br-sm bg-fighter-b/10"
        )}
      >
        <p className="text-sm">{message.text}</p>
        {message.timestamp && (
          <p className="mt-1 text-[10px] text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </p>
        )}
      </div>

      {message.confidence < 0.8 && (
        <div className="flex items-center" title="Low confidence">
          <AlertTriangle className="h-3 w-3 text-yellow-500" />
        </div>
      )}
    </motion.div>
  );
}
