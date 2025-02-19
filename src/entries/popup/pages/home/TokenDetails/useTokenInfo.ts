import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { metadataClient } from '~/core/graphql';
import { AboutTokenQuery } from '~/core/graphql/__generated__/metadata';
import { createQueryKey } from '~/core/react-query';
import { useCurrentCurrencyStore } from '~/core/state';
import { networkStore } from '~/core/state/networks/networks';
import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { formatCurrency } from '~/core/utils/formatNumber';

const parseTokenInfo = (token: AboutTokenQuery['token']) => {
  if (!token) return token;
  const format = (n?: number | string | null) =>
    formatCurrency(n || 0, {
      notation: 'compact',
      maximumSignificantDigits: 4,
    });
  return {
    allTime: {
      high: format(token.allTime.highValue),
      low: format(token.allTime.lowValue),
    },
    price: token.price,
    circulatingSupply: format(token.circulatingSupply),
    fullyDilutedValuation: format(token.fullyDilutedValuation),
    marketCap: format(token.marketCap),
    totalSupply: format(token.totalSupply),
    volume1d: format(token.volume1d),
    networks: Object.entries(token.networks).map(([chainId, network]) => ({
      chainId: +chainId as ChainId,
      ...(network as { address: Address; decimals: number }),
    })),
    description: token.description,
    links: token.links,
    isBridgeable: !!token.bridging,
  };
};
export type ParsedTokenInfo = ReturnType<typeof parseTokenInfo>;

export const useTokenInfo = <Select = ParsedTokenInfo>(
  token: { address: AddressOrEth; chainId: ChainId } | null,
  options?: { select: (t: ParsedTokenInfo) => Select },
) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const supportedChains = networkStore((state) =>
    state.getBackendSupportedChains(true),
  );
  const args = token && { ...token, currency: currentCurrency };
  return useQuery({
    queryFn: () => {
      if (!args) return;
      return metadataClient
        .aboutToken(args)
        .then((d) => parseTokenInfo(d.token));
    },
    queryKey: createQueryKey(
      'tokenInfo',
      { ...(args ? { args } : {}) },
      { persisterVersion: 2 },
    ),
    enabled: !!token && !!supportedChains[token.chainId],
    ...options,
  });
};
