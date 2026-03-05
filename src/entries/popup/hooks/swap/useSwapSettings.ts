import { Source } from '@rainbow-me/swaps';
import { useCallback, useEffect, useState } from 'react';

import {
  defaultslippagInBips,
  useRemoteConfigStore,
} from '~/core/state/remoteConfig';
import { ChainId } from '~/core/types/chains';

import usePrevious from '../usePrevious';

const slippageInBipsToString = (slippageInBips: number) =>
  (slippageInBips / 100).toString();

export const getDefaultSlippage = (chainId: ChainId) => {
  const defaultSlippageBips =
    useRemoteConfigStore.getState().default_slippage_bips;
  return slippageInBipsToString(
    defaultSlippageBips[chainId] ?? defaultslippagInBips(chainId),
  );
};

export const useSwapSettings = ({ chainId }: { chainId: ChainId }) => {
  const defaultSlippageBips = useRemoteConfigStore(
    (s) => s.default_slippage_bips,
  );
  const defaultSlippage = slippageInBipsToString(
    defaultSlippageBips[chainId] ?? defaultslippagInBips(chainId),
  );

  const [source, setSource] = useState<Source | 'auto'>('auto');
  const [slippageManuallyUpdated, setSlippageManuallyUpdated] =
    useState<boolean>(false);
  const [internalSlippage, setInternalSlippage] =
    useState<string>(defaultSlippage);
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
      setSlippage(defaultSlippage);
      setSlippageManuallyUpdated(false);
    }
  }, [chainId, prevChainId, defaultSlippage, setSlippage]);

  return {
    source,
    slippage: internalSlippage,
    setSource,
    setSlippage,
    setSettings,
    slippageManuallyUpdated,
  };
};
