// Suppress console output during tests
global.console = {
  ...console,
  log: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  info: () => {},
};
