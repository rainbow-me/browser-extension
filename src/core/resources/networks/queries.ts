export const BACKEND_NETWORKS_QUERY = `
  query getNetworks($device: Device!, $includeTestnets: Boolean!) {
    networks(device: $device, includeTestnets: $includeTestnets) {
      id
      mainnetId
      name
      label
      colors {
        light
        dark
      }
      icons {
        uncropped {
          largeURL
          smallURL
        }
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
        notifications {
          enabled
        }
        swap {
          enabled
          swap
          swapExactOutput
          bridge
          bridgeExactOutput
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

export const CUSTOM_NETWORKS_QUERY = `
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
