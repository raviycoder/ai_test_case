import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { getTestFileByPath } from "@/lib/apis/ai-test-api";
import { convertToText } from "./use-convert-to-text";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  
  const userStoppedRef = useRef(false);
  
  const location = useLocation();
  const params = useParams();
  const searchParams = new URLSearchParams(location.search || window.location.search);
  const urlTestFilePath = searchParams.get("_file");
  const routeSessionId = params.sessionId;

  // Store progress in localStorage
  const storeProgress = useCallback((data: {
    sessionId: string;
    progress: number;
    currentStep: string;
    currentMessage: string;
    isGenerating: boolean;
  }) => {
    try {
      localStorage.setItem("test-generation-progress", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to store progress:", error);
    }
  }, []);

  // Restore progress from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("test-generation-progress");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.sessionId && parsed.isGenerating) {
          console.log("🔄 Restoring persisted progress:", parsed);
          setSessionId(parsed.sessionId);
          setProgress(parsed.progress || 0);
          setCurrentStep(parsed.currentStep || "");
          setCurrentMessage(parsed.currentMessage || "");
          setIsGenerating(true);
        }
      } catch (error) {
        console.error("Failed to restore persisted progress:", error);
        localStorage.removeItem("test-generation-progress");
      }
    }
  }, []);

  // Get realtime token when sessionId changes
  useEffect(() => {
    if (sessionId && !realtimeToken) {
      testGenerationApi.getRealtimeToken(sessionId)
        .then(token => {
          console.log("🔑 Got realtime token");
          setRealtimeToken(token);
        })
        .catch(error => {
          console.error("❌ Failed to get realtime token:", error);
          setError("Failed to get realtime token");
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
      console.log("✅ Background job triggered:", result);
      setSessionId(result.sessionId);
      setIsGenerating(true);
      setCurrentMessage("Background job started, waiting for real-time updates...");
      setError(null);
    },
    onError: (error: Error) => {
      console.error("❌ Background test generation error:", error);
      setIsGenerating(false);
      setError(error.message || "Failed to start background test generation");
    },
  });

  // Fetch complete test data after generation completes
  const fetchCompleteTestData = useCallback(async () => {
    if (!sessionId) return;

    try {
      console.log("🔄 Fetching complete test data from backend...");
      setCurrentMessage("Fetching complete test data from backend...");
      
      if (urlTestFilePath) {
        // Fetch specific test file
        console.log("📡 Fetching specific test file:", urlTestFilePath);
        const testFileDto = await getTestFileByPath(sessionId, urlTestFilePath);

        if (testFileDto) {

          const generatedTestec: GeneratedTest = {
            filePath: testFileDto.data?.originalFilePath || urlTestFilePath,
            testCode: convertToText(testFileDto.data?.testCode as unknown as {data: number[]}, "gzip") || "",
            summary: {
              description: testFileDto.data?.summary?.description || "Generated tests",
              testCount: testFileDto.data?.summary?.testCount || 0,
              coverageAreas: testFileDto.data?.summary?.coverageAreas || [],
              framework: "unknown",
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
          console.log("✅ Fetched specific test file:", generatedTestec);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching test data:", error);
      setError(`Failed to fetch test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [sessionId, urlTestFilePath]);

  // Process realtime updates from Inngest
  useEffect(() => {
    if (latestData && !userStoppedRef.current && isGenerating) {
      const update = latestData.data as ProgressUpdate;
      console.log("📊 Received progress update:", update);

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

      // Store progress in localStorage
      if (sessionId) {
        storeProgress({
          sessionId,
          progress: update.progress || progress,
          currentStep: update.step || currentStep,
          currentMessage: update.message || currentMessage,
          isGenerating: true
        });
      }

      // Handle completion
      if (update.type === "generation_completed") {
        console.log("🎉 Generation completed");
        
        setProgress(100);
        setCurrentStep("completed");
        setCurrentMessage("Test generation completed successfully!");
        setIsGenerating(false);
        
        // Clear localStorage on completion
        localStorage.removeItem("test-generation-progress");

        console.log("🔄 Fetching complete test data after completion...", sessionId, urlTestFilePath);
        
        // Fetch complete test data from backend
        if (update.type === "generation_completed" && sessionId) {
          console.log("✅ Conditions met, fetching complete test data...");
          fetchCompleteTestData();
        }

        console.log("🤖🤖", generatedTest);

        options.onComplete?.(update);
        return;
      }

      options.onProgress?.(update);
    }
  }, [latestData, sessionId, isGenerating, progress, currentStep, currentMessage, storeProgress, options, fetchCompleteTestData, generatedTest, urlTestFilePath]);

  // Handle subscription errors
  useEffect(() => {
    if (subscriptionError && !userStoppedRef.current) {
      console.error("❌ Subscription error:", subscriptionError);
      setIsGenerating(false);
      setError(subscriptionError.message || "Subscription failed");
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

      console.log("🚀 Starting background test generation...", request);

      // Generate sessionId if not provided
      const clientSessionId = request.sessionId ||
        (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `session_${Date.now()}`);

      // Set sessionId and trigger generation
      setSessionId(clientSessionId);
      
      const result = await triggerGenerationMutation.mutateAsync({
        ...request,
        sessionId: clientSessionId,
      });

      return result;
    } catch (error) {
      setIsGenerating(false);
      throw error;
    }
  }, [triggerGenerationMutation]);

  // Stop generation
  const stopGeneration = useCallback(async () => {
    console.log("🛑 User stopping generation");
    userStoppedRef.current = true;
    setIsGenerating(false);
    setCurrentMessage("Generation stopped by user");
    localStorage.removeItem("test-generation-progress");
  }, []);

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
    userStoppedRef.current = false;
    
    // Clear localStorage
    localStorage.removeItem("test-generation-progress");
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
    
    // URL Parameters
    urlTestFilePath,
    routeSessionId,
    
    // Actions
    startBackgroundGeneration,
    stopGeneration,
    reset,
    
    // AI Test Generation integration
  };
};

export default useRealtimeTestGeneration;
