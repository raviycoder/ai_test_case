import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient, Db } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/";
const DB_NAME = process.env.DB_NAME || "ai_test_git";

// Global variables for connection and auth
let client: MongoClient | null = null;
let database: Db | null = null;
let authInstance: any = null;

// Function to get connected database
export const getDatabase = async (): Promise<Db> => {
  if (database) return database;
  
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB connected for Better Auth');
  }
  
  database = client.db(DB_NAME);
  return database;
};

// Function to get auth instance (async to ensure DB is ready)
export const getAuth = async () => {
  if (authInstance) return authInstance;

  // Ensure database is connected first
  const db = await getDatabase();

  // Create Better Auth instance with connected database
  authInstance = betterAuth({
    database: mongodbAdapter(db),
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
    },
    trustedOrigins: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
    ],
    logger: {
      level: "info",
      log: (level, message, ...args) => {
        console.log({
          level,
          message,
          metadata: args,
          timestamp: new Date().toISOString(),
        });
      },
    },
  });

  return authInstance;
};
