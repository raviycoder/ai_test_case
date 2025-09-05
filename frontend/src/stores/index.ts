import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  TestSession, 
  TestFileDto, 
  GeneratedTest 
} from '@/lib/apis/ai-test-api';

// User session type
interface UserSession {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
}

// Repository type
interface Repository {
  id: string;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
}

// Auth Store - Simple session state
interface AuthState {
  session: UserSession | null;
  isAuthenticated: boolean;
  setSession: (session: UserSession | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        session: null,
        isAuthenticated: false,
        setSession: (session) => set({ 
          session, 
          isAuthenticated: !!session 
        }),
        clearSession: () => set({ 
          session: null, 
          isAuthenticated: false 
        }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ session: state.session }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// Test Generation Store - Global test generation state
interface TestGenerationState {
  // Current active session
  activeSession: TestSession | null;
  
  // Generation states
  isGenerating: boolean;
  globalProgress: number;
  currentStep: string;
  
  // File-specific states
  fileStates: Record<string, {
    isGenerating: boolean;
    progress: number;
    testFile: TestFileDto | null;
    error: string | null;
  }>;
  
  // Generated test
  generatedTest: GeneratedTest | null;
  
  // Actions
  setActiveSession: (session: TestSession | null) => void;
  setGenerationState: (isGenerating: boolean, progress?: number, step?: string) => void;
  setFileState: (filePath: string, state: Partial<TestGenerationState['fileStates'][string]>) => void;
  setGeneratedTest: (test: GeneratedTest) => void;
  clearFileState: (filePath: string) => void;
  clearAll: () => void;
}

export const useTestGenerationStore = create<TestGenerationState>()(
  devtools(
    persist(
      (set, get) => ({
        activeSession: null,
        isGenerating: false,
        globalProgress: 0,
        currentStep: '',
        fileStates: {},
        generatedTest: null,

        setActiveSession: (session) => set({ activeSession: session }),
        
        setGenerationState: (isGenerating, progress = 0, step = '') => 
          set({ 
            isGenerating, 
            globalProgress: progress, 
            currentStep: step 
          }),
        
        setFileState: (filePath, newState) => {
          const currentFileStates = get().fileStates;
          const existingState = currentFileStates[filePath] || {
            isGenerating: false,
            progress: 0,
            testFile: null,
            error: null,
          };
          
          set({
            fileStates: {
              ...currentFileStates,
              [filePath]: {
                ...existingState,
                ...newState,
              }
            }
          });
        },

        setGeneratedTest: (test) => set({ generatedTest: test }),

        clearFileState: (filePath) => {
          const currentFileStates = get().fileStates;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [filePath]: _, ...rest } = currentFileStates;
          set({ fileStates: rest });
        },
        
        clearAll: () => set({
          activeSession: null,
          isGenerating: false,
          globalProgress: 0,
          currentStep: '',
          fileStates: {},
          generatedTest: null,
        }),
      }),
      {
        name: 'test-generation-storage',
        partialize: (state) => ({ 
          activeSession: state.activeSession,
          fileStates: state.fileStates 
        }),
      }
    ),
    { name: 'TestGenerationStore' }
  )
);

// Repository Store - Git repository state
interface RepositoryState {
  currentRepo: Repository | null;
  repositories: Repository[];
  selectedBranch: string;
  
  setCurrentRepo: (repo: Repository | null) => void;
  setRepositories: (repos: Repository[]) => void;
  setSelectedBranch: (branch: string) => void;
}

export const useRepositoryStore = create<RepositoryState>()(
  devtools(
    persist(
      (set) => ({
        currentRepo: null,
        repositories: [],
        selectedBranch: 'main',
        
        setCurrentRepo: (repo) => set({ currentRepo: repo }),
        setRepositories: (repos) => set({ repositories: repos }),
        setSelectedBranch: (branch) => set({ selectedBranch: branch }),
      }),
      {
        name: 'repository-storage',
        partialize: (state) => ({ 
          currentRepo: state.currentRepo,
          selectedBranch: state.selectedBranch 
        }),
      }
    ),
    { name: 'RepositoryStore' }
  )
);

// UI Store - Global UI state
interface UIState {
  sidebarOpen: boolean;
  currentPage: string;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    timestamp: number;
  }>;
  
  setSidebarOpen: (open: boolean) => void;
  setCurrentPage: (page: string) => void; 
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      sidebarOpen: true,
      currentPage: '/',
      notifications: [],
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCurrentPage: (page) => set({ currentPage: page }),
      
      addNotification: (notification) => {
        const id = Date.now().toString();
        const newNotification = {
          ...notification,
          id,
          timestamp: Date.now(),
        };
        set({ 
          notifications: [...get().notifications, newNotification] 
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          set({ 
            notifications: get().notifications.filter(n => n.id !== id) 
          });
        }, 5000);
      },
      
      removeNotification: (id) => set({ 
        notifications: get().notifications.filter(n => n.id !== id) 
      }),
    }),
    { name: 'UIStore' }
  )
);
