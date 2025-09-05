import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { getTestFileByPath } from "@/lib/apis/ai-test-api";
import { convertToText } from "./use-convert-to-text";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

// Configure axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

interface BackgroundTestGenerationOptions {
  testTypes?: string[];
  coverage?: "basic" | "comprehensive";
  includeEdgeCases?: boolean;
  mockExternal?: boolean;
}

interface BackgroundTestGenerationRequest {
  repositoryId: string;
  sessionId?: string;
  files: Array<{
    path: string;
    content: string;
    framework?: string;
  }>;
  framework: string;
  repoBranch?: string;
  options?: BackgroundTestGenerationOptions;
}

interface GeneratedTest {
  filePath: string;
  testCode: string;
  summary: {
    description: string;
    testCount: number;
    coverageAreas: string[];
    framework: string;
    dependencies: string[];
  };
  validation: {
    isValid: boolean;
    syntax: { valid: boolean; errors?: string[] };
    logic: { valid: boolean; warnings?: string[] };
    coverage: { estimated: number; gaps?: string[] };
    suggestions?: string[];
  };
  metadata: {
    generatedAt: Date;
    tokensUsed: { prompt: number; response: number };
    model: string;
    processingTime: number;
  };
}

interface ProgressUpdate {
  type: string;
  step?: string;
  message?: string;
  progress?: number;
  currentFile?: string;
  fileIndex?: number;
  totalFiles?: number;
  timestamp: string;
  generatedTest?: GeneratedTest;
  generatedTests?: GeneratedTest[];
}

interface BackgroundTestGenerationResult {
  sessionId: string;
  eventId: string;
  status: string;
  totalFiles: number;
  framework: string;
  estimatedTime: string;
}

interface UseRealtimeTestGenerationOptions {
  onProgress?: (update: ProgressUpdate) => void;
  onComplete?: (result: ProgressUpdate) => void;
  onError?: (error: string) => void;
}

