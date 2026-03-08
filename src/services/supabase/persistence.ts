// Supabase Persistence Service
// Handles storage uploads, battle saving, and share link generation

import { createClient } from "./client";
import type {
  ReconstructedTimeline,
  BattleResult,
  AnalysisResult,
} from "@/types";

export interface SaveBattleParams {
  userId?: string;
  participantAName: string;
  participantBName: string;
  timeline: ReconstructedTimeline;
  battleResult: BattleResult;
  analysisResult: AnalysisResult;
}

export interface SaveBattleResult {
  battleId: string;
  conversationId: string;
}

export interface CreateShareLinkResult {
  token: string;
  shareUrl: string;
  expiresAt: string | null;
}

class SupabasePersistenceService {
  /**
   * Upload an image to Supabase Storage
   */
  async uploadImage(
    file: File,
    userId: string
  ): Promise<{ path: string; url: string }> {
    const supabase = createClient();

    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: urlData.publicUrl,
    };
  }

  /**
   * Upload multiple images
   */
  async uploadImages(
    files: File[],
    userId: string,
    onProgress?: (completed: number, total: number) => void
  ): Promise<Array<{ path: string; url: string }>> {
    const results: Array<{ path: string; url: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadImage(files[i], userId);
      results.push(result);
      onProgress?.(i + 1, files.length);
    }

    return results;
  }

  /**
   * Save a conversation to the database
   */
  async saveConversation(
    userId: string,
    timeline: ReconstructedTimeline,
    uploadId?: string
  ): Promise<string> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        upload_id: uploadId || null,
        timeline_json: timeline,
        confidence: timeline.overallConfidence,
        language: timeline.language,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to save conversation: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Save a battle to the database
   */
  async saveBattle(params: SaveBattleParams): Promise<SaveBattleResult> {
    const supabase = createClient();

    // First save the conversation
    let conversationId: string | null = null;
    if (params.userId) {
      conversationId = await this.saveConversation(
        params.userId,
        params.timeline
      );
    }

    // Then save the battle
    const { data, error } = await supabase
      .from("battles")
      .insert({
        user_id: params.userId || null,
        conversation_id: conversationId,
        participant_a_name: params.participantAName,
        participant_b_name: params.participantBName,
        attacks_json: params.battleResult,
        analysis_json: params.analysisResult,
        winner: params.analysisResult.winner,
        final_hp_a: params.battleResult.finalHpA,
        final_hp_b: params.battleResult.finalHpB,
        stats_json: params.battleResult.stats,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to save battle: ${error.message}`);
    }

    return {
      battleId: data.id,
      conversationId: conversationId || "",
    };
  }

  /**
   * Create a share link for a battle
   */
  async createShareLink(
    battleId: string,
    userId?: string,
    expiresInDays: number = 30
  ): Promise<CreateShareLinkResult> {
    const supabase = createClient();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const { data, error } = await supabase
      .from("share_cards")
      .insert({
        battle_id: battleId,
        user_id: userId || null,
        is_public: true,
        expires_at: expiresAt.toISOString(),
      })
      .select("public_token, expires_at")
      .single();

    if (error) {
      throw new Error(`Failed to create share link: ${error.message}`);
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

    return {
      token: data.public_token,
      shareUrl: `${baseUrl}/share/${data.public_token}`,
      expiresAt: data.expires_at,
    };
  }

  /**
   * Get user's battle history
   */
  async getUserBattles(userId: string): Promise<
    Array<{
      id: string;
      participantA: string;
      participantB: string;
      winner: string | null;
      createdAt: string;
    }>
  > {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("battles")
      .select("id, participant_a_name, participant_b_name, winner, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(`Failed to fetch battles: ${error.message}`);
    }

    return data.map((battle) => ({
      id: battle.id,
      participantA: battle.participant_a_name,
      participantB: battle.participant_b_name,
      winner: battle.winner,
      createdAt: battle.created_at,
    }));
  }

  /**
   * Get a battle by ID
   */
  async getBattle(battleId: string): Promise<{
    id: string;
    participantA: string;
    participantB: string;
    battleResult: BattleResult;
    analysisResult: AnalysisResult;
    timeline: ReconstructedTimeline | null;
    createdAt: string;
  } | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("battles")
      .select("*, conversations(timeline_json)")
      .eq("id", battleId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      participantA: data.participant_a_name,
      participantB: data.participant_b_name,
      battleResult: data.attacks_json as BattleResult,
      analysisResult: data.analysis_json as AnalysisResult,
      timeline: data.conversations?.timeline_json as ReconstructedTimeline | null,
      createdAt: data.created_at,
    };
  }

  /**
   * Delete a battle
   */
  async deleteBattle(battleId: string, userId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("battles")
      .delete()
      .eq("id", battleId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete battle: ${error.message}`);
    }
  }

  /**
   * Update user's ad consent
   */
  async updateAdsConsent(userId: string, consent: boolean): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ ads_consent: consent, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to update ads consent: ${error.message}`);
    }
  }
}

// Singleton instance
export const persistenceService = new SupabasePersistenceService();

