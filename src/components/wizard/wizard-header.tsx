"use client";

import Link from "next/link";
import { Swords, RotateCcw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/stores/wizard-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export function WizardHeader() {
  const { reset, currentStep } = useWizardStore();
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleReset = () => {
    reset();
    setShowResetDialog(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-primary"
        >
          <Swords className="h-5 w-5" />
          <span className="hidden sm:inline">FightReplay</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {currentStep !== "upload" && (
            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <RotateCcw className="h-4 w-4" />
                  <span className="sr-only">Start over</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Over?</DialogTitle>
                  <DialogDescription>
                    This will clear all your uploaded images and progress. Are
                    you sure you want to start over?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowResetDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReset}>
                    Start Over
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <Link href="/auth">
              <User className="h-4 w-4" />
              <span className="sr-only">Account</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
