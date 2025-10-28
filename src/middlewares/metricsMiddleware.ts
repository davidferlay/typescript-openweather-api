import { Request, Response, NextFunction } from "express";
import { metrics } from "../services/metrics.js";

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const path = req.route?.path || req.path;
    metrics.trackRequest(req.method, path, res.statusCode, duration);
  });

  next();
}
