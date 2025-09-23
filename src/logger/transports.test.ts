import * as Sentry from '@sentry/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  LogLevel,
  Logger,
  RainbowError,
  consoleTransport,
  sentryTransport,
} from './index';

// Mock Sentry
vi.mock('@sentry/react', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
}));

describe('Transport Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  describe('consoleTransport', () => {
    it('should log debug messages to console.log', () => {
      consoleTransport(LogLevel.Debug, 'Debug message', {});
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Debug message'),
      );
    });

    it('should log info messages to console.log', () => {
      consoleTransport(LogLevel.Info, 'Info message', {
        extra: { test: true },
      });
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Info message'),
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"test": true'),
      );
    });

    it('should log warn messages to console.log', () => {
      consoleTransport(LogLevel.Warn, 'Warning message', {});
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Warning message'),
      );
    });

    it('should log error messages to console.error', () => {
      const error = new RainbowError('Test error');
      consoleTransport(LogLevel.Error, error, {});
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error'),
      );
    });

    it('should include timestamp in log output', () => {
      consoleTransport(LogLevel.Info, 'Test', {});
      expect(console.log).toHaveBeenCalledWith(
        expect.stringMatching(/\d{2}:\d{2}:\d{2}/),
      );
    });

    it('should handle metadata in console output', () => {
      const metadata = {
        tags: { component: 'test' },
        extra: { userId: '123' },
      };
      consoleTransport(LogLevel.Info, 'Test with metadata', metadata);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"tags"'),
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"component": "test"'),
      );
    });
  });

  describe('sentryTransport', () => {
    it('should add breadcrumb for debug level', () => {
      sentryTransport(LogLevel.Debug, 'Debug breadcrumb', {
        type: 'debug',
        extra: { test: 'value' },
      });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Debug breadcrumb',
        level: 'debug',
        type: 'debug',
        data: { extra: { test: 'value' } }, // metadata after destructuring type and tags
        timestamp: expect.any(Number),
      });
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should add breadcrumb for info level', () => {
      sentryTransport(LogLevel.Info, 'Info breadcrumb', {
        extra: { action: 'user_login' },
      });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Info breadcrumb',
        level: 'info',
        type: 'default',
        data: { extra: { action: 'user_login' } },
        timestamp: expect.any(Number),
      });
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should add breadcrumb for warn level', () => {
      sentryTransport(LogLevel.Warn, 'Warning breadcrumb', {});

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Warning breadcrumb',
        level: 'warning',
        type: 'default',
        data: {},
        timestamp: expect.any(Number),
      });
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should capture exception for error level with RainbowError', () => {
      const error = new RainbowError('Critical error');
      const metadata = {
        tags: { component: 'payment', severity: 'high' },
        extra: { orderId: 'ORD-123' },
      };

      sentryTransport(LogLevel.Error, error, metadata);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        tags: { component: 'payment', severity: 'high' },
        extra: { extra: { orderId: 'ORD-123' } }, // metadata after destructuring
      });
      expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    });

    it('should add breadcrumb for error level with string message', () => {
      // String messages create breadcrumbs, not exceptions
      sentryTransport(LogLevel.Error, 'String error message', {});

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'String error message',
        level: 'error',
        type: 'default',
        data: {},
        timestamp: expect.any(Number),
      });
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should handle error with cause chain', () => {
      const rootCause = new Error('Database connection failed');
      const wrappedError = new RainbowError('Service unavailable');
      Object.defineProperty(wrappedError, 'cause', {
        value: rootCause,
        enumerable: true,
      });

      sentryTransport(LogLevel.Error, wrappedError, {
        tags: { service: 'api' },
      });

      expect(Sentry.captureException).toHaveBeenCalledWith(wrappedError, {
        tags: { service: 'api' },
        extra: {},
      });
      // Sentry SDK should handle the cause chain internally
    });

    it('should use custom breadcrumb type when provided', () => {
      sentryTransport(LogLevel.Info, 'Navigation event', {
        type: 'navigation',
        extra: { from: '/home', to: '/profile' },
      });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Navigation event',
        level: 'info',
        type: 'navigation',
        data: { extra: { from: '/home', to: '/profile' } }, // metadata without type
        timestamp: expect.any(Number),
      });
    });

    it('should handle empty metadata gracefully', () => {
      // This should not crash even with empty metadata
      sentryTransport(LogLevel.Info, 'Message without metadata', {});

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Message without metadata',
        level: 'info',
        type: 'default',
        data: {},
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Integration with Logger', () => {
    it('should work with both transports simultaneously', () => {
      const logger = new Logger({ level: LogLevel.Debug, debug: '' });
      logger.transports = [consoleTransport, sentryTransport];

      logger.info('Test message', { tags: { test: true } });

      expect(console.log).toHaveBeenCalled(); // consoleTransport uses console.log for info
      expect(Sentry.addBreadcrumb).toHaveBeenCalled();
    });

    it('should send errors to both console and Sentry', () => {
      const logger = new Logger({ level: LogLevel.Error, debug: '' });
      logger.transports = [consoleTransport, sentryTransport];

      const error = new RainbowError('Test error');
      logger.error(error, { tags: { critical: true } });

      expect(console.error).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        tags: { critical: true },
        extra: {},
      });
    });
  });
});
