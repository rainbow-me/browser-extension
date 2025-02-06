import { Source } from '@rainbow-me/swaps';
import { useCallback, useEffect, useState } from 'react';

import config from '~/core/firebase/remoteConfig';
import { ChainId, ChainName, chainIdToNameMapping } from '~/core/types/chains';

import usePrevious from '../usePrevious';

export const DEFAULT_SLIPPAGE_BIPS = {
  [ChainId.mainnet]: 100,
  [ChainId.polygon]: 200,
  [ChainId.bsc]: 200,
  [ChainId.optimism]: 500,
  [ChainId.base]: 500,
  [ChainId.zora]: 500,
  [ChainId.arbitrum]: 500,
  [ChainId.avalanche]: 500,
  [ChainId.blast]: 500,
  [ChainId.degen]: 500,
  [ChainId.apechain]: 500,
  [ChainId.ink]: 500,
  [ChainId.sanko]: 500,
  [ChainId.gravity]: 500,
  [ChainId.berachain]: 500,
};

export const DEFAULT_SLIPPAGE = {
  [ChainId.mainnet]: '1',
  [ChainId.polygon]: '2',
  [ChainId.bsc]: '2',
  [ChainId.optimism]: '5',
  [ChainId.base]: '5',
  [ChainId.zora]: '5',
  [ChainId.arbitrum]: '5',
  [ChainId.avalanche]: '5',
  [ChainId.blast]: '5',
  [ChainId.degen]: '5',
  [ChainId.apechain]: '5',
  [ChainId.ink]: '5',
  [ChainId.sanko]: '5',
  [ChainId.gravity]: '5',
  [ChainId.berachain]: '5',
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
    | ChainName.apechain
    | ChainName.ink
    | ChainName.sanko
    | ChainName.gravity
    | ChainName.berachain;
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
  const prevChainId = usePrevious(chainId);

  const setSlippage = useCallback((slippage: string) => {
    setInternalSlippage(slippage);
    setSlippageManuallyUpdated(true);
  }, []);

  const setSettings = useCallback(
    ({ source, slippage }: { source: Source | 'auto'; slippage: string }) => {
      setSource(source);
      setSlippage(slippage);
    },
    [setSlippage],
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
    setSource,
    setSlippage,
    setSettings,
    slippageManuallyUpdated,
  };
};
