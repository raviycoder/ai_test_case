import { Router } from 'express';

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

router.get('/test/data', (req, res) => {
  res.json({
    success: true,
    message: 'Test data endpoint working',
    data: {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  });
});

export default router;
