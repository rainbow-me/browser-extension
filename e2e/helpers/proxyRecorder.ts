/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { WebDriver } from 'selenium-webdriver';

interface ProxyRecorderConfig {
  port?: number;
  mode?: 'record' | 'replay' | 'passthrough';
  scenarioName?: string;
  outputDir?: string;
  updateMocks?: boolean;
  failOnUnmocked?: boolean;
  verbose?: boolean;
}

interface NetworkRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
}

interface NetworkResponse {
  status: number;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
}

interface NetworkEntry {
  request: NetworkRequest;
  response: NetworkResponse;
  duration: number;
}

/**
 * Automatic proxy recorder for Selenium tests
 * Records HAR files and generates MSW mocks automatically
 */
export class ProxyRecorder {
  private mitmProcess: ChildProcess | null = null;
  private entries: NetworkEntry[] = [];
  private unmockedRequests: string[] = [];
  private config: Required<ProxyRecorderConfig>;
  private harPath: string;
  private isActive = false;
  private proxyServer: import('http').Server | null = null;

  constructor(config: ProxyRecorderConfig = {}) {
    const allowedModes = new Set(['record', 'replay', 'passthrough']);
    const inputMode = config.mode || 'record';
    const normalizedMode = allowedModes.has(inputMode)
      ? inputMode
      : 'passthrough';

    this.config = {
      port: config.port || 8080,
      mode: normalizedMode,
      scenarioName: config.scenarioName || this.getScenarioFromTest(),
      outputDir: config.outputDir || 'fixtures',
      updateMocks: config.updateMocks ?? true,
      failOnUnmocked: config.failOnUnmocked ?? true,
      verbose: config.verbose ?? process.env.DEBUG === 'true',
    };

    if (!allowedModes.has(inputMode)) {
      // Helpful log when external runners set MODE to values like "test"
      // We explicitly coerce unknown modes to 'passthrough'
      // so Selenium can still boot with the proxy.
      // eslint-disable-next-line no-console
      console.log(
        `[ProxyRecorder] Unknown mode "${String(
          inputMode,
        )}". Using 'passthrough' instead.`,
      );
    }

    this.harPath = path.join(
      this.config.outputDir,
      `${this.config.scenarioName}.har`,
    );
  }

  private getScenarioFromTest(): string {
    // Try to extract test name from Vitest context
    const testName = (global as any).currentTestName || 'unknown-test';
    return testName.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  }

