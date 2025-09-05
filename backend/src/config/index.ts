import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  DB_NAME: string;
  FRONTEND_URL: string;
  JWT_SECRET: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

const config: Config = {
  PORT: parseInt(process.env.PORT ?? '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  DB_NAME: process.env.DB_NAME || 'ai_test_git',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};

// Validate required environment variables
const validateConfig = (): void => {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.warn(`⚠️  Warning: ${varName} is not set in environment variables`);
    }
  }

  if (config.NODE_ENV === 'production' && config.JWT_SECRET === 'fallback-secret-key') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
};

// Validate configuration on import
validateConfig();

export { config };
