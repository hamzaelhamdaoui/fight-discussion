import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/types";

interface AuthStore {
  user: UserProfile | null;
  isGuest: boolean;
  isLoading: boolean;
  adsConsent: boolean | null;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setIsGuest: (isGuest: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setAdsConsent: (consent: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isGuest: true,
      isLoading: true,
      adsConsent: null,

      setUser: (user) => set({ user, isGuest: !user, isLoading: false }),
      setIsGuest: (isGuest) => set({ isGuest }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setAdsConsent: (adsConsent) => set({ adsConsent }),
      logout: () =>
        set({ user: null, isGuest: true, isLoading: false }),
    }),
    {
      name: "fight-replay-auth",
      partialize: (state) => ({
        isGuest: state.isGuest,
        adsConsent: state.adsConsent,
      }),
    }
  )
);
