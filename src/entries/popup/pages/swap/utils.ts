import { Source } from '@rainbow-me/swaps';

import Logo0x from 'static/assets/aggregators/0x.png';
import Logo1Inch from 'static/assets/aggregators/1inch.png';
import LogoRainbow from 'static/assets/aggregators/rainbow.png';
import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';

export const aggregatorInfo = {
  auto: { logo: LogoRainbow, name: i18n.t('swap.aggregators.rainbow') },
  [Source.Aggregator0x]: { logo: Logo0x, name: Source.Aggregator0x },
  [Source.Aggregator1inch]: { logo: Logo1Inch, name: Source.Aggregator1inch },
};

export const pinnedSwapAssets = {
  [ChainId.mainnet]: [
    // Ethereum - ETH
    'eth',
    // USDC - USDC
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    // Tether - USDT
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    // Wrapped Bitcoin - WBTC
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    // Wrapped stETH - WSTETH
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    // Dai - DAI
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    // Ethena USDe - USDE
    '0x4c9edd5852cd905f086c759e8383e09bff1e68b3',
    // Pepe - PEPE
    '0x6982508145454ce325ddbe47a25d4ec3d2311933',
    // Chainlink - LINK
    '0x514910771af9ca656af840dff83e8264ecf986ca',
    // Maker - MKR
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
  ],
  [ChainId.optimism]: [
    // Ethereum - ETH
    'eth',
    // Bridged USDC - USDC.E
    '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // Optimism - Op
    '0x4200000000000000000000000000000000000042',
    // USDC - USDC
    '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
    // Bridged USDT - USDT
    '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    // Dai - DAI
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    // Wrapped Bitcoin - WBTC
    '0x68f180fcce6836688e9084f035309e29bf0a2095',
    // Wrapped stETH - WSTETH
    '0x1f32b1c2345538c0c6f582fcb022739c4a194ebb',
    // Worldcoin - WLD
    '0xdc6ff44d5d932cbd77b52e5612ba0529dc6226f1',
    // Synthetix Network - SNX
    '0x8700daec35af8ff88c16bdf0418774cb3d7599b4',
  ],
  [ChainId.bsc]: [
    // BNB - BNB
    'eth',
    // Binance Bridged USDT (BNB Smart Chain) - USDT
    '0x55d398326f99059ff775485246999027b3197955',
    // WETH - ETH
    '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    // Binance Bridged USDC (BNB Smart Chain) - USDC
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    // Binance Bitcoin - BTCB
    '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
    // Binance-Peg BUSD -BUSD
    '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    // Artificial Superintelligence Alliance - FET
    '0x031b41e504677879370e9dbcf937283a8691fa7f',
    // SmarDex - SDEX
    '0xfdc66a08b0d0dc44c17bbd471b88f49f50cdd20f',
    // Velo - VELO
    '0xf486ad071f3bee968384d2e39e2d8af0fcf6fd46',
    // Trust Wallet - TWT
    '0x4b0f1812e5df2a09796481ff14017e6005508003',
  ],
  [ChainId.polygon]: [
    // Bridged USDC - USDC.E
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    // Matic - MATIC
    'eth',
    // WETH - WETH
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    // Polygon Bridged USDT (Polygon) - USDT
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    // USDC - USDC
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
    // Wrapped Bitcoin - WBTC
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
    // Chainlink - LINK
    '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39',
    // Dai - DAI
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    // Render - RNDR
    '0x61299774020da444af134c82fa83e3810b309991',
    // Lido DAO - LDO
    '0xc3c7d422809852031b44ab29eec9f1eff2a58756',
  ],
  [ChainId.base]: [
    // Ethereum - ETH
    'eth',
    // USDC - USDC
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    // Bridged USDC - USDBC
    '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca',
    // Degen (Base) - DEGEN
    '0x4ed4e862860bed51a9570b96d89af5e1b0efefed',
    // Brett - BRETT
    '0x532f27101965dd16442e59d40670faf5ebb142e4',
    // mfercoin - $MFER
    '0xe3086852a4b125803c815a158249ae468a3254ca',
    // Aerodrome Finance - AERO
    '0x940181a94a35a4569e4529a3cdfb74e38fd98631',
    // Wrapped stETH - WSTETH
    '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452',
    // Keyboard Cat (Base) - KEYCAT
    '0x9a26f5433671751c3276a065f57e5a02d2817973',
    // Toshi - TOSHI
    '0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4',
  ],
  [ChainId.arbitrum]: [
    // Arbitrum Bridged USDT (Arbitrum) - USDT
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    // Ethereum - ETH
    'eth',
    // USD Coin - USDC
    '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    // Bridged USDC - USDC.E
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    // Dai - DAI
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    // Arbitrum - ARB
    '0x912ce59144191c1204e64559fe8253a0e49e6548',
    // Edge Matrix Computing - EMC
    '0xdfb8be6f8c87f74295a87de951974362cedcfa30',
    // Wrapped Bitcoin - WBTC
    '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
    // Axelar Bridged USDC -AXLUSDC
    '0xeb466342c4d449bc9f53a865d5cb90586f405215',
    // Verified USD - USDV
    '0x323665443cef804a3b5206103304bd4872ea4253',
  ],
  [ChainId.avalanche]: [
    // Tether -USDT
    '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
    // USDC - USDC
    '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
    // Bitcoin - BTC.b
    '0x152b9d0fdc40c096757f570a51e494bd4b943e50',
    // Staked AVAX - sAVAX
    '0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be',
    // JoeToken - JOE
    '0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd',
    // Wrapped AVAX - WAVAX
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    // Pangolin - PNG
    '0x60781c2586d68229fde47564546784ab3faca982',
    // C-Chain BloodLoop Shard - BLS
    '0x46b9144771cb3195d66e4eda643a7493fadcaf9d',
    // GoGoPool Protocol - GGP
    '0x69260b9483f9871ca57f81a90d91e2f96c2cd11d',
    // COQINU - COQ
    '0x420fca0121dc28039145009570975747295f2329',
  ],
  [ChainId.blast]: [
    // Ethereum - ETH
    'eth',
    // USDB - USDB
    '0x4300000000000000000000000000000000000003',
    // Blast - BLAST
    '0xb1a5700fa2358173fe465e6ea4ff52e36e88e2ad',
  ],
  [ChainId.zora]: [
    // Enjoy - ENJOY
    '0xa6b280b42cb0b7c4a4f789ec6ccc3a7609a1bc39',
    // Wrapped Ether - WETH
    '0x4200000000000000000000000000000000000006',
    // Zora
    '0x787e73b749607f4afaf086b5bc0a4803900d0bd6',
    // Merkly OFT - MERK
    '0xd838d5b87439e17b0194fd43e37300cd99aa3de0',
    // Imagine - Imagine
    '0x078540eecc8b6d89949c9c7d5e8e91eab64f6696',
    // USD Coin - Bridged from Ethereum
    '0xcccccccc7021b32ebb4e8c08314bd62f7c653ec4',
    // RIFT - RiftSwap Token
    '0xf05585457acdff218713e30d1d108bb8f022e03b',
    // Marathon OFT - MARA
    '0x661d1fa0aae29e6608a877627e49a058caae0285',
    // Zora Pepe - ZOPE
    '0xb4281a73c06960bcd4373341d4747c5eb8a362d6',
    // Yeet - YEET
    '0x418eaae6857c385bde88f93ca935d21eeff0fd76',
  ],
  [ChainId.degen]: [],
};
