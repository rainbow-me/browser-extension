import fs from 'node:fs/promises';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { BeforeRequestSentEvent } from './bidi';

// Mock the selenium-webdriver modules
/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('selenium-webdriver/bidi/addInterceptParameters', () => ({
  AddInterceptParameters: vi.fn().mockImplementation(function (this: any) {
    this.urlPattern = vi.fn().mockReturnThis();
    return this;
  }),
}));

vi.mock('selenium-webdriver/bidi/continueRequestParameters', () => ({
  ContinueRequestParameters: vi.fn().mockImplementation(function (
    this: any,
    requestId: string,
  ) {
    this.requestId = requestId;
  }),
}));

vi.mock('selenium-webdriver/bidi/interceptPhase', () => ({
  InterceptPhase: {
    BEFORE_REQUEST_SENT: 'beforeRequestSent',
  },
}));

vi.mock('selenium-webdriver/bidi/network', () => ({
  Network: vi.fn(() => ({
    setCacheBehavior: vi.fn(),
    addIntercept: vi.fn(),
    beforeRequestSent: vi.fn(),
    responseCompleted: vi.fn(),
    continueRequest: vi.fn(),
    provideResponse: vi.fn(),
  })),
}));

vi.mock('selenium-webdriver/bidi/provideResponseParameters', () => ({
  ProvideResponseParameters: vi.fn().mockImplementation(function (
    this: any,
    requestId: string,
  ) {
    this.requestId = requestId;
    this.statusCode = vi.fn().mockReturnThis();
    this.body = vi.fn().mockReturnThis();
  }),
}));

vi.mock('selenium-webdriver/bidi/urlPattern', () => ({
  UrlPattern: vi.fn().mockImplementation(function (this: any) {
    this.protocol = vi.fn().mockReturnThis();
    this.hostname = vi.fn().mockReturnThis();
    return this;
  }),
}));

