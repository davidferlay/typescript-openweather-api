import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './auth.js';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  const originalEnv = process.env.JWT_SECRET;

  beforeEach(() => {
    mockRequest = { headers: {}, path: '/test' };
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
    };
    mockNext = jest.fn() as jest.MockedFunction<NextFunction>;
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  it('should return 401 when authorization header is missing', () => {
    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when token format is invalid', () => {
    mockRequest.headers = { authorization: 'InvalidFormat' };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token format' });
  });

  it('should return 500 when JWT_SECRET is not configured', () => {
    delete process.env.JWT_SECRET;
    mockRequest.headers = { authorization: 'Bearer sometoken' };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Server configuration error' });
  });

  it('should call next() with valid token and attach user to request', () => {
    const token = jwt.sign({ userId: 1, username: 'testuser' }, 'test-secret');
    mockRequest.headers = { authorization: `Bearer ${token}` };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.user).toBeDefined();
    expect((mockRequest.user as any).username).toBe('testuser');
  });

  it('should return 403 with invalid or expired token', () => {
    const expiredToken = jwt.sign({ userId: 1 }, 'test-secret', { expiresIn: '-1s' });
    mockRequest.headers = { authorization: `Bearer ${expiredToken}` };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });
});
