const path = require('path');
const fs = require('fs-extra');

/* GraphQL query to fetch mainnet networks data */
const networksQuery = `
  query getNetworks($device: Device!, $includeTestnets: Boolean!) {
    networks(device: $device, includeTestnets: $includeTestnets) {
      id
      name
      label
      icons {
        badgeURL
      }
      testnet
      internal
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
      gasUnits {
        basic {
          approval
          swap
          swapPermit
          eoaTransfer
          tokenTransfer
        }
        wrapped {
          wrap
          unwrap
        }
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
        meteorology {
          enabled
        }
        swap {
          enabled
        }
        addys {
          approvals
          transactions
          assets
          positions
        }
        tokenSearch {
          enabled
        }
        nftProxy {
          enabled
        }
      }
    }
  }
`;

/* GraphQL query to fetch custom networks data */
const customNetworksQuery = `
  query GetCustomNetworks($includeTestnets: Boolean) {
    customNetworks(includeTestnets: $includeTestnets) {
      id
      name
      iconURL
      nativeAsset {
        symbol
        decimals
        iconURL
      }
      defaultRPCURL
      defaultExplorerURL
      testnet {
        FaucetURL
        isTestnet
        mainnetChainID
      }
    }
  }
`;

/**
 * Fetches data from the GraphQL API
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

/**
 * Persists the network data to a JSON file.
 */
async function persistData(fileName, data) {
  const filePath = path.join(__dirname, `../static/data/${fileName}.json`);

  await fs.ensureFile(filePath);
  await fs.writeJson(filePath, data);
}

async function main() {
  try {
    console.log('Fetching networks ...');
    const { networks } = await fetchData(networksQuery);

    console.log('Fetching custom networks ...');
    const { customNetworks } = await fetchData(customNetworksQuery);

    console.log('Persisting networks data ...');
    await persistData('networks', { networks, customNetworks });
    
    console.log('Networks data fetched and persisted.');
    process.exit(0);
  } catch (error) {
    console.error('Error fetching networks data:', error);
    process.exit(1);
  }
}

main();
