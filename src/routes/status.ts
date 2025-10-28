import { Router } from "express";
import { execSync } from "child_process";
import { config } from "../config.js";
import { metrics } from "../services/metrics.js";

const router: Router = Router();

function getGitCommitSha(): string {
  try {
    const commitSha: string = execSync("git rev-parse --short HEAD").toString().trim();
    return commitSha;
  } catch {
    return "unknown";
  }
}

router.get("/status", (_req, res) => {
  const currentCommit: string = getGitCommitSha();

  res.json({
    config: {
      cacheTTL: config.weather.cacheTTL,
      units: config.weather.units,
    },
    git: {
      commit: currentCommit,
    },
  });
});

router.get("/metrics", (_req, res) => {
  const currentMetrics: unknown = metrics.getMetrics();
  res.json(currentMetrics);
});

export default router;
