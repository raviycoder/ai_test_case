import { Router } from 'express';
import userRoutes from './user.route';
import githubRoutes from './github.route';
import aiTestRoutes from './ai_test.route';
import inngestRoutes from './inngest.route';
import realtimeRoutes from './realtime.route';

const router = Router();

// Base API route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Example protected route structure
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    data: {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  });
});

// Mount feature routers
router.use('/users', userRoutes);
router.use('/github', githubRoutes);
router.use('/ai-tests', aiTestRoutes);
router.use('/inngest', inngestRoutes);
router.use('/realtime', realtimeRoutes);

export default router;
