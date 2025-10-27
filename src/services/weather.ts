import axios from "axios";
import { getCachedWeather, setCachedWeather } from "./cache.js";
import { config } from "../config.js";

export async function getWeather(city: string) {
  const cached = getCachedWeather(city);
  if (cached) {
    console.log(`Cache hit for city: ${city}`);
    return { data: cached, fromCache: true };
  }
  console.log(`Fetching from API for city: ${city}`);
  const apiKey = process.env.OWM_API_KEY;
  if (!apiKey) {
    throw new Error("Missing required environment variable: OWM_API_KEY");
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${config.weather.units}`;
  const response = await axios.get(url);
  const weather = {
    city: response.data.name,
    weather: response.data.weather[0].main,
    temperature: response.data.main.temp,
  };
  setCachedWeather(city, weather);
  return { data: weather, fromCache: false };
}

