/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LogLevel, Logger, RainbowError } from './index';

describe('Logger', () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.clearAllMocks();
  });

  describe('Log Levels', () => {
    it('should respect log level hierarchy', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Warn, debug: '' });
      logger.transports = [mockTransport];

      logger.debug('debug message', {});
      logger.info('info message', {});
      logger.warn('warn message', {});
      logger.error(new RainbowError('error message'), {});

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

      expect(error.name).toBe('Error');
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
      logger.debug('network message', {}, 'network');
      logger.debug('no context message', {});

      expect(mockTransport).toHaveBeenCalledTimes(3);
    });

    it('should support wildcard debug contexts', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({
        level: LogLevel.Debug,
        debug: 'auth:*',
      });
      logger.transports = [mockTransport];

      logger.debug('message 1', {}, 'auth:login');
      logger.debug('message 2', {}, 'auth:logout');
      logger.debug('message 3', {}, 'wallet:send');

      expect(mockTransport).toHaveBeenCalledTimes(2);
    });
  });

  describe('Environment Variables', () => {
    it('should use provided log level', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({
        level: LogLevel.Info,
        debug: '',
      });
      logger.transports = [mockTransport];

      logger.debug('debug', {});
      logger.info('info', {});

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
      const mockTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Info, debug: '' });
      logger.transports = [mockTransport];

      const metadata = {
        extra: {
          username: 'user@example.com',
          password: 'should-not-appear',
          apiKey: 'secret-key',
        },
      };

      logger.info('User login', metadata);

      expect(mockTransport).toHaveBeenCalledWith(
        LogLevel.Info,
        'User login',
        expect.objectContaining({ extra: expect.any(Object) }),
      );
    });
  });

  describe('Error Cause Chains', () => {
    it('should handle nested error causes', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Error, debug: '' });
      logger.transports = [mockTransport];

      const networkError = new Error('Network timeout');
      const databaseError = new RainbowError('Database connection failed');
      Object.defineProperty(databaseError, 'cause', {
        value: networkError,
        enumerable: true,
      });
      const userError = new RainbowError('Failed to fetch user data');
      Object.defineProperty(userError, 'cause', {
        value: databaseError,
        enumerable: true,
      });

      logger.error(userError, {
        tags: { component: 'UserService', action: 'fetchProfile' },
        extra: { userId: '12345', retryCount: 3 },
      });

      expect(mockTransport).toHaveBeenCalledWith(
        LogLevel.Error,
        userError,
        expect.objectContaining({
          tags: { component: 'UserService', action: 'fetchProfile' },
          extra: { userId: '12345', retryCount: 3 },
        }),
      );
    });

    it('should handle non-Error objects passed to error()', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Error, debug: '' });
      logger.transports = [mockTransport];

      logger.error('String error message' as unknown as RainbowError);
      logger.error({ message: 'Object error' } as unknown as RainbowError);

      expect(mockTransport).toHaveBeenCalledTimes(2);
      expect(mockTransport).toHaveBeenCalledWith(
        LogLevel.Error,
        expect.any(RainbowError),
        {},
      );
    });
  });

  describe('Real-World Usage Patterns', () => {
    it('should handle RAP execution errors like in production', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Error, debug: '' });
      logger.transports = [mockTransport];

      const originalError = new Error('Cannot read properties of undefined');
      logger.error(new RainbowError('unlock: error estimateApprove'), {
        message: originalError.message,
        tags: { action: 'unlock', component: 'raps' },
      });

      expect(mockTransport).toHaveBeenCalledWith(
        LogLevel.Error,
        expect.any(RainbowError),
        expect.objectContaining({
          message: 'Cannot read properties of undefined',
          tags: { action: 'unlock', component: 'raps' },
        }),
      );
    });

    it('should handle analytics errors with context', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Warn, debug: '' });
      logger.transports = [mockTransport];

      logger.warn('Analytics event failed', {
        tags: { component: 'analytics', severity: 'low' },
        extra: {
          event: 'swap_completed',
          properties: { amount: '100', token: 'ETH' },
        },
      });

      expect(mockTransport).toHaveBeenCalledWith(
        LogLevel.Warn,
        'Analytics event failed',
        expect.objectContaining({
          tags: { component: 'analytics', severity: 'low' },
          extra: {
            event: 'swap_completed',
            properties: { amount: '100', token: 'ETH' },
          },
        }),
      );
    });

    it('should handle debug logging with context filtering in production patterns', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({
        level: LogLevel.Debug,
        debug: 'raps:*,wallet:*',
      });
      logger.transports = [mockTransport];

      logger.debug('Executing swap', {}, 'raps:swap');
      logger.debug('Wallet connected', {}, 'wallet:connect');
      logger.debug('Network request', {}, 'network:http');
      logger.debug('Cache hit', {}, 'cache:storage');

      expect(mockTransport).toHaveBeenCalledTimes(2);
      expect(mockTransport).toHaveBeenCalledWith(
        LogLevel.Debug,
        'Executing swap',
        {},
      );
      expect(mockTransport).toHaveBeenCalledWith(
        LogLevel.Debug,
        'Wallet connected',
        {},
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined gracefully', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Info, debug: '' });
      logger.transports = [mockTransport];

      logger.info(null as any);
      logger.info(undefined as any);
      logger.info('', null as any);
      logger.info('', undefined as any);

      expect(mockTransport).toHaveBeenCalledTimes(4);
    });

    it('should handle circular references in metadata', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Info, debug: '' });
      logger.transports = [mockTransport];

      const circular: any = { prop: 'value' };
      circular.self = circular;

      logger.info('Circular reference test', {
        extra: circular,
      });
      expect(mockTransport).toHaveBeenCalledTimes(1);
    });

    it('should handle very large metadata objects', () => {
      const mockTransport = vi.fn();
      const logger = new Logger({ level: LogLevel.Info, debug: '' });
      logger.transports = [mockTransport];

      const largeArray = new Array(10000).fill('data');
      const largeObject: any = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`key_${i}`] = `value_${i}`;
      }

      logger.info('Large metadata test', {
        extra: {
          array: largeArray,
          object: largeObject,
        },
      });

      expect(mockTransport).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple transports correctly', () => {
      const transport1 = vi.fn();
      const transport2 = vi.fn();
      const transport3 = vi.fn();

      const logger = new Logger({ level: LogLevel.Info, debug: '' });
      logger.transports = [transport1, transport2, transport3];

      logger.info('Multi-transport test', { extra: { test: true } });

      expect(transport1).toHaveBeenCalledTimes(1);
      expect(transport2).toHaveBeenCalledTimes(1);
      expect(transport3).toHaveBeenCalledTimes(1);

      const expectedCall = [
        LogLevel.Info,
        'Multi-transport test',
        { extra: { test: true } },
      ];
      expect(transport1).toHaveBeenCalledWith(...expectedCall);
      expect(transport2).toHaveBeenCalledWith(...expectedCall);
      expect(transport3).toHaveBeenCalledWith(...expectedCall);
    });

    it('should handle transport failures', () => {
      const failingTransport = vi.fn(() => {
        throw new Error('Transport failed');
      });
      const workingTransport = vi.fn();

      const logger = new Logger({ level: LogLevel.Error, debug: '' });

      logger.transports = [workingTransport, failingTransport];

      expect(() => {
        logger.error(new RainbowError('Test error'));
      }).toThrow();

      expect(workingTransport).toHaveBeenCalled();
      expect(failingTransport).toHaveBeenCalled();
    });
  });
});
