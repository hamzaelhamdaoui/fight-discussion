"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { battleApi } from "@/services/api/battle-api";
import { useWizardStore } from "@/stores/wizard-store";
import { toast } from "@/hooks/use-toast";
import type { ImageExtractionResult } from "@/types";

export type FlowStage = "idle" | "analyzing" | "reconstructing" | "generating" | "complete" | "error";

export function useBattleFlow() {
  const [stage, setStage] = useState<FlowStage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const {
    images,
    participants,
    setImageExtractionResult,
    updateImageStatus,
    setTimeline,
    setBattleResult,
    setAnalysisResult,
    setIsProcessing,
  } = useWizardStore();

  // Mutation for analyzing images
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      setStage("analyzing");
      setProgress(0);
      setIsProcessing(true);

      const imagesToAnalyze = images
        .filter((img) => img.file && img.status !== "done")
        .map((img) => ({ file: img.file!, id: img.id }));

      if (imagesToAnalyze.length === 0) {
        // All images already analyzed
        return images
          .filter((img) => img.extractionResult)
          .map((img) => img.extractionResult!);
      }

      // Mark images as processing
      imagesToAnalyze.forEach((img) => updateImageStatus(img.id, "processing"));

      const results: ImageExtractionResult[] = [];

      for (const { file, id } of imagesToAnalyze) {
        try {
          const base64 = await battleApi.fileToBase64(file);
          const result = await battleApi.analyzeImage({ imageBase64: base64, imageId: id });
          setImageExtractionResult(id, result);
          results.push(result);
          setProgress((prev) => Math.min(prev + (100 / imagesToAnalyze.length), 100));
        } catch (err) {
          updateImageStatus(id, "error", (err as Error).message);
          throw err;
        }
      }

      return results;
    },
    onSuccess: () => {
      setStage("complete");
      setIsProcessing(false);
    },
    onError: (err: Error) => {
      setError(err.message);
      setStage("error");
      setIsProcessing(false);
      toast({
        title: "Analysis failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for reconstructing timeline
  const reconstructMutation = useMutation({
    mutationFn: async () => {
      setStage("reconstructing");
      setProgress(0);
      setIsProcessing(true);

      const extractions = images
        .filter((img) => img.extractionResult)
        .map((img) => img.extractionResult!);

      if (extractions.length === 0) {
        throw new Error("No images analyzed yet");
      }

      const timeline = await battleApi.reconstructTimeline({ extractions });
      setTimeline(timeline);
      setProgress(100);
      return timeline;
    },
    onSuccess: () => {
      setStage("complete");
      setIsProcessing(false);
    },
    onError: (err: Error) => {
      setError(err.message);
      setStage("error");
      setIsProcessing(false);
      toast({
        title: "Reconstruction failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for generating battle
  const battleMutation = useMutation({
    mutationFn: async () => {
      setStage("generating");
      setProgress(0);
      setIsProcessing(true);

      const { timeline } = useWizardStore.getState();

      if (!timeline) {
        throw new Error("No timeline available");
      }

      const { battleResult, analysisResult } = await battleApi.generateBattle({
        timeline,
        participantNames: {
          A: participants.A.name,
          B: participants.B.name,
        },
      });

      setBattleResult(battleResult);
      setAnalysisResult(analysisResult);
      setProgress(100);
      return { battleResult, analysisResult };
    },
    onSuccess: () => {
      setStage("complete");
      setIsProcessing(false);
    },
    onError: (err: Error) => {
      setError(err.message);
      setStage("error");
      setIsProcessing(false);
      toast({
        title: "Battle generation failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Full flow mutation
  const fullFlowMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      setError(null);

      // Analyze
      setStage("analyzing");
      await analyzeMutation.mutateAsync();

      // Reconstruct
      setStage("reconstructing");
      await reconstructMutation.mutateAsync();

      // Generate battle
      setStage("generating");
      await battleMutation.mutateAsync();

      setStage("complete");
    },
    onError: (err: Error) => {
      setError(err.message);
      setStage("error");
      setIsProcessing(false);
    },
  });

  const analyzeImages = useCallback(() => {
    return analyzeMutation.mutateAsync();
  }, [analyzeMutation]);

  const reconstructTimeline = useCallback(() => {
    return reconstructMutation.mutateAsync();
  }, [reconstructMutation]);

  const generateBattle = useCallback(() => {
    return battleMutation.mutateAsync();
  }, [battleMutation]);

  const runFullFlow = useCallback(() => {
    return fullFlowMutation.mutateAsync();
  }, [fullFlowMutation]);

  const reset = useCallback(() => {
    setStage("idle");
    setProgress(0);
    setError(null);
  }, []);

  return {
    stage,
    progress,
    error,
    isLoading: analyzeMutation.isPending || reconstructMutation.isPending || battleMutation.isPending,
    analyzeImages,
    reconstructTimeline,
    generateBattle,
    runFullFlow,
    reset,
  };
}

