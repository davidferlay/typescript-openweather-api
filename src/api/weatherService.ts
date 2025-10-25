
// Example: Fetch weather data using the API key from .env
export async function fetchWeather(city: string) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather API error: ${response.statusText}`);
  return await response.json();
}

