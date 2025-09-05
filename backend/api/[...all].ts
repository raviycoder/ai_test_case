import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { toNodeHandler } from 'better-auth/node';
import { config } from '../src/config';
import { connectToDatabase } from '../src/config/database';
import { errorHandler } from '../src/middleware/errorHandler';
import routes from '../src/routes';
import { getAuth } from '../src/controllers/auth.controller';
import { serve } from 'inngest/express';
import { inngest, functions } from '../src/services/inngest/index';

// Create Express app (serverless)
const app = express();

// Basic middleware
app.use(helmet());
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(compression());
app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Better Auth before body parsers
app.all('/api/auth/*', async (req, res) => {
  try {
    const auth = await getAuth();
    return toNodeHandler(auth)(req, res);
  } catch (e) {
    console.error('Better Auth error:', e);
    return res.status(500).json({ error: 'Authentication service error' });
  }
});

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', environment: config.NODE_ENV });
});

// Connect DB once per cold start
connectToDatabase().catch((err) => console.error('DB connect error:', err));

// Routes & Inngest
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api', routes);

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Errors
app.use(errorHandler);

// Vercel handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  return (app as any)(req, res);
}
