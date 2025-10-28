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
  server: {
    port: getEnvNumber("PORT", 3000),
  },
  logging: {
    level: getEnvVar("LOG_LEVEL", "WARN").toUpperCase() as "ERROR" | "WARN" | "INFO" | "DEBUG",
  },
  weather: {
    units: getEnvVar("WEATHER_UNITS", "metric") as "metric" | "imperial" | "standard",
    cacheTTL: getEnvNumber("CACHE_TTL_SECONDS", 600), // Default is 10 min
  },
  // TODO: upgrade in favor of real user registration workflow
  auth: {
    username: process.env.E2E_AUTH_USERNAME,
    password: process.env.E2E_AUTH_PASSWORD,
  },
} as const;
