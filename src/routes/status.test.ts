import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';

describe('Status Routes', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis() as any,
    };
    jest.resetModules();
  });

  it('should return status with config and git info', async () => {
    const statusRoutes = await import('./status.js');
    const statusRoute = statusRoutes.default.stack.find((layer: any) => layer.route.path === '/status');
    const handler = statusRoute.route.stack[0].handle;

    await handler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.any(Object),
        git: expect.objectContaining({ commit: expect.any(String) })
      })
    );
  });

  it('should return "unknown" commit when git command fails', async () => {
    jest.unstable_mockModule('child_process', () => ({
      execSync: jest.fn(() => {
        throw new Error('git not found');
      })
    }));

    const statusRoutes = await import('./status.js');
    const statusRoute = statusRoutes.default.stack.find((layer: any) => layer.route.path === '/status');
    const handler = statusRoute.route.stack[0].handle;

    await handler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        git: { commit: 'unknown' }
      })
    );
  });

  it('should return metrics data', async () => {
    const statusRoutes = await import('./status.js');
    const metricsRoute = statusRoutes.default.stack.find((layer: any) => layer.route.path === '/metrics');
    const handler = metricsRoute.route.stack[0].handle;

    await handler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        uptimeSeconds: expect.any(Number),
        requests: expect.any(Object)
      })
    );
  });
});
