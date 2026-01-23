"use client";

import { motion } from "framer-motion";
import { User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWizardStore } from "@/stores/wizard-store";
import { getInitials } from "@/lib/utils";
import type { Speaker } from "@/types";

const participantConfig: Record<
  Speaker,
  { colorClass: string; bgClass: string; label: string }
> = {
  A: {
    colorClass: "text-fighter-a",
    bgClass: "bg-fighter-a",
    label: "Person A (usually left side)",
  },
  B: {
    colorClass: "text-fighter-b",
    bgClass: "bg-fighter-b",
    label: "Person B (usually right side)",
  },
};

export function ParticipantsStep() {
  const { participants, setParticipantName, nextStep, prevStep } =
    useWizardStore();

  const canProceed =
    participants.A.name.trim().length > 0 &&
    participants.B.name.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Name the Fighters</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Who&apos;s in this conversation? Give them names!
        </p>
      </div>

      {/* Participant cards */}
      <div className="space-y-4">
        {(["A", "B"] as const).map((speaker) => {
          const config = participantConfig[speaker];
          const participant = participants[speaker];

          return (
            <motion.div
              key={speaker}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: speaker === "A" ? 0 : 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className={`h-1 ${config.bgClass}`} />
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className={`h-12 w-12 ${config.bgClass}`}>
                      <AvatarFallback className="bg-transparent text-white font-bold">
                        {participant.name
                          ? getInitials(participant.name)
                          : speaker}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <Label
                        htmlFor={`name-${speaker}`}
                        className={`text-xs ${config.colorClass}`}
                      >
                        {config.label}
                      </Label>
                      <Input
                        id={`name-${speaker}`}
                        placeholder={`Enter name for ${speaker}...`}
                        value={participant.name}
                        onChange={(e) =>
                          setParticipantName(speaker, e.target.value)
                        }
                        className="h-11"
                        maxLength={30}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg bg-muted/50 p-4"
      >
        <div className="flex items-start gap-3">
          <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Tip</p>
            <p className="mt-1">
              Person A is typically shown on the left side of the chat, Person B
              on the right. The AI will help identify who said what!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button className="flex-1" disabled={!canProceed} onClick={nextStep}>
          Analyze Chat
        </Button>
      </div>
    </div>
  );
}
