import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateDamageColor(damage: number): string {
  if (damage <= 5) return "text-damage-low";
  if (damage <= 10) return "text-damage-medium";
  if (damage <= 20) return "text-damage-high";
  return "text-damage-critical";
}

export function calculateHPColor(hp: number, maxHP: number = 100): string {
  const percentage = (hp / maxHP) * 100;
  if (percentage > 60) return "hp-gradient-full";
  if (percentage > 30) return "hp-gradient-medium";
  return "hp-gradient-low";
}
