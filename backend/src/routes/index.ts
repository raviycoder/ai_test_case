import { Router } from 'express';
import userRoutes from './user.route';
import githubRoutes from './github.route';

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

export default router;
