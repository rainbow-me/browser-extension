import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';

import { selectUserAssetsList } from '~/core/resources/_selectors';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';

export const useSendTransactionAsset = () => {
  const { address } = useAccount();
  const { currentCurrency } = useCurrentCurrencyStore();

  const [index, setIndex] = useState<number>(-1);
  const { data: assets = [] } = useUserAssets(
    {
      address,
      currency: currentCurrency,
    },
    { select: selectUserAssetsList },
  );

  const shuffleAssetIndex = useCallback(
    (n?: number) => {
      setIndex(n ?? index + 1);
    },
    [index],
  );

  const asset = index === -1 ? null : assets?.[index];

  return {
    shuffleAssetIndex,
    asset,
  };
};
