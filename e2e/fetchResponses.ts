import { writeFile } from 'fs/promises';

import { Hex, sha256 } from 'viem';

import { urls } from './urls.json';

await Promise.all(
  urls.map(async (url) => {
    const res = await fetch(url).then((r) => r.text());
    const hash = sha256(url as Hex);
    writeFile(`./responses/${hash}.json`, res);
  }),
);
