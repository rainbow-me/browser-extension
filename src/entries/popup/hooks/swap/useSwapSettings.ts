import { Source } from '@rainbow-me/swaps';
import { useCallback, useEffect, useState } from 'react';

import { ChainId } from '~/core/types/chains';

import usePrevious from '../usePrevious';

export const DEFAULT_SLIPPAGE_BIPS = {
  [ChainId.mainnet]: 100,
  [ChainId.polygon]: 200,
  [ChainId.bsc]: 200,
  [ChainId.optimism]: 200,
  [ChainId.arbitrum]: 200,
};

export const DEFAULT_SLIPPAGE = {
  [ChainId.mainnet]: '1',
  [ChainId.polygon]: '2',
  [ChainId.bsc]: '2',
  [ChainId.optimism]: '2',
  [ChainId.arbitrum]: '2',
};

export const useSwapSettings = ({ chainId }: { chainId: ChainId }) => {
  const [source, setSource] = useState<Source | 'auto'>('auto');
  const [slippage, setSlippage] = useState<string>(DEFAULT_SLIPPAGE[chainId]);
  const [flashbotsEnabled, setFlashbotsEnabled] = useState<boolean>(false);
  const prevChainId = usePrevious(chainId);

  const setSettings = useCallback(
    ({
      source,
      slippage,
      flashbotsEnabled,
    }: {
      source: Source | 'auto';
      slippage: string;
      flashbotsEnabled: boolean;
    }) => {
      setSource(source);
      setSlippage(slippage);
      setFlashbotsEnabled(flashbotsEnabled);
    },
    [],
  );

  useEffect(() => {
    if (prevChainId !== chainId) {
      setSlippage(DEFAULT_SLIPPAGE[chainId]);
    }
  }, [chainId, prevChainId]);

  return {
    source,
    slippage,
    flashbotsEnabled,
    setSource,
    setSlippage,
    setFlashbotsEnabled,
    setSettings,
  };
};
