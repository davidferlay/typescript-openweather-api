import NodeCache from "node-cache";
import { config } from "../config.js";

const cache = new NodeCache({ stdTTL: config.weather.cacheTTL });

export function getCachedWeather(city: string) {
  return cache.get(city);
}
export function setCachedWeather(city: string, data: any) {
  cache.set(city, data);
}

