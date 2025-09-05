import type { Request, Response } from "express";
import { getAuth } from "./auth.controller";
import { fromNodeHeaders } from "better-auth/node";
import axios from "axios";

// Utility function to safely decode file paths
const safeDecodeFilePath = (encodedPath: string): string => {
    try {
        // Handle multiple encoding scenarios
        let decodedPath = decodeURIComponent(encodedPath);
        
        // If the path was double-encoded, decode again
        if (decodedPath.includes('%')) {
            try {
                decodedPath = decodeURIComponent(decodedPath);
            } catch {
                // If second decode fails, use the first decode result
            }
        }
        
        return decodedPath;
    } catch (error) {
        console.warn("Failed to decode file path:", encodedPath, error);
        // Return the original path if decoding fails
        return encodedPath;
    }
};

// Utility function to safely encode file paths for GitHub API
const safeEncodeFilePath = (path: string): string => {
    try {
        // Split by forward slashes and encode each segment
        return path.split('/').map(segment => encodeURIComponent(segment)).join('/');
    } catch (error) {
        console.warn("Failed to encode file path:", path, error);
        // Fallback to simple encoding
        return encodeURIComponent(path);
    }
};

// Fetch the current user's GitHub repositories using Better Auth's access token
export const getGithubRepos = async (req: Request, res: Response) => {
    try {
        const auth = await getAuth();
                // Obtain provider access token for current session
        const tokenResp = await auth.api.getAccessToken({
            body: { providerId: "github" },
            headers: fromNodeHeaders(req.headers),
        });

        console.log("🤗🤗🤗 Token response:", tokenResp);

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

        // Filter tree to include only testable files and their containing directories
        const rawTree = treeRes.data;
        const testableExtensions = new Set([
            '.js', '.jsx', '.ts', '.tsx',           // JavaScript/TypeScript
            '.py',                                   // Python
            '.java',                                 // Java
            '.kt', '.kts',                          // Kotlin
            '.cs',                                   // C#
            '.cpp', '.cc', '.cxx', '.c',            // C/C++
            '.php',                                  // PHP
            '.rb',                                   // Ruby
            '.go',                                   // Go
            '.rs',                                   // Rust
            '.swift',                                // Swift
            '.dart',                                 // Dart
            '.scala',                                // Scala
            '.m', '.mm',                            // Objective-C
            '.vue',                                  // Vue.js
            '.svelte'                               // Svelte
        ]);

        // Extract testable files and build directory structure
        const testableFiles = new Set<string>();
        const requiredDirs = new Set<string>();

        // Find all testable files
        rawTree.tree?.forEach((item: any) => {
            if (item.type === 'blob') {
                const ext = item.path.substring(item.path.lastIndexOf('.'));
                if (testableExtensions.has(ext.toLowerCase())) {
                    testableFiles.add(item.path);
                    
                    // Add all parent directories to required dirs
                    const pathParts = item.path.split('/');
                    for (let i = 1; i < pathParts.length; i++) {
                        const dirPath = pathParts.slice(0, i).join('/');
                        requiredDirs.add(dirPath);
                    }
                }
            }
        });

        // Filter tree to include only testable files and required directories
        const filteredTree = rawTree.tree?.filter((item: any) => {
            if (item.type === 'blob') {
                return testableFiles.has(item.path);
            } else if (item.type === 'tree') {
                return requiredDirs.has(item.path);
            }
            return false;
        }) || [];

        // Return filtered tree with metadata
        return res.json({ 
            tree: {
                ...rawTree,
                tree: filteredTree
            },
            meta: {
                totalFiles: rawTree.tree?.length || 0,
                testableFiles: testableFiles.size,
                supportedExtensions: Array.from(testableExtensions)
            }
        });
    } catch (err) {
        console.error("getRepoTree error:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch repository tree" });
    }
}

export const getFileContent = async (req: Request, res: Response) => {
    const { owner, repo } = req.params;
    // Get the wildcard path and decode it properly
    let filePath = req.params[0] || '';
    
    try {
        // Safely decode the file path that was encoded when sent from frontend
        const decodedPath = safeDecodeFilePath(filePath);
        
        console.log("Original path:", filePath);
        console.log("Decoded file path:", decodedPath);

        const auth = await getAuth();
        const tokenResp = await auth.api.getAccessToken({
            body: { providerId: "github" },
            headers: fromNodeHeaders(req.headers),
        });

        if (tokenResp.error || !tokenResp?.accessToken) {
            return res.status(401).json({ success: false, message: "No provider access token" });
        }

        const accessToken = tokenResp.accessToken as string;

        // Safely encode the path for GitHub API call
        const encodedPath = safeEncodeFilePath(decodedPath);
        console.log("Sending to GitHub API with encoded path:", encodedPath);

        const axiosRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`, {
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
            console.error("GitHub API error:", ghRes.status, err);
            return res.status(ghRes.status).json({ 
                success: false, 
                message: "GitHub error", 
                data: err,
                path: decodedPath 
            });
        }

        const fileData = (await ghRes.json()) as any;

        // If the file is a blob, we can return its content
        if (fileData.type === 'file') {
            return res.json({
                success: true,
                content: fileData.content,
                encoding: fileData.encoding,
                name: fileData.name,
                path: decodedPath, // Return the original decoded path
                size: fileData.size,
                sha: fileData.sha,
                download_url: fileData.download_url
            });
        }

        return res.status(404).json({ 
            success: false, 
            message: "File not found or is not a file", 
            path: decodedPath 
        });
    } catch (err) {
        console.error("getFileContent error:", err);
        console.error("File path that caused error:", filePath);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to fetch file content",
            error: err instanceof Error ? err.message : "Unknown error",
            path: filePath 
        });
    }
}
