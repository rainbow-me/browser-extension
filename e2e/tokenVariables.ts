export type TokenNames =
  | keyof (typeof tokenAddresses)['mainnet']
  | keyof (typeof tokenAddresses)['optimism']
  | keyof (typeof tokenAddresses)['base'];

export const tokenAddresses = {
  mainnet: {
    usdt: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    uniswap: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    chainlink: '0x514910771af9ca656af840dff83e8264ecf986ca',
  },
  optimism: {
    usdt: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    usdc: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
    uniswap: '0x6fd9d7ad17242c41f7131d257212c54a0e816691',
    chainlink: '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6',
  },
  base: {
    wormhole: '0xb0ffa8000886e57f86dd5264b9582b2ad87b2b91',
    usdc: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    degen: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed',
    snx: '0x22e6966b799c4d5b13be962e1d117b56327fda66',
  },
};

export const tokenNames: Record<TokenNames, string> = {
  usdt: 'Tether USD',
  usdc: 'USD Coin',
  uniswap: 'Uniswap',
  chainlink: 'Chainlink',
  wormhole: 'Wormhole',
  snx: 'Synthetix',
  degen: 'Degen',
};
