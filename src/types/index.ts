import { z } from "zod";

// ============ MESSAGE & CONVERSATION TYPES ============

export const SpeakerSchema = z.enum(["A", "B"]);
export type Speaker = z.infer<typeof SpeakerSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  speaker: SpeakerSchema,
  text: z.string(),
  timestamp: z.string().nullish(), // Can be string, null, or undefined
  confidence: z.number().min(0).max(1),
  sourceImageId: z.string().optional(),
});
export type Message = z.infer<typeof MessageSchema>;

export const ExtractedMessageSchema = z.object({
  speaker: SpeakerSchema,
  text: z.string(),
  timestamp: z.string().nullish(), // Can be string, null, or undefined
  confidence: z.number().min(0).max(1),
  position_in_image: z.number().optional(),
});
export type ExtractedMessage = z.infer<typeof ExtractedMessageSchema>;

export const ImageExtractionResultSchema = z.object({
  imageId: z.string(),
  messages: z.array(ExtractedMessageSchema),
  language: z.string().optional(),
  platform: z.string().optional(),
});
export type ImageExtractionResult = z.infer<typeof ImageExtractionResultSchema>;

export const TimelineGapSchema = z.object({
  afterMessageId: z.string(),
  reason: z.string(),
  estimatedMissingCount: z.number().optional(),
});
export type TimelineGap = z.infer<typeof TimelineGapSchema>;

export const ReconstructedTimelineSchema = z.object({
  messages: z.array(MessageSchema),
  overallConfidence: z.number().min(0).max(1),
  explanationShort: z.string(),
  gaps: z.array(TimelineGapSchema),
  language: z.string(),
});
export type ReconstructedTimeline = z.infer<typeof ReconstructedTimelineSchema>;

// ============ PARTICIPANT TYPES ============

export const ParticipantSchema = z.object({
  id: SpeakerSchema,
  name: z.string(),
  avatar: z.string().optional(),
  color: z.string().optional(),
});
export type Participant = z.infer<typeof ParticipantSchema>;

// ============ BATTLE TYPES ============

export const AttackTypeSchema = z.enum([
  "logical_argument",
  "emotional_appeal",
  "sarcasm",
  "deflection",
  "insult",
  "manipulation",
  "support",
  "resolution_attempt",
  "escalation",
  "passive_aggressive",
]);
export type AttackType = z.infer<typeof AttackTypeSchema>;

export const AttackSchema = z.object({
  id: z.string(),
  messageId: z.string(),
  attacker: SpeakerSchema,
  target: SpeakerSchema,
  damage: z.number().min(0).max(50),
  attackType: AttackTypeSchema,
  text: z.string(),
  rationale: z.string(),
  isCritical: z.boolean().default(false),
});
export type Attack = z.infer<typeof AttackSchema>;

export const BattleResultSchema = z.object({
  winner: SpeakerSchema.nullable(),
  finalHpA: z.number(),
  finalHpB: z.number(),
  attacks: z.array(AttackSchema),
  stats: z.object({
    totalAttacksA: z.number(),
    totalAttacksB: z.number(),
    totalDamageDealtA: z.number(),
    totalDamageDealtB: z.number(),
    criticalHitsA: z.number(),
    criticalHitsB: z.number(),
    mostUsedTypeA: AttackTypeSchema.optional(),
    mostUsedTypeB: AttackTypeSchema.optional(),
  }),
});
export type BattleResult = z.infer<typeof BattleResultSchema>;

// ============ ANALYSIS TYPES ============

export const AnalysisCriterionSchema = z.object({
  name: z.string(),
  scoreA: z.number().min(0).max(10),
  scoreB: z.number().min(0).max(10),
  explanation: z.string(),
});
export type AnalysisCriterion = z.infer<typeof AnalysisCriterionSchema>;

export const AnalysisResultSchema = z.object({
  winner: SpeakerSchema.nullable(),
  winnerReason: z.string(),
  criteria: z.array(AnalysisCriterionSchema),
  recommendations: z.array(z.string()),
  keyMoments: z.array(
    z.object({
      messageId: z.string(),
      description: z.string(),
      impact: z.enum(["positive", "negative", "neutral"]),
    })
  ),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

// ============ UPLOAD TYPES ============

export const UploadedImageSchema = z.object({
  id: z.string(),
  file: z.instanceof(File).optional(),
  preview: z.string(),
  status: z.enum(["pending", "processing", "done", "error"]),
  error: z.string().optional(),
  extractionResult: ImageExtractionResultSchema.optional(),
});
export type UploadedImage = z.infer<typeof UploadedImageSchema>;

// ============ WIZARD STATE TYPES ============

export const WizardStepSchema = z.enum([
  "upload",
  "participants",
  "review",
  "battle",
  "results",
]);
export type WizardStep = z.infer<typeof WizardStepSchema>;

export interface WizardState {
  currentStep: WizardStep;
  images: UploadedImage[];
  participants: {
    A: Participant;
    B: Participant;
  };
  timeline: ReconstructedTimeline | null;
  battleResult: BattleResult | null;
  analysisResult: AnalysisResult | null;
}

// ============ AUTH TYPES ============

export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  adsConsent: boolean;
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  isGuest: boolean;
  isLoading: boolean;
}

// ============ ADS TYPES ============

export type AdPlacement =
  | "landing_below_fold"
  | "review_inline"
  | "results_winner"
  | "results_mid"
  | "results_bottom"
  | "share_bottom";

export interface AdSlotConfig {
  placement: AdPlacement;
  format: "responsive" | "rectangle" | "leaderboard";
  testMode?: boolean;
}

// ============ SHARE TYPES ============

export interface ShareCard {
  id: string;
  publicToken: string;
  battleId: string;
  isPublic: boolean;
  createdAt: string;
  expiresAt: string | null;
}
