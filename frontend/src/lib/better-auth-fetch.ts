import { getBetterAuthCookieHeader } from './cookie-utils';

/**
 * Custom fetch function that manually adds Better Auth cookies
 * Use this with Better Auth client for better cookie handling
 */
export const betterAuthFetch = async (url: string, options: RequestInit = {}) => {
  const cookieHeader = getBetterAuthCookieHeader();
  
  console.log('Better Auth custom fetch:', url);
  console.log('Adding cookies:', cookieHeader);
  
  const headers = new Headers(options.headers);
  
  // Add Better Auth cookies manually
  if (cookieHeader) {
    headers.set('Cookie', cookieHeader);
  }
  
  // Ensure credentials are included
  const fetchOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers,
  };
  
  console.log('Fetch options:', fetchOptions);
  
  return fetch(url, fetchOptions);
};

/**
 * Enhanced auth client with custom fetch
 */
export const createEnhancedAuthClient = (baseURL: string) => {
  return {
    async getSession() {
      const response = await betterAuthFetch(`${baseURL}/api/auth/session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Session request failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    
    async signOut() {
      const response = await betterAuthFetch(`${baseURL}/api/auth/sign-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Sign out failed: ${response.statusText}`);
      }
      
      return response.json();
    },
  };
};
