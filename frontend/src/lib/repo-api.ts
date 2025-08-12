import axios from "axios";

const base = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/github`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const repoAPI = {
  getRepos: async ({ page = 1, perPage = 20 }: { page?: number; perPage?: number } = {}) => {
    const res = await base.get("/repos", {
      params: { page, perPage }
    });
    return res.data;
  },
  getRepoFiles: async (owner: string, repo: string) => {
    const res = await base.get(`/repos/${owner}/${repo}/contents`);
    return res.data;
  },
  getRepoTree: async (owner: string, repo: string, branch = 'main') => {
    const res = await base.get(`/repos/${owner}/${repo}/tree`, { params: { branch } });
    return res.data;
  }
};