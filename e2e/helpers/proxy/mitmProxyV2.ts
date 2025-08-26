/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as net from 'net';
import * as path from 'path';
import * as tls from 'tls';
import { URL } from 'url';
import * as zlib from 'zlib';

import * as forge from 'node-forge';

interface RequestRecord {
  id: string;
  timestamp: number;
  request: {
    method: string;
    url: string;
    headers: Record<string, string | string[]>;
    body?: string;
  };
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string | string[]>;
    body: string;
  };
}

interface ProxyConfig {
  port?: number;
  mode?: 'record' | 'replay' | 'passthrough';
  fixturesDir?: string;
  scenarioName?: string;
  verbose?: boolean;
  failOnUnmocked?: boolean;
}

interface Certificate {
  cert: string;
  key: string;
}

/**
 * MITM Proxy V2 - Improved version with better error handling and recording
 */
export class MitmProxyV2 {
  private server: http.Server | null = null;
  private records: Map<string, RequestRecord> = new Map();
  private config: Required<ProxyConfig>;
  private fixturesPath: string;
  private unmockedRequests: Set<string> = new Set();
  private rootCA: Certificate;
  private certCache: Map<string, Certificate> = new Map();
  private activeConnections: Set<net.Socket> = new Set();
  private recordingSaveInterval: NodeJS.Timeout | null = null;

  constructor(config: ProxyConfig = {}) {
    this.config = {
      port: config.port || 8080,
      mode: config.mode || 'passthrough',
      fixturesDir: config.fixturesDir || 'e2e/fixtures',
      scenarioName: config.scenarioName || 'default',
      verbose: config.verbose ?? false,
      failOnUnmocked: config.failOnUnmocked ?? false,
    };

    this.fixturesPath = path.join(
      this.config.fixturesDir,
      this.config.scenarioName,
      'recordings.json',
    );

    // Generate or load root CA
    this.rootCA = this.generateRootCA();
  }

