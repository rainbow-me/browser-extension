import { ChainId } from '~/core/types/chains';

/**
 * Derives chain ID from block explorer hostname for wallet_watchAsset.
 * Used when no active session exists to determine which chain to add the token to.
 */
export function deriveChainIdByHostname(hostname: string): number {
  switch (hostname) {
    case 'etherscan.io':
      return ChainId.mainnet;
    case 'goerli.etherscan.io':
      return ChainId.sepolia; // goerli deprecated, fallback to sepolia
    case 'arbiscan.io':
      return ChainId.arbitrum;
    case 'explorer-mumbai.maticvigil.com':
    case 'explorer-mumbai.matic.today':
    case 'mumbai.polygonscan.com':
      return ChainId.polygonAmoy; // mumbai deprecated, fallback to polygon amoy
    case 'polygonscan.com':
      return ChainId.polygon;
    case 'optimistic.etherscan.io':
      return ChainId.optimism;
    case 'bscscan.com':
      return ChainId.bsc;
    case 'ftmscan.com':
      return ChainId.fantom;
    case 'explorer.celo.org':
      return ChainId.celo;
    case 'explorer.harmony.one':
      return ChainId.mainnet; // harmonyOne deprecated
    case 'explorer.avax.network':
    case 'subnets.avax.network':
    case 'snowtrace.io':
      return ChainId.avalanche;
    case 'moonscan.io':
      return ChainId.moonbeam;
    default:
      return ChainId.mainnet;
  }
}
