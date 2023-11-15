import { useMemo } from 'react';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ChainId } from '~/core/types/chains';
import { chainIdToUse, getChain } from '~/core/utils/chains';

import { useHasEnoughGas } from '../../pages/messages/useHasEnoughGas';

export const useApproveAppRequestValidations = ({
  chainId,
  dappStatus,
}: {
  chainId: ChainId;
  dappStatus?: DAppStatus;
}) => {
  const { connectedToHardhat, connectedToHardhatOp } =
    useConnectedToHardhatStore();

  const activeChainId = chainIdToUse(
    connectedToHardhat,
    connectedToHardhatOp,
    chainId,
  );

  const enoughNativeAssetForGas = useHasEnoughGas(activeChainId);

  const buttonLabel = useMemo(() => {
    if (dappStatus === DAppStatus.Scam)
      return i18n.t('approve_request.send_transaction_anyway');

    if (!enoughNativeAssetForGas)
      return i18n.t('approve_request.insufficient_native_asset_for_gas', {
        symbol: getChain({ chainId: activeChainId }).nativeCurrency.name,
      });

    return i18n.t('approve_request.send_transaction');
  }, [activeChainId, enoughNativeAssetForGas, dappStatus]);

  return {
    enoughNativeAssetForGas,
    buttonLabel,
  };
};
