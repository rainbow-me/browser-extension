import { Source } from '@rainbow-me/swaps';
import { useCallback, useEffect, useState } from 'react';

import config, { DEFAULT_CONFIG } from '~/core/firebase/remoteConfig';
import { ChainId } from '~/core/types/chains';

import usePrevious from '../usePrevious';

const slippageInBipsToString = (slippageInBips: number) =>
  (slippageInBips / 100).toString();

export const getDefaultSlippage = (chainId: ChainId) => {
  return slippageInBipsToString(
    config.default_slippage_bips[chainId] ||
      DEFAULT_CONFIG.default_slippage_bips[chainId] ||
      200,
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
