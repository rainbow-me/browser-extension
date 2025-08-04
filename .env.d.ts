declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Mainnet RPCs
      ARBITRUM_MAINNET_RPC: string;
      AVALANCHE_MAINNET_RPC: string;
      BASE_MAINNET_RPC: string;
      BLAST_MAINNET_RPC: string;
      BSC_MAINNET_RPC: string;
      DEGEN_MAINNET_RPC: string;
      ETH_MAINNET_RPC: string;
      OPTIMISM_MAINNET_RPC: string;
      POLYGON_MAINNET_RPC: string;
      ZORA_MAINNET_RPC: string;
      // Testnet RPCs
      ARBITRUM_SEPOLIA_RPC: string;
      AVALANCHE_FUJI_RPC: string;
      BASE_SEPOLIA_RPC: string;
      BLAST_SEPOLIA_RPC: string;
      BSC_TESTNET_RPC: string;
      ETH_HOLESKY_RPC: string;
      ETH_SEPOLIA_RPC: string;
      OPTIMISM_SEPOLIA_RPC: string;
      POLYGON_AMOY_RPC: string;
      ZORA_SEPOLIA_RPC: string;
      // Services
      ADDYS_API_KEY: string;
      DATA_API_KEY: string;
      DATA_ENDPOINT: string;
      ETHERSCAN_API_KEY: string;
      IMGIX_DOMAIN: string;
      IMGIX_TOKEN: string;
      NFT_API_KEY: string;
      NFT_API_URL: string;
      RAINBOW_METADATA_API_TOKEN: string;
      RPC_PROXY_API_KEY: string;
      RPC_PROXY_BASE_URL: string;
      RPC_PROXY_ENABLED: 'true' | 'false';
      GRAPH_ENS_API_KEY: string;
      // Firebase
      FIREBASE_API_KEY_BX: string;
      FIREBASE_AUTH_DOMAIN_BX: string;
      FIREBASE_PROJECT_ID_BX: string;
      FIREBASE_SENDER_ID_BX: string;
      FIREBASE_APP_ID_BX: string;
      FIREBASE_VAPID_BX: string;
      // Telemetry
      RUDDERSTACK_DATA_PLANE: string;
      RUDDERSTACK_WRITE_KEY: string;
      SENTRY_DSN: string;
      SECURE_WALLET_HASH_KEY: string;
      // Development
      IS_DEV: 'true' | 'false';
      IS_TESTING: 'true' | 'false';
      LOG_DEBUG?: string;
      LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
