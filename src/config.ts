import dotenv from "dotenv";

dotenv.config();

const DEFAULT_PORT: number = 3000;
const DEFAULT_LOG_LEVEL: string = "WARN";
const DEFAULT_WEATHER_UNITS: string = "metric";
const DEFAULT_CACHE_TTL_SECONDS: number = 600;

function getEnvVar(key: string, defaultValue?: string): string {
  const value: string | undefined = process.env[key];

  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value || defaultValue!;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value: string | undefined = process.env[key];

  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value ? parseInt(value, 10) : defaultValue!;
}

export const config: {
  readonly server: {
    readonly port: number;
  };
  readonly logging: {
    readonly level: "ERROR" | "WARN" | "INFO" | "DEBUG";
  };
  readonly weather: {
    readonly units: "metric" | "imperial" | "standard";
    readonly cacheTTL: number;
  };
  readonly auth: {
    readonly username: string | undefined;
    readonly password: string | undefined;
  };
} = {
  server: {
    port: getEnvNumber("PORT", DEFAULT_PORT),
  },

  logging: {
    level: getEnvVar("LOG_LEVEL", DEFAULT_LOG_LEVEL).toUpperCase() as "ERROR" | "WARN" | "INFO" | "DEBUG",
  },

  weather: {
    units: getEnvVar("WEATHER_UNITS", DEFAULT_WEATHER_UNITS) as "metric" | "imperial" | "standard",
    cacheTTL: getEnvNumber("CACHE_TTL_SECONDS", DEFAULT_CACHE_TTL_SECONDS),
  },

  auth: {
    username: process.env["E2E_AUTH_USERNAME"],
    password: process.env["E2E_AUTH_PASSWORD"],
  },
} as const;
