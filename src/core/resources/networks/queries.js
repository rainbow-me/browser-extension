const BACKEND_NETWORKS_QUERY = `
  query getNetworks($device: Device!, $includeTestnets: Boolean!) {
    networks(device: $device, includeTestnets: $includeTestnets) {
      id
      mainnetId
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
      favorites {
        address
      }
    }
  }
`;

const CUSTOM_NETWORKS_QUERY = `
  query getCustomNetworks($includeTestnets: Boolean) {
    customNetworks(includeTestnets: $includeTestnets) {
      id
      name
      iconURL
      nativeAsset {
        address
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

module.exports = {
  BACKEND_NETWORKS_QUERY,
  CUSTOM_NETWORKS_QUERY,
};
