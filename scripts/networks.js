/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { BACKEND_NETWORKS_QUERY, CUSTOM_NETWORKS_QUERY } = require('../src/core/resources/backendNetworks/sharedQueries');

const fs = require('fs-extra');

/**
 * Fetches data from the GraphQL API and saves it to a JSON file.
 */
async function fetchData(query) {
  const response = await fetch('https://metadata.p.rainbow.me/v1/graph', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { device: 'BX', includeTestnets: true },
    }),
  });

  const { data } = await response.json();
  return data;
}

async function persistData(fileName, data) {
  const filePath = path.join(__dirname, `../static/data/${fileName}.json`);

  await fs.ensureFile(filePath);
  await fs.writeJson(filePath, data);
}

async function main() {
  try {
    console.log('Fetching networks ...');
    const [backendNetworks, customNetworks] = await Promise.all([
      fetchData(BACKEND_NETWORKS_QUERY),
      fetchData(CUSTOM_NETWORKS_QUERY),
    ]);
    console.log('Persisting networks ...');
    await persistData('networks', { backendNetworks, customNetworks });
    console.log('Networks data fetched and available.');
    process.exit(0);
  } catch (error) {
    console.error('Error fetching networks data:', error);
    process.exit(1);
  }
}

main();
