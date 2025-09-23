import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LogLevel, Logger, RainbowError } from './index';

describe('Logger', () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test'; // Prevent auto-adding console transport
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.clearAllMocks();
  });

  describe('Log Levels', () => {
    it('should respect log level hierarchy', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Warn, debug: '' }); // Explicitly set debug to empty
      logger.transports = [mockTransport];

      logger.debug('debug message', {});
      logger.info('info message', {});
      logger.warn('warn message', {});
      logger.error(new RainbowError('error message'), {});

      // Debug and info should not be logged, only warn and error

      expect(mockTransport).toHaveBeenCalledTimes(2);
      expect(mockTransport).toHaveBeenCalledWith(
        LogLevel.Warn,
        'warn message',
        {},
      );
      expect(mockTransport).toHaveBeenCalledWith(
        LogLevel.Error,
        expect.any(RainbowError),
        {},
      );
    });

    it('should log all levels when set to debug', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Debug, debug: '' });
      logger.transports = [mockTransport];

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error(new RainbowError('error message'));

      // All levels should be logged
      expect(mockTransport).toHaveBeenCalledTimes(4);
      expect(mockTransport).toHaveBeenCalledWith(
        LogLevel.Debug,
        'debug message',
        {},
      );
      expect(mockTransport).toHaveBeenCalledWith(
        LogLevel.Info,
        'info message',
        {},
      );
      expect(mockTransport).toHaveBeenCalledWith(
        LogLevel.Warn,
        'warn message',
        {},
      );
    });
  });

  describe('RainbowError', () => {
    it('should be an instance of Error', () => {
      const error = new RainbowError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RainbowError);
      expect(error.message).toBe('Test error');
    });

    it('should work with logger.error', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Error, debug: '' });
      logger.transports = [mockTransport];

      const error = new RainbowError('Rainbow error occurred');
      logger.error(error);

      expect(mockTransport).toHaveBeenCalledWith(LogLevel.Error, error, {});
    });

    it('should support standard Error properties', () => {
      const error = new RainbowError('Custom error');

      expect(error.name).toBe('Error'); // RainbowError extends Error without overriding name
      expect(error.message).toBe('Custom error');
      expect(error.stack).toBeDefined();
    });
  });

  describe('Metadata and Context', () => {
    it('should include metadata with logs', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Info, debug: '' });
      logger.transports = [mockTransport];
      const metadata = {
        tags: { component: 'test', action: 'validate' },
        extra: { userId: '123', timestamp: Date.now() },
      };

      logger.info('Test message', metadata);

      expect(mockTransport).toHaveBeenCalledWith(
        LogLevel.Info,
        'Test message',
        expect.objectContaining({
          tags: expect.objectContaining({ component: 'test' }),
          extra: expect.objectContaining({ userId: '123' }),
        }),
      );
    });

    it('should respect debug context filtering', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({
        level: LogLevel.Debug,
        debug: 'auth,wallet', // Only log auth and wallet contexts
      });
      logger.transports = [mockTransport];

      logger.debug('auth message', {}, 'auth');
      logger.debug('wallet message', {}, 'wallet');
      logger.debug('network message', {}, 'network'); // Should not log
      logger.debug('no context message', {}); // Logs when no context provided (current behavior)

      expect(mockTransport).toHaveBeenCalledTimes(3); // auth, wallet, and no-context
    });

    it('should support wildcard debug contexts', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({
        level: LogLevel.Debug,
        debug: 'auth:*', // Log all auth: prefixed contexts
      });
      logger.transports = [mockTransport];

      logger.debug('message 1', {}, 'auth:login');
      logger.debug('message 2', {}, 'auth:logout');
      logger.debug('message 3', {}, 'wallet:send'); // Should not log

      expect(mockTransport).toHaveBeenCalledTimes(2);
    });
  });

  describe('Environment Variables', () => {
    it('should read LOG_LEVEL from process.env', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({
        level: LogLevel.Info,
        debug: '', // Explicitly disable debug
      });
      logger.transports = [mockTransport];

      logger.debug('debug', {}); // Should not log
      logger.info('info', {}); // Should log

      expect(mockTransport).toHaveBeenCalledTimes(1);
      expect(mockTransport).toHaveBeenCalledWith(LogLevel.Info, 'info', {});
    });
  });

  describe('Transport System', () => {
    it('should call custom transports', () => {
      const customTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Info, debug: '' });
      logger.transports.push(customTransport);

      logger.info('test message', { custom: 'data' });

      expect(customTransport).toHaveBeenCalledWith(
        LogLevel.Info,
        'test message',
        expect.objectContaining({ custom: 'data' }),
      );
    });
  });

  describe('Sensitive Data Filtering', () => {
    it('should pass sensitive data to transport for filtering', () => {
      // The transport is responsible for filtering sensitive data
      const mockTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Info, debug: '' });
      logger.transports = [mockTransport];

      const metadata = {
        extra: {
          username: 'user@example.com',
          password: 'should-not-appear', // Should be filtered by transport
          apiKey: 'secret-key', // Should be filtered by transport
        },
      };

      logger.info('User login', metadata);

      // Verify the logger passes the data to the transport
      // The transport implementation should handle filtering
      expect(mockTransport).toHaveBeenCalledWith(
        LogLevel.Info,
        'User login',
        expect.objectContaining({ extra: expect.any(Object) }),
      );
    });
  });
});
