"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Loader2, ChevronRight, ImagePlus } from "lucide-react";
import { useWizardStore } from "@/stores/wizard-store";
import { useTranslations } from "@/hooks/use-translations";
import { battleApi } from "@/services/api/battle-api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/heic": [".heic"],
};

export function UploadStep() {
  const { images, addImages, removeImage, nextStep, isProcessing, setIsProcessing, setImageExtractionResult, updateImageStatus } =
    useWizardStore();
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const t = useTranslations();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remainingSlots = MAX_FILES - images.length;
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);
      if (filesToAdd.length > 0) {
        addImages(filesToAdd);
      }
    },
    [images.length, addImages]
  );

  const handleContinue = async () => {
    const allAnalyzed = images.every((img) => img.extractionResult);
    if (allAnalyzed) {
      nextStep();
      return;
    }

    const imagesToAnalyze = images.filter((img) => img.file && !img.extractionResult);
    if (imagesToAnalyze.length === 0) {
      nextStep();
      return;
    }

    setIsAnalyzing(true);
    setIsProcessing(true);
    setAnalyzeProgress(0);

    imagesToAnalyze.forEach((img) => updateImageStatus(img.id, "processing"));

    let completed = 0;
    let hasError = false;

    for (const img of imagesToAnalyze) {
      if (!img.file) continue;

      try {
        const base64 = await battleApi.fileToBase64(img.file);
        const result = await battleApi.analyzeImage({ imageBase64: base64, imageId: img.id });
        setImageExtractionResult(img.id, result);
        completed++;
        setAnalyzeProgress(Math.round((completed / imagesToAnalyze.length) * 100));
      } catch (err) {
        hasError = true;
        updateImageStatus(img.id, "error", (err as Error).message);
        toast({
          title: t.upload.errors.analysisFailed,
          description: `${t.upload.errors.analysisFailed} ${completed + 1}: ${(err as Error).message}`,
          variant: "destructive",
        });
        break;
      }
    }

    setIsAnalyzing(false);
    setIsProcessing(false);

    if (!hasError) {
      nextStep();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES - images.length,
    disabled: images.length >= MAX_FILES,
  });

  const canProceed = images.length >= 1;

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white font-space-grotesk">{t.upload.title}</h1>
        <p className="mt-2 text-sm text-white/60 font-inter">
          {t.upload.subtitle}
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
          "bg-gradient-to-b from-cinder-light/80 to-cinder/80 backdrop-blur-sm",
          isDragActive
            ? "border-cyan bg-cyan-10 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
            : "border-white/10 hover:border-cyan/40",
          images.length >= MAX_FILES && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-10 via-transparent to-orange-10 opacity-50 pointer-events-none" />

        <div className="relative flex flex-col items-center text-center py-10 px-6">
          {/* Upload icon with glow */}
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all",
            "bg-gradient-to-br from-cyan/20 to-cyan/10 border border-cyan/30",
            isDragActive && "shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-110"
          )}>
            <Upload className={cn(
              "w-8 h-8 transition-colors",
              isDragActive ? "text-cyan" : "text-cyan/80"
            )} />
          </div>

          {/* Text */}
          <p className="text-base text-white font-medium font-space-grotesk">
            {isDragActive ? t.upload.dropzone.active : t.upload.dropzone.inactive}
          </p>

          <p className="mt-2 text-xs text-white/40 font-inter">
            PNG, JPG, WEBP hasta 10MB ({images.length}/{MAX_FILES})
          </p>

          {/* Select button inside dropzone */}
          <button
            type="button"
            className={cn(
              "mt-5 px-6 py-3 rounded-xl text-sm font-semibold transition-all",
              "bg-white/5 border border-white/10 text-white/80",
              "hover:bg-white/10 hover:border-white/20",
              "flex items-center gap-2"
            )}
          >
            <ImagePlus className="w-4 h-4" />
            Seleccionar imágenes
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <AnimatePresence mode="popLayout">
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <p className="text-xs text-white/40 font-semibold tracking-wider uppercase font-inter">
              PREVISUALIZACIÓN
            </p>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative flex-shrink-0 w-24 h-32 rounded-xl overflow-hidden bg-cinder-light border border-white/10 group"
                >
                  {image.preview ? (
                    <Image
                      src={image.preview}
                      alt={`Screenshot ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                    </div>
                  )}

                  {/* Processing overlay */}
                  {image.status === "processing" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-cinder/80 backdrop-blur-sm">
                      <Loader2 className="h-5 w-5 animate-spin text-cyan" />
                    </div>
                  )}

                  {/* Number badge - top left, cyan color */}
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-cyan flex items-center justify-center shadow-lg shadow-cyan/30">
                    <span className="text-[10px] font-bold text-cinder">{index + 1}</span>
                  </div>

                  {/* Remove button - top right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-cinder-light border border-cyan/20 p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-cyan" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white font-space-grotesk">{t.upload.analyzing}</p>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan to-cyan/60 rounded-full"
                  animate={{ width: `${analyzeProgress}%` }}
                  transition={{ type: "spring", stiffness: 100 }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-cyan font-space-grotesk">{analyzeProgress}%</span>
          </div>
        </motion.div>
      )}

      {/* Continue Button */}
      <button
        disabled={!canProceed || isProcessing || isAnalyzing}
        onClick={handleContinue}
        className={cn(
          "w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 font-space-grotesk",
          canProceed && !isProcessing && !isAnalyzing
            ? "bg-blue hover:bg-blue/90 shadow-lg shadow-blue/30"
            : "bg-white/10 text-white/40 cursor-not-allowed"
        )}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t.upload.analyzing}
          </>
        ) : isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t.upload.processing}
          </>
        ) : (
          <>
            {t.upload.continue}
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
