import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "./logger.js";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader: string | undefined = req.headers['authorization'];
  const hasAuthHeader: boolean = Boolean(authHeader);
  if (!hasAuthHeader) {
    logger.warn("Request without authorization header", { path: req.path });
    res.status(401).json({ error: "No token" });
    return;
  }

  const token: string | undefined = authHeader!.split(" ")[1];
  const hasValidTokenFormat: boolean = Boolean(token);
  if (!hasValidTokenFormat) {
    logger.warn("Request with invalid token format", { path: req.path });
    res.status(401).json({ error: "Invalid token format" });
    return;
  }

  const jwtSecret: string | undefined = process.env["JWT_SECRET"];
  const isSecretConfigured: boolean = Boolean(jwtSecret);
  if (!isSecretConfigured) {
    logger.error("JWT_SECRET not configured in auth middleware");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  try {
    req.user = jwt.verify(token!, jwtSecret!);
    next();
  } catch (err) {
    const errorMessage: string = err instanceof Error ? err.message : String(err);
    logger.warn("Invalid token verification", { path: req.path, error: errorMessage });
    res.status(403).json({ error: "Invalid token" });
  }
}

