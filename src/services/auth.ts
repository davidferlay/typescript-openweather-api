import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "./logger.js";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader: string | undefined = req.headers['authorization'];
  if (!authHeader) {
    logger.warn("Request without authorization header", { path: req.path });
    res.status(401).json({ error: "No token" });
    return;
  }
  const token: string | undefined = authHeader.split(" ")[1];
  if (!token) {
    logger.warn("Request with invalid token format", { path: req.path });
    res.status(401).json({ error: "Invalid token format" });
    return;
  }
  const secret: string | undefined = process.env["JWT_SECRET"];
  if (!secret) {
    logger.error("JWT_SECRET not configured in auth middleware");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }
  try {
    req.user = jwt.verify(token, secret);
    next();
  } catch (err) {
    logger.warn("Invalid token verification", { path: req.path, error: err instanceof Error ? err.message : String(err) });
    res.status(403).json({ error: "Invalid token" });
  }
}

