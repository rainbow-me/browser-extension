declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ALCHEMY_API_KEY: string;
      INFURA_API_KEY: string;
      ETHERSCAN_API_KEY: string;
      PLAYGROUND: 'default' | 'ds'
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}