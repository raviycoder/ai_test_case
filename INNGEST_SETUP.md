# AI Test Generator - Inngest Background Jobs

This document explains how to use the new Inngest-powered background test generation feature.

## What's New

### Background Test Generation
- ⚡ **Non-blocking**: UI remains responsive during test generation
- 📊 **Real-time progress**: Watch progress updates as tests are generated
- 🔄 **Automatic retries**: Failed generations are automatically retried
- 📈 **Better scalability**: Handle multiple generations simultaneously

### API Endpoints

#### Trigger Background Generation
```
POST /api/inngest/trigger
```

**Request Body:**
```json
{
  "repositoryId": "your-repo-id",
  "sessionId": "optional-session-id",
  "files": [
    {
      "path": "src/components/Button.tsx",
      "content": "file content here",
      "framework": "jest"
    }
  ],
  "framework": "jest",
  "repoBranch": "main",
  "options": {
    "testTypes": ["unit", "integration"],
    "coverage": "comprehensive",
    "includeEdgeCases": true,
    "mockExternal": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test generation started in background",
  "data": {
    "sessionId": "sess_123456",
    "eventId": "inngest_event_id",
    "status": "processing",
    "totalFiles": 1,
    "framework": "jest",
    "estimatedTime": "30s"
  }
}
```

#### Real-time Progress (Server-Sent Events)
```
GET /api/inngest/stream/{sessionId}
```

**Response (SSE Stream):**
```
data: {"type":"session_created","step":"session","message":"Session created successfully","progress":10}

data: {"type":"file_processing","step":"generation","message":"Generating tests for Button.tsx","progress":40,"currentFile":"Button.tsx","fileIndex":1,"totalFiles":1}

data: {"type":"generation_completed","step":"completed","message":"AI test generation completed","progress":100,"summary":{"totalFiles":1,"successfulTests":1,"failedTests":0,"totalTestCount":5}}
```

#### Check Status
```
GET /api/inngest/status/{sessionId}
```

### Frontend Integration

#### Basic Usage with React Hook

```tsx
import useBackgroundTestGeneration from '../hooks/useBackgroundTestGeneration';

function TestGenerationComponent() {
  const {
    isGenerating,
    error,
    progress,
    currentStep,
    currentMessage,
    sessionId,
    generatedTests,
    startBackgroundGeneration,
    stopGeneration,
    reset,
  } = useBackgroundTestGeneration({
    onProgress: (update) => {
    },
    onComplete: (result) => {
    },
    onError: (error) => {
    },
  });

  const handleGenerate = async () => {
    await startBackgroundGeneration({
      repositoryId: 'your-repo-id',
      files: [
        {
          path: 'src/Button.tsx',
          content: 'button component code',
          framework: 'jest'
        }
      ],
      framework: 'jest',
      options: {
        testTypes: ['unit'],
        coverage: 'comprehensive',
        includeEdgeCases: true,
        mockExternal: true,
      }
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Tests'}
      </button>
      
      {isGenerating && (
        <div>
          <div>Progress: {progress}%</div>
          <div>Step: {currentStep}</div>
          <div>Message: {currentMessage}</div>
        </div>
      )}
      
      {error && <div>Error: {error}</div>}
      
      {generatedTests.length > 0 && (
        <div>
          <h3>Generated Tests:</h3>
          {generatedTests.map((test, index) => (
            <div key={index}>
              <h4>{test.filePath}</h4>
              <pre>{test.testCode}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Benefits

1. **Better User Experience**: No more waiting for tests to generate - UI stays responsive
2. **Real-time Feedback**: See exactly what's happening during generation
3. **Reliability**: Built-in retries and error handling
4. **Scalability**: Handle multiple users generating tests simultaneously
5. **Observability**: Full visibility into the generation process

### Development Setup

1. **Start Inngest Dev Server:**
   ```bash
   cd backend
   bunx inngest-cli@latest dev -u http://localhost:5000/api/inngest
   ```

2. **Environment Variables:**
   ```
   GOOGLE_API_KEY=your_gemini_api_key
   INNGEST_EVENT_KEY=your_inngest_event_key (optional for dev)
   ```

3. **Test the Integration:**
   - Visit http://localhost:3000 (frontend)
   - Select files and choose "Background Generation"
   - Watch real-time progress updates
   - Check Inngest dashboard at http://localhost:8288

### Architecture

```
Frontend (React)
    ↓ HTTP Request
Backend API (/api/inngest/trigger)
    ↓ Send Event
Inngest Server
    ↓ Execute Function
Background Job (AI Test Generation)
    ↓ Progress Events
Backend SSE (/api/inngest/stream)
    ↓ Real-time Updates
Frontend (SSE Connection)
```

### Monitoring

- **Inngest Dashboard**: http://localhost:8288 (dev mode)
- **Server Logs**: Check backend console for detailed logs
- **Frontend Console**: Progress updates and errors
- **Database**: Test sessions and files are saved automatically
