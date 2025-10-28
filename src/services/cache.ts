import NodeCache from "node-cache";
import { config } from "../config.js";

const cache: NodeCache = new NodeCache({ stdTTL: config.weather.cacheTTL });

export function getCachedWeather(city: string): unknown {
  return cache.get(city);
}
export function setCachedWeather(city: string, data: unknown): void {
  cache.set(city, data);
}

