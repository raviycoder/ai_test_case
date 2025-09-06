import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient, Db } from "mongodb";
import { beforeAuthHook } from "../middleware/auth.middleware";
import { config } from "../config";
import { getHeapSpaceStatistics } from "v8";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/";
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
    baseURL: process.env.BETTER_AUTH_URL,
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain: "ai-test-case-iprf.vercel.app", // Set your domain for production
      },
      cookies: {
        session_token: {
          attributes: {
            sameSite: "none",
          },
        },
        session_data: {
          attributes: {
            sameSite: "none",
          },
        },
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    },
    hooks: {
      before: beforeAuthHook,
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
    },
    trustedOrigins: [
      process.env.FRONTEND_URL as string,
      process.env.BETTER_AUTH_URL as string,
    ],
    logger: {
      level: "info",
      log: (level, message, ...args) => {
        if (process.env.NODE_ENV !== "production") {
          console.log({
            level,
            message,
            metadata: args,
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
  });

  return authInstance;
};

export const requestAdditionalScopes = async () => {
  const auth = await getAuth();
  await auth.linkSocial({
    provider: "github",
    scopes: ["repo"], // Use "public_repo" if you only need access to public repositories
  });
};
