import { Router, Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { getAuth } from '../controllers/auth.controller';

const router = Router();

// Async middleware to handle Better Auth initialization
export const authHandler = async (req: Request, res: Response) => {
  try {
    const auth = await getAuth();
    const handler = toNodeHandler(auth);
    return handler(req, res);
  } catch (error) {
    console.error('Auth handler error:', error);
    res.status(500).json({ error: 'Authentication service unavailable' });
  }
};

// Mount Better Auth handler for all /auth/* routes
router.all('/*', authHandler);

export default router;
