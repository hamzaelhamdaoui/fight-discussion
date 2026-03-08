// API Service for Battle Flow
// Handles all API calls: analyze, reconstruct, battle

import type {
  ImageExtractionResult,
  ReconstructedTimeline,
  BattleResult,
  AnalysisResult,
} from "@/types";

export interface AnalyzeImageParams {
  imageBase64: string;
  imageId: string;
}

export interface ReconstructParams {
  extractions: ImageExtractionResult[];
}

export interface GenerateBattleParams {
  timeline: ReconstructedTimeline;
  participantNames: {
    A: string;
    B: string;
  };
}

export interface BattleResponse {
  battleResult: BattleResult;
  analysisResult: AnalysisResult;
}

class BattleApiService {
  private baseUrl = "";

  /**
   * Convert a File to base64 string
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Analyze a single image to extract messages
   */
  async analyzeImage(params: AnalyzeImageParams): Promise<ImageExtractionResult> {
    const response = await fetch(`${this.baseUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `Failed to analyze image: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Analyze multiple images in parallel
   */
  async analyzeImages(
    images: Array<{ file: File; id: string }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<ImageExtractionResult[]> {
    const results: ImageExtractionResult[] = [];
    let completed = 0;

    // Process in batches of 3 to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async ({ file, id }) => {
          const base64 = await this.fileToBase64(file);
          const result = await this.analyzeImage({ imageBase64: base64, imageId: id });
          completed++;
          onProgress?.(completed, images.length);
          return result;
        })
      );

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Reconstruct the timeline from extracted messages
   */
  async reconstructTimeline(params: ReconstructParams): Promise<ReconstructedTimeline> {
    const response = await fetch(`${this.baseUrl}/api/reconstruct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `Failed to reconstruct timeline: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Generate battle results from timeline
   */
  async generateBattle(params: GenerateBattleParams): Promise<BattleResponse> {
    const response = await fetch(`${this.baseUrl}/api/battle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `Failed to generate battle: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Complete flow: analyze images → reconstruct → generate battle
   */
  async processFullFlow(
    images: Array<{ file: File; id: string }>,
    participantNames: { A: string; B: string },
    onProgress?: (stage: string, progress: number) => void
  ): Promise<{
    extractions: ImageExtractionResult[];
    timeline: ReconstructedTimeline;
    battleResult: BattleResult;
    analysisResult: AnalysisResult;
  }> {
    // Stage 1: Analyze images
    onProgress?.("analyzing", 0);
    const extractions = await this.analyzeImages(images, (completed, total) => {
      onProgress?.("analyzing", (completed / total) * 33);
    });
    onProgress?.("analyzing", 33);

    // Stage 2: Reconstruct timeline
    onProgress?.("reconstructing", 33);
    const timeline = await this.reconstructTimeline({ extractions });
    onProgress?.("reconstructing", 66);

    // Stage 3: Generate battle
    onProgress?.("generating", 66);
    const { battleResult, analysisResult } = await this.generateBattle({
      timeline,
      participantNames,
    });
    onProgress?.("complete", 100);

    return { extractions, timeline, battleResult, analysisResult };
  }
}

// Singleton instance
export const battleApi = new BattleApiService();

