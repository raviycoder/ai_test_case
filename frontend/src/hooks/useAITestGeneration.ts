import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTestSession,
  generateTests,
  getTestStatus,
  getTestFileByPath as getTestFileByPathApi,
  type TestGenerationRequest,
  type GenerationUpdate,
  type GeneratedTest,
  type TestSession,
  type GenerationResult,
  type TestFileDto,
} from '../lib/ai-test-api';

interface UseAITestGenerationOptions {
  onUpdate?: (update: GenerationUpdate) => void;
  onComplete?: (result: GenerationResult) => void;
  onError?: (error: Error) => void;
}

interface UseAITestGenerationReturn {
  // State
  session: TestSession | null;
  isGenerating: boolean;
  testFile: TestFileDto | null;
  isLoading: boolean;
  error: string | null;
  generatedTests: GeneratedTest[];
  progress: number;
  currentStep: string;
  
  // Actions
  createSession: (repositoryId: string, session_id: string, repoBranch: string, framework?: string) => Promise<void>;
  startGeneration: (request: Omit<TestGenerationRequest, 'sessionId'>) => Promise<void>;
  refreshStatus: () => Promise<void>;
  getTestFileByPath: (filePath: string, sessionId?: string) => Promise<TestFileDto | null>;
  // Hydrate from an existing session id (e.g., from URL)
  hydrateSession: (sessionId: string) => Promise<void>;
  reset: () => void;
}

export const useAITestGeneration = (options: UseAITestGenerationOptions = {}): UseAITestGenerationReturn => {
  const { onUpdate, onComplete, onError } = options;

  // State
  const [session, setSession] = useState<TestSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTests, setGeneratedTests] = useState<GeneratedTest[]>([]);
  const [testFile, setTestFile] = useState<TestFileDto | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const queryClient = useQueryClient();

  // Create new test session
  const createSessionMutation = useMutation({
    mutationFn: async (
      args: { repositoryId: string; session_id: string; repoBranch: string; framework?: string }
    ) => {
      const { repositoryId, session_id, repoBranch, framework = 'jest' } = args;
      return await createTestSession(repositoryId, framework, session_id, repoBranch);
    },
    onSuccess: (data) => {
      setSession(data);
    },
    onError: (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create test session';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    },
    onSettled: () => setIsLoading(false),
  });

  const createSession = useCallback(async (repositoryId: string, session_id: string, repoBranch: string, framework = 'jest') => {
    setIsLoading(true);
    setError(null);
    await createSessionMutation.mutateAsync({ repositoryId, session_id, repoBranch, framework });
  }, [createSessionMutation]);

  // Start test generation
  const startGenerationMutation = useMutation({
    mutationFn: async (request: Omit<TestGenerationRequest, 'sessionId'>) => {
      if (!session) throw new Error('No active session. Create a session first.');

      const fullRequest: TestGenerationRequest = { ...request, sessionId: session.sessionId };

      const result = await generateTests(fullRequest, (update) => {
        onUpdate?.(update);
        switch (update.type) {
          case 'progress':
            setProgress(update.data.progress || 0);
            setCurrentStep(update.data.message || '');
            break;
          case 'test_generated':
            setProgress(update.data.progress || 0);
            break;
          case 'error':
            setError(update.data.error || 'Generation error occurred');
            break;
        }
      });
      return result;
    },
    onMutate: () => {
      setIsGenerating(true);
      setError(null);
      setProgress(0);
      setCurrentStep('Initializing...');
      setGeneratedTests([]);
    },
    onSuccess: (result) => {
      setGeneratedTests(result.generatedTests);
      setProgress(100);
      setCurrentStep('Completed');
      onComplete?.(result);
    },
    onError: (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : 'Test generation failed';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    },
    onSettled: () => setIsGenerating(false),
  });

  const startGeneration = useCallback(async (request: Omit<TestGenerationRequest, 'sessionId'>) => {
    await startGenerationMutation.mutateAsync(request);
  }, [startGenerationMutation]);

  // Refresh session status
  const refreshStatus = useCallback(async () => {
    if (!session) return;
    try {
      setIsLoading(true);
      const updatedSession = await queryClient.fetchQuery({
        queryKey: ['test-session', session.sessionId],
        queryFn: () => getTestStatus(session.sessionId),
      });
      setSession(updatedSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [session, queryClient]);

  // Hydrate hook with an existing session id (without creating a new one)
  const hydrateSession = useCallback(async (sessionId: string) => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      setError(null);
      const existing = await queryClient.fetchQuery({
        queryKey: ['test-session', sessionId],
        queryFn: () => getTestStatus(sessionId),
      });
      setSession(existing);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to hydrate session';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  // Reset state
  const reset = useCallback(() => {
    setSession(null);
    setIsGenerating(false);
    setIsLoading(false);
    setError(null);
    setGeneratedTests([]);
    setProgress(0);
    setCurrentStep('');
  }, []);

  // Fetch persisted test file by path (for reloads)
  const getTestFileByPath = useCallback(async (filePath: string, providedSessionId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const dto = await queryClient.fetchQuery({
        queryKey: ['test-file', filePath],
        queryFn: () => getTestFileByPathApi(providedSessionId ?? session?.sessionId ?? '', filePath),
      });
      if (dto) {
        setTestFile(dto as unknown as TestFileDto);
        return dto;
      } else {
        setTestFile(null);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get test file';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [queryClient, session?.sessionId]);

  return {
    // State
    session,
    testFile,
    isGenerating,
    isLoading,
    error,
    generatedTests,
    progress,
    currentStep,
    
    // Actions
    createSession,
    startGeneration,
    refreshStatus,
  hydrateSession,
    getTestFileByPath,
    reset,
  };
};

export default useAITestGeneration;
