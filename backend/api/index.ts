import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { toNodeHandler } from 'better-auth/node';
import rateLimit from 'express-rate-limit';
import { config } from '../src/config';
import { connectToDatabase } from '../src/config/database';
import { errorHandler } from '../src/middleware/errorHandler';
import routes from '../src/routes';
import { getAuth } from '../src/controllers/auth.controller';
import { serve } from "inngest/express";
import { inngest, functions } from "../src/services/inngest/index";

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-frontend-domain.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Database connection
let isConnected = false;
const connectDB = async () => {
  if (!isConnected) {
    try {
      await connectToDatabase();
      isConnected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
};

// Better Auth handler
app.all("/api/auth/*", async (req, res) => {
  await connectDB();
  const auth = await getAuth();
  return toNodeHandler(auth)(req, res);
});

// Inngest handler
app.use("/api/inngest", serve({
  client: inngest,
  functions: functions,
}));

// API routes
app.use('/api', async (req, res, next) => {
  await connectDB();
  next();
}, routes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Export handler for Vercel
export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};
