import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import {toNodeHandler} from 'better-auth/node'
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { connectToDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import userRoutes from './routes/user.route';
import githubRoutes from './routes/github.route';
import aiTestRoutes from './routes/ai_test.route';
import inngestRoutes from './routes/inngest.route';
import realtimeRoutes from './routes/realtime.route';
import { getAuth } from './controllers/auth.controller';
import { serve } from "inngest/express";
import { inngest, functions } from "./services/inngest/index";
import { createTestSession, getUserSessions } from './controllers/test_session.controller';
import { deleteTestFile, generateTests, generateTestsDirect, getTestFileByPath, getTestFilePaths, getTestFiles, getTestFilesByRepository, getTestStatus, updateTestFileStatus } from './controllers/ai_test.controller';
import { getFileContent, getGithubRepos, getRepoFiles, getRepoTree } from './controllers/repo.controller';
import { isGitHubAccountLinked } from './controllers/github.controller';
import { getRealtimeToken, getRealTimeUpdates } from './controllers/realtime.controller';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes
//   max: config.RATE_LIMIT_MAX_REQUESTS, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

// CORS configuration
app.use(cors({
  origin: config.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  // allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.NODE_ENV !== 'test') {
  app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Better Auth middleware - must come before express.json()
app.all("/api/auth/*", async (req, res, next) => {
  try {
    const auth = await getAuth();
    const handler = toNodeHandler(auth);
    return handler(req, res);
  } catch (error) {
    console.error('Better Auth error:', error);
    return res.status(500).json({ error: 'Authentication service error' });
  }
});



// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    uptime: process.uptime()
  });
});

// API routes - mount BEFORE Inngest to ensure proper routing
// app.use('/api/users', userRoutes);
// app.use('/api/github', githubRoutes);
// app.use('/api/ai-tests', aiTestRoutes);
// app.use('/api/realtime', realtimeRoutes);
// Create a new test session
app.post('/api/ai-tests/sessions', createTestSession);

// Get all sessions for the authenticated user
app.get('/api/ai-tests/sessions', getUserSessions);

// Get test generation status
app.get('/api/ai-tests/sessions/:sessionId/status', getTestStatus);

// Generate tests for selected files (requires existing session)
app.post('/api/ai-tests/generate', generateTests);

// Generate tests directly without session (creates session after successful generation)
app.post('/api/ai-tests/generate-direct', generateTestsDirect);

// Get test files for a specific session
app.get('/api/ai-tests/sessions/:sessionId/test-files', getTestFiles);

// Get test files for a specific path
app.get('/api/ai-tests/test-file/:sessionId/:filePath*', getTestFileByPath);
// Route /api/ai-tests/test-file/session_1755164337994_yp98ggyyg/src/components/Filter.tsx not found

// Get test files for a repository
app.get('/api/ai-tests/repositories/:repositoryId/test-files', getTestFilesByRepository);

// Get only paths of test files
app.get('/api/ai-tests/repositories/:repositoryId/:sessionId', getTestFilePaths);

// Update test file status
app.patch('/api/ai-tests/test-files/:testFileId', updateTestFileStatus);

app.delete('/api/ai-tests/:sessionId/:filePath', deleteTestFile);

// GET /api/github/repos
app.get("/api/github/repos", getGithubRepos);

// GET /api/github/repos/:owner/:repo/contents
app.get("/api/github/repos/:owner/:repo/contents", getRepoFiles);

// GET /api/github/repos/:owner/:repo/tree?branch=main
app.get("/api/github/repos/:owner/:repo/tree", getRepoTree);

// GET /api/github/repos/:owner/:repo/contents/:path(*) - path can include slashes
app.get("/api/github/repos/:owner/:repo/contents/*", getFileContent);

app.get("/api/github/is-linked/:id", isGitHubAccountLinked);

// Get subscription token for realtime updates
app.get("/api/realtime/token/:sessionId", getRealtimeToken);

// Get realtime updates from session db
app.get("/api/realtime/updates/:sessionId", getRealTimeUpdates);
// Inngest serve endpoint - mount AFTER API routes with specific path
app.use("/api/inngest", serve({ client: inngest, functions }));

// redirect to frontend url
app.get('/', (req, res) => {
  res.redirect(config.FRONTEND_URL);
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

// On Vercel (serverless), do not start a listener; connect DB once per cold start
if (process.env.VERCEL) {
  connectToDatabase().catch((error) => {
    console.error('❌ MongoDB connection failed (serverless):', error);
  });
} else {
  // Local / non-Vercel: connect DB then start server
  (async () => {
    try {
      await connectToDatabase();
      app.listen(config.PORT, () => {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`🚀 Server running on port ${config.PORT}`);
          console.log(`📱 Environment: ${config.NODE_ENV}`);
          console.log(`🔗 API available at: http://localhost:${config.PORT}/api`);
          console.log(`❤️  Health check: http://localhost:${config.PORT}/health`);
        }
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  })();
}

// Export Vercel-compatible handler
export default function handler(req: any, res: any) {
  return (app as any)(req, res);
}
