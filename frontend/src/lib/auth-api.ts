import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000', // Your backend URL
});

// Auth API functions that work with React Query
export const authAPI = {
  // GitHub OAuth login
  signInWithGitHub: async (callbackURL?: string) => {
    return authClient.signIn.social({
      provider: 'github',
      callbackURL: callbackURL || '/', // Redirect after login
    });
  },

  // Get current session
  getSession: async () => {
    return authClient.getSession();
  },

  // Sign out
  signOut: async () => {
    return authClient.signOut();
  },
};