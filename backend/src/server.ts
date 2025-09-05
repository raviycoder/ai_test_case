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
app.use('/api/users', userRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/ai-tests', aiTestRoutes);
app.use('/api/inngest', inngestRoutes);
app.use('/api/realtime', realtimeRoutes);

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
