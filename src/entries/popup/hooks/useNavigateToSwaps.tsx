import React from 'react';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { KeychainType } from '~/core/types/keychainTypes';
import { POPUP_URL, goToNewTab } from '~/core/utils/tabs';
import { triggerAlert } from '~/design-system/components/Alert/Alert';

import { ROUTES } from '../urls';

import { useCurrentWalletTypeAndVendor } from './useCurrentWalletType';
import { useIsFullScreen } from './useIsFullScreen';
import { useRainbowNavigate } from './useRainbowNavigate';
import { useWallets } from './useWallets';

export const useNavigateToSwaps = () => {
  const { type } = useCurrentWalletTypeAndVendor();
  const isFullScreen = useIsFullScreen();
  const { isWatchingWallet } = useWallets();
  const navigate = useRainbowNavigate();
  const { featureFlags } = useFeatureFlagsStore();
  const { testnetMode } = useTestnetModeStore();

  const allowSwap = React.useMemo(
    () =>
      (!isWatchingWallet || featureFlags.full_watching_wallets) &&
      config.swaps_enabled,
    [featureFlags.full_watching_wallets, isWatchingWallet],
  );

  return () => {
    if (testnetMode) {
      triggerAlert({ text: i18n.t('alert.wallet_testing_mode') });
    } else if (!allowSwap) {
      triggerAlert({ text: i18n.t('alert.wallet_watching_mode') });
    } else {
      return type === KeychainType.HardwareWalletKeychain && !isFullScreen
        ? goToNewTab({ url: POPUP_URL + `#${ROUTES.SWAP}?hideBack=true` })
        : navigate(ROUTES.SWAP);
    }
  };
};
