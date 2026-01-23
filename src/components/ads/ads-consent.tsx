"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";

export function AdsConsent() {
  const { adsConsent, setAdsConsent } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show consent banner if not yet decided
    if (adsConsent === null) {
      // Small delay to not interrupt initial page load
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [adsConsent]);

  const handleAccept = () => {
    setAdsConsent(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    setAdsConsent(false);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-bottom"
        >
          <Card className="mx-auto max-w-lg border-2 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Cookie className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">Personalized Ads</h3>
                    <button
                      onClick={handleDecline}
                      className="shrink-0 rounded-sm p-1 text-muted-foreground hover:text-foreground"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We use ads to keep FightReplay AI free. Allow personalized ads
                    for a better experience?
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAccept}
                      className="flex-1"
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDecline}
                      className="flex-1"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
