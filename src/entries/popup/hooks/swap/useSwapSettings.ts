import { Source } from '@rainbow-me/swaps';
import { useCallback, useEffect, useState } from 'react';

import config from '~/core/firebase/remoteConfig';
import { useFlashbotsEnabledStore } from '~/core/state';
import { ChainId, ChainName, chainIdToNameMapping } from '~/core/types/chains';

import usePrevious from '../usePrevious';

export const DEFAULT_SLIPPAGE_BIPS = {
  [ChainId.mainnet]: 100,
  [ChainId.polygon]: 200,
  [ChainId.bsc]: 200,
  [ChainId.optimism]: 200,
  [ChainId.base]: 200,
  [ChainId.zora]: 200,
  [ChainId.arbitrum]: 200,
  [ChainId.avalanche]: 200,
  [ChainId.blast]: 200,
  [ChainId.degen]: 200,
  [ChainId.apechain]: 200,
};

export const DEFAULT_SLIPPAGE = {
  [ChainId.mainnet]: '1',
  [ChainId.polygon]: '2',
  [ChainId.bsc]: '2',
  [ChainId.optimism]: '2',
  [ChainId.base]: '2',
  [ChainId.zora]: '2',
  [ChainId.arbitrum]: '2',
  [ChainId.avalanche]: '2',
  [ChainId.blast]: '2',
  [ChainId.degen]: '2',
  [ChainId.apechain]: '2',
};

const slippageInBipsToString = (slippageInBips: number) =>
  (slippageInBips / 100).toString();

export const getDefaultSlippage = (chainId: ChainId) => {
  const chainName = chainIdToNameMapping[chainId] as
    | ChainName.mainnet
    | ChainName.optimism
    | ChainName.polygon
    | ChainName.arbitrum
    | ChainName.base
    | ChainName.zora
    | ChainName.bsc
    | ChainName.avalanche
    | ChainName.blast
    | ChainName.degen
    | ChainName.apechain;
  return slippageInBipsToString(
    config.default_slippage_bips[chainName] || DEFAULT_SLIPPAGE_BIPS[chainId],
  );
};

export const useSwapSettings = ({ chainId }: { chainId: ChainId }) => {
  const [source, setSource] = useState<Source | 'auto'>('auto');
  const [slippageManuallyUpdated, setSlippageManuallyUpdated] =
    useState<boolean>(false);
  const [internalSlippage, setInternalSlippage] = useState<string>(
    getDefaultSlippage(chainId),
  );
  const { swapFlashbotsEnabled, setSwapFlashbotsEnabled } =
    useFlashbotsEnabledStore();
  const prevChainId = usePrevious(chainId);

  const setSlippage = useCallback((slippage: string) => {
    setInternalSlippage(slippage);
    setSlippageManuallyUpdated(true);
  }, []);

  const setSettings = useCallback(
    ({
      source,
      slippage,
      swapFlashbotsEnabled,
    }: {
      source: Source | 'auto';
      slippage: string;
      swapFlashbotsEnabled: boolean;
    }) => {
      setSource(source);
      setSlippage(slippage);
      setSwapFlashbotsEnabled(swapFlashbotsEnabled);
    },
    [setSlippage, setSwapFlashbotsEnabled],
  );

  useEffect(() => {
    if (prevChainId !== chainId) {
      setSlippage(getDefaultSlippage(chainId));
      setSlippageManuallyUpdated(false);
    }
  }, [chainId, prevChainId, setSlippage]);

  return {
    source,
    slippage: internalSlippage,
    swapFlashbotsEnabled,
    setSource,
    setSlippage,
    setSwapFlashbotsEnabled,
    setSettings,
    slippageManuallyUpdated,
  };
};
