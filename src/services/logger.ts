import { config } from "../config.js";

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = LogLevel[config.logging.level as keyof typeof LogLevel];
  }

  private formatMessage(level: string, message: string, meta?: unknown): string {
    const timestamp: string = new Date().toISOString();
    const metaStr: string = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  }

  error(message: string, meta?: unknown): void {
    if (this.logLevel >= LogLevel.ERROR) {
      console.error(this.formatMessage("ERROR", message, meta));
    }
  }

  warn(message: string, meta?: unknown): void {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(this.formatMessage("WARN", message, meta));
    }
  }

  info(message: string, meta?: unknown): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(this.formatMessage("INFO", message, meta));
    }
  }

  debug(message: string, meta?: unknown): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.log(this.formatMessage("DEBUG", message, meta));
    }
  }
}

export const logger: Logger = new Logger();
