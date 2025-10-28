import { Request, Response, NextFunction } from "express";

interface EndpointStats {
  count: number;
  totalDuration: number;
  minDuration: number;
  maxDuration: number;
}

interface MetricsResponse {
  uptimeSeconds: number;
  requests: {
    total: number;
  };
  endpoints: Record<string, {
    count: number;
    avgDurationMs: number;
    minDurationMs: number;
    maxDurationMs: number;
  }>;
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  errors: {
    total: number;
    byStatusCode: Record<number, number>;
  };
}

class MetricsCollector {
  private requestCount: number = 0;
  private endpointStats: Map<string, EndpointStats> = new Map();
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private errors: Map<number, number> = new Map();
  private startTime: number = Date.now();

  trackRequest(method: string, path: string, statusCode: number, duration: number): void {
    this.requestCount++;

    const endpointKey: string = `${method} ${path}`;
    const currentStats: EndpointStats = this.endpointStats.get(endpointKey) || {
      count: 0,
      totalDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
    };

    currentStats.count++;
    currentStats.totalDuration += duration;
    currentStats.minDuration = Math.min(currentStats.minDuration, duration);
    currentStats.maxDuration = Math.max(currentStats.maxDuration, duration);

    this.endpointStats.set(endpointKey, currentStats);

    const isError: boolean = statusCode >= 400;
    if (isError) {
      const currentErrorCount: number = this.errors.get(statusCode) || 0;
      this.errors.set(statusCode, currentErrorCount + 1);
    }
  }

  trackCacheHit(): void {
    this.cacheHits++;
  }

  trackCacheMiss(): void {
    this.cacheMisses++;
  }

  getMetrics(): MetricsResponse {
    const currentTime: number = Date.now();
    const uptimeSeconds: number = Math.floor((currentTime - this.startTime) / 1000);

    const endpointsData: Record<string, {
      count: number;
      avgDurationMs: number;
      minDurationMs: number;
      maxDurationMs: number;
    }> = {};

    this.endpointStats.forEach((stats, endpointKey) => {
      const avgDuration: number = Math.round(stats.totalDuration / stats.count);
      const minDuration: number = stats.minDuration === Infinity ? 0 : stats.minDuration;

      endpointsData[endpointKey] = {
        count: stats.count,
        avgDurationMs: avgDuration,
        minDurationMs: minDuration,
        maxDurationMs: stats.maxDuration,
      };
    });

    const totalCacheOperations: number = this.cacheHits + this.cacheMisses;
    const hasCacheOperations: boolean = totalCacheOperations > 0;
    const cacheHitRate: number = hasCacheOperations ? (this.cacheHits / totalCacheOperations) * 100 : 0;
    const roundedCacheHitRate: number = Math.round(cacheHitRate * 100) / 100;

    const errorsByStatusCode: Record<number, number> = {};
    this.errors.forEach((count, statusCode) => {
      errorsByStatusCode[statusCode] = count;
    });

    const errorCounts: number[] = Array.from(this.errors.values());
    const totalErrors: number = errorCounts.reduce((sum, count) => sum + count, 0);

    return {
      uptimeSeconds: uptimeSeconds,
      requests: {
        total: this.requestCount,
      },
      endpoints: endpointsData,
      cache: {
        hits: this.cacheHits,
        misses: this.cacheMisses,
        hitRate: roundedCacheHitRate,
      },
      errors: {
        total: totalErrors,
        byStatusCode: errorsByStatusCode,
      },
    };
  }
}

// Singleton instance
export const metrics: MetricsCollector = new MetricsCollector();

// Express middleware for tracking request metrics
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime: number = Date.now();

  res.on("finish", () => {
    const duration: number = Date.now() - startTime;
    const path: string = req.route?.path || req.path;
    metrics.trackRequest(req.method, path, res.statusCode, duration);
  });

  next();
}
