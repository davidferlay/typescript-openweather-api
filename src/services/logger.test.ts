import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Logger', () => {
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;
  let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;
  const originalEnv = process.env.LOG_LEVEL;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    process.env.LOG_LEVEL = originalEnv;
  });

  it('should log error messages with metadata', async () => {
    const { logger } = await import('./logger.js');
    logger.error('Test error', { code: 500 });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] ERROR: Test error {"code":500}/)
    );
  });

  it('should log warning messages', async () => {
    const { logger } = await import('./logger.js');
    logger.warn('Test warning');

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('WARN: Test warning')
    );
  });

  it('should log info messages', async () => {
    const { logger } = await import('./logger.js');
    logger.info('Test info');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('INFO: Test info')
    );
  });

  it('should log debug messages when LOG_LEVEL=DEBUG', async () => {
    process.env.LOG_LEVEL = 'DEBUG';

    // Re-import with new env variable
    const loggerPath = './logger.js';
    delete (await import('module')).default._cache[loggerPath];
    const { logger } = await import(`${loggerPath}?t=${Date.now()}`);

    logger.debug('Test debug');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('DEBUG: Test debug')
    );
  });
});
