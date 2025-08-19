/* eslint-disable @typescript-eslint/no-var-requires */

// this file is ran locally with ts-node to fetch the responses from the addys assets urls
require('dotenv').config();
const { writeFile } = require('fs/promises');

const { sha256 } = require('viem');

const urls = require('./urls.json');
const FETCH_TIMEOUT = 5000; // 5 seconds

const fetchWithTimeout = (url, timeout) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Fetch timed out'));
    }, timeout);

    fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.ADDYS_API_KEY}`,
      },
    })
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
  const fetchAndWritePromises = urls.map(async (url) => {
    const hash = sha256(url);

    try {
      const res = await fetchWithTimeout(url, FETCH_TIMEOUT);
      await writeFile(`e2e/mocks/addys/assets/${hash}.json`, res);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
      console.error(`❌ Error fetching ${url}:`, error.message);
      const errorMessage = JSON.stringify({
        error: true,
        message: error.message,
      });
      await writeFile(`e2e/mocks/addys/assets/${hash}.json`, errorMessage);
    }
  });

  await Promise.all(fetchAndWritePromises);
})();
