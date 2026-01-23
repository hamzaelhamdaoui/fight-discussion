"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWizardStore } from "@/stores/wizard-store";
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
  const { images, addImages, removeImage, nextStep, isProcessing } =
    useWizardStore();

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

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_TYPES,
      maxSize: MAX_FILE_SIZE,
      maxFiles: MAX_FILES - images.length,
      disabled: images.length >= MAX_FILES,
    });

  const canProceed = images.length >= 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Upload Screenshots</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drop your conversation screenshots here - they can be out of order!
        </p>
      </div>

      {/* Dropzone */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          isDragActive && "border-primary bg-primary/5",
          images.length >= MAX_FILES && "opacity-50 cursor-not-allowed"
        )}
      >
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={cn(
              "flex flex-col items-center justify-center px-4 py-8 text-center cursor-pointer",
              images.length >= MAX_FILES && "pointer-events-none"
            )}
          >
            <input {...getInputProps()} />
            <div
              className={cn(
                "mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors",
                isDragActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              <Upload className="h-8 w-8" />
            </div>
            <p className="font-medium">
              {isDragActive
                ? "Drop images here..."
                : "Tap to select or drag images"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, WEBP up to 10MB each ({images.length}/{MAX_FILES})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error messages */}
      {fileRejections.length > 0 && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              {fileRejections[0].errors[0].code === "file-too-large"
                ? "File is too large (max 10MB)"
                : fileRejections[0].errors[0].code === "file-invalid-type"
                ? "Invalid file type"
                : "Error uploading file"}
            </span>
          </div>
        </div>
      )}

      {/* Image previews */}
      <AnimatePresence mode="popLayout">
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                Uploaded ({images.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Drag to reorder
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                >
                  {image.preview ? (
                    <Image
                      src={image.preview}
                      alt={`Screenshot ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}

                  {/* Status indicator */}
                  {image.status === "processing" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}

                  {image.status === "error" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-destructive/80">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80 touch-target"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>

                  {/* Index badge */}
                  <div className="absolute bottom-1 left-1 flex h-5 min-w-5 items-center justify-center rounded bg-black/60 px-1 text-[10px] font-bold text-white">
                    {index + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue button */}
      <div className="pt-4">
        <Button
          size="lg"
          className="w-full"
          disabled={!canProceed || isProcessing}
          onClick={nextStep}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue to Names"
          )}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {canProceed
            ? "Your images will be analyzed by AI"
            : "Add at least 1 screenshot to continue"}
        </p>
      </div>
    </div>
  );
}
