import React from 'react';
import { authAPI } from '../lib/apis/auth-api';
import { debugAPI } from '../lib/apis/debug-api';
import { debugCookies } from '../lib/cookie-utils';

export const AuthDebugComponent: React.FC = () => {
  const testSession = async () => {
    console.log('=== TESTING SESSION ===');
    
    try {
      // Test Better Auth session
      console.log('1. Testing Better Auth session...');
      const session = await authAPI.getSession();
      console.log('Session result:', session);
    } catch (error) {
      console.error('Better Auth session failed:', error);
    }
    
    try {
      // Test manual cookies session
      console.log('2. Testing manual cookies session...');
      const manualSession = await authAPI.getSessionWithManualCookies();
      console.log('Manual session result:', manualSession);
    } catch (error) {
      console.error('Manual session failed:', error);
    }
    
    try {
      // Test debug endpoint
      console.log('3. Testing debug endpoint...');
      const debugResult = await debugAPI.testSession();
      console.log('Debug result:', debugResult);
    } catch (error) {
      console.error('Debug endpoint failed:', error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Auth Debug Panel</h3>
      <button onClick={debugCookies} style={{ margin: '5px' }}>
        Debug Cookies
      </button>
      <button onClick={testSession} style={{ margin: '5px' }}>
        Test Session
      </button>
    </div>
  );
};
