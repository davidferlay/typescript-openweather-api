import axios from "axios";
import { getCachedWeather, setCachedWeather } from "./cache";

export async function getWeather(city: string) {
  const cached = getCachedWeather(city);
  if (cached) return cached;
  const apiKey = process.env.OWM_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const response = await axios.get(url);
  const weather = {
    city: response.data.name,
    weather: response.data.weather[0].main,
    temperature: response.data.main.temp,
  };
  setCachedWeather(city, weather);
  return weather;
}

