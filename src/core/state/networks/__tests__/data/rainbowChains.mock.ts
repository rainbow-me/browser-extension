import {
  RainbowChainsState,
  rainbowChainsStore,
} from '~/core/state/rainbowChains';
export const DEFAULT_DATA: RainbowChainsState['rainbowChains'] =
  rainbowChainsStore.getInitialState()['rainbowChains'];
export const GRANT_DATA: RainbowChainsState['rainbowChains'] = {
  '1': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/1/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 1,
        name: 'Ethereum',
        testnet: false,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/1/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/1/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://etherscan.io',
            name: 'Etherscan',
          },
        },
        contracts: {
          ensRegistry: {
            address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
          },
          ensUniversalResolver: {
            address: '0xce01f8eee7E479C928F8919abD53E553a36CeF67',
            blockCreated: 19258213,
          },
          multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 14353601,
          },
        },
      },
    ],
  },
  '10': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/10/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 10,
        name: 'Optimism',
        testnet: false,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/10/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/10/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://optimistic.etherscan.io',
            name: 'Optimism',
          },
        },
      },
    ],
  },
  '56': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/56/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 56,
        name: 'BSC',
        testnet: false,
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/56/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/56/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://bscscan.com',
            name: 'Bscscan',
          },
        },
      },
    ],
  },
  '97': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/97/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 97,
        name: 'Bsc Testnet',
        testnet: true,
        nativeCurrency: {
          name: 'Testnet BNB',
          symbol: 'BNB',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/97/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/97/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://testnet.bscscan.com',
            name: 'Bscscan',
          },
        },
      },
    ],
  },
  '137': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/137/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 137,
        name: 'Polygon',
        testnet: false,
        nativeCurrency: {
          name: 'Polygon Ecosystem Token',
          symbol: 'POL',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/137/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/137/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://polygonscan.com',
            name: 'Polygonscan',
          },
        },
      },
    ],
  },
  '8333': {
    chains: [
      {
        id: 8333,
        name: 'B3',
        nativeCurrency: {
          symbol: 'ETH',
          decimals: 18,
          name: 'ETH',
        },
        rpcUrls: {
          default: {
            http: ['https://mainnet-rpc.b3.fun'],
          },
          public: {
            http: ['https://mainnet-rpc.b3.fun'],
          },
        },
        testnet: false,
      },
    ],
    activeRpcUrl: 'https://mainnet-rpc.b3.fun',
  },
  '8453': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/8453/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 8453,
        name: 'Base',
        testnet: false,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/8453/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/8453/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://basescan.org',
            name: 'Basescan',
          },
        },
      },
      {
        id: 8453,
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        name: 'Base LlamaNodes',
        rpcUrls: {
          default: {
            http: ['https://base.llamarpc.com'],
          },
          public: {
            http: ['https://base.llamarpc.com'],
          },
        },
        blockExplorers: {
          default: {
            name: '',
            url: 'https://basescan.org',
          },
        },
      },
    ],
  },
  '17000': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/17000/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 17000,
        name: 'Holesky',
        testnet: true,
        nativeCurrency: {
          name: 'Holesky Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/17000/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/17000/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://holesky.etherscan.io',
            name: 'Etherscan',
          },
        },
      },
    ],
  },
  '33111': {
    activeRpcUrl: 'https://rpc.curtis.apechain.com',
    chains: [
      {
        id: 33111,
        name: 'Curtis',
        nativeCurrency: {
          name: 'ApeCoin',
          symbol: 'APE',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ['https://rpc.curtis.apechain.com'],
          },
        },
        blockExplorers: {
          default: {
            name: 'Curtis Explorer',
            url: 'https://explorer.curtis.apechain.com',
          },
        },
        testnet: true,
      },
    ],
  },
  '33139': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/33139/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 33139,
        name: 'Apechain',
        testnet: false,
        nativeCurrency: {
          name: 'ApeCoin',
          symbol: 'APE',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/33139/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/33139/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://apescan.io',
            name: 'Apechain',
          },
        },
      },
    ],
  },
  '42161': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/42161/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 42161,
        name: 'Arbitrum',
        testnet: false,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/42161/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/42161/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://arbiscan.io',
            name: 'Arbiscan',
          },
        },
      },
    ],
  },
  '43113': {
    activeRpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    chains: [
      {
        id: 43113,
        name: 'Avalanche Fuji',
        nativeCurrency: {
          decimals: 18,
          name: 'Avalanche Fuji',
          symbol: 'AVAX',
        },
        rpcUrls: {
          default: {
            http: ['https://api.avax-test.network/ext/bc/C/rpc'],
          },
        },
        blockExplorers: {
          default: {
            name: 'SnowTrace',
            url: 'https://testnet.snowtrace.io',
            apiUrl: 'https://api-testnet.snowtrace.io',
          },
        },
        contracts: {
          multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 7096959,
          },
        },
        testnet: true,
      },
    ],
  },
  '43114': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/43114/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 43114,
        name: 'Avalanche',
        testnet: false,
        nativeCurrency: {
          name: 'Avalanche',
          symbol: 'AVAX',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/43114/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/43114/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://43114.snowtrace.io',
            name: 'Snowtrace',
          },
        },
      },
    ],
  },
  '57073': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/57073/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 57073,
        name: 'Ink',
        testnet: false,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/57073/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/57073/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://explorer.inkonchain.com',
            name: 'Ink',
          },
        },
      },
    ],
  },
  '80002': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/80002/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 80002,
        name: 'Polygon Amoy',
        testnet: true,
        nativeCurrency: {
          name: 'Polygon Ecosystem Token',
          symbol: 'POL',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/80002/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/80002/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://amoy.polygonscan.com',
            name: 'Polygonscan',
          },
        },
      },
    ],
  },
  '81457': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/81457/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 81457,
        name: 'Blast',
        testnet: false,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/81457/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/81457/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://blastscan.io',
            name: 'Blastscan',
          },
        },
      },
    ],
  },
  '84532': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/84532/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 84532,
        name: 'Base Sepolia',
        testnet: true,
        nativeCurrency: {
          name: 'Base Sepolia Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/84532/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/84532/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://sepolia.basescan.org',
            name: 'Basescan',
          },
        },
      },
    ],
  },
  '421614': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/421614/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 421614,
        name: 'Arbitrum Sepolia',
        testnet: true,
        nativeCurrency: {
          name: 'Arbitrum Sepolia Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/421614/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/421614/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://sepolia.arbiscan.io',
            name: 'Arbiscan',
          },
        },
      },
    ],
  },
  '763373': {
    activeRpcUrl: 'https://rpc-gel-sepolia.inkonchain.com',
    chains: [
      {
        serializers: {},
        contracts: {
          gasPriceOracle: {
            address: '0x420000000000000000000000000000000000000F',
          },
          l1Block: {
            address: '0x4200000000000000000000000000000000000015',
          },
          l2CrossDomainMessenger: {
            address: '0x4200000000000000000000000000000000000007',
          },
          l2Erc721Bridge: {
            address: '0x4200000000000000000000000000000000000014',
          },
          l2StandardBridge: {
            address: '0x4200000000000000000000000000000000000010',
          },
          l2ToL1MessagePasser: {
            address: '0x4200000000000000000000000000000000000016',
          },
          disputeGameFactory: {
            '11155111': {
              address: '0x860e626c700af381133d9f4af31412a2d1db3d5d',
            },
          },
          portal: {
            '11155111': {
              address: '0x5c1d29c6c9c8b0800692acc95d700bcb4966a1d7',
            },
          },
          l1StandardBridge: {
            '11155111': {
              address: '0x33f60714bbd74d62b66d79213c348614de51901c',
            },
          },
        },
        id: 763373,
        name: 'Ink Sepolia',
        nativeCurrency: {
          name: 'Sepolia Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ['https://rpc-gel-sepolia.inkonchain.com'],
          },
        },
        blockExplorers: {
          default: {
            name: 'Blockscout',
            url: 'https://explorer-sepolia.inkonchain.com/',
            apiUrl: 'https://explorer-sepolia.inkonchain.com/api/v2',
          },
        },
        testnet: true,
        sourceId: 11155111,
      },
    ],
  },
  '7777777': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/7777777/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 7777777,
        name: 'Zora',
        testnet: false,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/7777777/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/7777777/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://explorer.zora.energy',
            name: 'Zora',
          },
        },
      },
    ],
  },
  '11155111': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/11155111/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 11155111,
        name: 'Sepolia',
        testnet: true,
        nativeCurrency: {
          name: 'Sepolia Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/11155111/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/11155111/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://sepolia.etherscan.io',
            name: 'Etherscan',
          },
        },
      },
    ],
  },
  '11155420': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/11155420/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 11155420,
        name: 'Optimism Sepolia',
        testnet: true,
        nativeCurrency: {
          name: 'Optimism Sepolia Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/11155420/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/11155420/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://sepolia-optimism.etherscan.io',
            name: 'Optimism',
          },
        },
      },
    ],
  },
  '168587773': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/168587773/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 168587773,
        name: 'Blast Sepolia',
        testnet: true,
        nativeCurrency: {
          name: 'Blast Sepolia Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/168587773/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/168587773/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://sepolia.blastscan.io',
            name: 'Blastscan',
          },
        },
      },
    ],
  },
  '666666666': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/666666666/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 666666666,
        name: 'Degen',
        testnet: false,
        nativeCurrency: {
          name: 'Degen',
          symbol: 'DEGEN',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/666666666/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/666666666/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://explorer.degen.tips',
            name: 'Degen',
          },
        },
      },
    ],
  },
  '999999999': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/999999999/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 999999999,
        name: 'Zora Sepolia',
        testnet: true,
        nativeCurrency: {
          name: 'Zora Sepolia Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/999999999/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/999999999/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://sepolia.explorer.zora.energy',
            name: 'Zora',
          },
        },
      },
    ],
  },
};
export const MIKE_DATA: RainbowChainsState['rainbowChains'] = {
  '1': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/1/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 1,
        name: 'Ethereum',
        testnet: false,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/1/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/1/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://etherscan.io',
            name: 'Etherscan',
          },
        },
        contracts: {
          ensRegistry: {
            address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
          },
          ensUniversalResolver: {
            address: '0xce01f8eee7E479C928F8919abD53E553a36CeF67',
            blockCreated: 19258213,
          },
          multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 14353601,
          },
        },
      },
    ],
  },
  '10': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/10/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 10,
        name: 'Optimism',
        testnet: false,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/10/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/10/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://optimistic.etherscan.io',
            name: 'Optimism',
          },
        },
      },
    ],
  },
  '56': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/56/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 56,
        name: 'BSC',
        testnet: false,
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/56/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/56/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://bscscan.com',
            name: 'Bscscan',
          },
        },
      },
    ],
  },
  '97': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/97/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 97,
        name: 'Bsc Testnet',
        testnet: true,
        nativeCurrency: {
          name: 'Testnet BNB',
          symbol: 'BNB',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/97/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/97/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://testnet.bscscan.com',
            name: 'Bscscan',
          },
        },
      },
    ],
  },
  '137': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/137/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 137,
        name: 'Polygon',
        testnet: false,
        nativeCurrency: {
          name: 'Polygon Ecosystem Token',
          symbol: 'POL',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/137/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/137/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://polygonscan.com',
            name: 'Polygonscan',
          },
        },
      },
    ],
  },
  '2020': {
    chains: [
      {
        id: 2020,
        name: 'Ronin',
        nativeCurrency: {
          symbol: 'RON',
          decimals: 18,
          name: 'RON',
        },
        rpcUrls: {
          default: {
            http: ['https://api.roninchain.com/rpc'],
          },
          public: {
            http: ['https://api.roninchain.com/rpc'],
          },
        },
        blockExplorers: {
          default: {
            name: 'roninchain.com',
            url: 'https://app.roninchain.com',
          },
        },
        testnet: false,
      },
    ],
    activeRpcUrl: 'https://api.roninchain.com/rpc',
  },
  '8333': {
    chains: [
      {
        id: 8333,
        name: 'B3',
        nativeCurrency: {
          symbol: 'ETH',
          decimals: 18,
          name: 'ETH',
        },
        rpcUrls: {
          default: {
            http: ['https://mainnet-rpc.b3.fun'],
          },
          public: {
            http: ['https://mainnet-rpc.b3.fun'],
          },
        },
        testnet: false,
      },
    ],
    activeRpcUrl: 'https://mainnet-rpc.b3.fun',
  },
  '8453': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/8453/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 8453,
        name: 'Base',
        testnet: false,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/8453/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/8453/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://basescan.org',
            name: 'Basescan',
          },
        },
      },
    ],
  },
  '17000': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/17000/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 17000,
        name: 'Holesky',
        testnet: true,
        nativeCurrency: {
          name: 'Holesky Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/17000/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/17000/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://holesky.etherscan.io',
            name: 'Etherscan',
          },
        },
      },
    ],
  },
  '33111': {
    activeRpcUrl: 'https://rpc.curtis.apechain.com',
    chains: [
      {
        id: 33111,
        name: 'Curtis',
        nativeCurrency: {
          name: 'ApeCoin',
          symbol: 'APE',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ['https://rpc.curtis.apechain.com'],
          },
        },
        blockExplorers: {
          default: {
            name: 'Curtis Explorer',
            url: 'https://explorer.curtis.apechain.com',
          },
        },
        testnet: true,
      },
    ],
  },
  '33139': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/33139/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 33139,
        name: 'Apechain',
        testnet: false,
        nativeCurrency: {
          name: 'ApeCoin',
          symbol: 'APE',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/33139/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/33139/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://apescan.io',
            name: 'Apechain',
          },
        },
      },
    ],
  },
  '42161': {
    activeRpcUrl: 'https://arb1.arbitrum.io/rpc',
    chains: [
      {
        id: 42161,
        name: 'Arbitrum',
        testnet: false,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/42161/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/42161/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://arbiscan.io',
            name: 'Arbiscan',
          },
        },
      },
      {
        id: 42161,
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        name: 'Arbitrum One',
        rpcUrls: {
          default: {
            http: ['https://arb1.arbitrum.io/rpc'],
          },
          public: {
            http: ['https://arb1.arbitrum.io/rpc'],
          },
        },
        blockExplorers: {
          default: {
            name: '',
            url: 'https://arbiscan.io',
          },
        },
      },
    ],
  },
  '43113': {
    activeRpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    chains: [
      {
        id: 43113,
        name: 'Avalanche Fuji',
        nativeCurrency: {
          decimals: 18,
          name: 'Avalanche Fuji',
          symbol: 'AVAX',
        },
        rpcUrls: {
          default: {
            http: ['https://api.avax-test.network/ext/bc/C/rpc'],
          },
        },
        blockExplorers: {
          default: {
            name: 'SnowTrace',
            url: 'https://testnet.snowtrace.io',
            apiUrl: 'https://api-testnet.snowtrace.io',
          },
        },
        contracts: {
          multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 7096959,
          },
        },
        testnet: true,
      },
    ],
  },
  '43114': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/43114/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 43114,
        name: 'Avalanche',
        testnet: false,
        nativeCurrency: {
          name: 'Avalanche',
          symbol: 'AVAX',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/43114/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/43114/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://43114.snowtrace.io',
            name: 'Snowtrace',
          },
        },
      },
    ],
  },
  '57073': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/57073/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 57073,
        name: 'Ink',
        testnet: false,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/57073/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/57073/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://explorer.inkonchain.com',
            name: 'Ink',
          },
        },
      },
    ],
  },
  '80002': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/80002/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 80002,
        name: 'Polygon Amoy',
        testnet: true,
        nativeCurrency: {
          name: 'Polygon Ecosystem Token',
          symbol: 'POL',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/80002/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/80002/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://amoy.polygonscan.com',
            name: 'Polygonscan',
          },
        },
      },
    ],
  },
  '80084': {
    chains: [
      {
        id: 80084,
        name: 'Berachain bArtio',
        nativeCurrency: {
          symbol: 'BERA',
          decimals: 18,
          name: 'BERA Token',
        },
        rpcUrls: {
          default: {
            http: ['https://bartio.rpc.berachain.com'],
          },
          public: {
            http: ['https://bartio.rpc.berachain.com'],
          },
        },
        testnet: false,
      },
      {
        id: 80084,
        name: 'berachain',
        nativeCurrency: {
          symbol: 'BERA',
          decimals: 18,
          name: 'BERA',
        },
        rpcUrls: {
          default: {
            http: ['https://bera-testnet.nodeinfra.com'],
          },
          public: {
            http: ['https://bera-testnet.nodeinfra.com'],
          },
        },
        blockExplorers: {
          default: {
            name: '',
            url: '',
          },
        },
        testnet: false,
      },
    ],
    activeRpcUrl: 'https://bartio.rpc.berachain.com',
  },
  '80085': {
    chains: [
      {
        id: 80085,
        name: 'Berachain Artio',
        nativeCurrency: {
          symbol: 'BERA',
          decimals: 18,
          name: 'BERA Token',
        },
        rpcUrls: {
          default: {
            http: ['https://artio.rpc.berachain.com'],
          },
          public: {
            http: ['https://artio.rpc.berachain.com'],
          },
        },
        testnet: false,
      },
    ],
    activeRpcUrl: 'https://artio.rpc.berachain.com',
  },
  '80094': {
    chains: [
      {
        id: 80094,
        name: 'Berachain',
        nativeCurrency: {
          symbol: 'BERA',
          decimals: 18,
          name: 'BERA Token',
        },
        rpcUrls: {
          default: {
            http: ['https://rpc.berachain.com'],
          },
          public: {
            http: ['https://rpc.berachain.com'],
          },
        },
        testnet: false,
      },
    ],
    activeRpcUrl: 'https://rpc.berachain.com',
  },
  '81457': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/81457/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 81457,
        name: 'Blast',
        testnet: false,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/81457/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/81457/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://blastscan.io',
            name: 'Blastscan',
          },
        },
      },
    ],
  },
  '84532': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/84532/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 84532,
        name: 'Base Sepolia',
        testnet: true,
        nativeCurrency: {
          name: 'Base Sepolia Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/84532/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/84532/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://sepolia.basescan.org',
            name: 'Basescan',
          },
        },
      },
    ],
  },
  '421614': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/421614/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 421614,
        name: 'Arbitrum Sepolia',
        testnet: true,
        nativeCurrency: {
          name: 'Arbitrum Sepolia Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/421614/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/421614/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://sepolia.arbiscan.io',
            name: 'Arbiscan',
          },
        },
      },
    ],
  },
  '763373': {
    activeRpcUrl: 'https://rpc-gel-sepolia.inkonchain.com',
    chains: [
      {
        serializers: {},
        contracts: {
          gasPriceOracle: {
            address: '0x420000000000000000000000000000000000000F',
          },
          l1Block: {
            address: '0x4200000000000000000000000000000000000015',
          },
          l2CrossDomainMessenger: {
            address: '0x4200000000000000000000000000000000000007',
          },
          l2Erc721Bridge: {
            address: '0x4200000000000000000000000000000000000014',
          },
          l2StandardBridge: {
            address: '0x4200000000000000000000000000000000000010',
          },
          l2ToL1MessagePasser: {
            address: '0x4200000000000000000000000000000000000016',
          },
          disputeGameFactory: {
            '11155111': {
              address: '0x860e626c700af381133d9f4af31412a2d1db3d5d',
            },
          },
          portal: {
            '11155111': {
              address: '0x5c1d29c6c9c8b0800692acc95d700bcb4966a1d7',
            },
          },
          l1StandardBridge: {
            '11155111': {
              address: '0x33f60714bbd74d62b66d79213c348614de51901c',
            },
          },
        },
        id: 763373,
        name: 'Ink Sepolia',
        nativeCurrency: {
          name: 'Sepolia Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ['https://rpc-gel-sepolia.inkonchain.com'],
          },
        },
        blockExplorers: {
          default: {
            name: 'Blockscout',
            url: 'https://explorer-sepolia.inkonchain.com/',
            apiUrl: 'https://explorer-sepolia.inkonchain.com/api/v2',
          },
        },
        testnet: true,
        sourceId: 11155111,
      },
    ],
  },
  '7777777': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/7777777/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 7777777,
        name: 'Zora',
        testnet: false,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/7777777/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/7777777/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://explorer.zora.energy',
            name: 'Zora',
          },
        },
      },
    ],
  },
  '11155111': {
    activeRpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/demo',
    chains: [
      {
        id: 11155111,
        name: 'Sepolia',
        testnet: true,
        nativeCurrency: {
          name: 'Sepolia Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/11155111/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/11155111/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://sepolia.etherscan.io',
            name: 'Etherscan',
          },
        },
      },
      {
        id: 11155111,
        nativeCurrency: {
          name: 'Sepolia Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        name: 'Sepolia',
        rpcUrls: {
          default: {
            http: ['https://eth-sepolia.g.alchemy.com/v2/demo'],
          },
          public: {
            http: ['https://eth-sepolia.g.alchemy.com/v2/demo'],
          },
        },
        blockExplorers: {
          default: {
            name: '',
            url: 'https://sepolia.etherscan.io',
          },
        },
      },
    ],
  },
  '11155420': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/11155420/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 11155420,
        name: 'Optimism Sepolia',
        testnet: true,
        nativeCurrency: {
          name: 'Optimism Sepolia Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/11155420/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/11155420/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://sepolia-optimism.etherscan.io',
            name: 'Optimism',
          },
        },
      },
    ],
  },
  '168587773': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/168587773/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 168587773,
        name: 'Blast Sepolia',
        testnet: true,
        nativeCurrency: {
          name: 'Blast Sepolia Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/168587773/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/168587773/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://sepolia.blastscan.io',
            name: 'Blastscan',
          },
        },
      },
    ],
  },
  '666666666': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/666666666/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 666666666,
        name: 'Degen',
        testnet: false,
        nativeCurrency: {
          name: 'Degen',
          symbol: 'DEGEN',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/666666666/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/666666666/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://explorer.degen.tips',
            name: 'Degen',
          },
        },
      },
    ],
  },
  '999999999': {
    activeRpcUrl:
      'https://rpc.rainbow.me/v1/999999999/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
    chains: [
      {
        id: 999999999,
        name: 'Zora Sepolia',
        testnet: true,
        nativeCurrency: {
          name: 'Zora Sepolia Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [
              'https://rpc.rainbow.me/v1/999999999/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
          public: {
            http: [
              'https://rpc.rainbow.me/v1/999999999/B9kBlwE2Hpw0COb7pWj6rpnk69fqSGGRc3fQ5nZ2LzeFS1G2VRxBQilZWbxAZkXI',
            ],
          },
        },
        blockExplorers: {
          default: {
            url: 'https://sepolia.explorer.zora.energy',
            name: 'Zora',
          },
        },
      },
    ],
  },
};
