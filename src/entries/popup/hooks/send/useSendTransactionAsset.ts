import { useAccount } from 'wagmi';

import { selectUserAssetsList } from '~/core/resources/_selectors';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';

export const useSendTransactionAsset = () => {
  const { address } = useAccount();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { data: assets = [] } = useUserAssets(
    {
      address,
      currency: currentCurrency,
    },
    { select: selectUserAssetsList },
  );
  const asset = assets?.[1];
  return {
    asset,
  };
};
