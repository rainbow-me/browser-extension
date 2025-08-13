/* eslint-disable @typescript-eslint/no-var-requires */

// this file is ran locally with ts-node to fetch the responses from the swap quotes urls
require('dotenv').config();
const { writeFile } = require('fs/promises');

const { createClient, http, sha256 } = require('viem');
const { getBlockNumber } = require('viem/actions');

const urls = require('./swap_quotes_urls.json');
const FETCH_TIMEOUT = 5000; // 5 seconds

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

(async () => {
  const client = createClient({ transport: http('http://127.0.0.1:8545') });
  const blockNumberInitial = await getBlockNumber(client);

  console.log('INITIAL BLOCK NUMBER', blockNumberInitial.toString());

  const fetchAndWritePromises = urls.map(async (url: RequestInfo | URL) => {
    const hash = sha256(url);
    try {
      const res = await fetchWithTimeout(url, FETCH_TIMEOUT);
      await writeFile(`e2e/mocks/swap/quotes/${hash}.json`, res);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(`Error fetching ${url}:`, error.message);
      const errorMessage = JSON.stringify({
        error: true,
        message: error.message,
      });
      await writeFile(`e2e/mocks/swap/quotes/${hash}.json`, errorMessage);
    }
  });

  await Promise.all(fetchAndWritePromises);

  const blockNumberFinal = await getBlockNumber(client);

  console.log('FINAL BLOCK NUMBER', blockNumberFinal.toString());

  if (blockNumberInitial === blockNumberFinal)
    console.log('✅✅✅ REQUESTS SPAN SINGLE BLOCK');
  else console.log('❌❌❌ REQUESTS SPAN MULTIPLE BLOCKS');
})();
