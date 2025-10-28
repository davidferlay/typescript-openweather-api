import { describe, it, expect } from '@jest/globals';
import { getCachedWeather, setCachedWeather } from './cache.js';

describe('Cache Service', () => {
  it('should return undefined for non-existent keys', () => {
    expect(getCachedWeather('NonExistentCity')).toBeUndefined();
  });

  it('should store and retrieve cached data', () => {
    const weatherData = { city: 'Paris', weather: 'Sunny', temperature: 22 };

    setCachedWeather('Paris', weatherData);
    expect(getCachedWeather('Paris')).toEqual(weatherData);
  });

  it('should overwrite existing cached data', () => {
    const initialData = { city: 'Tokyo', weather: 'Cloudy', temperature: 18 };
    const updatedData = { city: 'Tokyo', weather: 'Sunny', temperature: 25 };

    setCachedWeather('Tokyo', initialData);
    setCachedWeather('Tokyo', updatedData);

    expect(getCachedWeather('Tokyo')).toEqual(updatedData);
  });

  it('should handle different cities independently', () => {
    const parisData = { city: 'Paris', weather: 'Sunny', temperature: 22 };
    const londonData = { city: 'London', weather: 'Rainy', temperature: 15 };

    setCachedWeather('Paris', parisData);
    setCachedWeather('London', londonData);

    expect(getCachedWeather('Paris')).toEqual(parisData);
    expect(getCachedWeather('London')).toEqual(londonData);
  });
});
