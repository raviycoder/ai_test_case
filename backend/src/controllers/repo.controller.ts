import type { Request, Response } from "express";
import { getAuth } from "./auth.controller";
import { fromNodeHeaders } from "better-auth/node";
import axios from "axios";

// Fetch the current user's GitHub repositories using Better Auth's access token
export const getGithubRepos = async (req: Request, res: Response) => {
    try {
        const auth = await getAuth();
                // Obtain provider access token for current session
        const tokenResp = await auth.api.getAccessToken({
            body: { providerId: "github" },
            headers: fromNodeHeaders(req.headers),
        });

        console.log("GitHub access token response:", tokenResp);

        if (tokenResp.error || !tokenResp?.accessToken) {
            return res.status(401).json({ success: false, message: "No provider access token" });
        }

        const accessToken = tokenResp.accessToken as string;

                // Pagination params
                const page = Math.max(parseInt(String(req.query.page || "1"), 10) || 1, 1);
                const perPage = Math.min(
                    Math.max(parseInt(String(req.query.perPage || "20"), 10) || 20, 1),
                    100
                );

                const axiosRes = await axios.get("https://api.github.com/user/repos", {
            headers: {
            Authorization: `Bearer ${accessToken}`,
            // Accept: "application/vnd.github+json",
            // "User-Agent": "better-auth-example",
            },
                        params: { per_page: perPage, page },
            validateStatus: () => true, // don't throw on non-2xx
        });

        const ghRes = {
            ok: axiosRes.status >= 200 && axiosRes.status < 300,
            status: axiosRes.status,
            text: async () =>
            typeof axiosRes.data === "string" ? axiosRes.data : JSON.stringify(axiosRes.data),
            json: async () => axiosRes.data,
        };

        if (!ghRes.ok) {
            const err = await ghRes.text();
            return res.status(ghRes.status).json({ success: false, message: "GitHub error", data: err });
        }

                const repos = (await ghRes.json()) as Array<any>;

                // Map to requested schema
                const repositories = repos.map((r) => ({
                    id: r.id,
                    name: r.name,
                    fullName: r.full_name,
                    description: r.description,
                    language: r.language,
                    private: r.private,
                    defaultBranch: r.default_branch,
                    updatedAt: r.updated_at,
                    size: r.size,
                    hasCode: (r.size ?? 0) > 0,
                    testable: false, // set true if you later analyze repo contents
                    frameworks: [] as string[], // fill after content analysis if needed
                    fileStats: {
                        total: 0,
                        testable: 0,
                        extensions: {} as Record<string, number>,
                    },
                    url: r.html_url,
                }));

                // Compute meta.hasMore from Link header
                const link = axiosRes.headers["link"] as string | undefined;
                const hasMore = Boolean(link && link.includes('rel="next"'));

                const meta = {
                    total: repositories.length, // total in this page; overall total requires extra calls
                    page,
                    perPage,
                    hasMore,
                };

                return res.json({ repositories, meta });
    } catch (err) {
        console.error("getGithubRepos error:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch repositories" });
    }
};


export const getRepoFiles = async (req: Request, res: Response) => {
    try {
        const { owner, repo } = req.params;
        const auth = await getAuth();
        const tokenResp = await auth.api.getAccessToken({
            body: { providerId: "github" },
            headers: fromNodeHeaders(req.headers),
        });

        console.log("GitHub access token response:", tokenResp);

        if (tokenResp.error || !tokenResp?.accessToken) {
            return res.status(401).json({ success: false, message: "No provider access token" });
        }

        const accessToken = tokenResp.accessToken as string;

        const axiosRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            validateStatus: () => true, // don't throw on non-2xx
        });

        const ghRes = {
            ok: axiosRes.status >= 200 && axiosRes.status < 300,
            status: axiosRes.status,
            text: async () =>
                typeof axiosRes.data === "string" ? axiosRes.data : JSON.stringify(axiosRes.data),
            json: async () => axiosRes.data,
        };

        if (!ghRes.ok) {
            const err = await ghRes.text();
            return res.status(ghRes.status).json({ success: false, message: "GitHub error", data: err });
        }

        const files = (await ghRes.json()) as Array<any>;

        return res.json({ files });
    } catch (err) {
        console.error("getRepoFiles error:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch repository files" });
    }
}

// Fetch full repository file tree (recursive)
export const getRepoTree = async (req: Request, res: Response) => {
    try {
        const { owner, repo } = req.params;
        const branch = (req.query.branch as string) || "main";

        const auth = await getAuth();
        const tokenResp = await auth.api.getAccessToken({
            body: { providerId: "github" },
            headers: fromNodeHeaders(req.headers),
        });

        if (tokenResp.error || !tokenResp?.accessToken) {
            return res.status(401).json({ success: false, message: "No provider access token" });
        }

        const accessToken = tokenResp.accessToken as string;

        // Step 1: Get branch tip commit SHA
        const branchRes = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                validateStatus: () => true,
            }
        );

        if (branchRes.status < 200 || branchRes.status >= 300) {
            return res
                .status(branchRes.status)
                .json({ success: false, message: "GitHub error (branch)", data: branchRes.data });
        }

        const commitSha: string = branchRes.data?.commit?.sha;

        if (!commitSha) {
            return res.status(400).json({ success: false, message: "Could not resolve branch commit SHA" });
        }

        // Step 2: Resolve tree SHA from commit
        const commitRes = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/git/commits/${commitSha}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                validateStatus: () => true,
            }
        );

        if (commitRes.status < 200 || commitRes.status >= 300) {
            return res
                .status(commitRes.status)
                .json({ success: false, message: "GitHub error (commit)", data: commitRes.data });
        }

        const treeSha: string | undefined = commitRes.data?.tree?.sha;
        if (!treeSha) {
            return res.status(400).json({ success: false, message: "Could not resolve tree SHA from commit" });
        }

        // Step 3: Fetch recursive tree
        const treeRes = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                validateStatus: () => true,
            }
        );

        if (treeRes.status < 200 || treeRes.status >= 300) {
            return res
                .status(treeRes.status)
                .json({ success: false, message: "GitHub error (tree)", data: treeRes.data });
        }

        // Return tree as-is to keep flexible on the frontend
        return res.json({ tree: treeRes.data });
    } catch (err) {
        console.error("getRepoTree error:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch repository tree" });
    }
}