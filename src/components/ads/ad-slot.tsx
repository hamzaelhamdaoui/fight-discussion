"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { AdPlacement } from "@/types";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

// Mapping of placements to ad formats
const placementConfig: Record<
  AdPlacement,
  { format: "responsive" | "rectangle" | "leaderboard"; minHeight: number }
> = {
  landing_below_fold: { format: "responsive", minHeight: 100 },
  review_inline: { format: "rectangle", minHeight: 250 },
  results_winner: { format: "responsive", minHeight: 100 },
  results_mid: { format: "rectangle", minHeight: 250 },
  results_bottom: { format: "responsive", minHeight: 100 },
  share_bottom: { format: "responsive", minHeight: 90 },
};

export function AdSlot({ placement, className }: AdSlotProps) {
  const { adsConsent } = useAuthStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const config = placementConfig[placement];

  useEffect(() => {
    // Only load ads if user has consented
    if (adsConsent !== true) return;

    // In production, this would initialize the actual ad
    // For now, we simulate loading
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, [adsConsent]);

  // Don't render anything if no consent
  if (adsConsent !== true) {
    return null;
  }

  const isProduction = process.env.NODE_ENV === "production";
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-lg bg-muted/30 border border-dashed border-muted-foreground/20",
        className
      )}
      style={{ minHeight: config.minHeight }}
      data-ad-placement={placement}
      data-ad-format={config.format}
    >
      {isProduction && adClientId ? (
        // Production: Real AdSense
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight: config.minHeight }}
          data-ad-client={adClientId}
          data-ad-slot={placement}
          data-ad-format={config.format === "responsive" ? "auto" : "rectangle"}
          data-full-width-responsive={config.format === "responsive" ? "true" : "false"}
        />
      ) : (
        // Development: Mock ad placeholder
        <div
          className={cn(
            "flex flex-col items-center justify-center text-muted-foreground/50 p-4",
            !isLoaded && "animate-pulse"
          )}
          style={{ minHeight: config.minHeight }}
        >
          {isLoaded ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wider mb-1">
                Advertisement
              </p>
              <p className="text-[10px]">{placement.replace(/_/g, " ")}</p>
              <p className="text-[10px] mt-1 text-muted-foreground/30">
                ({config.format})
              </p>
            </>
          ) : (
            <div className="h-4 w-24 rounded bg-muted-foreground/10" />
          )}
        </div>
      )}
    </div>
  );
}
