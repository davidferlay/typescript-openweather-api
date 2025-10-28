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
    const hasMetadata: boolean = Boolean(meta);
    const metadataString: string = hasMetadata ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] ${level}: ${message}${metadataString}`;
  }

  error(message: string, meta?: unknown): void {
    const shouldLog: boolean = this.logLevel >= LogLevel.ERROR;
    if (shouldLog) {
      const formattedMessage: string = this.formatMessage("ERROR", message, meta);
      console.error(formattedMessage);
    }
  }

  warn(message: string, meta?: unknown): void {
    const shouldLog: boolean = this.logLevel >= LogLevel.WARN;
    if (shouldLog) {
      const formattedMessage: string = this.formatMessage("WARN", message, meta);
      console.warn(formattedMessage);
    }
  }

  info(message: string, meta?: unknown): void {
    const shouldLog: boolean = this.logLevel >= LogLevel.INFO;
    if (shouldLog) {
      const formattedMessage: string = this.formatMessage("INFO", message, meta);
      console.log(formattedMessage);
    }
  }

  debug(message: string, meta?: unknown): void {
    const shouldLog: boolean = this.logLevel >= LogLevel.DEBUG;
    if (shouldLog) {
      const formattedMessage: string = this.formatMessage("DEBUG", message, meta);
      console.log(formattedMessage);
    }
  }
}

export const logger: Logger = new Logger();
