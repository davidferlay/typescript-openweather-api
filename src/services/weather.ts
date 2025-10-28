import axios from "axios";
import { getCachedWeather, setCachedWeather } from "./cache.js";
import { config } from "../config.js";
import { metrics } from "./metrics.js";
import { logger } from "./logger.js";

interface WeatherData {
  city: string;
  weather: string;
  temperature: number;
}

export async function getWeather(city: string): Promise<{ data: unknown; fromCache: boolean }> {
  const cachedData: unknown = getCachedWeather(city);
  const isCached: boolean = Boolean(cachedData);
  if (isCached) {
    logger.debug("Cache hit for weather data", { city });
    metrics.trackCacheHit();
    return { data: cachedData, fromCache: true };
  }

  logger.info("Fetching weather data from API", { city });
  metrics.trackCacheMiss();

  const apiKey: string | undefined = process.env["OWM_API_KEY"];
  const isApiKeyConfigured: boolean = Boolean(apiKey);
  if (!isApiKeyConfigured) {
    logger.error("OWM_API_KEY not configured");
    throw new Error("Missing required environment variable: OWM_API_KEY");
  }

  try {
    const apiUrl: string = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${config.weather.units}`;
    const response: { data: { name: string; weather: [{ main: string }]; main: { temp: number } } } = await axios.get(apiUrl);

    const weatherData: WeatherData = {
      city: response.data.name,
      weather: response.data.weather[0].main,
      temperature: response.data.main.temp,
    };

    setCachedWeather(city, weatherData);
    logger.info("Weather data fetched successfully", { city });
    return { data: weatherData, fromCache: false };
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : String(error);
    logger.error("Failed to fetch weather data", { city, error: errorMessage });
    throw error;
  }
}

