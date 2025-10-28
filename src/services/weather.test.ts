import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Weather Service', () => {
  const originalEnv = process.env.OWM_API_KEY;

  beforeEach(() => {
    jest.unstable_mockModule('./cache.js', () => ({
      getCachedWeather: jest.fn(),
      setCachedWeather: jest.fn(),
    }));

    jest.unstable_mockModule('axios', () => ({
      default: {
        get: jest.fn(),
      },
    }));

    process.env.OWM_API_KEY = 'test-api-key';
  });

  afterEach(async () => {
    process.env.OWM_API_KEY = originalEnv;
    jest.resetModules();
  });

  it('should return cached data when available', async () => {
    const cache = await import('./cache.js');
    const { getWeather } = await import('./weather.js');
    const cachedData = { city: 'Paris', weather: 'Sunny', temperature: 22 };
    (cache.getCachedWeather as jest.Mock).mockReturnValue(cachedData);

    const result = await getWeather('Paris');

    expect(result.data).toEqual(cachedData);
    expect(result.fromCache).toBe(true);
  });

  it('should fetch from API when cache misses', async () => {
    const cache = await import('./cache.js');
    const axios = await import('axios');
    const { getWeather } = await import('./weather.js');

    (cache.getCachedWeather as jest.Mock).mockReturnValue(undefined);
    (axios.default.get as jest.Mock).mockResolvedValue({
      data: {
        name: 'London',
        weather: [{ main: 'Rainy' }],
        main: { temp: 15 }
      }
    });

    const result = await getWeather('London');

    expect(result.data).toEqual({ city: 'London', weather: 'Rainy', temperature: 15 });
    expect(result.fromCache).toBe(false);
  });

  it('should throw error when OWM_API_KEY is missing', async () => {
    const cache = await import('./cache.js');
    const { getWeather } = await import('./weather.js');
    delete process.env.OWM_API_KEY;
    (cache.getCachedWeather as jest.Mock).mockReturnValue(undefined);

    await expect(getWeather('Paris')).rejects.toThrow('Missing required environment variable: OWM_API_KEY');
  });

  it('should throw error when API request fails', async () => {
    const cache = await import('./cache.js');
    const axios = await import('axios');
    const { getWeather } = await import('./weather.js');

    (cache.getCachedWeather as jest.Mock).mockReturnValue(undefined);
    (axios.default.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(getWeather('Paris')).rejects.toThrow('Network error');
  });
});
