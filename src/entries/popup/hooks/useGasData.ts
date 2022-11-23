import { useEffect, useMemo, useState } from 'react';
import { Chain, chain, useProvider } from 'wagmi';

import {
  MeteorologyLegacyResponse,
  useMeteorology,
} from '~/core/resources/gas/meteorology';
import { weiToGwei } from '~/core/utils/ethereum';

export const useGasData = ({ chainId }: { chainId: Chain['id'] }) => {
  const [gasPrice, setGasPrice] = useState<string>('');
  const { data: meteorologyData } = useMeteorology(
    { chainId },
    {
      refetchInterval: 5000,
      enabled: chainId === chain.mainnet.id || chainId === chain.polygon.id,
    },
  );

  const provider = useProvider({ chainId });

  useEffect(() => {
    const getPrice = async () => {
      const gasPrice = await provider.getGasPrice();
      setGasPrice(gasPrice.toString());
    };
    getPrice();
  }, [provider, chainId]);

  const nonMeteorologyData: MeteorologyLegacyResponse = useMemo(() => {
    return {
      data: {
        legacy: {
          fastGasPrice: weiToGwei(gasPrice),
          proposeGasPrice: weiToGwei(gasPrice),
          safeGasPrice: weiToGwei(gasPrice),
        },
        meta: {
          blockNumber: 0,
          provider: '',
        },
      },
    };
  }, [gasPrice]);

  const data = useMemo(() => {
    if (chainId === chain.mainnet.id || chainId === chain.polygon.id) {
      return meteorologyData;
    } else {
      return nonMeteorologyData;
    }
  }, [chainId, meteorologyData, nonMeteorologyData]);

  return { data };
};
