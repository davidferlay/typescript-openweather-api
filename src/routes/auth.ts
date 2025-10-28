import { Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config.js";
import { logger } from "../services/logger.js";

const TOKEN_EXPIRATION_TIME = "1h" as const;

const router: Router = Router();

router.post("/get-token", (req, res) => {
  const { username, password } = req.body || {};

  const isAuthConfigured: boolean = Boolean(config.auth.username && config.auth.password);
  if (!isAuthConfigured) {
    logger.error("Authentication not configured - E2E_AUTH_USERNAME and E2E_AUTH_PASSWORD must be set");
    return res.status(503).json({ error: "Authentication service not available" });
  }

  const hasCredentials: boolean = Boolean(username && password);
  if (!hasCredentials) {
    logger.warn("Authentication attempt with missing credentials");
    return res.status(400).json({ error: "Username and password are required" });
  }

  const credentialsMatch: boolean = (username === config.auth.username && password === config.auth.password);
  if (!credentialsMatch) {
    logger.warn("Failed authentication attempt", { username });
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const jwtSecret: string | undefined = process.env["JWT_SECRET"];
  if (!jwtSecret) {
    logger.error("JWT_SECRET not configured");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const tokenPayload: JwtPayload = { username };
  const token: string = jwt.sign(tokenPayload, jwtSecret!, { expiresIn: TOKEN_EXPIRATION_TIME });

  logger.info("User authenticated successfully", { username });
  return res.json({ token });
});

export default router;

