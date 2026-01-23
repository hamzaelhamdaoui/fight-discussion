import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  WizardStep,
  UploadedImage,
  Participant,
  ReconstructedTimeline,
  BattleResult,
  AnalysisResult,
  Speaker,
} from "@/types";
import { generateId } from "@/lib/utils";

interface WizardStore {
  // State
  currentStep: WizardStep;
  images: UploadedImage[];
  participants: {
    A: Participant;
    B: Participant;
  };
  timeline: ReconstructedTimeline | null;
  battleResult: BattleResult | null;
  analysisResult: AnalysisResult | null;
  isProcessing: boolean;

  // Actions
  setStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Image actions
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  updateImageStatus: (
    id: string,
    status: UploadedImage["status"],
    error?: string
  ) => void;
  setImageExtractionResult: (
    id: string,
    result: UploadedImage["extractionResult"]
  ) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;

  // Participant actions
  setParticipantName: (speaker: Speaker, name: string) => void;
  setParticipantAvatar: (speaker: Speaker, avatar: string) => void;

  // Timeline actions
  setTimeline: (timeline: ReconstructedTimeline) => void;

  // Battle actions
  setBattleResult: (result: BattleResult) => void;
  setAnalysisResult: (result: AnalysisResult) => void;

  // Processing
  setIsProcessing: (isProcessing: boolean) => void;

  // Reset
  reset: () => void;
}

const STEP_ORDER: WizardStep[] = [
  "upload",
  "participants",
  "review",
  "battle",
  "results",
];

const initialParticipants: WizardStore["participants"] = {
  A: { id: "A", name: "Person A", color: "hsl(217 91% 60%)" },
  B: { id: "B", name: "Person B", color: "hsl(346 77% 49%)" },
};

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: "upload",
      images: [],
      participants: initialParticipants,
      timeline: null,
      battleResult: null,
      analysisResult: null,
      isProcessing: false,

      // Step navigation
      setStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const currentIndex = STEP_ORDER.indexOf(get().currentStep);
        if (currentIndex < STEP_ORDER.length - 1) {
          set({ currentStep: STEP_ORDER[currentIndex + 1] });
        }
      },

      prevStep: () => {
        const currentIndex = STEP_ORDER.indexOf(get().currentStep);
        if (currentIndex > 0) {
          set({ currentStep: STEP_ORDER[currentIndex - 1] });
        }
      },

      // Image management
      addImages: (files) => {
        const newImages: UploadedImage[] = files.map((file) => ({
          id: generateId(),
          file,
          preview: URL.createObjectURL(file),
          status: "pending",
        }));
        set((state) => ({ images: [...state.images, ...newImages] }));
      },

      removeImage: (id) => {
        set((state) => {
          const image = state.images.find((img) => img.id === id);
          if (image?.preview) {
            URL.revokeObjectURL(image.preview);
          }
          return { images: state.images.filter((img) => img.id !== id) };
        });
      },

      updateImageStatus: (id, status, error) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id ? { ...img, status, error } : img
          ),
        }));
      },

      setImageExtractionResult: (id, result) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id
              ? { ...img, extractionResult: result, status: "done" }
              : img
          ),
        }));
      },

      reorderImages: (fromIndex, toIndex) => {
        set((state) => {
          const newImages = [...state.images];
          const [removed] = newImages.splice(fromIndex, 1);
          newImages.splice(toIndex, 0, removed);
          return { images: newImages };
        });
      },

      // Participants
      setParticipantName: (speaker, name) => {
        set((state) => ({
          participants: {
            ...state.participants,
            [speaker]: { ...state.participants[speaker], name },
          },
        }));
      },

      setParticipantAvatar: (speaker, avatar) => {
        set((state) => ({
          participants: {
            ...state.participants,
            [speaker]: { ...state.participants[speaker], avatar },
          },
        }));
      },

      // Timeline
      setTimeline: (timeline) => set({ timeline }),

      // Battle
      setBattleResult: (result) => set({ battleResult: result }),
      setAnalysisResult: (result) => set({ analysisResult: result }),

      // Processing
      setIsProcessing: (isProcessing) => set({ isProcessing }),

      // Reset
      reset: () => {
        const state = get();
        // Clean up blob URLs
        state.images.forEach((img) => {
          if (img.preview) {
            URL.revokeObjectURL(img.preview);
          }
        });
        set({
          currentStep: "upload",
          images: [],
          participants: initialParticipants,
          timeline: null,
          battleResult: null,
          analysisResult: null,
          isProcessing: false,
        });
      },
    }),
    {
      name: "fight-replay-wizard",
      partialize: (state) => ({
        // Don't persist File objects or blob URLs
        currentStep: state.currentStep,
        participants: state.participants,
        timeline: state.timeline,
        battleResult: state.battleResult,
        analysisResult: state.analysisResult,
      }),
    }
  )
);
