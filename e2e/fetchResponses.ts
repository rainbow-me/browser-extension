import { writeFile } from 'fs/promises';

import { Hex, createClient, http, sha256 } from 'viem';
import { getBlockNumber } from 'viem/actions';

import urls from './mocks/mock_swap_quotes_urls.json';

const client = createClient({ transport: http(process.env.ETH_MAINNET_RPC) });
const blockNumber = await getBlockNumber(client);
console.log(blockNumber);

await Promise.all(
  urls.map(async (url) => {
    const res = await fetch(url).then((r) => r.text());
    const hash = sha256(url as Hex);
    writeFile(`./mocks/swap_quotes/${hash}.json`, res);
  }),
);
