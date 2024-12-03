/* eslint-disable @typescript-eslint/no-var-requires */

// this file is ran locally with ts-node to fetch the responses from the swap quotes urls
require('dotenv').config();
const { writeFile } = require('fs/promises');

const { createClient, http, sha256 } = require('viem');
const { getBlockNumber } = require('viem/actions');

const urls = require('./mocks/mock_swap_quotes_urls.json');

(async () => {
  const client = createClient({ transport: http(process.env.ETH_MAINNET_RPC) });
  const blockNumber = await getBlockNumber(client);

  // check initial blockNumber
  console.log('OUTSIDE FUNCTION', blockNumber.toString());

  await Promise.all(
    urls.map(async (url: RequestInfo | URL) => {
      const res = await fetch(url).then((r) => r.text());
      const hash = sha256(url);

      // check if blockNumber is the same the entire time
      console.log('INSIDE FUNCTION', blockNumber.toString());
      await writeFile(`e2e/mocks/swap_quotes/${hash}.json`, res);
    }),
  );
})();
