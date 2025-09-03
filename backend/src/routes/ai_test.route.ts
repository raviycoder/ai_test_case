import { Router } from 'express';
import { 
  generateTests, 
  getTestStatus, 
  generateTestsDirect,
  getTestFiles,
  getTestFilesByRepository,
  updateTestFileStatus,
  getTestFileByPath,
  getTestFilePaths
} from '../controllers/ai_test.controller';
import { createTestSession, getUserSessions } from '../controllers/test_session.controller';

const router = Router();

// Create a new test session
router.post('/sessions', createTestSession);

// Get all sessions for the authenticated user
router.get('/sessions', getUserSessions);

// Get test generation status
router.get('/sessions/:sessionId/status', getTestStatus);

// Generate tests for selected files (requires existing session)
router.post('/generate', generateTests);

// Generate tests directly without session (creates session after successful generation)
router.post('/generate-direct', generateTestsDirect);

// Get test files for a specific session
router.get('/sessions/:sessionId/test-files', getTestFiles);

// Get test files for a specific path
router.get('/test-file/:sessionId/:filePath*', getTestFileByPath);
// Route /api/ai-tests/test-file/session_1755164337994_yp98ggyyg/src/components/Filter.tsx not found

// Get test files for a repository
router.get('/repositories/:repositoryId/test-files', getTestFilesByRepository);

// Get only paths of test files
router.get('/repositories/:repositoryId/:sessionId', getTestFilePaths);

// Update test file status
router.patch('/test-files/:testFileId', updateTestFileStatus);


export default router;
