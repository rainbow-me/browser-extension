import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  HttpResponse,
  JsonBodyType,
  getResponse,
  http,
  passthrough,
} from 'msw';
import * as Hash from 'ox/Hash';
import { AddInterceptParameters } from 'selenium-webdriver/bidi/addInterceptParameters';
// @ts-expect-error - BiDi modules not in TS definitions
import { ContinueRequestParameters } from 'selenium-webdriver/bidi/continueRequestParameters';
// @ts-expect-error - BiDi modules not in TS definitions
import { InterceptPhase } from 'selenium-webdriver/bidi/interceptPhase';
// @ts-expect-error - BiDi modules not in TS definitions
import { Network } from 'selenium-webdriver/bidi/network';
// @ts-expect-error - BiDi modules not in TS definitions
import { BytesValue } from 'selenium-webdriver/bidi/networkTypes';
// @ts-expect-error - BiDi modules not in TS definitions
import { ProvideResponseParameters } from 'selenium-webdriver/bidi/provideResponseParameters';
import { UrlPattern } from 'selenium-webdriver/bidi/urlPattern';

import type { BeforeRequestSentEvent, Header } from './bidi';
import { ENDPOINTS } from './endpoints';

const SNAPSHOT_ROOT = path.resolve('e2e/mocks');

type Mode = 'replay' | 'record';
const MODE = (process.env.MOCK_MODE as Mode) || 'replay';

// Track URLs that have been recorded during this session to avoid duplicates
const recordedUrls = new Set<string>();

// Helper: Normalize URL for consistent handling
// Addys API has inconsistent trailing slashes, so we need to normalize them
function normalizeUrl(urlString: string): string {
  // Remove trailing slash before query string
  // Convert /path/? to /path? and /path/ to /path
  return urlString.replace(/\/+(\?|$)/, '$1');
}

// Helper: Get snapshot file path for a URL (without extension)
export function getSnapshotPath(url: URL): string | undefined {
  const host = url.host.toLowerCase();
  const pathname = url.pathname.toLowerCase();

  for (const service of Object.values(ENDPOINTS)) {
    if (host === service.host) {
      for (const { pattern, dir } of service.paths) {
        if (pattern.test(pathname)) {
          // Normalize the URL before hashing to ensure consistent file names
          const normalizedUrlString = normalizeUrl(url.toString());
          const hex = ('0x' +
            Buffer.from(normalizedUrlString, 'utf8').toString(
              'hex',
            )) as `0x${string}`;
          const hash = Hash.sha256(hex).slice(2);
          return path.join(SNAPSHOT_ROOT, dir, hash); // Return without extension
        }
      }
    }
  }
  return undefined;
}

