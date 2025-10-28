import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';

describe('Weather Routes', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.unstable_mockModule('../services/weather.js', () => ({
      getWeather: jest.fn(),
    }));

    mockRequest = { params: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
      setHeader: jest.fn() as any,
    };
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('should return 400 when city parameter is missing', async () => {
    const weatherRoutes = await import('./weather.js');
    const route = weatherRoutes.default.stack[0].route;
    const handler = route.stack[1].handle; // index 1 because authMiddleware is at 0

    mockRequest.params = {};
    await handler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'City parameter is required' });
  });

  it('should return weather data with cache status', async () => {
    const weatherService = await import('../services/weather.js');
    const weatherRoutes = await import('./weather.js');

    (weatherService.getWeather as jest.Mock).mockResolvedValue({
      data: { city: 'Paris', weather: 'Sunny', temperature: 22 },
      fromCache: true
    });

    const route = weatherRoutes.default.stack[0].route;
    const handler = route.stack[1].handle;

    mockRequest.params = { city: 'Paris' };
    await handler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Cache-Status', 'HIT');
    expect(mockResponse.json).toHaveBeenCalledWith({ city: 'Paris', weather: 'Sunny', temperature: 22 });
  });

  it('should return 500 on weather service error', async () => {
    const weatherService = await import('../services/weather.js');
    const weatherRoutes = await import('./weather.js');

    (weatherService.getWeather as jest.Mock).mockRejectedValue(new Error('API error'));

    const route = weatherRoutes.default.stack[0].route;
    const handler = route.stack[1].handle;

    mockRequest.params = { city: 'Paris' };
    await handler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Weather fetch failed' });
  });
});
