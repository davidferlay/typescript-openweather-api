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
  const cached: unknown = getCachedWeather(city);
  if (cached) {
    logger.debug("Cache hit for weather data", { city });
    metrics.trackCacheHit();
    return { data: cached, fromCache: true };
  }
  logger.info("Fetching weather data from API", { city });
  metrics.trackCacheMiss();

  const apiKey: string | undefined = process.env["OWM_API_KEY"];
  if (!apiKey) {
    logger.error("OWM_API_KEY not configured");
    throw new Error("Missing required environment variable: OWM_API_KEY");
  }

  try {
    const url: string = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${config.weather.units}`;
    const response: { data: { name: string; weather: [{ main: string }]; main: { temp: number } } } = await axios.get(url);
    const weather: WeatherData = {
      city: response.data.name,
      weather: response.data.weather[0].main,
      temperature: response.data.main.temp,
    };
    setCachedWeather(city, weather);
    logger.info("Weather data fetched successfully", { city });
    return { data: weather, fromCache: false };
  } catch (error) {
    logger.error("Failed to fetch weather data", { city, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

