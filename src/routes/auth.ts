import { Router } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { logger } from "../services/logger.js";

const router = Router();

// TODO: upgrade in favor of real /registration user workflow
router.post("/get-token", (req, res) => {
  const { username, password } = req.body || {};

  // Check if authentication is configured
  if (!config.auth.username || !config.auth.password) {
    logger.error("Authentication not configured - E2E_AUTH_USERNAME and E2E_AUTH_PASSWORD must be set");
    return res.status(503).json({ error: "Authentication service not available" });
  }

  // Validate credentials
  if (!username || !password) {
    logger.warn("Authentication attempt with missing credentials");
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (username !== config.auth.username || password !== config.auth.password) {
    logger.warn("Failed authentication attempt", { username });
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error("JWT_SECRET not configured");
    return res.status(500).json({ error: "Server configuration error" });
  }
  const payload = { username };
  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  logger.info("User authenticated successfully", { username });
  res.json({ token });
});

export default router;