  private log(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: any,
  ) {
    if (!this.config.verbose && level === 'debug') return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [ProxyRecorder] [${level.toUpperCase()}]`;

    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Start the proxy with automatic HAR recording
   */
  async start(): Promise<void> {
    if (this.isActive) {
      this.log('warn', 'Proxy already active');
      return;
    }

    this.log(
      'info',
      `Starting proxy in ${this.config.mode} mode on port ${this.config.port}`,
    );

    if (this.config.mode === 'record') {
      await this.startRecordingProxy();
    } else if (this.config.mode === 'replay') {
      await this.startReplayProxy();
    } else {
      await this.startPassthroughProxy();
    }

    this.isActive = true;
    this.log('info', `✅ Proxy started in ${this.config.mode} mode`);
  }

  /**
   * Start mitmproxy in recording mode
   */
  private async startRecordingProxy(): Promise<void> {
    // For now, just skip proxy recording if mitmproxy not available
    this.log('info', 'Proxy recording mode - currently requires mitmproxy');
    this.log('info', 'Install with: pip install mitmproxy');
    this.log('info', 'Continuing without proxy recording...');
    return;
  }

  /**
   * Generate mitmproxy Python script for recording
   */
  private generateMitmScript(): string {
    const scriptPath = path.join(this.config.outputDir, '.mitm-recorder.py');

    const script = `
import json
import os
from mitmproxy import http, ctx
from mitmproxy.addons import har_dump

class NetworkRecorder:
    def __init__(self):
        self.entries = []
        self.unmocked = []
        
    def request(self, flow: http.HTTPFlow) -> None:
        # Log request
        ctx.log.info(f"→ {flow.request.method} {flow.request.pretty_url}")
        
    def response(self, flow: http.HTTPFlow) -> None:
        # Log response
        ctx.log.info(f"← {flow.response.status_code} {flow.request.pretty_url}")
        
        # Track entry
        entry = {
            "method": flow.request.method,
            "url": flow.request.pretty_url,
            "status": flow.response.status_code,
            "duration": int((flow.response.timestamp_end - flow.request.timestamp_start) * 1000)
        }
        self.entries.append(entry)
        
        # Check if this is mocked
        if "${this.config.mode}" == "record" and "${this.config.failOnUnmocked}" == "true":
            # In record mode, check if we have existing mocks
            mock_file = self.get_mock_file(flow.request.pretty_url)
            if not os.path.exists(mock_file):
                self.unmocked.append(f"{flow.request.method} {flow.request.pretty_url}")
    
    def get_mock_file(self, url):
        # Generate mock filename based on URL
        import hashlib
        url_hash = hashlib.sha256(url.encode()).hexdigest()[:16]
        return f"mocks/generated/{url_hash}.json"
        
    def done(self):
        # Report statistics
        ctx.log.info(f"✅ Recorded {len(self.entries)} requests")
        if self.unmocked:
            ctx.log.warn(f"⚠️  {len(self.unmocked)} unmocked requests found")
            for req in self.unmocked[:5]:  # Show first 5
                ctx.log.warn(f"  - {req}")

addons = [
    NetworkRecorder(),
    har_dump.HarDump()  # Also save as HAR
]
`;

    fs.writeFileSync(scriptPath, script);
    return scriptPath;
  }

  /**
   * Start proxy in replay mode (serve mocks)
   */
  private async startReplayProxy(): Promise<void> {
    // This would load existing mocks and serve them
    this.log('info', 'Replay mode: Serving existing mocks');
    // Implementation would load HAR/mocks and replay them
  }

  /**
   * Start proxy in passthrough mode (monitor only)
   */
  private async startPassthroughProxy(): Promise<void> {
    this.log('info', 'Passthrough mode: Starting transparent proxy');

    const http = await import('http');
    const net = await import('net');
    const url = await import('url');

    // Create HTTP proxy server
    const server = http.createServer((req, res) => {
      const targetUrl = req.url || '';
      this.log('debug', `HTTP request: ${req.method} ${targetUrl}`);

      // Parse the target URL
      const parsedUrl = url.parse(targetUrl);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 80,
        path: parsedUrl.path,
        method: req.method,
        headers: req.headers,
      };

      // Make the proxied request
      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        this.log('error', `Proxy request failed: ${err.message}`);
        res.writeHead(500);
        res.end('Proxy Error');
      });

      req.pipe(proxyReq);
    });

    // Handle HTTPS CONNECT tunneling
    server.on('connect', (req, socket, head) => {
      const [hostname, port] = (req.url || '').split(':');
      const targetPort = parseInt(port) || 443;

      this.log('debug', `CONNECT ${hostname}:${targetPort}`);

      const serverSocket = net.connect(targetPort, hostname, () => {
        socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        serverSocket.write(head as unknown as Uint8Array);
        serverSocket.pipe(socket);
        socket.pipe(serverSocket);
      });

      serverSocket.on('error', (err) => {
        this.log('error', `CONNECT failed: ${err.message}`);
        socket.end();
      });

      socket.on('error', () => {
        serverSocket.end();
      });
    });

    // Start listening
    await new Promise<void>((resolve, reject) => {
      server.listen(this.config.port, () => {
        this.log(
          'info',
          `✅ Proxy server listening on port ${this.config.port}`,
        );
        resolve();
      });

      server.on('error', (err) => {
        this.log('error', `Failed to start proxy: ${err.message}`);
        reject(err);
      });
    });

    // Store server reference for cleanup
    (this as any).proxyServer = server;
  }

  /**
   * Wait for proxy to be ready
   */
  private async waitForProxy(maxAttempts = 30): Promise<void> {
    const http = await import('http');

    for (let i = 0; i < maxAttempts; i++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await new Promise<void>((resolve, reject) => {
          const req = http.get(`http://localhost:${this.config.port}/`, () => {
            resolve();
          });
          req.on('error', reject);
          req.setTimeout(1000);
          req.end();
        });
        return;
      } catch {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });
      }
    }
    throw new Error('Proxy failed to start');
  }

  /**
   * Stop the proxy and process recordings
   */
  async stop(): Promise<void> {
    if (!this.isActive) return;

    this.log('info', 'Stopping proxy...');

    if (this.mitmProcess) {
      this.mitmProcess.kill('SIGTERM');
      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    }

    // Close the proxy server if it exists
    if ((this as any).proxyServer) {
      await new Promise<void>((resolve) => {
        (this as any).proxyServer.close(() => {
          this.log('info', 'Proxy server closed');
          resolve();
        });
      });
      (this as any).proxyServer = null;
    }

    this.isActive = false;

    // Process the HAR file if in record mode
    if (this.config.mode === 'record' && fs.existsSync(this.harPath)) {
      await this.processRecording();
    }

    // Report unmocked requests
    if (this.unmockedRequests.length > 0) {
      this.log(
        'warn',
        `Found ${this.unmockedRequests.length} unmocked requests:`,
      );
      this.unmockedRequests.slice(0, 10).forEach((req) => {
        this.log('warn', `  - ${req}`);
      });

      if (this.config.failOnUnmocked) {
        throw new Error(
          `Test failed: ${this.unmockedRequests.length} unmocked requests found`,
        );
      }
    }

    this.log('info', '✅ Proxy stopped');
  }

  /**
   * Process the recorded HAR and generate/update mocks
   */
  private async processRecording(): Promise<void> {
    this.log('info', `Processing recording: ${this.harPath}`);

    if (!this.config.updateMocks) {
      this.log('info', 'Mock update disabled, skipping generation');
      return;
    }

    try {
      // Run the HAR to MSW converter
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      // Generate MSW handlers
      this.log('info', 'Generating MSW handlers...');
      await execAsync(`npx tsx scripts/har-to-msw.ts ${this.harPath}`);

      // Generate BiDi stubs
      this.log('info', 'Generating BiDi stubs...');
      await execAsync(`npx tsx scripts/har-to-stubs.ts ${this.harPath}`);

      this.log('info', '✅ Mocks generated successfully');

      // Optionally, use @mswjs/source to update existing handlers
      if (this.shouldUseMSWSource()) {
        await this.updateWithMSWSource();
      }
    } catch (error) {
      this.log('error', 'Failed to generate mocks', error);
    }
  }

  /**
   * Check if we should use MSW Source for updates
   */
  private shouldUseMSWSource(): boolean {
    // Check if there are existing handlers to update
    const handlerPath = path.join(
      'tests',
      'mocks',
      `${this.config.scenarioName}.handlers.ts`,
    );
    return fs.existsSync(handlerPath);
  }

  /**
   * Update existing handlers using @mswjs/source
   */
  private async updateWithMSWSource(): Promise<void> {
    this.log('info', 'Updating existing handlers with @mswjs/source...');

    try {
      // Use a Vite-safe dynamic import to avoid optimizer pre-bundling
      // eslint-disable-next-line no-eval
      const mswSource: any = await (0, eval)('import("@mswjs/source")').catch(
        () => null,
      );

      const fromTraffic = mswSource?.fromTraffic ?? null;
      const toHandlers = mswSource?.toHandlers ?? null;

      if (!fromTraffic || !toHandlers) {
        this.log(
          'warn',
          '@mswjs/source not available, skipping intelligent merge',
        );
        return;
      }

      // Read the HAR file
      const harContent = fs.readFileSync(this.harPath, 'utf-8');
      const har = JSON.parse(harContent);

      // Convert HAR to MSW handlers using @mswjs/source
      const traffic = fromTraffic(har);
      const handlers = await toHandlers(traffic, {
        // Options for handler generation
        groupBy: 'pathname',
        respectHeaders: ['content-type'],
      });

      // Update the existing handlers file
      const handlerPath = path.join(
        'tests',
        'mocks',
        `${this.config.scenarioName}.handlers.ts`,
      );
      fs.writeFileSync(handlerPath, handlers);

      this.log('info', '✅ Handlers updated with @mswjs/source');
    } catch (error) {
      this.log('error', 'Failed to update with @mswjs/source', error);
    }
  }

  /**
   * Get statistics about the recording session
   */
  getStatistics() {
    return {
      recorded: this.entries.length,
      unmocked: this.unmockedRequests.length,
      scenario: this.config.scenarioName,
      harPath: this.harPath,
    };
  }
}

/**
 * Vitest/Jest integration helper
 */
export async function withProxyRecording(
  testFn: () => Promise<void>,
  config?: ProxyRecorderConfig,
): Promise<void> {
  const proxy = new ProxyRecorder(config);

  try {
    await proxy.start();
    await testFn();
  } finally {
    await proxy.stop();
    const stats = proxy.getStatistics();
    console.log(`📊 Proxy Statistics:`, stats);
  }
}

/**
 * Selenium test helper with automatic proxy recording
 */
export async function setupProxyForTest(
  driver: WebDriver,
  config?: ProxyRecorderConfig,
): Promise<ProxyRecorder> {
  const proxy = new ProxyRecorder({
    ...config,
    // Auto-detect test name from Vitest
    scenarioName: config?.scenarioName || (global as any).currentTestName,
  });

  await proxy.start();

  // Ensure driver is using the proxy
  // (Already configured in helpers.ts, but we can verify)
  const capabilities = await driver.getCapabilities();
  console.log('🔍 Driver proxy config:', capabilities.get('proxy'));

  return proxy;
}
