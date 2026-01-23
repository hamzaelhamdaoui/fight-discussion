import { create } from "zustand";
import type { Attack, Speaker } from "@/types";

interface BattleState {
  // Battle progress
  isPlaying: boolean;
  currentAttackIndex: number;
  hpA: number;
  hpB: number;
  maxHp: number;

  // Animation state
  lastAttack: Attack | null;
  isAnimatingDamage: boolean;
  damagedFighter: Speaker | null;

  // Speed control
  playbackSpeed: number;

  // Actions
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentAttackIndex: (index: number) => void;
  nextAttack: () => void;
  setHp: (speaker: Speaker, hp: number) => void;
  dealDamage: (speaker: Speaker, damage: number) => void;
  setLastAttack: (attack: Attack | null) => void;
  setIsAnimatingDamage: (isAnimating: boolean, fighter?: Speaker | null) => void;
  setPlaybackSpeed: (speed: number) => void;
  reset: () => void;
  initBattle: (maxHp?: number) => void;
}

const DEFAULT_MAX_HP = 100;

export const useBattleStore = create<BattleState>((set, get) => ({
  isPlaying: false,
  currentAttackIndex: -1,
  hpA: DEFAULT_MAX_HP,
  hpB: DEFAULT_MAX_HP,
  maxHp: DEFAULT_MAX_HP,
  lastAttack: null,
  isAnimatingDamage: false,
  damagedFighter: null,
  playbackSpeed: 1,

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setCurrentAttackIndex: (index) => set({ currentAttackIndex: index }),

  nextAttack: () =>
    set((state) => ({ currentAttackIndex: state.currentAttackIndex + 1 })),

  setHp: (speaker, hp) =>
    set((state) => ({
      [speaker === "A" ? "hpA" : "hpB"]: Math.max(0, Math.min(state.maxHp, hp)),
    })),

  dealDamage: (speaker, damage) =>
    set((state) => {
      const key = speaker === "A" ? "hpA" : "hpB";
      const currentHp = state[key];
      return { [key]: Math.max(0, currentHp - damage) };
    }),

  setLastAttack: (attack) => set({ lastAttack: attack }),

  setIsAnimatingDamage: (isAnimating, fighter = null) =>
    set({ isAnimatingDamage: isAnimating, damagedFighter: fighter }),

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  reset: () =>
    set({
      isPlaying: false,
      currentAttackIndex: -1,
      hpA: get().maxHp,
      hpB: get().maxHp,
      lastAttack: null,
      isAnimatingDamage: false,
      damagedFighter: null,
    }),

  initBattle: (maxHp = DEFAULT_MAX_HP) =>
    set({
      isPlaying: false,
      currentAttackIndex: -1,
      hpA: maxHp,
      hpB: maxHp,
      maxHp,
      lastAttack: null,
      isAnimatingDamage: false,
      damagedFighter: null,
    }),
}));
