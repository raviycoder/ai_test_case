import { Router } from "express";
import { getFileContent, getGithubRepos, getRepoFiles, getRepoTree } from "../controllers/repo.controller";
import { isGitHubAccountLinked } from "../controllers/github.controller";

const router = Router();

// GET /api/github/repos
router.get("/repos", getGithubRepos);

// GET /api/github/repos/:owner/:repo/contents
router.get("/repos/:owner/:repo/contents", getRepoFiles);

// GET /api/github/repos/:owner/:repo/tree?branch=main
router.get("/repos/:owner/:repo/tree", getRepoTree);

// GET /api/github/repos/:owner/:repo/contents/:path(*) - path can include slashes
router.get("/repos/:owner/:repo/contents/*", getFileContent);

router.get("/is-linked/:id", isGitHubAccountLinked);

export default router;

