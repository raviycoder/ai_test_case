import React, { useEffect, useState } from "react";
import { Progress } from "../ui/progress";
import { Clock, FileText } from "lucide-react";

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

export const TestGenerationProgress: React.FC<TestGenerationProgressProps> = ({
  isGenerating,
  progress,
  currentStep,
  currentMessage,
  sessionId,
  filePath,
}) => {
  const [persistedProgress, setPersistedProgress] = useState<ProgressData | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<string>("");

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
        console.error("Failed to parse persisted progress:", error);
        localStorage.removeItem(PROGRESS_STORAGE_KEY);
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

  // Update elapsed time
  useEffect(() => {
    if (persistedProgress?.startedAt) {
      const updateTime = () => {
        const startTime = new Date(persistedProgress.startedAt).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        if (minutes > 0) {
          setTimeElapsed(`${minutes}m ${seconds}s`);
        } else {
          setTimeElapsed(`${seconds}s`);
        }
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [persistedProgress?.startedAt]);

  // Determine what to show - current or persisted data
  const showProgress = isGenerating || persistedProgress;
  const displayProgress = isGenerating ? progress : (persistedProgress?.progress || 0);
  const displayStep = isGenerating ? currentStep : (persistedProgress?.currentStep || "");
  const displayMessage = isGenerating ? currentMessage : (persistedProgress?.currentMessage || "");
  const displayFilePath = filePath || persistedProgress?.filePath;

  if (!showProgress) return null;

  const isCompleted = displayProgress >= 100;
  const isPersisted = !isGenerating && !!persistedProgress;

  return (
    <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isCompleted ? "Generation Complete!" : "Generation Progress"}
          </span>
          {isPersisted && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
              Restored
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {timeElapsed && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{timeElapsed}</span>
            </div>
          )}
          <span>{displayProgress}%</span>
        </div>
      </div>
      
      <Progress 
        value={displayProgress} 
        className={`w-full ${isCompleted ? 'bg-green-100' : ''}`}
      />
      
      <div className="space-y-1">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{displayStep}:</span> {displayMessage}
        </div>
        
        {displayFilePath && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FileText className="h-3 w-3" />
            <span>{displayFilePath}</span>
          </div>
        )}
        
        {isPersisted && (
          <div className="text-xs text-orange-600 mt-2">
            ⚡ Progress restored from previous session. The generation may still be running in the background.
          </div>
        )}
      </div>
    </div>
  );
};
