/* eslint-disable @typescript-eslint/no-var-requires */

// This script fetches fresh swap quote responses from the Rainbow API and
// updates the Anvil fork block number in vitest.anvil.ts to match the
// capture point.  RFQ/PMM protocols are excluded from quote requests so
// that signed orders (which embed chain-specific EIP-712 signatures)
// don't fail verification on the fork (chain ID 1337 vs mainnet 1).
//
// Usage: npx ts-node e2e/fetchResponses.ts
//
// Prerequisites:
// - ALCHEMY_DEV_KEY must be set in .env
// - No need to run Anvil locally (connects to live mainnet)

require('dotenv').config();
const { readFile, writeFile, readdir, unlink } = require('fs/promises');

const { createClient, http, sha256 } = require('viem');
const { getBlock, getBlockNumber } = require('viem/actions');
const { mainnet } = require('viem/chains');

const urls = require('./mocks/mock_swap_quotes_urls.json');
const FETCH_TIMEOUT = 30000; // 30 seconds for quote requests
const MOCKS_DIR = 'e2e/mocks/swap_quotes';

// Must match the normalization in e2e/mockFetch.ts so that files are stored
// under the same hash that the mock interceptor will look up at runtime.
const LARGE_SWAP_SELL_AMOUNT = '10000000000000000000000';
const FALLBACK_SWAP_SELL_AMOUNT = '1000000000000000000';

function normalizeSwapUrlForMock(rawUrl: string): string {
  const url = new URL(rawUrl);
  const sellAmount = url.searchParams.get('sellAmount');
  if (sellAmount !== LARGE_SWAP_SELL_AMOUNT) return rawUrl;
  url.searchParams.set('sellAmount', FALLBACK_SWAP_SELL_AMOUNT);
  return url.href;
}

const fetchWithTimeout = (
  url: RequestInfo | URL,
  timeout: number,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Fetch timed out'));
    }, timeout);

    fetch(url)
      .then((response) => {
        clearTimeout(timer);
        if (!response.ok) {
          reject(new Error(`Failed to fetch: ${response.statusText}`));
        }
        return response.text();
      })
      .then(resolve)
      .catch(reject);
  });
};

async function updateAnvilConfig(blockNumber: bigint) {
  const anvilConfigPath = 'e2e/vitest.anvil.ts';
  let content = await readFile(anvilConfigPath, 'utf-8');

  content = content.replace(
    /forkBlockNumber:\s*\d+/,
    `forkBlockNumber: ${blockNumber.toString()}`,
  );

  await writeFile(anvilConfigPath, content);
  console.log(`✅ Updated ${anvilConfigPath}:`);
  console.log(`   forkBlockNumber: ${blockNumber}`);
}

async function removeUnusedMocks(expectedHashes: Set<string>) {
  /** @type {string[]} */
  const files = await readdir(MOCKS_DIR);
  const staleFiles = files.filter(
    (file: string) => file.endsWith('.json') && !expectedHashes.has(file),
  );

  await Promise.all(
    staleFiles.map(async (file: string) => {
      await unlink(`${MOCKS_DIR}/${file}`);
    }),
  );

  if (staleFiles.length > 0) {
    console.log(`🧹 Removed ${staleFiles.length} stale mock files`);
  }
}

(async () => {
  // Connect to live mainnet to get current block
  const alchemyKey = process.env.ALCHEMY_DEV_KEY;
  if (!alchemyKey) {
    console.error('❌ ALCHEMY_DEV_KEY not set in .env');
    process.exit(1);
  }

  const rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`;
  const client = createClient({
    chain: mainnet,
    transport: http(rpcUrl),
  });

  // Capture the current block BEFORE fetching quotes so that the fork state
  // is guaranteed to be from a point before any quote was generated.
  const initialBlock = await getBlock(client);
  const forkBlockNumber = initialBlock.number;

  console.log('📦 Fork block:', forkBlockNumber.toString());
  console.log(
    `⏰ Block timestamp: ${new Date(
      Number(initialBlock.timestamp) * 1000,
    ).toISOString()}`,
  );

  console.log(`🔄 Fetching ${urls.length} swap quotes...`);

  let successCount = 0;
  let errorCount = 0;

  const expectedHashes = new Set<string>(
    urls.map((url: string) => `${sha256(normalizeSwapUrlForMock(url))}.json`),
  );

  const fetchAndWritePromises = urls.map(async (url: string) => {
    // Hash the normalized URL so the file is stored under the same key
    // that mockFetch.ts will use for lookup at runtime.
    const hash = sha256(normalizeSwapUrlForMock(url));
    try {
      // For /v1/quote URLs, disable RFQ and PMM (Private Market Maker)
      // protocols.  Both embed chain-specific EIP-712 signed orders that
      // fail verification on our fork (chain ID 1337 vs mainnet 1).
      // The response is stored under the ORIGINAL URL's hash so that
      // mockFetch.ts can look it up at runtime using the extension's URL.
      let fetchUrl = url;
      if (new URL(url).pathname.includes('/v1/quote')) {
        const u = new URL(url);
        u.searchParams.set('disableRFQs', 'true');
        u.searchParams.set('disablePMMProtocols', 'true');
        fetchUrl = u.href;
      }

      const res = await fetchWithTimeout(fetchUrl, FETCH_TIMEOUT);
      await writeFile(`${MOCKS_DIR}/${hash}.json`, res);
      successCount += 1;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(`Error fetching ${url}:`, error.message);
      const errorMessage = JSON.stringify({
        error: true,
        message: error.message,
      });
      await writeFile(`${MOCKS_DIR}/${hash}.json`, errorMessage);
      errorCount += 1;
    }
  });

  await Promise.all(fetchAndWritePromises);
  await removeUnusedMocks(expectedHashes);

  const blockNumberFinal = await getBlockNumber(client);

  console.log(`\n📊 Results: ${successCount} success, ${errorCount} errors`);

  if (forkBlockNumber === blockNumberFinal) {
    console.log('✅ All requests completed within a single block');
  } else {
    console.log(
      `⚠️  Requests spanned ${blockNumberFinal - forkBlockNumber} blocks`,
    );
  }

  // Update the Anvil fork config with the block captured BEFORE fetching quotes.
  // The chain clock is frozen at the fork block's timestamp by the global setup
  // (anvil_setBlockTimestampInterval(0)) so RFQ quote expiry is never reached.
  await updateAnvilConfig(forkBlockNumber);

  console.log('\n🎉 Done! The Anvil fork block has been updated.');
  console.log('   Swap execution tests should now work with the fresh mocks.');
})();
