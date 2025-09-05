// Enhanced hooks with Zustand integration

// Original hooks for backward compatibility
export { useAuth as useAuthOriginal } from './use-auth';
export { useAITestGeneration as useAITestGenerationOriginal } from './use-ai-test-generation';
export { useRealtimeTestGeneration as useRealtimeTestGenerationOriginal } from './use-realtime-test-generation';

// Other hooks
export { useUser } from './use-user';
export { useGitRepo } from './use-git-repo';
export { useIsMobile } from './use-mobile';
export { useLink } from './use-link';
export { useSessions } from './use-session';
export { convertToText } from './use-convert-to-text';

// Zustand stores
export { 
  useAuthStore,
  useTestGenerationStore,
  useRepositoryStore,
  useUIStore
} from '../stores';
