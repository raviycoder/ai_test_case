/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { ungzip } from "pako";
import type { ReactNode } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/";

// Configure axios for AI test endpoints
const aiTestApi = axios.create({
  baseURL: `${API_BASE_URL}/api/ai-tests`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Configure axios for Inngest endpoints
const inngestApi = axios.create({
  baseURL: `${API_BASE_URL}/api/inngest`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types for AI test generation
export interface DirectTestGenerationRequest {
  repositoryId: string;
  repoBranch?: string;
  files: Array<{
    path: string;
    content: string;
    framework?: string;
  }>;
  framework: string;
  options?: {
    testTypes?: string[];
    coverage?: "basic" | "comprehensive";
    includeEdgeCases?: boolean;
    mockExternal?: boolean;
  };
}

export interface TestGenerationRequest {
  sessionId: string;
  files: Array<{
    path: string;
    content: string;
    framework?: string;
  }>;
  framework: string;
  options?: {
    testTypes?: string[];
    coverage?: "basic" | "comprehensive";
    includeEdgeCases?: boolean;
    mockExternal?: boolean;
  };
}

export interface ValidationResult {
  isValid: boolean;
  syntax: { valid: boolean; errors?: string[] };
  logic: { valid: boolean; warnings?: string[] };
  coverage: { estimated: number; gaps?: string[] };
  suggestions?: string[];
}

export interface GeneratedTest {
  filePath: string;
  testCode: string;
  summary: {
    description: string;
    testCount: number;
    coverageAreas: string[];
    framework: string;
    dependencies: string[];
  };
  validation: ValidationResult;
  metadata: {
    generatedAt: Date;
    tokensUsed: { prompt: number; response: number };
    model: string;
    processingTime: number;
  };
}

export interface TestSession {
  sessionId: string;
  repositoryId?: string;
  repoBranch?: string;
  defaultPath?: string;
  status: "pending" | "processing" | "completed" | "failed";
  framework: string;
  selectedFiles: Array<{
    testFileId: string;
    path: string;
    framework: string;
    aiProvider: string;
    aiModel: string;
    promptTokens: number;
    responseTokens: number;
    included: boolean;
  }>;
  countFiles: number;
  processingTimeMs: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface CodeSummary {
  summary: {
    purpose: string;
    mainFeatures: string[];
    complexity: string;
    linesOfCode: number;
    maintainability: string;
  };
  structure: {
    functions: Array<{ name: string; purpose: string; complexity: string }>;
    classes: Array<{ name: string; purpose: string }>;
    exports: string[];
    dependencies: string[];
  };
  quality: {
    score: number;
    strengths: string[];
    improvements: string[];
    testability: string;
  };
}

export interface GenerationResult {
  success: boolean;
  generatedTests: GeneratedTest[];
  summary: {
    totalFiles: number;
    successfulTests: number;
    failedTests: number;
    totalTestCount: number;
    averageCoverage: number;
    processingTime: number;
  };
}

export interface GenerationUpdate {
  type:
    | "steps"
    | "progress"
    | "file_analysis"
    | "test_generated"
    | "error"
    | "completed"
    | "completion"
    | "session_created"
    | "warning";
  data: {
    step?: string;
    message?: string;
    progress?: number;
    fileIndex?: number;
    totalFiles?: number;
    successfulTests?: number;
    processingTime?: number;
    filePath?: string;
    summary?: CodeSummary;
    validation?: ValidationResult;
    error?: string;
    success?: boolean;
    generatedTests?: GeneratedTest[];
    sessionId?: string;
  } & GenerationResult;
}

// API DTOs for persisted test files
export type CoverageScore = "excellent" | "good" | "fair" | "poor";

export interface ValidationSummaryDto {
  score: number;
  issues: number;
  status: CoverageScore;
}

export interface TestFileSummaryDto {
  description: string;
  testCount: number;
  coverageAreas: string[];
  framework: string;
  dependencies: string[];
}

export interface TestFileMetadataDto {
  generatedAt: string | Date;
  tokensUsed: { prompt: number; response: number };
  model: string;
  processingTime: number;
  aiProvider?: string;
}

export interface TestFileDto {
  validation: any;
  originalFilePath: ReactNode;
  summary: any;
  coverageScore: any;
  metadata: any;
  status: ReactNode;
  sessionId: ReactNode;
  validationSummary: any;
  testCode:any;
  suggestedTestFileName: string;
  data: {
    sessionId: string;
    id: string;
    originalFilePath: string;
    testFilePath?: string | null;
    suggestedTestFileName: string;
    testCode: string;
    summary: TestFileSummaryDto;
    validation: ValidationResult;
    metadata: TestFileMetadataDto;
    status: string;
    validationSummary: ValidationSummaryDto;
    coverageScore: CoverageScore;
  };
}

// Create a new test session
export const createTestSession = async (
  repositoryId: string,
  framework = "jest",
  session_id: string,
  repoBranch: string
): Promise<TestSession> => {
  const response = await aiTestApi.post("/sessions", {
    repositoryId,
    framework,
    session_id,
    repoBranch,
  });
  return response.data.data;
};

// Get test session status
export const getTestStatus = async (
  sessionId: string
): Promise<TestSession> => {
  const response = await aiTestApi.get(`/sessions/${sessionId}/status`);
  return response.data.data;
};

// Get all user sessions
export const getUserSessions = async (): Promise<TestSession[]> => {
  const response = await aiTestApi.get("/sessions");
  return response.data.data;
};

// Generate tests with real-time updates
export const generateTests = async (
  request: TestGenerationRequest,
  onUpdate?: (update: GenerationUpdate) => void
): Promise<GenerationResult> => {
  return new Promise((resolve, reject) => {
    // Use fetch for streaming response
    fetch(`${API_BASE_URL}/api/ai-tests/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(request),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Response body is not readable");
        }

        const decoder = new TextDecoder();
        let finalResult: GenerationResult | null = null;

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim());

            for (const line of lines) {
              try {
                const update: GenerationUpdate = JSON.parse(line);

                if (onUpdate) {
                  onUpdate(update);
                }

                if (update.type === "completed") {
                  finalResult = {
                    success: update.data.success || false,
                    generatedTests: update.data.generatedTests || [],
                    summary: update.data.summary || {
                      totalFiles: 0,
                      successfulTests: 0,
                      failedTests: 0,
                      totalTestCount: 0,
                      averageCoverage: 0,
                      processingTime: 0,
                    },
                  };
                } else if (update.type === "error") {
                  throw new Error(
                    update.data.error || "Test generation failed"
                  );
                }
              } catch (parseError) {
                console.warn("Failed to parse streaming update:", parseError);
              }
            }
          }

          if (finalResult) {
            resolve(finalResult);
          } else {
            throw new Error("No final result received");
          }
        } catch (streamError) {
          reader.releaseLock();
          throw streamError;
        }
      })
      .catch(reject);
  });
};

export const deleteTestFileApi = async (
  sessionId: string,
  filePath: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Encode the filePath to handle special characters and spaces
    const encodedFilePath = encodeURIComponent(filePath);
    const response = await aiTestApi.delete(`/${sessionId}/${encodedFilePath}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting test file:", error);
    return { success: false, message: "Failed to delete test file" };
  }
};

// Generate tests directly without requiring a pre-existing session
// Creates session automatically after first successful test generation
export const generateTestsDirect = async (
  request: DirectTestGenerationRequest,
  onUpdate?: (update: GenerationUpdate) => void
): Promise<GenerationResult> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/ai-tests/generate-direct`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate tests");
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let finalResult: GenerationResult | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const update: GenerationUpdate = JSON.parse(line);

            if (onUpdate) {
              onUpdate(update);
            }

            if (update.type === "completion") {
              finalResult = {
                success: true,
                generatedTests: update.data.generatedTests || [],
                summary: {
                  totalFiles: update.data.totalFiles || 0,
                  successfulTests: update.data.successfulTests || 0,
                  failedTests:
                    (update.data.totalFiles || 0) -
                    (update.data.successfulTests || 0),
                  totalTestCount: (update.data.generatedTests || []).reduce(
                    (sum, test) => sum + test.summary.testCount,
                    0
                  ),
                  averageCoverage: 0, // Would need to calculate from tests
                  processingTime: update.data.processingTime || 0,
                },
              };
            } else if (update.type === "error") {
              throw new Error(update.data.error || "Test generation failed");
            }
          } catch (parseError) {
            console.warn("Failed to parse update:", parseError);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (!finalResult) {
      throw new Error("No completion result received");
    }

    return finalResult;
  } catch (error) {
    console.error("Direct test generation error:", error);
    throw error instanceof Error
      ? error
      : new Error("Unknown error during test generation");
  }
};

// Helper function to fetch file content from GitHub
export const fetchFileContent = async (
  owner: string,
  repo: string,
  path: string,
  branch = "main"
): Promise<string> => {
  // Encode the path to handle special characters and spaces
  const encodedPath = encodeURIComponent(path);
  
  const response = await axios.get(
    `${API_BASE_URL}/api/github/repos/${owner}/${repo}/contents/${encodedPath}`,
    {
      params: { ref: branch },
      withCredentials: true,
    }
  );

  if (response.data.content) {
    // GitHub API returns base64 encoded content
    return atob(response.data.content);
  }

  throw new Error("File content not found");
};

export const getTestFileByPath = async (
  sessionId: string,
  filePath: string
): Promise<TestFileDto | null> => {
  try {
    // Encode the filePath to handle special characters and spaces
    const encodedFilePath = encodeURIComponent(filePath);
    
    const response = await axios.get(
      `${API_BASE_URL}/api/ai-tests/test-file/${sessionId}/${encodedFilePath}`,
      {
        withCredentials: true,
      }
    );

    if (response.data) {
      const testCode = await convertToText(response.data.data.testCode.data);
      console.log("👋👋Test code:", response.data.data.testCode, testCode);
      return response.data as TestFileDto;
    }
  } catch (error) {
    console.error("Error fetching test file by path:", error);
  }

  return null;
};

export const convertToText = async (compressedData: string | null) => {
    if (!compressedData) return null;
    
    try {
        // Decode base64 to binary string
        const binaryString = atob(compressedData);
    
        // Convert binary string to Uint8Array
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
        }
    
        // Decompress using pako
        const decompressed = ungzip(bytes, { to: 'string' });
        return decompressed;
    } catch (error) {
        console.error("Decompression error:", error);
        return null;
    }
}

export const getTestFilePaths = async (
  sessionId: string,
  repositoryId: string): Promise<string[]> => {

    try {
      const response = await aiTestApi.get(`/repositories/${repositoryId}/${sessionId}`);
      return response.data.testFiles as string[];
    } catch (error) {
      console.error("Error fetching test file paths:", error);
      return [];
    }
  }

// Background test generation with Inngest
export interface BackgroundTestGenerationRequest {
  repositoryId: string;
  sessionId?: string;
  files: Array<{
    path: string;
    content: string;
    framework?: string;
  }>;
  framework: string;
  repoBranch?: string;
  options?: {
    testTypes?: string[];
    coverage?: "basic" | "comprehensive";
    includeEdgeCases?: boolean;
    mockExternal?: boolean;
  };
}

export interface BackgroundTestGenerationResponse {
  success: boolean;
  message: string;
  data?: {
    sessionId: string;
    eventId: string;
    status: string;
    totalFiles: number;
    framework: string;
    estimatedTime: string;
  };
  error?: string;
}

export const triggerBackgroundTestGeneration = async (
  requestData: BackgroundTestGenerationRequest
): Promise<BackgroundTestGenerationResponse> => {
  try {
    const response = await inngestApi.post("/trigger", requestData);
    return response.data;
  } catch (error) {
    console.error("Error triggering background test generation:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to trigger background test generation");
    }
    throw error;
  }
};

export const getBackgroundTestStatus = async (sessionId: string) => {
  try {
    const response = await inngestApi.get(`/status/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting background test status:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to get background test status");
    }
    throw error;
  }
};

export const getRealtimeUpdates = async (sessionId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/realtime/updates/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting realtime updates:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to get realtime updates");
    }
    throw error;
  }
};

export default aiTestApi;
