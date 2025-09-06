import { getBetterAuthCookieHeader } from './cookie-utils';

/**
 * Add Better Auth cookies to request headers
 * Use this function when you need to manually add auth cookies to any API call
 */
export const addAuthHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  const authCookies = getBetterAuthCookieHeader();
  
  if (authCookies) {
    return {
      ...headers,
      'Cookie': authCookies,
      'Content-Type': 'application/json',
    };
  }
  
  return headers;
};

/**
 * Create an authenticated API request with manual cookie headers
 */
export const authenticatedRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const authHeaders = addAuthHeaders(options.headers as Record<string, string>);
  
  console.log('Authenticated request to:', url);
  console.log('With headers:', authHeaders);
  
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: authHeaders,
  });
};

/**
 * Example usage functions
 */
export const authExamples = {
  // Get session with manual cookies
  async getSession() {
    const response = await authenticatedRequest(
      `${import.meta.env.VITE_API_URL}/api/auth/session`,
      { method: 'GET' }
    );
    return response.json();
  },
  
  // Get user data with manual cookies
  async getUserData() {
    const response = await authenticatedRequest(
      `${import.meta.env.VITE_API_URL}/api/users`,
      { method: 'GET' }
    );
    return response.json();
  },
  
  // Any API call with manual auth
  async makeAuthenticatedCall(endpoint: string, method: string = 'GET', body?: object) {
    const options: RequestInit = { method };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await authenticatedRequest(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      options
    );
    
    return response.json();
  }
};
