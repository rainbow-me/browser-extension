/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const fs = require('fs-extra');

/**
 * Fetches data from the GraphQL API and saves it to a JSON file.
 */
async function fetchData() {
  const graphqlQuery = `
  query getNetworks($device: Device!, $includeTestnets: Boolean!) {
    networks(device: $device, includeTestnets: $includeTestnets) {
      id
      name
      label
      icons {
        badgeURL
      }
      testnet
      opStack
      defaultExplorer {
        url
        label
        transactionURL
        tokenURL
      }
      defaultRPC {
        enabledDevices
        url
      }
      nativeAsset {
        address
        name
        symbol
        decimals
        iconURL
        colors {
          primary
          fallback
          shadow
        }
      }
      nativeWrappedAsset {
          address
          name
          symbol
          decimals
          iconURL
          colors {
          primary
          fallback
          shadow
        }
      }
      enabledServices {
        gas {
          enabled
        }
        trade {
          swapping
        }
        wallet {
          approvals
          transactions
          balance
          summary
        }
        token {
          tokenSearch
          nftProxy
        }
      }
    }
  }
  `;

  const response = await fetch('https://metadata.p.rainbow.me/v1/graph', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: graphqlQuery,
      variables: { device: 'BX', includeTestnets: true },
    }),
  });

  const { data } = await response.json();
  const filePath = path.join(__dirname, '../static/data/chains.json');

  await fs.ensureFile(filePath);
  await fs.writeJson(filePath, data);
}

async function main() {
  try {
    console.log('Fetching chains ...');
    await fetchData();
    console.log('Chains data fetched and available.');
    process.exit(0);
  } catch (error) {
    console.error('Error fetching chains data:', error);
    process.exit(1);
  }
}

main();
