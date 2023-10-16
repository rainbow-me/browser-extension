declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ALCHEMY_API_KEY: string;
      BSC_MAINNET_RPC: string;
      ZORA_MAINNET_RPC: string;
      BASE_MAINNET_RPC: string;
      ETHERSCAN_API_KEY: string;
      SEGMENT_WRITE_KEY: string;
      SENTRY_DSN: string;
      DATA_API_KEY: string;
      DATA_ENDPOINT: string;
      DATA_ORIGIN: string;
      PLAYGROUND: 'default' | 'ds';
      LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
      LOG_DEBUG: string;
      FIREBASE_API_KEY_BX: string;
      FIREBASE_AUTH_DOMAIN_BX: string;
      FIREBASE_PROJECT_ID_BX: string;
      FIREBASE_SENDER_ID_BX: string;
      FIREBASE_APP_ID_BX: string;
      FIREBASE_VAPID_BX: string;
      IMGIX_DOMAIN: string;
      IMGIX_TOKEN: string;
      RPC_PROXY_ENABLED: string;
      RPC_PROXY_BASE_URL: string;
      RPC_PROXY_API_KEY: string;
    }
  }
}

declare global {
  interface Window {
    TrezorConnect: typeof Window.TrezorConnect;
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
