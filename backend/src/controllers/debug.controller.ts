import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { getAuth } from './auth.controller';
import { fromNodeHeaders } from 'better-auth/node';

// Debug endpoint to check session headers
export const getSessionDebug = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('=== SESSION DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.headers.cookie);
    
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    console.log('Session result:', session);

    return res.status(200).json({
      success: true,
      message: 'Session debug info',
      data: {
        session,
        headers: req.headers,
        cookies: req.headers.cookie,
        hasSession: !!session?.user
      }
    });
  } catch (error) {
    console.error('Session debug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to debug session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
