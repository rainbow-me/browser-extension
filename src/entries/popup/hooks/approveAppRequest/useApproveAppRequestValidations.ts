import { useMemo } from 'react';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { ActiveSession } from '~/core/state/appSessions';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ChainId } from '~/core/types/chains';
import { chainIdToUse, getChain } from '~/core/utils/chains';

import { useHasEnoughGas } from '../../pages/messages/useHasEnoughGas';

export const useApproveAppRequestValidations = ({
  session,
  dappStatus,
  signingWithDevice,
}: {
  session: ActiveSession;
  dappStatus?: DAppStatus;
  signingWithDevice?: boolean;
}) => {
  const { connectedToHardhat, connectedToHardhatOp } =
    useConnectedToHardhatStore();

  const { hasEnough: enoughNativeAssetForGas, isLoading: isGasLoading } =
    useHasEnoughGas(session);

  const buttonLabel = useMemo(() => {
    const activeChainId = chainIdToUse(
      connectedToHardhat,
      connectedToHardhatOp,
      session?.chainId || ChainId.mainnet,
    );
    if (dappStatus === DAppStatus.Scam)
      return i18n.t('approve_request.send_transaction_anyway');

    // Only show insufficient gas if we've confirmed they don't have enough (not loading)
    if (!isGasLoading && enoughNativeAssetForGas === false)
      return i18n.t('approve_request.insufficient_native_asset_for_gas', {
        symbol: getChain({ chainId: activeChainId }).nativeCurrency.name,
      });

    if (signingWithDevice) {
      return i18n.t('approve_request.confirm_hw');
    }

    return i18n.t('approve_request.send_transaction');
  }, [
    connectedToHardhat,
    connectedToHardhatOp,
    session?.chainId,
    dappStatus,
    enoughNativeAssetForGas,
    isGasLoading,
    signingWithDevice,
  ]);

  return {
    enoughNativeAssetForGas,
    buttonLabel,
  };
};
