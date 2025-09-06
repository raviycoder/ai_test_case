import { apiClient } from "../api-client";

export const userAPI = {
    // Fetch all users
    getUsers: async () => {
        const response = await apiClient.get("/api/users");
        return response.data;
    },
    
    // Fetch user by ID
    getUserById: async (id: string) => {
        const response = await apiClient.get(`/api/users/${id}`);
        return response.data;
    },
    
    // Create a new user
    createUser: async (userData: { email: string; name: string }) => {
        const response = await apiClient.post("/api/users", userData);
        return response.data;
    },
    
    // Update an existing user
    updateUser: async (id: string, updateData: object) => {
        const response = await apiClient.put(`/api/users/${id}`, updateData);
        return response.data;
    },
    
    // Delete a user
    deleteUser: async (id: string) => {
        const response = await apiClient.delete(`/api/users/${id}`);
        return response.data;
    },
}