import React, { useEffect, useState } from "react";
import { AILoader } from "../ui/ai-loader";
import { toast } from "sonner";

interface TestGenerationProgressProps {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  currentMessage: string;
  sessionId?: string;
  filePath?: string;
}

interface ProgressData {
  sessionId: string;
  filePath?: string;
  progress: number;
  currentStep: string;
  currentMessage: string;
  startedAt: string;
  lastUpdated: string;
}

const PROGRESS_STORAGE_KEY = "test-generation-progress";

// Transform step names to shorter, two-word versions
const formatStep = (step: string): string => {
  const stepMap: Record<string, string> = {
    "initializing": "Starting\nUp",
    "analyzing": "Reading\nCode",
    "analyzing_files": "Reading\nFiles",
    "planning_tests": "Planning\nTests",
    "generating_tests": "Generating\nCode",
    "generating": "Generating\nCode",
    "validating": "Checking\nCode",
    "validating_tests": "Checking\nTests",
    "saving": "Saving\nFile",
    "saving_files": "Saving\nFiles",
    "compressing": "Compressing\nData",
    "finalizing": "Finishing\nUp",
    "completed": "Test\nComplete",
    "error": "Error\nOccurred",
    "cancelled": "Task\nCancelled",
    "preparing": "Preparing\nFiles",
    "processing": "Processing\nData",
    "reviewing": "Reviewing\nCode",
    "optimizing": "Optimizing\nTests"
  };

  // Try exact match first
  if (stepMap[step.toLowerCase()]) {
    return stepMap[step.toLowerCase()];
  }

  // Try partial matches for complex step names
  const lowerStep = step.toLowerCase();
  if (lowerStep.includes("generat")) return "Generating\nCode";
  if (lowerStep.includes("analyz") || lowerStep.includes("read")) return "Reading\nCode";
  if (lowerStep.includes("valid") || lowerStep.includes("check")) return "Checking\nCode";
  if (lowerStep.includes("sav")) return "Saving\nFile";
  if (lowerStep.includes("plan")) return "Planning\nTests";
  if (lowerStep.includes("final") || lowerStep.includes("finish")) return "Finishing\nUp";
  if (lowerStep.includes("complet")) return "Test\nComplete";
  if (lowerStep.includes("error")) return "Error\nOccurred";
  if (lowerStep.includes("prepar")) return "Preparing\nFiles";
  if (lowerStep.includes("process")) return "Processing\nData";

  // Fallback: split long step names into two words
  const words = step.split(/[\s_-]+/).filter(word => word.length > 0);
  if (words.length >= 2) {
    return `${words[0]}\n${words[1]}`;
  } else if (words.length === 1 && words[0].length > 6) {
    // Split single long word in half
    const word = words[0];
    const mid = Math.ceil(word.length / 2);
    return `${word.slice(0, mid)}\n${word.slice(mid)}`;
  }

  return step || "Working\nOn It";
};

export const TestGenerationProgress: React.FC<TestGenerationProgressProps> = ({
  isGenerating,
  progress,
  currentStep,
  currentMessage,
  sessionId,
  filePath,
}) => {
  const [persistedProgress, setPersistedProgress] = useState<ProgressData | null>(null);

  // Load persisted progress on component mount
  useEffect(() => {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: ProgressData = JSON.parse(stored);
        // Only restore if it's for the current session
        if (sessionId && parsed.sessionId === sessionId) {
          setPersistedProgress(parsed);
        } else if (!sessionId) {
          // If no current sessionId, show any persisted progress
          setPersistedProgress(parsed);
        }
      } catch (error) {
        toast.error("Failed to load saved progress. Starting fresh.", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
        localStorage.removeItem(PROGRESS_STORAGE_KEY);
        setPersistedProgress(null);
      }
    }
  }, [sessionId]);

  // Save progress to localStorage when generating
  useEffect(() => {
    if (isGenerating && sessionId) {
      const progressData: ProgressData = {
        sessionId,
        filePath,
        progress,
        currentStep,
        currentMessage,
        startedAt: persistedProgress?.startedAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressData));
      setPersistedProgress(progressData);
    }
  }, [isGenerating, progress, currentStep, currentMessage, sessionId, filePath, persistedProgress?.startedAt]);

  // Clear localStorage when generation completes
  useEffect(() => {
    if (!isGenerating && progress >= 100 && sessionId) {
      // Wait a bit before clearing to allow user to see completion
      const timeout = setTimeout(() => {
        localStorage.removeItem(PROGRESS_STORAGE_KEY);
        setPersistedProgress(null);
      }, 5000); // Clear after 5 seconds

      return () => clearTimeout(timeout);
    }
  }, [isGenerating, progress, sessionId]);

  // Determine what to show - current or persisted data
  const showProgress = isGenerating || persistedProgress;
  const displayStep = isGenerating ? currentStep : (persistedProgress?.currentStep || "");

  // Format the step name to be shorter and more readable
  const formattedStep = formatStep(displayStep);

  if (!showProgress) return null;

  return (
    <div className="flex h-[90vh] justify-center items-center p-8">
      <div className="text-center space-y-4">
        <AILoader size={180} text={formattedStep} />
      </div>
    </div>
  );
};
