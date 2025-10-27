import { Router } from "express";
import { execSync } from "child_process";
import { config } from "../config.js";

const router = Router();

function getGitCommitSha(): string {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

router.get("/status", (req, res) => {
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

export default router;
