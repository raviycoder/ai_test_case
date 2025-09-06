import { apiClient } from '../api-client';
import { createAuthClient } from 'better-auth/react';
import { toast } from 'sonner';
import { getBetterAuthCookieHeader } from '../cookie-utils';
import { createEnhancedAuthClient } from '../better-auth-fetch';
import axios from 'axios';
import { authenticatedRequest } from '../auth-headers';
import Cookies from 'js-cookie';

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

  // Get current session
  getSession: async () => {
    const betterAuthToken = Cookies.get('__Secure-better-auth.session_token');
    const betterAuthSession = Cookies.get('__Secure-better-auth.session_data');
    console.log('Better Auth Token:', betterAuthToken);
    console.log('Better Auth Session:', betterAuthSession);
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/session`, { withCredentials: true,
      headers: { 'Cookie': `${betterAuthToken || ''}; ${betterAuthSession || ''}` }
     });
    if (!response.data || response.data == null) {
      const auth = authenticatedRequest(`${import.meta.env.VITE_API_URL}/api/auth/session`, {
        method: 'GET',
        headers: { 'Cookie': `${betterAuthToken || ''}; ${betterAuthSession || ''}` }
      });

      if (!auth) {
        throw new Error('Failed to fetch session');
      }
      return auth;
    }
    return response.data;
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
      const response = await apiClient.get(`/api/github/is-linked/${userId}`, {
        withCredentials: true,
        headers: { 'Cookie': getBetterAuthCookieHeader() || '' }
      });
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