import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60 }); // 60s cache

export function getCachedWeather(city: string) {
  return cache.get(city);
}
export function setCachedWeather(city: string, data: any) {
  cache.set(city, data);
}

