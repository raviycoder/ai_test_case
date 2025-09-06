import { apiClient } from '../api-client';
import { createAuthClient } from 'better-auth/react';
import { toast } from 'sonner';
import { getBetterAuthCookieHeader, debugCookies } from '../cookie-utils';
import { createEnhancedAuthClient } from '../better-auth-fetch';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL, // Your backend URL
  fetchOptions: { credentials: "include" } // Important for cookies in production
});

// Enhanced auth client with manual cookie handling
export const enhancedAuthClient = createEnhancedAuthClient(import.meta.env.VITE_API_URL);

// Auth API functions that work with React Query
export const authAPI = {
  // GitHub OAuth login
  signInWithGitHub: async (callbackURL?: string) => {
    return authClient.signIn.social({
      provider: 'github',
      callbackURL: callbackURL || '/', // Redirect after login
    });
  },

  // Get current session using Better Auth
  getSession: async () => {
    try {
      console.log('Getting session with Better Auth...');
      debugCookies(); // Debug current cookies
      const { data } = await authClient.getSession();
      console.log('Better Auth session data:', data);
      return data;
    } catch (error) {
      console.error('Better Auth session error:', error);
      // Fallback to enhanced client with manual cookies
      try {
        console.log('Trying enhanced auth client...');
        const sessionData = await enhancedAuthClient.getSession();
        console.log('Enhanced auth client session data:', sessionData);
        return sessionData;
      } catch (enhancedError) {
        console.error('Enhanced auth client error:', enhancedError);
        throw error;
      }
    }
  },

  // Alternative session method using manual cookie headers
  getSessionWithManualCookies: async () => {
    try {
      const cookieHeader = getBetterAuthCookieHeader();
      console.log('Manual cookie header:', cookieHeader);
      
      const response = await apiClient.get('/debug/session', {
        headers: {
          'Cookie': cookieHeader
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Manual session error:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    return authClient.signOut();
  },

  // Link GitHub account
  linkGitHub: async () => {
    return authClient.linkSocial({
      provider: 'github',
      scopes:['repo'],
      callbackURL: import.meta.env.VITE_FRONTEND_URL, // Redirect after linking
    })
  },

  getAccountData: async () => {
    const { data } = await authClient.getSession();
    const id = data?.user?.id;
    if (!id) {
      return null;
    }
    return authClient.accountInfo({ accountId: id });
  },
  // Link Status
  isGitHubLinked: async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/github/is-linked/${userId}`);
      if (!response.data.success) {
        throw new Error("Failed to check GitHub link status");
      }
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: Error | any) {
      toast.error("Failed to check GitHub link status.", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      return { success: false, message: error.message };
    }
  }
};