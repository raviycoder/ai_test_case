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
      headers: { Cookie: '__Secure-better-auth.session_token=bTsl9NpJe1TkotaiwqwikjbwjaxNMivD.urKGh1MVqe5t1J9aL1MastcLr6oR1rXf6UpgfgwgOgc%3D; __Secure-better-auth.session_data=eyJzZXNzaW9uIjp7InNlc3Npb24iOnsiZXhwaXJlc0F0IjoiMjAyNS0wOS0xM1QwNTozODoxOC41MDJaIiwidG9rZW4iOiJiVHNsOU5wSmUxVGtvdGFpd3F3aWtqYndqYXhOTWl2RCIsImNyZWF0ZWRBdCI6IjIwMjUtMDktMDZUMDU6Mzg6MTguNTAyWiIsInVwZGF0ZWRBdCI6IjIwMjUtMDktMDZUMDU6Mzg6MTguNTAyWiIsImlwQWRkcmVzcyI6IjExNy45Ny4xOTMuNDMiLCJ1c2VyQWdlbnQiOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQwLjAuMC4wIFNhZmFyaS81MzcuMzYiLCJ1c2VySWQiOiI2OGJiOGM1ODdkZWU5M2NhYzI1Yjg4OTgiLCJpZCI6IjY4YmJjOGNhNjQyMjA0NzZhZTg3MWM0YSJ9LCJ1c2VyIjp7Im5hbWUiOiJSYXZpIFlhZGF2IiwiZW1haWwiOiJ5cmF2aTc3MTNAZ21haWwuY29tIiwiZW1haWxWZXJpZmllZCI6dHJ1ZSwiaW1hZ2UiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTM1NTIxMTkyP3Y9NCIsImNyZWF0ZWRBdCI6IjIwMjUtMDktMDZUMDE6MjA6MjQuODEzWiIsInVwZGF0ZWRBdCI6IjIwMjUtMDktMDZUMDE6MjA6MjQuODEzWiIsImlkIjoiNjhiYjhjNTg3ZGVlOTNjYWMyNWI4ODk4In19LCJleHBpcmVzQXQiOjE3NTc3NDE4OTg3OTgsInNpZ25hdHVyZSI6IlJWVFVONUQwMEIyc3h0d19hSmIydUdTbjd6TDcxRXQtMC1UeUtYV2lRYzgifQ'}
     });
    if (!response.data || response.data == null) {
      const auth = authenticatedRequest(`${import.meta.env.VITE_API_URL}/api/auth/session`, {
        method: 'GET',
        headers: { Cookie:'__Secure-better-auth.session_token=bTsl9NpJe1TkotaiwqwikjbwjaxNMivD.urKGh1MVqe5t1J9aL1MastcLr6oR1rXf6UpgfgwgOgc%3D; __Secure-better-auth.session_data=eyJzZXNzaW9uIjp7InNlc3Npb24iOnsiZXhwaXJlc0F0IjoiMjAyNS0wOS0xM1QwNTozODoxOC41MDJaIiwidG9rZW4iOiJiVHNsOU5wSmUxVGtvdGFpd3F3aWtqYndqYXhOTWl2RCIsImNyZWF0ZWRBdCI6IjIwMjUtMDktMDZUMDU6Mzg6MTguNTAyWiIsInVwZGF0ZWRBdCI6IjIwMjUtMDktMDZUMDU6Mzg6MTguNTAyWiIsImlwQWRkcmVzcyI6IjExNy45Ny4xOTMuNDMiLCJ1c2VyQWdlbnQiOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQwLjAuMC4wIFNhZmFyaS81MzcuMzYiLCJ1c2VySWQiOiI2OGJiOGM1ODdkZWU5M2NhYzI1Yjg4OTgiLCJpZCI6IjY4YmJjOGNhNjQyMjA0NzZhZTg3MWM0YSJ9LCJ1c2VyIjp7Im5hbWUiOiJSYXZpIFlhZGF2IiwiZW1haWwiOiJ5cmF2aTc3MTNAZ21haWwuY29tIiwiZW1haWxWZXJpZmllZCI6dHJ1ZSwiaW1hZ2UiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTM1NTIxMTkyP3Y9NCIsImNyZWF0ZWRBdCI6IjIwMjUtMDktMDZUMDE6MjA6MjQuODEzWiIsInVwZGF0ZWRBdCI6IjIwMjUtMDktMDZUMDE6MjA6MjQuODEzWiIsImlkIjoiNjhiYjhjNTg3ZGVlOTNjYWMyNWI4ODk4In19LCJleHBpcmVzQXQiOjE3NTc3NDE4OTg3OTgsInNpZ25hdHVyZSI6IlJWVFVONUQwMEIyc3h0d19hSmIydUdTbjd6TDcxRXQtMC1UeUtYV2lRYzgifQ' }
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