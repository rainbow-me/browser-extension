#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Convert legacy mock files to the new proxy recording format
 * This helps transition from the old system to the new one
 */

import * as fs from 'fs';
import * as path from 'path';

interface ProxyRecording {
  id: string;
  timestamp: number;
  request: {
    method: string;
    url: string;
    headers: Record<string, string | string[]>;
    body?: string;
  };
  response: {
    status: number;
    headers: Record<string, string | string[]>;
    body: string;
  };
}

function convertLegacyMocks() {
  const recordings: ProxyRecording[] = [];

  // Convert swap mocks
  const swapMocksDir = path.join(process.cwd(), 'e2e/mocks/swap_quotes');
  if (fs.existsSync(swapMocksDir)) {
    const files = fs.readdirSync(swapMocksDir);

    files.forEach((file, index) => {
      if (!file.endsWith('.json')) return;

      const mockData: any = JSON.parse(
        fs.readFileSync(path.join(swapMocksDir, file), 'utf-8'),
      );

      // Create a recording entry
      recordings.push({
        id: `swap-${index}`,
        timestamp: Date.now(),
        request: {
          method: 'GET',
          url: 'https://swap.p.rainbow.me/v1/quote',
          headers: {
            'content-type': 'application/json',
          },
        },
        response: {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(mockData.default || mockData),
        },
      });
    });

    console.log(`✅ Converted ${files.length} swap mocks`);
  }

  // Convert user asset mocks
  const assetMocksDir = path.join(process.cwd(), 'e2e/mocks/user_assets');
  if (fs.existsSync(assetMocksDir)) {
    const files = fs.readdirSync(assetMocksDir);

    files.forEach((file, index) => {
      if (!file.endsWith('.json')) return;

      const mockData: any = JSON.parse(
        fs.readFileSync(path.join(assetMocksDir, file), 'utf-8'),
      );

      // Create a recording entry
      recordings.push({
        id: `assets-${index}`,
        timestamp: Date.now(),
        request: {
          method: 'GET',
          url: 'https://addys.p.rainbow.me/v3/1/assets',
          headers: {
            'content-type': 'application/json',
          },
        },
        response: {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(mockData.default || mockData),
        },
      });
    });

    console.log(`✅ Converted ${files.length} asset mocks`);
  }

  // Save converted recordings
  const outputDir = path.join(process.cwd(), 'e2e/fixtures/swap-flow-1');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'recordings.json');
  fs.writeFileSync(outputPath, JSON.stringify(recordings, null, 2));

  console.log(`
===========================================
✅ Mock Conversion Complete!
===========================================
Total recordings: ${recordings.length}
Output: ${outputPath}

To use these mocks:
1. Run: TEST_MODE=replay ./e2e/scripts/run-test-poc.sh
2. The proxy will load these recordings automatically
===========================================
  `);
}

// Run the conversion
convertLegacyMocks();
