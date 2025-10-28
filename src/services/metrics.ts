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

    // Update endpoint stats
    const endpoint: string = `${method} ${path}`;
    const stats: EndpointStats = this.endpointStats.get(endpoint) || {
      count: 0,
      totalDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
    };

    stats.count++;
    stats.totalDuration += duration;
    stats.minDuration = Math.min(stats.minDuration, duration);
    stats.maxDuration = Math.max(stats.maxDuration, duration);

    this.endpointStats.set(endpoint, stats);

    // Track errors
    if (statusCode >= 400) {
      this.errors.set(statusCode, (this.errors.get(statusCode) || 0) + 1);
    }
  }

  trackCacheHit(): void {
    this.cacheHits++;
  }

  trackCacheMiss(): void {
    this.cacheMisses++;
  }

  // Get all metrics
  getMetrics(): MetricsResponse {
    const uptimeSeconds: number = Math.floor((Date.now() - this.startTime) / 1000);

    // Endpoint-specific stats
    const endpoints: Record<string, {
      count: number;
      avgDurationMs: number;
      minDurationMs: number;
      maxDurationMs: number;
    }> = {};
    this.endpointStats.forEach((stats, endpoint) => {
      endpoints[endpoint] = {
        count: stats.count,
        avgDurationMs: Math.round(stats.totalDuration / stats.count),
        minDurationMs: stats.minDuration === Infinity ? 0 : stats.minDuration,
        maxDurationMs: stats.maxDuration,
      };
    });

    // Cache stats
    const totalCacheOps: number = this.cacheHits + this.cacheMisses;
    const cacheHitRate: number = totalCacheOps > 0 ? (this.cacheHits / totalCacheOps) * 100 : 0;

    // Error stats
    const errorsByCode: Record<number, number> = {};
    this.errors.forEach((count, code) => {
      errorsByCode[code] = count;
    });

    return {
      uptimeSeconds: uptimeSeconds,
      requests: {
        total: this.requestCount,
      },
      endpoints,
      cache: {
        hits: this.cacheHits,
        misses: this.cacheMisses,
        hitRate: Math.round(cacheHitRate * 100) / 100,
      },
      errors: {
        total: Array.from(this.errors.values()).reduce((a, b) => a + b, 0),
        byStatusCode: errorsByCode,
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