  private log(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: any,
  ) {
    if (!this.config.verbose && level === 'debug') return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [MitmProxyV2] [${level.toUpperCase()}]`;

    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Generate a self-signed root CA for MITM
   */
  private generateRootCA(): Certificate {
    const certsDir = path.join(this.config.fixturesDir, 'certs');
    const caKeyPath = path.join(certsDir, 'ca.key');
    const caCertPath = path.join(certsDir, 'ca.crt');

    // Check if CA already exists
    if (fs.existsSync(caKeyPath) && fs.existsSync(caCertPath)) {
      this.log('info', '📜 Using existing CA certificate');
      return {
        key: fs.readFileSync(caKeyPath, 'utf8'),
        cert: fs.readFileSync(caCertPath, 'utf8'),
      };
    }

    this.log('info', '🔐 Generating new CA certificate');

    // Create certs directory
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true });
    }

    // Generate CA using forge
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const cert = forge.pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(
      cert.validity.notBefore.getFullYear() + 10,
    );

    const attrs = [
      {
        name: 'commonName',
        value: 'Rainbow E2E Test CA',
      },
      {
        name: 'countryName',
        value: 'US',
      },
      {
        name: 'organizationName',
        value: 'Rainbow E2E Tests',
      },
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    cert.setExtensions([
      {
        name: 'basicConstraints',
        cA: true,
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
    ]);

    // Self-sign the certificate
    cert.sign(keys.privateKey, forge.md.sha256.create());

    // Convert to PEM
    const pemCert = forge.pki.certificateToPem(cert);
    const pemKey = forge.pki.privateKeyToPem(keys.privateKey);

    // Save CA files
    fs.writeFileSync(caCertPath, pemCert);
    fs.writeFileSync(caKeyPath, pemKey);

    this.log('info', `✅ CA certificate generated and saved to ${certsDir}`);

    return {
      cert: pemCert,
      key: pemKey,
    };
  }

  /**
   * Generate a certificate for a specific hostname
   */
  private generateCertificate(hostname: string): Certificate {
    // Check cache first
    if (this.certCache.has(hostname)) {
      return this.certCache.get(hostname)!;
    }

    this.log('debug', `🔒 Generating certificate for ${hostname}`);

    // Parse CA certificate and key
    const caCert = forge.pki.certificateFromPem(this.rootCA.cert);
    const caKey = forge.pki.privateKeyFromPem(this.rootCA.key);

    // Generate new key pair for the domain
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const cert = forge.pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = crypto.randomBytes(16).toString('hex');
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(
      cert.validity.notBefore.getFullYear() + 1,
    );

    const attrs = [
      {
        name: 'commonName',
        value: hostname,
      },
      {
        name: 'countryName',
        value: 'US',
      },
      {
        name: 'organizationName',
        value: 'Rainbow E2E Test',
      },
    ];

    cert.setSubject(attrs);
    cert.setIssuer(caCert.subject.attributes);

    cert.setExtensions([
      {
        name: 'subjectAltName',
        altNames: [
          {
            type: 2, // DNS
            value: hostname,
          },
          {
            type: 2,
            value: `*.${hostname}`,
          },
        ],
      },
    ]);

    // Sign with CA key
    cert.sign(caKey, forge.md.sha256.create());

    const pemCert = forge.pki.certificateToPem(cert);
    const pemKey = forge.pki.privateKeyToPem(keys.privateKey);

    const result = {
      cert: pemCert,
      key: pemKey,
    };

    // Cache the certificate
    this.certCache.set(hostname, result);

    return result;
  }

  async start(): Promise<void> {
    if (this.server) {
      this.log('warn', 'Proxy already running');
      return;
    }

    // Load existing recordings if in replay mode
    if (this.config.mode === 'replay') {
      await this.loadRecordings();
    }

    // Set up auto-save for recording mode
    if (this.config.mode === 'record') {
      this.recordingSaveInterval = setInterval(() => {
        this.saveRecordings().catch((err) => {
          this.log('error', 'Failed to auto-save recordings:', err);
        });
      }, 5000); // Save every 5 seconds
    }

    this.server = http.createServer();

    // Handle regular HTTP requests
    this.server.on('request', this.handleHttpRequest.bind(this));

    // Handle HTTPS CONNECT tunneling with MITM
    this.server.on('connect', this.handleConnect.bind(this));

    return new Promise((resolve) => {
      this.server!.listen(this.config.port, () => {
        this.log(
          'info',
          `✅ MITM Proxy V2 started in ${this.config.mode} mode on port ${this.config.port}`,
        );
        this.log(
          'info',
          `📜 CA certificate: ${path.join(
            this.config.fixturesDir,
            'certs',
            'ca.crt',
          )}`,
        );
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (!this.server) {
      this.log('warn', 'Proxy not running');
      return;
    }

    // Clear auto-save interval
    if (this.recordingSaveInterval) {
      clearInterval(this.recordingSaveInterval);
      this.recordingSaveInterval = null;
    }

    // Save recordings one last time if in record mode
    if (this.config.mode === 'record') {
      await this.saveRecordings();
    }

    // Report unmocked requests if any
    if (this.unmockedRequests.size > 0) {
      this.log(
        'warn',
        `⚠️ Unmocked requests detected:`,
        Array.from(this.unmockedRequests),
      );
    }

    // Close all active connections gracefully
    this.activeConnections.forEach((socket) => {
      try {
        socket.end();
        setTimeout(() => {
          if (!socket.destroyed) {
            socket.destroy();
          }
        }, 1000);
      } catch (err) {
        // Ignore errors during shutdown
      }
    });
    this.activeConnections.clear();

    return new Promise((resolve) => {
      this.server!.close(() => {
        this.log('info', '✅ Proxy stopped');
        this.server = null;
        resolve();
      });
    });
  }

  /**
   * Handle HTTPS CONNECT with MITM - Improved version
   */
  private handleConnect(
    req: http.IncomingMessage,
    clientSocket: net.Socket,
    head: Buffer,
  ) {
    const { hostname, port } = this.parseConnectTarget(req.url!);

    this.log('debug', `🔒 CONNECT tunnel to ${hostname}:${port}`);

    // Track connection
    this.activeConnections.add(clientSocket);
    clientSocket.on('close', () => {
      this.activeConnections.delete(clientSocket);
    });

    // Error handling for client socket
    clientSocket.on('error', (err) => {
      this.log('debug', `Client socket error for ${hostname}: ${err.message}`);
      this.activeConnections.delete(clientSocket);
    });

    // Generate certificate for this hostname
    const cert = this.generateCertificate(hostname);

    // Send 200 Connection Established
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');

    // Create TLS server options
    const tlsOptions = {
      key: cert.key,
      cert: cert.cert,
      isServer: true,
      requestCert: false,
      rejectUnauthorized: false,
    };

    // Upgrade the socket to TLS
    const tlsSocket = new tls.TLSSocket(clientSocket, tlsOptions);

    tlsSocket.on('secure', () => {
      this.log('debug', `✅ TLS handshake complete for ${hostname}`);
    });

    // Buffer to accumulate partial HTTP requests
    let requestBuffer = '';

    // Handle the decrypted HTTPS data
    tlsSocket.on('data', async (data: Buffer) => {
      try {
        requestBuffer += data.toString();

        // Check if we have a complete HTTP request
        const requestEndIndex = requestBuffer.indexOf('\r\n\r\n');
        if (requestEndIndex === -1) {
          // Wait for more data
          return;
        }

        // Extract the complete request
        const headerEnd = requestEndIndex + 4;
        const requestHeaders = requestBuffer.substring(0, requestEndIndex);
        const lines = requestHeaders.split('\r\n');

        if (lines.length === 0) return;

        // Parse request line
        const [method, path] = lines[0].split(' ');
        if (!method || !path) return;

        // Parse headers
        const headers: Record<string, string> = {};
        let contentLength = 0;

        for (let i = 1; i < lines.length; i++) {
          const [key, ...valueParts] = lines[i].split(': ');
          if (key) {
            const value = valueParts.join(': ');
            headers[key.toLowerCase()] = value;
            if (key.toLowerCase() === 'content-length') {
              contentLength = parseInt(value, 10);
            }
          }
        }

        // Get body if present
        let body = '';
        if (contentLength > 0) {
          const currentBodyLength = requestBuffer.length - headerEnd;
          if (currentBodyLength < contentLength) {
            // Wait for more data
            return;
          }
          body = requestBuffer.substring(headerEnd, headerEnd + contentLength);
        }

        // Clear the processed request from buffer
        requestBuffer = requestBuffer.substring(headerEnd + contentLength);

        // Construct full URL
        const fullUrl = `https://${hostname}${path}`;
        this.log('debug', `🔓 Intercepted: ${method} ${fullUrl}`);

        // Handle based on mode
        if (this.config.mode === 'replay') {
          await this.handleReplayHTTPS(
            method,
            fullUrl,
            headers,
            body,
            tlsSocket,
          );
        } else {
          await this.handleProxyHTTPS(
            method,
            fullUrl,
            headers,
            body,
            tlsSocket,
          );
        }
      } catch (err: any) {
        this.log(
          'error',
          `Error processing HTTPS data for ${hostname}: ${err.message}`,
        );
        try {
          const errorResponse =
            'HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nProxy Internal Error';
          tlsSocket.write(errorResponse);
        } catch (writeErr) {
          // Socket might be closed
        }
      }
    });

    tlsSocket.on('error', (err) => {
      if (err.message.includes('EPIPE') || err.message.includes('ECONNRESET')) {
        this.log('debug', `TLS socket closed for ${hostname}`);
      } else {
        this.log('error', `TLS socket error for ${hostname}: ${err.message}`);
      }
      try {
        clientSocket.destroy();
      } catch (e) {
        // Ignore
      }
    });

    // Write any buffered data
    if (head && head.length > 0) {
      // Convert Buffer to Uint8Array for TypeScript compatibility
      const headArray = new Uint8Array(
        head.buffer,
        head.byteOffset,
        head.byteLength,
      );
      tlsSocket.write(headArray as any);
    }
  }

  /**
   * Handle HTTPS request in replay mode
   */
  private async handleReplayHTTPS(
    method: string,
    url: string,
    headers: Record<string, string>,
    body: string,
    tlsSocket: tls.TLSSocket,
  ) {
    const record = this.findRecording(method, url);

    if (record?.response) {
      this.log('debug', `✅ Replaying recorded response for ${url}`);

      // Decompress body if it's compressed
      let responseBody = record.response.body || '';

      // If body is an object (JSON), stringify it
      if (typeof responseBody === 'object') {
        responseBody = JSON.stringify(responseBody);
      }

      const contentEncoding = record.response.headers['content-encoding'];

      if (contentEncoding && responseBody) {
        try {
          // Check if the data is actually compressed by looking for compression signatures
          const isCompressed =
            (contentEncoding === 'gzip' &&
              responseBody.includes('\u001f\u008b')) || // gzip signature
            (contentEncoding === 'br' && responseBody.charAt(0) === '\u00ce') || // brotli signature (approximate)
            (contentEncoding === 'deflate' && responseBody.includes('\u0078')); // deflate signature (approximate)

          if (isCompressed) {
            const buffer = Buffer.from(responseBody, 'binary');

            if (contentEncoding === 'gzip') {
              responseBody = zlib
                .gunzipSync(buffer as unknown as Uint8Array)
                .toString('utf8');
              this.log('debug', `📦 Decompressed gzipped response for ${url}`);
            } else if (contentEncoding === 'br') {
              responseBody = zlib
                .brotliDecompressSync(buffer as unknown as Uint8Array)
                .toString('utf8');
              this.log('debug', `📦 Decompressed brotli response for ${url}`);
            } else if (contentEncoding === 'deflate') {
              responseBody = zlib
                .inflateSync(buffer as unknown as Uint8Array)
                .toString('utf8');
              this.log('debug', `📦 Decompressed deflate response for ${url}`);
            }
          } else {
            this.log(
              'debug',
              `📋 Response marked as ${contentEncoding} but appears uncompressed, using as-is`,
            );
          }
        } catch (err) {
          this.log(
            'debug',
            `⚠️ Could not decompress ${contentEncoding} response for ${url}, using as-is`,
          );
          // If decompression fails, assume the body is already decompressed
        }
      }

      // Log the response body for debugging
      if (url.includes('/assets/') || url.includes('token-search')) {
        this.log('info', `📊 Response for ${url}:`);

        // More detailed logging for mainnet token searches
        if (url.includes('token-search.rainbow.me/v3/tokens/1/')) {
          this.log('info', `🔍 Mainnet token search detected!`);
          try {
            const parsed = JSON.parse(responseBody) as any;
            this.log(
              'info',
              `Token search returned ${parsed?.data?.length || 0} results`,
            );
            if (parsed?.data?.[0]) {
              this.log(
                'info',
                `First token: ${parsed.data[0].symbol} (${parsed.data[0].address})`,
              );
            }
          } catch (e) {
            // Not JSON, show raw preview
          }
        }

        this.log(
          'info',
          `Response body (first 500 chars): ${responseBody.substring(0, 500)}`,
        );

        // Special logging for USDC token-search to debug favorites
        if (
          url.includes('token-search.rainbow.me') &&
          url.includes('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
        ) {
          this.log('info', '🎯 USDC token-search response detected!');
          try {
            const parsedBody = JSON.parse(responseBody) as any;
            this.log(
              'info',
              `USDC search parsed successfully. Results count: ${
                parsedBody?.data?.length || 0
              }`,
            );
            if (parsedBody?.data?.[0]) {
              this.log(
                'info',
                `First result: ${JSON.stringify(parsedBody.data[0]).substring(
                  0,
                  300,
                )}`,
              );
            }
          } catch (e) {
            this.log('warn', `Could not parse USDC response as JSON: ${e}`);
          }
        }
      }

      // Build response - filter out problematic headers
      const skipHeaders = [
        'transfer-encoding',
        'content-encoding',
        'content-length',
      ];
      let responseData = `HTTP/1.1 ${record.response.status} ${
        record.response.statusText || 'OK'
      }\r\n`;

      // Add headers, filtering out problematic ones
      Object.entries(record.response.headers).forEach(([key, value]) => {
        if (value && !skipHeaders.includes(key.toLowerCase())) {
          if (Array.isArray(value)) {
            value.forEach((v) => {
              responseData += `${key}: ${v}\r\n`;
            });
          } else {
            responseData += `${key}: ${value}\r\n`;
          }
        }
      });

      // Add content-length for the actual body
      const bodyLength = Buffer.byteLength(responseBody);
      responseData += `Content-Length: ${bodyLength}\r\n`;
      responseData += '\r\n';
      responseData += responseBody;

      try {
        tlsSocket.write(responseData);
      } catch (err) {
        this.log('error', `Failed to write replay response: ${err}`);
      }
    } else {
      this.unmockedRequests.add(`${method} ${url}`);

      if (this.config.failOnUnmocked) {
        this.log('error', `❌ No recording found for ${method} ${url}`);
        const errorResponse = `HTTP/1.1 501 Not Implemented\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(
          {
            error: 'No mock found',
            method: method,
            url: url,
            hint: 'Run tests with mode=record to capture this request',
          },
        )}`;
        try {
          tlsSocket.write(errorResponse);
        } catch (err) {
          // Socket might be closed
        }
      } else {
        this.log('warn', `⚠️ No recording found, passing through: ${url}`);
        await this.handleProxyHTTPS(method, url, headers, body, tlsSocket);
      }
    }
  }

  /**
   * Proxy HTTPS request to actual server
   */
  private async handleProxyHTTPS(
    method: string,
    fullUrl: string,
    headers: Record<string, string>,
    body: string,
    tlsSocket: tls.TLSSocket,
  ) {
    const targetUrl = new URL(fullUrl);
    const options: https.RequestOptions = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || 443,
      path: targetUrl.pathname + targetUrl.search,
      method: method,
      headers: {
        ...headers,
        host: targetUrl.host,
      },
      rejectUnauthorized: false, // Accept any certificate from upstream
    };

    // Remove hop-by-hop headers
    const hopByHopHeaders = [
      'proxy-connection',
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'upgrade',
    ];

    hopByHopHeaders.forEach((header) => {
      delete options.headers![header];
    });

    // For recording mode, capture the response
    const shouldRecord = this.config.mode === 'record';
    let recordedData: RequestRecord | null = null;

    if (shouldRecord) {
      recordedData = {
        id: crypto.randomBytes(16).toString('hex'),
        timestamp: Date.now(),
        request: {
          method,
          url: fullUrl,
          headers: this.sanitizeHeaders(headers),
          body,
        },
      };
    }

    // Make request to actual server
    const proxyReq = https.request(options, (proxyRes) => {
      // Handle chunked encoding properly
      const isChunked = proxyRes.headers['transfer-encoding'] === 'chunked';

      // Build response headers
      let responseHeaders = `HTTP/1.1 ${proxyRes.statusCode} ${
        proxyRes.statusMessage || 'OK'
      }\r\n`;

      // Check if response is compressed
      const contentEncoding = proxyRes.headers['content-encoding'];
      const isCompressed =
        contentEncoding === 'gzip' ||
        contentEncoding === 'deflate' ||
        contentEncoding === 'br';

      // Filter out problematic headers for the client
      // We skip content-length because we'll add it later with the correct value
      const skipHeaders = [
        'transfer-encoding',
        'content-encoding',
        'content-length',
      ];
      let responseBody = '';

      Object.entries(proxyRes.headers).forEach(([key, value]) => {
        if (!skipHeaders.includes(key.toLowerCase()) && value) {
          if (Array.isArray(value)) {
            value.forEach((v) => {
              responseHeaders += `${key}: ${v}\r\n`;
            });
          } else {
            responseHeaders += `${key}: ${value}\r\n`;
          }
        }
      });

      if (isChunked || shouldRecord || isCompressed) {
        // Buffer the entire response to handle chunked encoding and decompression
        const chunks: Buffer[] = [];

        proxyRes.on('data', (chunk) => {
          chunks.push(chunk);
        });

        proxyRes.on('end', () => {
          try {
            let fullBody = Buffer.concat(chunks as any[]);

            // Decompress if needed
            if (isCompressed) {
              this.log(
                'debug',
                `🗜️ Decompressing ${contentEncoding} response for ${fullUrl}`,
              );
              if (contentEncoding === 'gzip') {
                fullBody = zlib.gunzipSync(fullBody as unknown as Uint8Array);
              } else if (contentEncoding === 'deflate') {
                fullBody = zlib.inflateSync(fullBody as unknown as Uint8Array);
              } else if (contentEncoding === 'br') {
                fullBody = zlib.brotliDecompressSync(
                  fullBody as unknown as Uint8Array,
                );
              }
            }

            responseBody = fullBody.toString('utf8');

            // Add content-length header for decompressed content
            responseHeaders += `Content-Length: ${fullBody.length}\r\n`;
            responseHeaders += '\r\n';

            // Send complete response (decompressed)
            tlsSocket.write(responseHeaders);
            tlsSocket.write(fullBody as any);

            // Save recording if needed (with decompressed content)
            if (shouldRecord && recordedData) {
              // Store headers without content-encoding since we're storing decompressed
              const sanitizedHeaders = this.sanitizeHeaders(proxyRes.headers);
              delete sanitizedHeaders['content-encoding'];

              recordedData.response = {
                status: proxyRes.statusCode!,
                statusText: proxyRes.statusMessage || 'OK',
                headers: sanitizedHeaders,
                body: responseBody,
              };

              this.records.set(
                this.getRecordKey(method, fullUrl),
                recordedData,
              );
              this.log('debug', `📼 Recorded: ${method} ${fullUrl}`);
            }

            this.log('debug', `✅ Response sent for ${fullUrl}`);
          } catch (err) {
            this.log('error', `Error handling response for ${fullUrl}: ${err}`);
          }
        });
      } else {
        // Stream response directly
        // For streaming responses, we don't filter content-length since we're passing through as-is
        let streamHeaders = `HTTP/1.1 ${proxyRes.statusCode} ${
          proxyRes.statusMessage || 'OK'
        }\r\n`;

        // Only skip transfer-encoding and content-encoding for streaming
        const streamSkipHeaders = ['transfer-encoding', 'content-encoding'];

        Object.entries(proxyRes.headers).forEach(([key, value]) => {
          if (!streamSkipHeaders.includes(key.toLowerCase()) && value) {
            if (Array.isArray(value)) {
              value.forEach((v) => {
                streamHeaders += `${key}: ${v}\r\n`;
              });
            } else {
              streamHeaders += `${key}: ${value}\r\n`;
            }
          }
        });

        streamHeaders += '\r\n';

        try {
          tlsSocket.write(streamHeaders);
          proxyRes.pipe(tlsSocket, { end: false });

          proxyRes.on('end', () => {
            this.log('debug', `✅ Response streamed for ${fullUrl}`);
          });
        } catch (err) {
          this.log('error', `Error streaming response: ${err}`);
        }
      }
    });

    proxyReq.on('error', (err) => {
      this.log('error', `Request failed for ${fullUrl}: ${err.message}`);
      try {
        const errorResponse = `HTTP/1.1 502 Bad Gateway\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nProxy Error: ${err.message}`;
        tlsSocket.write(errorResponse);
      } catch (writeErr) {
        // Socket might be closed
      }
    });

    // Set timeout to prevent hanging requests
    proxyReq.setTimeout(30000, () => {
      proxyReq.destroy();
      this.log('error', `Request timeout for ${fullUrl}`);
    });

    // Send body if present
    if (body) {
      proxyReq.write(body);
    }

    proxyReq.end();
  }

  /**
   * Handle regular HTTP requests
   */
  private async handleHttpRequest(
    clientReq: http.IncomingMessage,
    clientRes: http.ServerResponse,
  ) {
    const targetUrl = this.parseTargetUrl(clientReq);

    if (!targetUrl) {
      clientRes.writeHead(400, { 'Content-Type': 'text/plain' });
      clientRes.end('Bad Request: Invalid URL');
      return;
    }

    this.log('debug', `📨 HTTP: ${clientReq.method} ${targetUrl}`);

    switch (this.config.mode) {
      case 'replay':
        await this.handleReplay(clientReq, clientRes, targetUrl);
        break;
      case 'record':
        await this.handleRecord(clientReq, clientRes, targetUrl);
        break;
      case 'passthrough':
        await this.handlePassthrough(clientReq, clientRes, targetUrl);
        break;
    }
  }

  private async handleReplay(
    clientReq: http.IncomingMessage,
    clientRes: http.ServerResponse,
    targetUrl: string,
  ) {
    const record = this.findRecording(clientReq.method!, targetUrl);

    if (record?.response) {
      this.log('debug', `✅ Replaying recorded response for ${targetUrl}`);

      // Decompress body if it's compressed
      let responseBody = record.response.body || '';

      // If body is an object (JSON), stringify it
      if (typeof responseBody === 'object') {
        responseBody = JSON.stringify(responseBody);
      }

      const contentEncoding = record.response.headers['content-encoding'];

      if (contentEncoding && responseBody) {
        try {
          // Check if the data is actually compressed by looking for compression signatures
          const isCompressed =
            (contentEncoding === 'gzip' &&
              responseBody.includes('\u001f\u008b')) || // gzip signature
            (contentEncoding === 'br' && responseBody.charAt(0) === '\u00ce') || // brotli signature (approximate)
            (contentEncoding === 'deflate' && responseBody.includes('\u0078')); // deflate signature (approximate)

          if (isCompressed) {
            const buffer = Buffer.from(responseBody, 'binary');

            if (contentEncoding === 'gzip') {
              responseBody = zlib
                .gunzipSync(buffer as unknown as Uint8Array)
                .toString('utf8');
              this.log(
                'debug',
                `📦 Decompressed gzipped response for ${targetUrl}`,
              );
            } else if (contentEncoding === 'br') {
              responseBody = zlib
                .brotliDecompressSync(buffer as unknown as Uint8Array)
                .toString('utf8');
              this.log(
                'debug',
                `📦 Decompressed brotli response for ${targetUrl}`,
              );
            } else if (contentEncoding === 'deflate') {
              responseBody = zlib
                .inflateSync(buffer as unknown as Uint8Array)
                .toString('utf8');
              this.log(
                'debug',
                `📦 Decompressed deflate response for ${targetUrl}`,
              );
            }
          } else {
            this.log(
              'debug',
              `📋 Response marked as ${contentEncoding} but appears uncompressed, using as-is`,
            );
          }
        } catch (err) {
          this.log(
            'debug',
            `⚠️ Could not decompress ${contentEncoding} response for ${targetUrl}, using as-is`,
          );
          // If decompression fails, assume the body is already decompressed
        }
      }

      // Filter out problematic headers
      const filteredHeaders = { ...record.response.headers };
      delete filteredHeaders['transfer-encoding'];
      delete filteredHeaders['content-encoding'];
      delete filteredHeaders['content-length'];

      // Set proper content-length
      if (responseBody) {
        filteredHeaders['content-length'] =
          Buffer.byteLength(responseBody).toString();
      }

      clientRes.writeHead(record.response.status, filteredHeaders);
      clientRes.end(responseBody);
    } else {
      this.unmockedRequests.add(`${clientReq.method} ${targetUrl}`);

      if (this.config.failOnUnmocked) {
        this.log(
          'error',
          `❌ No recording found for ${clientReq.method} ${targetUrl}`,
        );
        clientRes.writeHead(501, { 'Content-Type': 'application/json' });
        clientRes.end(
          JSON.stringify({
            error: 'No mock found',
            method: clientReq.method,
            url: targetUrl,
            hint: 'Run tests with mode=record to capture this request',
          }),
        );
      } else {
        this.log(
          'warn',
          `⚠️ No recording found, passing through: ${targetUrl}`,
        );
        await this.handlePassthrough(clientReq, clientRes, targetUrl);
      }
    }
  }

  private async handleRecord(
    clientReq: http.IncomingMessage,
    clientRes: http.ServerResponse,
    targetUrl: string,
  ) {
    const requestBody = await this.readBody(clientReq);

    const record: RequestRecord = {
      id: crypto.randomBytes(16).toString('hex'),
      timestamp: Date.now(),
      request: {
        method: clientReq.method!,
        url: targetUrl,
        headers: this.sanitizeHeaders(clientReq.headers),
        body: requestBody,
      },
    };

    await this.proxyRequest(
      clientReq,
      clientRes,
      targetUrl,
      (response, responseBody) => {
        record.response = {
          status: response.statusCode!,
          statusText: response.statusMessage || 'OK',
          headers: this.sanitizeHeaders(response.headers),
          body: responseBody,
        };

        this.records.set(
          this.getRecordKey(clientReq.method!, targetUrl),
          record,
        );
        this.log('debug', `📼 Recorded: ${clientReq.method} ${targetUrl}`);
      },
    );
  }

  private async handlePassthrough(
    clientReq: http.IncomingMessage,
    clientRes: http.ServerResponse,
    targetUrl: string,
  ) {
    await this.proxyRequest(clientReq, clientRes, targetUrl);
  }

  private async proxyRequest(
    clientReq: http.IncomingMessage,
    clientRes: http.ServerResponse,
    targetUrl: string,
    onResponse?: (response: http.IncomingMessage, body: string) => void,
  ) {
    const url = new URL(targetUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    // Remove proxy-related headers
    const headers = { ...clientReq.headers };
    delete headers['proxy-connection'];
    delete headers['proxy-authorization'];
    headers.host = url.host;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: clientReq.method,
      headers,
      rejectUnauthorized: false,
    };

    const proxyReq = client.request(options, (proxyRes) => {
      if (onResponse) {
        let responseBody = '';
        proxyRes.on('data', (chunk) => {
          responseBody += chunk;
          clientRes.write(chunk);
        });
        proxyRes.on('end', () => {
          onResponse(proxyRes, responseBody);
          clientRes.end();
        });
        clientRes.writeHead(proxyRes.statusCode!, proxyRes.headers);
      } else {
        clientRes.writeHead(proxyRes.statusCode!, proxyRes.headers);
        proxyRes.pipe(clientRes);
      }
    });

    proxyReq.on('error', (err) => {
      this.log(
        'error',
        `Proxy request failed for ${targetUrl}: ${err.message}`,
      );
      clientRes.writeHead(502, { 'Content-Type': 'text/plain' });
      clientRes.end('Bad Gateway');
    });

    clientReq.pipe(proxyReq);
  }

  private parseConnectTarget(url: string): { hostname: string; port: string } {
    const [hostname, port = '443'] = url.split(':');
    return { hostname, port };
  }

  private parseTargetUrl(req: http.IncomingMessage): string | null {
    if (req.url?.startsWith('http')) {
      return req.url;
    }

    const host = req.headers.host;
    if (!host || !req.url) {
      return null;
    }

    return `http://${host}${req.url}`;
  }

  private getRecordKey(method: string, url: string): string {
    try {
      const urlObj = new URL(url);
      // Include query parameters in the key for better matching
      const normalizedUrl = `${urlObj.origin}${urlObj.pathname}${urlObj.search}`;
      return `${method}:${normalizedUrl}`;
    } catch (err) {
      // Fallback for invalid URLs
      return `${method}:${url}`;
    }
  }

  private findRecording(
    method: string,
    url: string,
  ): RequestRecord | undefined {
    const key = this.getRecordKey(method, url);
    let record = this.records.get(key);

    // Log all token-search requests for debugging
    if (url.includes('token-search.rainbow.me')) {
      this.log('info', `🔍 Token search request: ${method} ${url}`);
      this.log('info', `🔑 Looking for key: ${key}`);

      // Log all available token-search keys
      const tokenSearchKeys = Array.from(this.records.keys()).filter((k) =>
        k.includes('token-search'),
      );
      if (tokenSearchKeys.length > 0) {
        this.log('info', `📚 Available token-search keys:`);
        tokenSearchKeys.forEach((k) => this.log('info', `  - ${k}`));
      }
    }

    // If no exact match and it's a Rainbow API, try fuzzy matching
    if (!record && url.includes('.rainbow.me')) {
      this.log('debug', `No exact match for ${url}, trying fuzzy match...`);

      // Special handling for token-search endpoint
      if (url.includes('token-search.rainbow.me')) {
        // Parse the URL to check the query parameters
        try {
          const requestUrl = new URL(url);
          const list = requestUrl.searchParams.get('list');
          const query = requestUrl.searchParams.get('query');
          const chainId = requestUrl.pathname.match(/\/v3\/tokens\/(\d+)/)?.[1];

          this.log(
            'info',
            `🔎 Token search params: list=${list}, query="${query}", chainId=${chainId}`,
          );

          // Try to find a matching mock based on list and query
          for (const [, recordValue] of Array.from(this.records.entries())) {
            if (recordValue.request.url.includes('token-search.rainbow.me')) {
              const mockUrl = new URL(recordValue.request.url);
              const mockList = mockUrl.searchParams.get('list');
              const mockQuery = mockUrl.searchParams.get('query');
              const mockChainId =
                mockUrl.pathname.match(/\/v3\/tokens\/(\d+)/)?.[1];

              // Match if list and chainId are the same, and either:
              // 1. Both queries are empty/null
              // 2. Queries match exactly
              // 3. Query contains USDC address (case-insensitive)
              // 4. Query is "usdc" text search
              const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
              const queryMatch =
                ((!query || query === '') &&
                  (!mockQuery || mockQuery === '')) ||
                query === mockQuery ||
                query?.toLowerCase() === usdcAddress.toLowerCase() ||
                (mockQuery?.toLowerCase() === usdcAddress.toLowerCase() &&
                  query?.toLowerCase().includes(usdcAddress.toLowerCase())) ||
                (query?.toLowerCase() === 'usdc' &&
                  mockQuery?.toLowerCase() === 'usdc');

              // For verifiedAssets with empty query, ignore fromChainId differences
              const isVerifiedAssetsEmptyQuery =
                list === 'verifiedAssets' && (!query || query === '');

              if (mockList === list && mockChainId === chainId && queryMatch) {
                this.log(
                  'warn',
                  `✅ Using fuzzy match for token-search: ${recordValue.request.url}`,
                );
                if (isVerifiedAssetsEmptyQuery) {
                  this.log(
                    'info',
                    `📋 Ignoring fromChainId for verifiedAssets empty query`,
                  );
                }
                if (query?.toLowerCase().includes(usdcAddress.toLowerCase())) {
                  this.log('info', `💰 USDC query matched!`);
                }
                record = recordValue;
                break;
              }
            }
          }
        } catch (err) {
          this.log('error', `Failed to parse token-search URL: ${err}`);
        }
      }

      // Special handling for assets endpoint - match by address
      else if (url.includes('/assets/')) {
        const urlParts = url.split('/');
        const addressMatch = urlParts.find((part) => part.startsWith('0x'));

        if (addressMatch) {
          // Try to find a record with the same address
          for (const recordValue of Array.from(this.records.values())) {
            if (
              recordValue.request.method === method &&
              recordValue.request.url.includes('/assets/') &&
              recordValue.request.url.includes(addressMatch)
            ) {
              this.log(
                'warn',
                `Using address-based match: ${recordValue.request.url} for ${url}`,
              );
              record = recordValue;
              break;
            }
          }
        }
      }

      // If still no match, try general fuzzy matching
      if (!record) {
        for (const recordValue of Array.from(this.records.values())) {
          if (recordValue.request.method === method) {
            const recordUrl = recordValue.request.url;

            // Check if it's the same endpoint with different chain IDs
            if (this.isSimilarRainbowUrl(url, recordUrl)) {
              this.log('warn', `Using fuzzy match: ${recordUrl} for ${url}`);
              record = recordValue;
              break;
            }
          }
        }
      }
    }

    return record;
  }

  private isSimilarRainbowUrl(url1: string, url2: string): boolean {
    try {
      const u1 = new URL(url1);
      const u2 = new URL(url2);

      // Must be same host
      if (u1.host !== u2.host) return false;

      // For addys.p.rainbow.me/v3/[chains]/[address?]/assets URLs
      if (u1.host === 'addys.p.rainbow.me' && u1.pathname.includes('/v3/')) {
        const path1Parts = u1.pathname.split('/').filter((p) => p);
        const path2Parts = u2.pathname.split('/').filter((p) => p);

        // Check if structure is similar (v3/chains/assets or v3/chains/address/assets)
        if (path1Parts[0] === 'v3' && path2Parts[0] === 'v3') {
          // Both have assets endpoint
          const hasAssets1 = path1Parts[path1Parts.length - 1] === 'assets';
          const hasAssets2 = path2Parts[path2Parts.length - 1] === 'assets';

          if (hasAssets1 && hasAssets2) {
            // Check if query params match
            return u1.search === u2.search;
          }
        }
      }

      // For other endpoints, require exact pathname match
      return u1.pathname === u2.pathname && u1.search === u2.search;
    } catch {
      return false;
    }
  }

  private sanitizeHeaders(
    headers: http.IncomingHttpHeaders,
  ): Record<string, string | string[]> {
    const sanitized: Record<string, string | string[]> = {};

    // Copy only defined values
    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined) {
        sanitized[key] = value;
      }
    }

    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
    ];

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private async readBody(stream: http.IncomingMessage): Promise<string> {
    return new Promise((resolve) => {
      let body = '';
      stream.on('data', (chunk) => {
        body += chunk.toString();
      });
      stream.on('end', () => {
        resolve(body);
      });
    });
  }

  private async loadRecordings(): Promise<void> {
    try {
      // Load main recordings file
      if (fs.existsSync(this.fixturesPath)) {
        const data = fs.readFileSync(this.fixturesPath, 'utf-8');
        const recordings = JSON.parse(data) as RequestRecord[];

        for (const record of recordings) {
          const key = this.getRecordKey(
            record.request.method,
            record.request.url,
          );
          this.records.set(key, record);
        }
        this.log(
          'info',
          `📼 Loaded ${recordings.length} recordings from main file`,
        );
      } else {
        this.log('warn', `No recordings found at ${this.fixturesPath}`);
      }

      // Load additional mock files from the same directory
      const fixtureDir = path.dirname(this.fixturesPath);
      const additionalMocks = [
        'test-wallet-assets.json',
        'minimal-assets-mock.json',
        'usdc-token-search.json',
        'usdc-high-liquidity.json',
        'mainnet-verified-assets.json',
        'popular-assets.json',
        'usdc-search-verified.json',
        'usdc-search-high-liquidity.json',
        'usdc-verified-assets.json',
        'swap-quote.json',
        'swap-slippage.json',
      ];

      for (const mockFile of additionalMocks) {
        const mockPath = path.join(fixtureDir, mockFile);
        if (fs.existsSync(mockPath)) {
          try {
            const mockData = fs.readFileSync(mockPath, 'utf-8');
            const mockRecord = JSON.parse(mockData) as RequestRecord;

            // Add multiple keys for fuzzy matching
            const key = this.getRecordKey(
              mockRecord.request.method,
              mockRecord.request.url,
            );
            this.records.set(key, mockRecord);

            // Also add a key without the exact address for fuzzy matching
            if (mockRecord.request.url.includes('/assets/')) {
              const urlParts = mockRecord.request.url.split('/');
              const addressIndex = urlParts.findIndex((part) =>
                part.startsWith('0x'),
              );
              if (addressIndex > 0) {
                // Create a fuzzy key that matches any address
                const fuzzyUrl = [...urlParts];
                fuzzyUrl[addressIndex] = '*';
                const fuzzyKey = this.getRecordKey(
                  mockRecord.request.method,
                  fuzzyUrl.join('/'),
                );
                this.records.set(fuzzyKey, mockRecord);
              }
            }

            this.log('info', `📼 Loaded mock from ${mockFile}`);
          } catch (err) {
            this.log('error', `Failed to load mock ${mockFile}: ${err}`);
          }
        }
      }

      this.log(
        'info',
        `✅ Loaded ${this.records.size} recordings from ${this.fixturesPath}`,
      );
    } catch (error) {
      this.log('error', `Failed to load recordings: ${error}`);
    }
  }

  private async saveRecordings(): Promise<void> {
    if (this.records.size === 0) {
      this.log('debug', 'No recordings to save');
      return;
    }

    try {
      const dir = path.dirname(this.fixturesPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const recordings = Array.from(this.records.values());
      fs.writeFileSync(this.fixturesPath, JSON.stringify(recordings, null, 2));

      this.log(
        'info',
        `✅ Saved ${recordings.length} recordings to ${this.fixturesPath}`,
      );
    } catch (error) {
      this.log('error', `Failed to save recordings: ${error}`);
    }
  }

  getCACertPath(): string {
    return path.join(this.config.fixturesDir, 'certs', 'ca.crt');
  }

  getStatistics() {
    return {
      mode: this.config.mode,
      recorded: this.records.size,
      unmocked: this.unmockedRequests.size,
      unmockedList: Array.from(this.unmockedRequests),
      caCertPath: this.getCACertPath(),
      activeConnections: this.activeConnections.size,
    };
  }
}