const testGenerationApi = {
  // Trigger background test generation
  triggerGeneration: async (request: BackgroundTestGenerationRequest): Promise<BackgroundTestGenerationResult> => {
    const response = await apiClient.post("/inngest/trigger", request);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to start background generation");
    }
    return response.data.data;
  },

  // Get realtime token
  getRealtimeToken: async (sessionId: string): Promise<string> => {
    const response = await apiClient.get(`/realtime/token/${sessionId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get realtime token");
    }
    return response.data.data.token;
  },
};

export const useRealtimeTestGeneration = (options: UseRealtimeTestGenerationOptions = {}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [generatedTest, setGeneratedTest] = useState<GeneratedTest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [realtimeToken, setRealtimeToken] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [generatingFilePaths, setGeneratingFilePaths] = useState<Set<string>>(new Set());
  
  const userStoppedRef = useRef(false);
  
  const location = useLocation();
  const params = useParams();
  const searchParams = new URLSearchParams(location.search || window.location.search);
  const urlTestFilePath = searchParams.get("_file");
  const routeSessionId = params.sessionId;

  // Store progress in localStorage with file-specific keys
  const storeProgress = useCallback((data: {
    sessionId: string;
    filePath?: string;
    progress: number;
    currentStep: string;
    currentMessage: string;
    isGenerating: boolean;
    isComplete?: boolean;
    generatingFiles?: string[];
  }) => {
    try {
      // Store global session progress
      localStorage.setItem("test-generation-progress", JSON.stringify({
        sessionId: data.sessionId,
        isGenerating: data.isGenerating,
        isComplete: data.isComplete || false,
        generatingFiles: data.generatingFiles || []
      }));
      
      // Store file-specific progress if filePath is provided
      if (data.filePath) {
        const fileProgressKey = `test-generation-progress-${data.sessionId}-${encodeURIComponent(data.filePath)}`;
        localStorage.setItem(fileProgressKey, JSON.stringify({
          filePath: data.filePath,
          progress: data.progress,
          currentStep: data.currentStep,
          currentMessage: data.currentMessage,
          isGenerating: data.isGenerating,
          isComplete: data.isComplete || false,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      toast.error("Failed to store progress.", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, []);

  // Helper function to get file-specific progress
  const getFileProgress = useCallback((filePath: string, sessionId: string) => {
    try {
      const fileProgressKey = `test-generation-progress-${sessionId}-${encodeURIComponent(filePath)}`;
      const stored = localStorage.getItem(fileProgressKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      toast.error("Failed to retrieve file progress.", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
    return null;
  }, []);

  // Helper function to check if a specific file is generating
  const isFileGenerating = useCallback((filePath: string) => {
    if (!sessionId) return false;
    const fileProgress = getFileProgress(filePath, sessionId);
    return fileProgress?.isGenerating && !fileProgress?.isComplete;
  }, [sessionId, getFileProgress]);

  // Helper function to clear file-specific progress
  const clearFileProgress = useCallback((filePath: string, sessionId: string) => {
    try {
      const fileProgressKey = `test-generation-progress-${sessionId}-${encodeURIComponent(filePath)}`;
      localStorage.removeItem(fileProgressKey);
    } catch (error) {
      toast.error("Failed to clear file progress.", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, []);

  // Restore progress from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("test-generation-progress");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.sessionId) {
          
          // If we have a specific file path, restore file-specific progress
          if (urlTestFilePath) {
            const fileProgress = getFileProgress(urlTestFilePath, parsed.sessionId);
            if (fileProgress) {
              setProgress(fileProgress.progress || 0);
              setCurrentStep(fileProgress.currentStep || "");
              setCurrentMessage(fileProgress.currentMessage || "");
              setIsGenerating(fileProgress.isGenerating && !fileProgress.isComplete);
              setIsComplete(fileProgress.isComplete || false);
              
              // Update generatingFilePaths set
              if (fileProgress.isGenerating && !fileProgress.isComplete) {
                setGeneratingFilePaths(prev => new Set([...prev, urlTestFilePath]));
              }
            }
          } else {
            // If no specific file, check if any generation is ongoing
            setIsGenerating(parsed.isGenerating && !parsed.isComplete);
            setIsComplete(parsed.isComplete || false);
            if (parsed.generatingFiles) {
              setGeneratingFilePaths(new Set(parsed.generatingFiles));
            }
          }
        }
      } catch (error) {
        localStorage.removeItem("test-generation-progress");
        toast.error("Failed to restore persisted progress.", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }, [urlTestFilePath, getFileProgress]);

  // Get realtime token when sessionId changes
  useEffect(() => {
    if (sessionId && !realtimeToken) {
      testGenerationApi.getRealtimeToken(sessionId)
        .then(token => {
          setRealtimeToken(token);
        })
        .catch(error => {
          setError("Failed to get realtime token");
          return error;
        });
    }
  }, [sessionId, realtimeToken]);

  // Inngest Realtime subscription
  const { latestData, error: subscriptionError } = useInngestSubscription({
    token: realtimeToken as unknown as Parameters<typeof useInngestSubscription>[0]["token"],
    enabled: !!realtimeToken && isGenerating,
    bufferInterval: 100,
  });

  // Trigger test generation mutation
  const triggerGenerationMutation = useMutation({
    mutationFn: testGenerationApi.triggerGeneration,
    onSuccess: (result) => {
      setSessionId(result.sessionId);
      setIsGenerating(true);
      setCurrentMessage("Background job started, waiting for real-time updates...");
      setError(null);
    },
    onError: (error: Error) => {
      setIsGenerating(false);
      setError(error.message || "Failed to start background test generation");
    },
  });

  // Fetch complete test data after generation completes
  const fetchCompleteTestData = useCallback(async () => {
    if (!sessionId) return;

    try {
      setCurrentMessage("Fetching complete test data from backend...");
      
      if (urlTestFilePath) {
        // Fetch specific test file
        const testFileDto = await getTestFileByPath(sessionId, urlTestFilePath);

        if (testFileDto) {

          const generatedTestec: GeneratedTest = {
            filePath: testFileDto.data?.originalFilePath || urlTestFilePath,
            testCode: convertToText(testFileDto.data?.testCode as unknown as {data: number[]}, "gzip") || "",
            summary: {
              description: testFileDto.data?.summary?.description || "Generated tests",
              testCount: testFileDto.data?.summary?.testCount || 0,
              coverageAreas: testFileDto.data?.summary?.coverageAreas || [],
              framework: testFileDto.data?.summary?.framework || "unknown",
              dependencies: testFileDto.data?.summary?.dependencies || []
            },
            validation: {
              isValid: testFileDto.data?.validation?.isValid ?? true,
              syntax: testFileDto.data?.validation?.syntax || { valid: true },
              logic: testFileDto.data?.validation?.logic || { valid: true },
              coverage: testFileDto.data?.validation?.coverage || { estimated: 0 }
            },
            metadata: {
              generatedAt: testFileDto.data?.metadata?.generatedAt ? 
                new Date(testFileDto.data.metadata.generatedAt) : new Date(),
              tokensUsed: testFileDto.data?.metadata?.tokensUsed || { prompt: 0, response: 0 },
              model: testFileDto.data?.metadata?.model || "unknown",
              processingTime: testFileDto.data?.metadata?.processingTime || 0
            }
          };

          setGeneratedTest(generatedTestec);
          setCurrentMessage("Test file loaded successfully!");
        }
      }
    } catch (error) {
      toast.error(`Failed to fetch test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [sessionId, urlTestFilePath]);

  // Process realtime updates from Inngest
  useEffect(() => {
    if (latestData && !userStoppedRef.current && isGenerating) {
      const update = latestData.data as ProgressUpdate;

      // Determine if this update is for the current file
      const isCurrentFileUpdate = !urlTestFilePath || 
        !update.currentFile || 
        update.currentFile === urlTestFilePath;

      // Update global progress only if it's for current file or no specific file
      if (isCurrentFileUpdate) {
        // Update progress
        if (update.progress !== undefined) {
          setProgress(update.progress);
        }
        
        // Update step
        if (update.step) {
          setCurrentStep(update.step);
        }
        
        // Update message
        if (update.message) {
          setCurrentMessage(update.message);
        }
      }

      // Update generating files list
      if (update.currentFile) {
        setGeneratingFilePaths(prev => {
          const newSet = new Set(prev);
          if (update.type === "generation_completed" || update.type === "generation_failed") {
            newSet.delete(update.currentFile!);
          } else {
            newSet.add(update.currentFile!);
          }
          return newSet;
        });
      }

      // Store progress in localStorage
      if (sessionId) {
        const currentGeneratingFiles = Array.from(generatingFilePaths);
        if (update.currentFile && update.type !== "generation_completed" && update.type !== "generation_failed") {
          currentGeneratingFiles.push(update.currentFile);
        }

        storeProgress({
          sessionId,
          filePath: update.currentFile || urlTestFilePath || undefined,
          progress: update.progress || progress,
          currentStep: update.step || currentStep,
          currentMessage: update.message || currentMessage,
          isGenerating: update.type !== "generation_completed" && update.type !== "generation_failed",
          isComplete: update.type === "generation_completed",
          generatingFiles: [...new Set(currentGeneratingFiles)]
        });
      }

      // Handle completion
      if (update.type === "generation_completed") {
        
        // Only update UI if this is for the current file or no specific file
        if (isCurrentFileUpdate) {
          setProgress(100);
          setCurrentStep("completed");
          setCurrentMessage("Test generation completed successfully!");
          setIsGenerating(false);
          setIsComplete(true);
        }
        
        // Clear file-specific progress on completion
        if (update.currentFile && sessionId) {
          clearFileProgress(update.currentFile, sessionId);
        }

        // Check if all files are completed
        const remainingFiles = Array.from(generatingFilePaths).filter(file => file !== update.currentFile);
        if (remainingFiles.length === 0) {
          localStorage.removeItem("test-generation-progress");
          setIsGenerating(false);
          setIsComplete(true);
        }

        fetchCompleteTestData();
        
        // Fetch complete test data from backend if it's for current file
        if (isCurrentFileUpdate && sessionId) {
          fetchCompleteTestData();
        }

        options.onComplete?.(update);
        return;
      }

      // Handle failure
      if (update.type === "generation_failed") {
        
        if (isCurrentFileUpdate) {
          setIsGenerating(false);
          setIsComplete(true);
          setError(update.message || "Generation failed");
        }

        // Clear file-specific progress on failure
        if (update.currentFile && sessionId) {
          clearFileProgress(update.currentFile, sessionId);
        }

        options.onError?.(update.message || "Generation failed");
        return;
      }

      options.onProgress?.(update);
    }
  }, [latestData, sessionId, isGenerating, progress, currentStep, currentMessage, storeProgress, options, fetchCompleteTestData, generatedTest, urlTestFilePath, generatingFilePaths, clearFileProgress]);

  // Handle subscription errors
  useEffect(() => {
    if (subscriptionError && !userStoppedRef.current) {
      setIsGenerating(false);
      toast.error(subscriptionError.message || "Subscription failed");
    }
  }, [subscriptionError]);

  // Start background test generation
  const startBackgroundGeneration = useCallback(async (request: BackgroundTestGenerationRequest) => {
    try {
      userStoppedRef.current = false;
      setIsGenerating(true);
      setProgress(0);
      setCurrentStep("starting");
      setCurrentMessage("Initiating background test generation...");
      setGeneratedTest(null);
      setError(null);
      setIsComplete(false);


      // Generate sessionId if not provided
      const clientSessionId = request.sessionId ||
        (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `session_${Date.now()}`);

      // Set sessionId and trigger generation
      setSessionId(clientSessionId);
      
      // Track which files are being generated
      const filePaths = request.files.map(file => file.path);
      setGeneratingFilePaths(new Set(filePaths));
      
      const result = await triggerGenerationMutation.mutateAsync({
        ...request,
        sessionId: clientSessionId,
      });

      return result;
    } catch (error) {
      setIsGenerating(false);
      setIsComplete(true);
      throw error;
    }
  }, [triggerGenerationMutation]);

  // Stop generation
  const stopGeneration = useCallback(async () => {
    userStoppedRef.current = true;
    setIsGenerating(false);
    setIsComplete(true);
    setCurrentMessage("Generation stopped by user");
    
    // Clear all file-specific progress
    if (sessionId) {
      generatingFilePaths.forEach(filePath => {
        clearFileProgress(filePath, sessionId);
      });
    }
    
    // Clear global progress
    localStorage.removeItem("test-generation-progress");
    setGeneratingFilePaths(new Set());
  }, [sessionId, generatingFilePaths, clearFileProgress]);

  // Reset state
  const reset = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setCurrentStep("");
    setCurrentMessage("");
    setSessionId(null);
    setGeneratedTest(null);
    setError(null);
    setRealtimeToken(null);
    setIsComplete(false);
    setGeneratingFilePaths(new Set());
    userStoppedRef.current = false;
    
    // Clear localStorage
    localStorage.removeItem("test-generation-progress");
    
    // Clear all file-specific progress (if we have sessionId)
    const stored = localStorage.getItem("test-generation-progress");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.sessionId && parsed.generatingFiles) {
          parsed.generatingFiles.forEach((filePath: string) => {
            const fileProgressKey = `test-generation-progress-${parsed.sessionId}-${encodeURIComponent(filePath)}`;
            localStorage.removeItem(fileProgressKey);
          });
        }
      } catch (error) {
        toast.error("Failed to clear file-specific progress.", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }, []);

  return {
    // State
    isGenerating,
    error,
    progress,
    currentStep,
    currentMessage,
    sessionId,
    generatedTest,
    isComplete,
    generatingFilePaths,
    
    // URL Parameters
    urlTestFilePath,
    routeSessionId,
    
    // Actions
    startBackgroundGeneration,
    setGeneratedTest,
    stopGeneration,
    setIsGenerating,
    reset,
    
    // File-specific utilities
    isFileGenerating,
    getFileProgress,
    clearFileProgress,
    
    // AI Test Generation integration
  };
};

export default useRealtimeTestGeneration;
