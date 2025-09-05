# Zustand Integration for Global State Management

This implementation adds **Zustand** for global state management while maintaining the existing hook structure and logic. The approach is **non-intrusive** and provides **backward compatibility**.

## 🏗️ **Architecture Overview**

### **Stores (Zustand)**
- **`useAuthStore`** - Authentication state
- **`useTestGenerationStore`** - Test generation state with file-specific tracking
- **`useRepositoryStore`** - Git repository state
- **`useUIStore`** - Global UI state (sidebar, notifications)

### **Enhanced Hooks**
- **`useAuthEnhanced`** - Auth hook with Zustand integration
- **`useAITestGenerationEnhanced`** - AI test generation with global state
- **`useRealtimeTestGenerationEnhanced`** - Realtime updates with persistence

## 📖 **Usage Examples**

### **1. Basic Authentication**

```typescript
import { useAuthEnhanced } from '@/hooks';

function LoginComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuthEnhanced();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.username}!</p>
          <button onClick={logout}>Sign Out</button>
        </div>
      ) : (
        <button onClick={() => login()} disabled={isLoading}>
          Sign in with GitHub
        </button>
      )}
    </div>
  );
}
```

### **2. Cross-Component Data Sharing**

```typescript
// Component A: Start generation
import { useAITestGenerationEnhanced } from '@/hooks';

function DashboardComponent() {
  const { createSession, startGeneration, session } = useAITestGenerationEnhanced();

  const handleStart = async () => {
    await createSession('repo-123', 'session-456', 'main');
    await startGeneration({
      files: [
        { path: '/src/utils.ts', content: 'file content' }
      ],
      framework: 'jest'
    });
  };

  return (
    <button onClick={handleStart}>
      Start Generation
    </button>
  );
}

// Component B: Monitor progress
function ProgressComponent() {
  const { progress, currentStep, isGenerating } = useAITestGenerationEnhanced();

  return (
    <div>
      {isGenerating && (
        <div>
          <p>Progress: {progress}%</p>
          <p>Step: {currentStep}</p>
        </div>
      )}
    </div>
  );
}

// Component C: File-specific view
function FileViewerComponent({ filePath }: { filePath: string }) {
  const { getFileState, getTestFileByPath } = useAITestGenerationEnhanced();
  const fileState = getFileState(filePath);

  useEffect(() => {
    getTestFileByPath(filePath);
  }, [filePath]);

  return (
    <div>
      <h3>Test for: {filePath}</h3>
      {fileState.isGenerating && <p>Generating...</p>}
      {fileState.testFile && (
        <pre>{fileState.testFile.testCode}</pre>
      )}
      {fileState.error && <p>Error: {fileState.error}</p>}
    </div>
  );
}
```

### **3. Global Notifications**

```typescript
import { useUIStore } from '@/stores';

function NotificationProvider() {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className="notifications">
      {notifications.map(notification => (
        <div key={notification.id} className={`alert alert-${notification.type}`}>
          {notification.message}
          <button onClick={() => removeNotification(notification.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

// Automatically handled by enhanced hooks
function SomeComponent() {
  const { startGeneration } = useAITestGenerationEnhanced();

  const handleStart = async () => {
    try {
      await startGeneration(request);
      // Success notification automatically added by hook
    } catch (error) {
      // Error notification automatically added by hook
    }
  };
}
```

### **4. Persistent State Across Pages**

```typescript
// Page 1: Start generation
function GenerationPage() {
  const { startGeneration } = useRealtimeTestGenerationEnhanced();
  
  const handleStart = async () => {
    await startGeneration({
      repositoryId: 'repo-123',
      files: [{ path: '/src/app.ts', content: 'code...' }],
      framework: 'jest'
    });
    // State automatically persisted to localStorage
  };
}

// Page 2: View progress (after navigation)
function ProgressPage() {
  const { progress, currentFile, isGenerating } = useRealtimeTestGenerationEnhanced();
  
  // State automatically restored from localStorage
  return (
    <div>
      <p>Status: {isGenerating ? 'Generating' : 'Idle'}</p>
      <p>Progress: {progress}%</p>
      <p>Current File: {currentFile}</p>
    </div>
  );
}
```

## 🔄 **Migration Strategy**

### **Gradual Migration**
1. **Keep existing hooks** - All original hooks remain unchanged
2. **Use enhanced hooks gradually** - Adopt enhanced hooks in new components
3. **Backward compatibility** - Original API still works

### **Component Updates**

```typescript
// Before (original)
import { useAuth } from '@/hooks/use-auth';

// After (enhanced)
import { useAuthEnhanced as useAuth } from '@/hooks';
// OR
import { useAuth } from '@/hooks'; // Still works with original
```

## 🎯 **Benefits**

✅ **Persistent State**: Data survives page reloads  
✅ **Cross-Component Sharing**: Multiple components access same data  
✅ **File-Specific Loading**: Track progress per file  
✅ **Global Notifications**: Centralized user feedback  
✅ **DevTools Integration**: Debug with Redux DevTools  
✅ **Type Safety**: Full TypeScript support  
✅ **Backward Compatible**: Existing code unchanged  

## 🚀 **Key Features**

### **File-Specific State Management**
```typescript
const { getFileState, isFileGenerating } = useAITestGenerationEnhanced();

// Check if specific file is generating
const isGenerating = isFileGenerating('/src/utils.ts');

// Get detailed file state
const fileState = getFileState('/src/utils.ts');
console.log(fileState.progress, fileState.error, fileState.testFile);
```

### **Global Progress Tracking**
```typescript
const { globalProgress, currentStep, isGenerating } = useTestGenerationStore();

// Global state available everywhere
```

### **Automatic Persistence**
- Session data persisted across browser sessions
- File-specific progress saved per session
- Generation state restored on page reload

## 🛠️ **Implementation Notes**

1. **Non-intrusive**: Original hooks still work without changes
2. **Type-safe**: Full TypeScript integration with proper interfaces
3. **Performance**: Zustand provides efficient re-renders
4. **Debugging**: Redux DevTools support for state inspection
5. **Modular**: Each store handles specific domain (auth, generation, UI)

This implementation provides a robust foundation for global state management while maintaining the existing codebase structure and ensuring smooth migration path.