// Mock fs operations
vi.mock('node:fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  },
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

// Mock ox/Hash for sha256
vi.mock('ox/Hash', () => ({
  sha256: vi.fn().mockReturnValue('0x' + '0'.repeat(62) + '42'),
}));

// Mock endpoints
vi.mock('./endpoints', () => ({
  ENDPOINTS: {
    swap: {
      host: 'swap.p.rainbow.me',
      headers: {},
      paths: [
        { pattern: /^\/v1\/quote/, dir: 'swap/quote' },
        { pattern: /^\/v1\/slippage/, dir: 'swap/slippage' },
      ],
    },
    addys: {
      host: 'addys.p.rainbow.me',
      headers: {
        Authorization: process.env.ADDYS_API_KEY
          ? `Bearer ${process.env.ADDYS_API_KEY}`
          : undefined,
      },
      paths: [
        { pattern: /^\/v3\/summary$/, dir: 'addys/summary' },
        { pattern: /\/v3\/[^/]+\/[^/]+\/assets/, dir: 'addys/assets' },
      ],
    },
  },
}));

describe('Intercept Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mode to replay
    process.env.MOCK_MODE = 'replay';
  });

  afterEach(() => {
    delete process.env.MOCK_MODE;
  });

  // These tests are no longer valid since responseCompleted handler was removed
  // The new fetchAndPersist function handles recording directly

  describe('Mode Handling', () => {
    it('should default to replay mode', async () => {
      delete process.env.MOCK_MODE;
      vi.resetModules();

      const { interceptMocks } = await import('./intercept');
      const mockDriver = {};
      const network = await interceptMocks(mockDriver);

      // Should not set cache bypass in replay mode
      expect(network.setCacheBehavior).not.toHaveBeenCalled();
    });

    it('should enable cache bypass in record mode', async () => {
      process.env.MOCK_MODE = 'record';
      vi.resetModules();

      const { interceptMocks } = await import('./intercept');
      const mockDriver = {};
      const network = await interceptMocks(mockDriver);

      expect(network.setCacheBehavior).toHaveBeenCalledWith('bypass');
    });
  });

  describe('fetchAndPersist', () => {
    const mockFsWriteFile = vi.mocked(fs.writeFile);
    const mockFsMkdir = vi.mocked(fs.mkdir);
    let fetchAndPersist: typeof import('./intercept').fetchAndPersist;

    beforeEach(async () => {
      vi.clearAllMocks();
      // Reset modules to clear cached imports
      vi.resetModules();

      // Re-apply ox/Hash mock after resetting modules
      vi.doMock('ox/Hash', () => ({
        sha256: vi.fn().mockReturnValue('0x' + '0'.repeat(62) + '42'),
      }));

      // Re-apply endpoints mock after resetting modules
      vi.doMock('./endpoints', () => ({
        ENDPOINTS: {
          swap: {
            host: 'swap.p.rainbow.me',
            headers: {},
            paths: [
              { pattern: /^\/v1\/quote/, dir: 'swap/quote' },
              { pattern: /^\/v1\/slippage/, dir: 'swap/slippage' },
            ],
          },
          addys: {
            host: 'addys.p.rainbow.me',
            headers: {
              Authorization: process.env.ADDYS_API_KEY
                ? `Bearer ${process.env.ADDYS_API_KEY}`
                : undefined,
            },
            paths: [
              { pattern: /^\/v3\/summary$/, dir: 'addys/summary' },
              { pattern: /\/v3\/[^/]+\/[^/]+\/assets/, dir: 'addys/assets' },
            ],
          },
        },
      }));

      process.env.MOCK_MODE = 'record';
      // Mock global fetch
      global.fetch = vi.fn();

      // Import fetchAndPersist after resetting modules and re-applying mocks
      const interceptModule = await import('./intercept');
      fetchAndPersist = interceptModule.fetchAndPersist;
    });

    afterEach(() => {
      delete process.env.MOCK_MODE;
      vi.restoreAllMocks();
    });

    it('should pass through all headers from the request', async () => {
      const mockRequest: BeforeRequestSentEvent['request'] = {
        request: 'req-123',
        url: 'https://swap.p.rainbow.me/v1/quote',
        method: 'GET',
        headers: [
          {
            name: 'Authorization',
            value: { type: 'string', value: 'Bearer test-api-key' },
          },
          {
            name: 'User-Agent',
            value: { type: 'string', value: 'Rainbow/1.0' },
          },
          {
            name: 'X-Custom-Header',
            value: { type: 'string', value: 'custom-value' },
          },
        ],
      };

      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ test: 'data' }),
      } as Response);

      await fetchAndPersist(mockRequest);

      // Verify fetch was called with all headers
      expect(mockFetch).toHaveBeenCalledWith(
        'https://swap.p.rainbow.me/v1/quote',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer test-api-key',
            'User-Agent': 'Rainbow/1.0',
            'X-Custom-Header': 'custom-value',
            accept: 'application/json',
            'accept-encoding': 'identity',
          },
        },
      );
    });

    it('should add default headers when not present in request', async () => {
      const mockRequest: BeforeRequestSentEvent['request'] = {
        request: 'req-123',
        url: 'https://swap.p.rainbow.me/v1/quote',
        method: 'GET',
        headers: [
          {
            name: 'Authorization',
            value: { type: 'string', value: 'Bearer test-api-key' },
          },
        ],
      };

      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ test: 'data' }),
      } as Response);

      await fetchAndPersist(mockRequest);

      // Verify default headers were added
      expect(mockFetch).toHaveBeenCalledWith(
        'https://swap.p.rainbow.me/v1/quote',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer test-api-key',
            accept: 'application/json',
            'accept-encoding': 'identity',
          },
        },
      );
    });

    it('should not override existing accept headers', async () => {
      const mockRequest: BeforeRequestSentEvent['request'] = {
        request: 'req-123',
        url: 'https://swap.p.rainbow.me/v1/quote',
        method: 'GET',
        headers: [
          { name: 'accept', value: { type: 'string', value: 'text/html' } },
          { name: 'accept-encoding', value: { type: 'string', value: 'gzip' } },
        ],
      };

      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/html' }),
        text: async () => '<html>test</html>',
        arrayBuffer: async () => new ArrayBuffer(0),
      } as Response);

      await fetchAndPersist(mockRequest);

      // Verify original accept headers were preserved
      expect(mockFetch).toHaveBeenCalledWith(
        'https://swap.p.rainbow.me/v1/quote',
        {
          method: 'GET',
          headers: {
            accept: 'text/html',
            'accept-encoding': 'gzip',
          },
        },
      );
    });

    it('should add authorization header for addys.p.rainbow.me when env var is set', async () => {
      const mockRequest: BeforeRequestSentEvent['request'] = {
        request: 'req-123',
        url: 'https://addys.p.rainbow.me/v3/1,10,56,137,8453,42161/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266/assets/?currency=usd',
        method: 'GET',
        // No headers provided
      };

      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ assets: [] }),
      } as Response);

      const logSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => undefined);

      await fetchAndPersist(mockRequest);

      // ADDYS_API_KEY is set in .env, so authorization header should be added
      expect(mockFetch).toHaveBeenCalledWith(
        'https://addys.p.rainbow.me/v3/1,10,56,137,8453,42161/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266/assets/?currency=usd',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.ADDYS_API_KEY}`,
            accept: 'application/json',
            'accept-encoding': 'identity',
          },
        },
      );

      expect(logSpy).toHaveBeenCalledWith(
        '[E2E Mock] Added Authorization header for addys.p.rainbow.me',
      );

      logSpy.mockRestore();
    });

    it('should preserve existing authorization header for addys.p.rainbow.me', async () => {
      const mockRequest: BeforeRequestSentEvent['request'] = {
        request: 'req-123',
        url: 'https://addys.p.rainbow.me/v3/1,10,56,137,8453,42161/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266/assets/?currency=usd',
        method: 'GET',
        headers: [
          {
            name: 'Authorization',
            value: { type: 'string', value: 'Bearer my-explicit-api-key' },
          },
        ],
      };

      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ assets: [] }),
      } as Response);

      await fetchAndPersist(mockRequest);

      // Verify authorization header was passed through (not overridden)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://addys.p.rainbow.me/v3/1,10,56,137,8453,42161/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266/assets/?currency=usd',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer my-explicit-api-key',
            accept: 'application/json',
            'accept-encoding': 'identity',
          },
        },
      );
    });

    it('should handle requests without headers', async () => {
      const mockRequest: BeforeRequestSentEvent['request'] = {
        request: 'req-123',
        url: 'https://swap.p.rainbow.me/v1/quote',
        method: 'GET',
      };

      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ test: 'data' }),
      } as Response);

      await fetchAndPersist(mockRequest);

      // Verify only default headers were added
      expect(mockFetch).toHaveBeenCalledWith(
        'https://swap.p.rainbow.me/v1/quote',
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'accept-encoding': 'identity',
          },
        },
      );
    });

    it('should skip non-GET requests', async () => {
      const mockRequest: BeforeRequestSentEvent['request'] = {
        request: 'req-123',
        url: 'https://swap.p.rainbow.me/v1/quote',
        method: 'POST',
        headers: [
          {
            name: 'Authorization',
            value: { type: 'string', value: 'Bearer test-api-key' },
          },
        ],
      };

      const mockFetch = vi.mocked(global.fetch);

      await fetchAndPersist(mockRequest);

      // Verify fetch was not called for non-GET request
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should persist JSON responses correctly', async () => {
      const mockRequest: BeforeRequestSentEvent['request'] = {
        request: 'req-123',
        url: 'https://swap.p.rainbow.me/v1/quote',
        method: 'GET',
        headers: [
          {
            name: 'Authorization',
            value: { type: 'string', value: 'Bearer test-api-key' },
          },
        ],
      };

      const mockJsonData = { test: 'data', assets: [1, 2, 3] };
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockJsonData,
      } as Response);

      await fetchAndPersist(mockRequest);

      // Verify JSON was written to file
      expect(mockFsMkdir).toHaveBeenCalled();
      expect(mockFsWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('.json'),
        JSON.stringify(mockJsonData, null, 2) + '\n',
        'utf8',
      );
    });

    it('should handle fetch failures gracefully', async () => {
      const mockRequest: BeforeRequestSentEvent['request'] = {
        request: 'req-123',
        url: 'https://swap.p.rainbow.me/v1/quote',
        method: 'GET',
        headers: [
          {
            name: 'Authorization',
            value: { type: 'string', value: 'Bearer test-api-key' },
          },
        ],
      };

      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
      } as Response);

      // Should not throw
      await expect(fetchAndPersist(mockRequest)).resolves.toBeUndefined();

      // Verify no file was written
      expect(mockFsWriteFile).not.toHaveBeenCalled();
    });

    it('should treat URLs with and without trailing slashes as duplicates', async () => {
      const mockRequest1: BeforeRequestSentEvent['request'] = {
        request: 'req-123',
        url: 'https://addys.p.rainbow.me/v3/1/0xabc/assets/?currency=usd',
        method: 'GET',
      };

      const mockRequest2: BeforeRequestSentEvent['request'] = {
        request: 'req-456',
        url: 'https://addys.p.rainbow.me/v3/1/0xabc/assets?currency=usd',
        method: 'GET',
      };

      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ assets: [] }),
      } as Response);

      // Set API key for addys endpoint
      process.env.ADDYS_API_KEY = 'test-key';

      // First call with trailing slash before query
      await fetchAndPersist(mockRequest1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFsWriteFile).toHaveBeenCalledTimes(1);

      // Second call without trailing slash should be skipped
      await fetchAndPersist(mockRequest2);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still only 1 call
      expect(mockFsWriteFile).toHaveBeenCalledTimes(1); // Still only 1 write

      // Clean up
      process.env.ADDYS_API_KEY = undefined as any;
    });

    it('should handle URLs not in endpoints configuration', async () => {
      // URL not in endpoints configuration
      const mockRequest: BeforeRequestSentEvent['request'] = {
        request: 'req-123',
        url: 'https://api.example.com/v1/data',
        method: 'GET',
      };

      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: 'test' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

      await fetchAndPersist(mockRequest);

      // Should return early without fetching
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not record the same URL twice', async () => {
      const mockRequest: BeforeRequestSentEvent['request'] = {
        request: 'req-123',
        url: 'https://swap.p.rainbow.me/v1/quote',
        method: 'GET',
        headers: [
          {
            name: 'Authorization',
            value: { type: 'string', value: 'Bearer test-api-key' },
          },
        ],
      };

      const mockFetch = vi.mocked(global.fetch);
      const mockJsonData = { test: 'data' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockJsonData,
      } as Response);

      // First call should fetch and persist
      await fetchAndPersist(mockRequest);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFsWriteFile).toHaveBeenCalledTimes(1);

      // Second call with same URL should skip
      await fetchAndPersist(mockRequest);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still only 1 call
      expect(mockFsWriteFile).toHaveBeenCalledTimes(1); // Still only 1 write
    });

    it('should handle fetch network errors gracefully', async () => {
      const mockRequest: BeforeRequestSentEvent['request'] = {
        request: 'req-123',
        url: 'https://swap.p.rainbow.me/v1/quote',
        method: 'GET',
        headers: [
          {
            name: 'Authorization',
            value: { type: 'string', value: 'Bearer test-api-key' },
          },
        ],
      };

      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const warnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => undefined);

      // Should not throw
      await expect(fetchAndPersist(mockRequest)).resolves.toBeUndefined();

      // Verify warning was logged
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[E2E Mock] Failed to fetch and persist'),
        expect.any(Error),
      );

      // Verify no file was written
      expect(mockFsWriteFile).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
