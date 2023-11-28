import { useMemo } from 'react';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { ActiveSession } from '~/core/state/appSessions';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { chainIdToUse, getChain } from '~/core/utils/chains';

import { useHasEnoughGas } from '../../pages/messages/useHasEnoughGas';

export const useApproveAppRequestValidations = ({
  session,
  dappStatus,
}: {
  session: ActiveSession;
  dappStatus?: DAppStatus;
}) => {
  const { connectedToHardhat, connectedToHardhatOp } =
    useConnectedToHardhatStore();

  const activeChainId = chainIdToUse(
    connectedToHardhat,
    connectedToHardhatOp,
    session?.chainId,
  );

  const enoughNativeAssetForGas = useHasEnoughGas(session);

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
