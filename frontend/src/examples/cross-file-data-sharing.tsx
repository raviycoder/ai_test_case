import { useEffect, useState } from 'react';
import { useAITestGeneration } from '../hooks/use-ai-test-generation';

// Example 1: Master Dashboard Component
export const TestDashboard = () => {
  const masterHook = useAITestGeneration({
    onUpdate: (update) => {
      // Broadcast updates to other components via global state/context
      console.log('Master received update:', update);
    },
    onComplete: (result) => {
      console.log('Generation completed:', result);
    }
  });

  const handleStartGeneration = async () => {
    // Create session that other components can reference
    await masterHook.createSession('repo-123', 'session-456', 'main');
    
    // Start generation for multiple files
    await masterHook.startGeneration({
      files: [
        { path: '/src/utils.ts', content: 'file content here' },
        { path: '/src/helpers.ts', content: 'helper file content' }
      ],
      framework: 'jest',
      options: {
        testTypes: ['unit'],
        coverage: 'comprehensive'
      }
    });
  };

  return (
    <div>
      <h2>Test Generation Dashboard</h2>
      <p>Progress: {masterHook.progress}%</p>
      <p>Step: {masterHook.currentStep}</p>
      <p>Generated Tests: {masterHook.generatedTests.length}</p>
      <button onClick={handleStartGeneration}>
        Start Generation
      </button>
    </div>
  );
};

// Example 2: File-specific Viewer Component
export const FileTestViewer = ({ filePath }: { filePath: string }) => {
  const fileHook = useAITestGeneration();

  useEffect(() => {
    // Get data for specific file using session from URL or global state
    const loadFileData = async () => {
      const sessionId = new URLSearchParams(window.location.search).get('session');
      if (sessionId) {
        await fileHook.hydrateSession(sessionId);
        await fileHook.getTestFileByPath(filePath, sessionId);
      }
    };
    
    loadFileData();
  }, [filePath, fileHook]);

  return (
    <div>
      <h3>Test for: {filePath}</h3>
      {fileHook.isLoading && <p>Loading file data...</p>}
      {fileHook.testFile && (
        <pre>
          <code>{fileHook.testFile.testCode}</code>
        </pre>
      )}
    </div>
  );
};

// Example 3: Progress Monitor Component (different file)
export const ProgressMonitor = ({ sessionId }: { sessionId: string }) => {
  const progressHook = useAITestGeneration();

  useEffect(() => {
    if (sessionId) {
      progressHook.hydrateSession(sessionId);
    }
  }, [sessionId, progressHook]);

  return (
    <div>
      <h4>Generation Progress</h4>
      <div className="progress-bar">
        <div 
          style={{ width: `${progressHook.progress}%` }}
          className="progress-fill"
        />
      </div>
      <p>Current: {progressHook.currentStep}</p>
      <p>Files processed: {progressHook.testFilePaths.length}</p>
    </div>
  );
};

// Example 4: File List Component
export const FileListManager = ({ repositoryId }: { repositoryId: string }) => {
  const listHook = useAITestGeneration();

  const loadFilePaths = async () => {
    const sessionId = 'current-session-id'; // Get from context/props
    const paths = await listHook.getTestFilePaths(sessionId, repositoryId);
    console.log('Available test files:', paths);
  };

  return (
    <div>
      <h4>Test Files</h4>
      <button onClick={loadFilePaths}>Refresh Files</button>
      <ul>
        {listHook.testFilePaths.map(path => (
          <li key={path}>
            {path}
            <button onClick={() => listHook.getTestFileByPath(path)}>
              View Test
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Example 5: Parent Component Orchestrating Multiple Children
export const TestGenerationWorkspace = () => {
  const mainHook = useAITestGeneration();
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  const initializeWorkspace = async () => {
    const sessionId = `session-${Date.now()}`;
    await mainHook.createSession('repo-123', sessionId, 'main');
    setCurrentSessionId(sessionId);
  };

  return (
    <div className="workspace">
      <button onClick={initializeWorkspace}>Initialize Workspace</button>
      <TestDashboard />
      
      <div className="side-panel">
        <ProgressMonitor sessionId={currentSessionId} />
        <FileListManager repositoryId="repo-123" />
      </div>
      
      <div className="main-content">
        <FileTestViewer filePath="/src/utils.ts" />
      </div>
    </div>
  );
};
