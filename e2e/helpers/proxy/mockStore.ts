/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * MockStore - Manages mock data for specific services
 * This provides a way to use existing mock data while transitioning to the new system
 */

import * as fs from 'fs';
import * as path from 'path';

interface MockEntry {
  url: string;
  method: string;
  response: {
    status: number;
    headers: Record<string, string>;
    body: any;
  };
}

export class MockStore {
  private mocks: Map<string, MockEntry> = new Map();
  private readonly services = [
    'swap.p.rainbow.me',
    'addys.p.rainbow.me',
    'nftp.rainbow.me',
    'token-search.rainbow.me',
  ];

  constructor(private scenarioName: string) {}

  /**
   * Load existing mock data from the old system
   * This allows us to reuse the existing mocks during transition
   */
  async loadLegacyMocks(): Promise<void> {
    const swapMocksDir = path.join(process.cwd(), 'e2e/mocks/swap_quotes');
    const userAssetsMocksDir = path.join(
      process.cwd(),
      'e2e/mocks/user_assets',
    );

    // Load swap mocks
    if (fs.existsSync(swapMocksDir)) {
      const files = fs.readdirSync(swapMocksDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const mockData: any = JSON.parse(
            fs.readFileSync(path.join(swapMocksDir, file), 'utf-8'),
          );
          // Store with a generic key for now
          this.addMock(
            `swap-${file}`,
            'GET',
            `https://swap.p.rainbow.me/quote`,
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
              body: mockData.default || mockData,
            },
          );
        }
      }
    }

    // Load user asset mocks
    if (fs.existsSync(userAssetsMocksDir)) {
      const files = fs.readdirSync(userAssetsMocksDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const mockData: any = JSON.parse(
            fs.readFileSync(path.join(userAssetsMocksDir, file), 'utf-8'),
          );
          this.addMock(
            `assets-${file}`,
            'GET',
            `https://addys.p.rainbow.me/assets`,
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
              body: mockData.default || mockData,
            },
          );
        }
      }
    }

    console.log(`[MockStore] Loaded ${this.mocks.size} legacy mocks`);
  }

  /**
   * Add a mock entry
   */
  addMock(
    id: string,
    method: string,
    url: string,
    response: MockEntry['response'],
  ) {
    const key = this.generateKey(method, url);
    this.mocks.set(key, {
      url,
      method,
      response,
    });
  }

  /**
   * Find a mock for a given request
   */
  findMock(method: string, url: string): MockEntry | undefined {
    // Try exact match first
    const exactKey = this.generateKey(method, url);
    const exactMatch = this.mocks.get(exactKey);
    if (exactMatch) return exactMatch;

    // Try pattern matching for dynamic URLs
    const urlObj = new URL(url);

    // Special handling for Rainbow API endpoints
    if (urlObj.hostname === 'swap.p.rainbow.me') {
      // For swap quotes, we need to match based on query params
      // For now, return the first swap mock we have
      for (const [key, mock] of this.mocks.entries()) {
        if (key.includes('swap-') && mock.method === method) {
          return mock;
        }
      }
    }

    if (urlObj.hostname === 'addys.p.rainbow.me') {
      // For user assets, match based on path pattern
      for (const [key, mock] of this.mocks.entries()) {
        if (key.includes('assets-') && mock.method === method) {
          return mock;
        }
      }
    }

    return undefined;
  }

  /**
   * Generate a consistent key for storing/retrieving mocks
   */
  private generateKey(method: string, url: string): string {
    const urlObj = new URL(url);
    // Use hostname and pathname for basic matching
    return `${method}:${urlObj.hostname}${urlObj.pathname}`;
  }

  /**
   * Get predefined mock responses for common Rainbow APIs
   * This provides fallback data when no recordings exist
   */
  static getDefaultMocks(): Record<string, any> {
    return {
      // Default swap quote response
      'swap.p.rainbow.me': {
        quote: {
          from: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          fromAmount: '1000000000000000000',
          toAmount: '3000000000',
          price: '3000',
          fee: '0.01',
          routes: [
            {
              name: '1inch',
              proportion: 1,
            },
          ],
        },
      },
      // Default user assets response
      'addys.p.rainbow.me': {
        assets: [
          {
            address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            balance: '10000000000000000000000',
            price: { value: 3000 },
          },
          {
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            balance: '0',
            price: { value: 1 },
          },
        ],
      },
      // Empty NFT response
      'nftp.rainbow.me': {
        results: [],
        next: null,
      },
      // Empty token search response
      'token-search.rainbow.me': {
        data: [],
      },
    };
  }

  /**
   * Export mocks to a format suitable for the proxy
   */
  exportForProxy(): Array<{
    method: string;
    url: string;
    response: any;
  }> {
    return Array.from(this.mocks.values()).map((mock) => ({
      method: mock.method,
      url: mock.url,
      response: mock.response,
    }));
  }
}
