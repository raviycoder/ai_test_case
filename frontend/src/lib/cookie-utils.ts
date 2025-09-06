// Utility functions for handling cookies and Better Auth tokens

/**
 * Get a specific cookie value by name
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

/**
 * Get all cookies as an object
 */
export const getAllCookies = (): Record<string, string> => {
  if (typeof document === 'undefined') return {};
  
  return document.cookie.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = value;
    }
    return cookies;
  }, {} as Record<string, string>);
};

/**
 * Get Better Auth session token from cookies
 */
export const getBetterAuthToken = (): string | null => {
  // Better Auth typically uses this cookie name
  return getCookie('__Secure-better-auth.session_token') || getCookie('__Secure-better-auth.session_token');
};

/**
 * Get all Better Auth related cookies
 */
export const getBetterAuthCookies = (): Record<string, string> => {
  const allCookies = getAllCookies();
  const betterAuthCookies: Record<string, string> = {};
  
  // Filter cookies that start with 'better-auth'
  Object.entries(allCookies).forEach(([name, value]) => {
    if (name.startsWith('__Secure-better-auth')) {
      betterAuthCookies[name] = value;
    }
  });

  console.log('Better Auth cookies found:', betterAuthCookies);
  
  return betterAuthCookies;
};

/**
 * Create Cookie header string from Better Auth cookies
 */
export const getBetterAuthCookieHeader = (): string => {
  const betterAuthCookies = getBetterAuthCookies();
  return Object.entries(betterAuthCookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
};

/**
 * Log current cookies for debugging
 */
export const debugCookies = () => {
  console.log('=== COOKIE DEBUG ===');
  console.log('All cookies:', getAllCookies());
  console.log('Better Auth cookies:', getBetterAuthCookies());
  console.log('Better Auth token:', getBetterAuthToken());
  console.log('Cookie header string:', getBetterAuthCookieHeader());
};
