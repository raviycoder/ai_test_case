import { Router } from "express";
import { getGithubRepos, getRepoFiles, getRepoTree } from "../controllers/repo.controller";

const router = Router();

// GET /api/github/repos
router.get("/repos", getGithubRepos);

// GET /api/github/repos/:owner/:repo/contents
router.get("/repos/:owner/:repo/contents", getRepoFiles);

// GET /api/github/repos/:owner/:repo/tree?branch=main
router.get("/repos/:owner/:repo/tree", getRepoTree);

export default router;

