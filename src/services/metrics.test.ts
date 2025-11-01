import { describe, it, expect, jest } from '@jest/globals';
import { metrics, metricsMiddleware } from './metrics.js';
import { Request, Response, NextFunction } from 'express';

describe('Metrics', () => {
  describe('trackRequest', () => {
    it('should track request count and endpoint statistics', () => {
      const initialMetrics = metrics.getMetrics();
      const initialCount = initialMetrics.requests.total;

      metrics.trackRequest('GET', '/test', 200, 100);

      const updatedMetrics = metrics.getMetrics();
      expect(updatedMetrics.requests.total).toBe(initialCount + 1);

      const endpoint = updatedMetrics.endpoints['GET /test'];
      expect(endpoint).toBeDefined();
      expect(endpoint.count).toBeGreaterThan(0);
      expect(endpoint.avgDurationMs).toBe(100);
    });

    it('should track min and max durations', () => {
      metrics.trackRequest('GET', '/duration', 200, 50);
      metrics.trackRequest('GET', '/duration', 200, 200);

      const metricsData = metrics.getMetrics();
      const endpoint = metricsData.endpoints['GET /duration'];

      expect(endpoint.minDurationMs).toBeLessThanOrEqual(50);
      expect(endpoint.maxDurationMs).toBeGreaterThanOrEqual(200);
    });

    it('should track errors by status code', () => {
      metrics.trackRequest('GET', '/error', 404, 50);

      const metricsData = metrics.getMetrics();
      expect(metricsData.errors.total).toBeGreaterThan(0);
      expect(metricsData.errors.byStatusCode[404]).toBeGreaterThan(0);
    });
  });

  describe('cache tracking', () => {
    it('should track cache hits and misses with hit rate', () => {
      const initialMetrics = metrics.getMetrics();
      const initialHits = initialMetrics.cache.hits;
      const initialMisses = initialMetrics.cache.misses;

      metrics.trackCacheHit();
      metrics.trackCacheMiss();

      const updatedMetrics = metrics.getMetrics();
      expect(updatedMetrics.cache.hits).toBe(initialHits + 1);
      expect(updatedMetrics.cache.misses).toBe(initialMisses + 1);
      expect(updatedMetrics.cache.hitRate).toBeGreaterThan(0);
      expect(updatedMetrics.cache.hitRate).toBeLessThanOrEqual(100);
    });
  });

  describe('getMetrics', () => {
    it('should return complete metrics with uptime', () => {
      const metricsData = metrics.getMetrics();

      expect(metricsData).toHaveProperty('uptimeSeconds');
      expect(metricsData).toHaveProperty('requests');
      expect(metricsData).toHaveProperty('endpoints');
      expect(metricsData).toHaveProperty('cache');
      expect(metricsData).toHaveProperty('errors');
      expect(typeof metricsData.uptimeSeconds).toBe('number');
    });
  });

  describe('metricsMiddleware', () => {
    it('should track request metrics via middleware', (done) => {
      const mockRequest = {
        method: 'POST',
        path: '/api/test',
        baseUrl: '',
        route: { path: '/api/test' }
      } as Partial<Request>;

      const mockResponse = {
        statusCode: 201,
        on: jest.fn((event: string, callback: () => void) => {
          if (event === 'finish') {
            setTimeout(() => {
              callback();

              const metricsData = metrics.getMetrics();
              const endpoint = metricsData.endpoints['POST /api/test'];
              expect(endpoint).toBeDefined();
              expect(endpoint.count).toBeGreaterThan(0);
              done();
            }, 0);
          }
        })
      } as Partial<Response>;

      const mockNext = jest.fn() as jest.MockedFunction<NextFunction>;

      metricsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should track mounted routes with baseUrl and route path', (done) => {
      const mockRequest = {
        method: 'GET',
        path: '/weather/Paris',
        baseUrl: '/weather',
        route: { path: '/:city' }
      } as Partial<Request>;

      const mockResponse = {
        statusCode: 200,
        on: jest.fn((event: string, callback: () => void) => {
          if (event === 'finish') {
            setTimeout(() => {
              callback();

              const metricsData = metrics.getMetrics();
              const endpoint = metricsData.endpoints['GET /weather/:city'];
              expect(endpoint).toBeDefined();
              expect(endpoint.count).toBeGreaterThan(0);
              done();
            }, 0);
          }
        })
      } as Partial<Response>;

      const mockNext = jest.fn() as jest.MockedFunction<NextFunction>;

      metricsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