// Helper: Fetch and persist response data for record mode
export async function fetchAndPersist(
  request: BeforeRequestSentEvent['request'],
): Promise<void> {
  const url = new URL(request.url);
  const basePath = getSnapshotPath(url);
  if (!basePath) return;

  // Normalize URL to handle trailing slashes consistently
  const normalizedUrl = normalizeUrl(request.url);

  // Check if this URL has already been recorded in this session
  if (recordedUrls.has(normalizedUrl)) {
    console.log(`[E2E Mock] Skipping duplicate recording for: ${request.url}`);
    return;
  }

  try {
    // Only attempt for GET requests
    const method = request.method || 'GET';
    if (method.toUpperCase() !== 'GET') {
      console.warn(
        `[E2E Mock] Skipping non-GET request: ${method} ${request.url}`,
      );
      return;
    }

    // Build headers, preserving all original headers
    const fetchHeaders: Record<string, string> = {};

    // Pass through all headers from the original request
    if (request.headers) {
      for (const header of request.headers) {
        if (header.name && header.value?.value) {
          fetchHeaders[header.name] = String(header.value.value);
        }
      }
    }

    // Set defaults for headers that weren't in the original request
    if (!fetchHeaders['accept']) {
      fetchHeaders['accept'] = 'application/json';
    }
    if (!fetchHeaders['accept-encoding']) {
      fetchHeaders['accept-encoding'] = 'identity'; // Request uncompressed
    }

    // Add custom headers based on endpoint configuration
    // BiDi may not capture certain headers from the browser
    for (const service of Object.values(ENDPOINTS)) {
      if (url.host === service.host && service.headers) {
        for (const [headerName, headerValue] of Object.entries(
          service.headers,
        )) {
          // Skip undefined values
          if (headerValue === undefined) continue;

          // Check if header is already present (case-insensitive)
          const headerLower = headerName.toLowerCase();
          const existingHeader = Object.keys(fetchHeaders).find(
            (key) => key.toLowerCase() === headerLower,
          );

          if (!existingHeader) {
            fetchHeaders[headerName] = headerValue;
            console.log(
              `[E2E Mock] Added ${headerName} header for ${url.host}`,
            );
          }
        }
        break; // Found matching service, no need to continue
      }
    }

    const response = await fetch(request.url, {
      method: 'GET',
      headers: fetchHeaders,
    });

    if (!response.ok) {
      console.warn(
        `[E2E Mock] Fetch failed (${response.status}) for: ${request.url}`,
      );
      return;
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = /application\/(json|.*\+json)/i.test(contentType);
    const filePath = isJson ? `${basePath}.json` : basePath;

    await fs.mkdir(path.dirname(filePath), { recursive: true });

    if (isJson) {
      try {
        const json = await response.json();
        await fs.writeFile(
          filePath,
          JSON.stringify(json, null, 2) + '\n',
          'utf8',
        );
        console.log(
          `[E2E Mock] Recorded JSON: ${request.url} -> ${path.relative(
            process.cwd(),
            filePath,
          )}`,
        );
        // Mark URL as recorded after successful write
        recordedUrls.add(normalizedUrl);
      } catch (error) {
        console.warn(
          `[E2E Mock] Failed to parse JSON for: ${request.url}`,
          error,
        );
        // Save raw text if JSON parsing fails
        const text = await response.text();
        await fs.writeFile(filePath, text, 'utf8');
        // Still mark as recorded even if JSON parsing failed
        recordedUrls.add(request.url);
      }
    } else {
      const data = await response.arrayBuffer();
      // Write binary data - Uint8Array is the correct type for fs.promises.writeFile
      await fs.writeFile(filePath, new Uint8Array(data));
      console.log(
        `[E2E Mock] Recorded non-JSON: ${request.url} -> ${path.relative(
          process.cwd(),
          filePath,
        )}`,
      );
      // Mark URL as recorded after successful write
      recordedUrls.add(request.url);
    }
  } catch (error) {
    console.warn(
      `[E2E Mock] Failed to fetch and persist ${request.url}:`,
      error,
    );
  }
}

// MSW handlers that serve from disk if a snapshot exists
const handlers = [
  http.all('**', async ({ request }) => {
    try {
      const url = new URL(request.url);
      const basePath = getSnapshotPath(url);
      if (!basePath) return passthrough();

      // Try .json file first
      const jsonFile = `${basePath}.json`;
      const jsonData = await fs.readFile(jsonFile, 'utf8').catch(() => null);
      if (jsonData) {
        try {
          const json = JSON.parse(jsonData);
          return HttpResponse.json(json as JsonBodyType, { status: 200 });
        } catch {
          // JSON parse failed, continue to try raw file
        }
      }

      // Try file without extension (for non-JSON responses)
      const rawData = await fs.readFile(basePath, null).catch(() => null);
      if (rawData) {
        // Return as-is for non-JSON content
        return new HttpResponse(rawData, { status: 200 });
      }

      return passthrough();
    } catch (error) {
      // On any error, passthrough to real network
      console.warn('[E2E Mock] MSW handler error:', error);
      return passthrough();
    }
  }),
];

// Install Selenium BiDi network interception for mocking
export async function interceptMocks(
  driver: unknown,
  browsingContextId?: string,
) {
  try {
    const network = await Network(
      driver,
      browsingContextId ? [browsingContextId] : undefined,
    );

    if (MODE === 'record') {
      await network.setCacheBehavior('bypass');
      console.log('[E2E Mock] Response data collector enabled');
    }

    // Set up interception for configured endpoints
    const interceptParams = new AddInterceptParameters(
      InterceptPhase.BEFORE_REQUEST_SENT,
    );
    for (const service of Object.values(ENDPOINTS)) {
      interceptParams.urlPattern(
        new UrlPattern().protocol('https').hostname(service.host),
      );
    }
    await network.addIntercept(interceptParams);

    // Handle request interception with single error boundary
    await network.beforeRequestSent(async (evt: BeforeRequestSentEvent) => {
      try {
        const req = evt.request;
        const url = new URL(req.url);
        const file = getSnapshotPath(url);

        // If not a mocked endpoint, continue
        if (!file) {
          await network.continueRequest(
            new ContinueRequestParameters(req.request),
          );
          return;
        }

        // In record mode, fetch and persist, then continue
        if (MODE === 'record') {
          // Await fetch and persist to ensure atomic operation and prevent race conditions
          try {
            await fetchAndPersist(req);
          } catch (error) {
            console.warn('[E2E Mock] fetchAndPersist error:', error);
          }
          await network.continueRequest(
            new ContinueRequestParameters(req.request),
          );
          return;
        }

        // In replay mode, try to serve from disk via MSW
        const mswReq = new Request(url.toString(), { method: req.method });
        const mswRes = await getResponse(handlers, mswReq);

        if (mswRes) {
          // Provide mocked response
          console.log(`[E2E Mock] Serving mock for: ${url.toString()}`);
          const params = new ProvideResponseParameters(req.request);
          params.statusCode(mswRes.status);

          // Convert MSW Response headers to BiDi format
          // MSW uses Headers object (like standard Fetch API)
          // BiDi expects an array of {name, value} objects with specific structure
          const headers: Header[] = [];
          mswRes.headers.forEach((v, k) => {
            headers.push({
              name: k,
              value: { type: 'string', value: String(v) },
            });
          });

          // BiDi protocol requires binary data to be base64 encoded for transport
          // The response body could contain non-UTF8 bytes (images, compressed data, etc.)
          // Base64 ensures safe transmission over the text-based BiDi protocol
          const ab = await mswRes.arrayBuffer();
          const bodyBytes: BytesValue = {
            type: 'base64',
            value: Buffer.from(ab).toString('base64'),
          };
          params.body(bodyBytes);
          await network.provideResponse(params);
        } else {
          // No mock, continue request
          console.warn(
            `[E2E Mock] Missing snapshot: ${url.toString()} -> ${file}.json or ${file}`,
          );
          await network.continueRequest(
            new ContinueRequestParameters(req.request),
          );
        }
      } catch (error) {
        // Any error: fallback to network
        const requestUrl = evt?.request?.url || 'unknown URL';
        console.warn(
          `[E2E Mock] Error in request handler for ${requestUrl}, falling back to network:`,
          error,
        );
        // Safely get request ID, fallback to evt if nested structure doesn't exist
        const requestId = evt?.request?.request || evt?.request || '';
        if (requestId) {
          await network.continueRequest(
            new ContinueRequestParameters(requestId),
          );
        } else {
          console.warn(
            `[E2E Mock] Could not extract request ID from event for ${requestUrl}, unable to continue request`,
          );
        }
      }
    });

    return network;
  } catch (error) {
    console.error('[E2E Mock] Failed to initialize mock interception:', error);
  }
}
