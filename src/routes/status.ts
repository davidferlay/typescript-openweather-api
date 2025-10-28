import { Router } from "express";
import { execSync } from "child_process";
import { config } from "../config.js";
import { metrics } from "../services/metrics.js";

const router: Router = Router();

function getGitCommitSha(): string {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

router.get("/status", (_req, res) => {
  res.json({
    config: {
      cacheTTL: config.weather.cacheTTL,
      units: config.weather.units,
    },
    git: {
      commit: getGitCommitSha(),
    },
  });
});

router.get("/metrics", (_req, res) => {
  res.json(metrics.getMetrics());
});

export default router;
