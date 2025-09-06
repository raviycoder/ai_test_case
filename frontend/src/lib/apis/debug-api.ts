import { apiClient } from '../api-client';

export const debugAPI = {
  // Test session debug endpoint
  testSession: async () => {
    try {
      console.log('Calling debug session endpoint...');
      const response = await apiClient.get('/debug/session');
      console.log('Debug session response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Debug session error:', error);
      throw error;
    }
  }
};
