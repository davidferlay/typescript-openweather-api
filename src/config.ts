import dotenv from "dotenv";

dotenv.config();

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
}

export const config = {
  weather: {
    units: getEnvVar("WEATHER_UNITS", "metric") as "metric" | "imperial" | "standard",
    cacheTTL: getEnvNumber("CACHE_TTL_SECONDS", 600), // Default is 10 min
  },
  // TODO: remove hardcoded auth credentials
  auth: {
    hardcodedUsername: "indy",
    hardcodedPassword: "password123",
  },
} as const;
