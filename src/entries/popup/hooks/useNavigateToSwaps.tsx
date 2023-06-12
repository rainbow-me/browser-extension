import { KeychainType } from '~/core/types/keychainTypes';
import { POPUP_URL, goToNewTab } from '~/core/utils/tabs';

import { ROUTES } from '../urls';

import { useCurrentAccount } from './useAccounts';
import { useIsFullScreen } from './useIsFullScreen';
import { useRainbowNavigate } from './useRainbowNavigate';

export const useNavigateToSwaps = () => {
  const { type } = useCurrentAccount();
  const isFullScreen = useIsFullScreen();
  const navigate = useRainbowNavigate();

  return () => {
    return type === KeychainType.HardwareWalletKeychain && !isFullScreen
      ? goToNewTab({ url: POPUP_URL + `#${ROUTES.SWAP}` })
      : navigate(ROUTES.SWAP);
  };
};
