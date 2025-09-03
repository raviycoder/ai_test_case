import axios from "axios";

const bashUrl = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/users`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const userAPI = {
    // Fetch all users
    getUsers: async () => {
        const response = await bashUrl.get("/");
        return response.data;
    },
    
    // Fetch user by ID
    getUserById: async (id: string) => {
        const response = await bashUrl.get(`/${id}`);
        return response.data;
    },
    
    // Create a new user
    createUser: async (userData: { email: string; name: string }) => {
        const response = await bashUrl.post("/", userData);
        return response.data;
    },
    
    // Update an existing user
    updateUser: async (id: string, updateData: object) => {
        const response = await bashUrl.put(`/${id}`, updateData);
        return response.data;
    },
    
    // Delete a user
    deleteUser: async (id: string) => {
        const response = await bashUrl.delete(`/${id}`);
        return response.data;
    },
}