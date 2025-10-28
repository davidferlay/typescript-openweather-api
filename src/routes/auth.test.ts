import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Request, Response } from 'express';

describe('Auth Routes', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    mockRequest = { body: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
    };
    jest.resetModules();
    // Ensure JWT_SECRET is set for tests
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  it('should return 400 when credentials are missing', async () => {
    const authRoutes = await import('./auth.js');
    const route = authRoutes.default.stack[0].route;
    const handler = route.stack[0].handle;

    mockRequest.body = {};
    await handler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username and password are required' });
  });

  it('should return 401 with invalid credentials', async () => {
    const authRoutes = await import('./auth.js');
    const route = authRoutes.default.stack[0].route;
    const handler = route.stack[0].handle;

    mockRequest.body = { username: 'wrong', password: 'wrong' };
    await handler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  it('should return token with valid credentials', async () => {
    const authRoutes = await import('./auth.js');
    const route = authRoutes.default.stack[0].route;
    const handler = route.stack[0].handle;

    mockRequest.body = { username: 'indy', password: 'password123' };
    await handler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ token: expect.any(String) })
    );
  });
});
