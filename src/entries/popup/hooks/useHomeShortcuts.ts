import { useCallback } from 'react';
import { useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';
import { truncateAddress } from '~/core/utils/address';
import { getProfileUrl, goToNewTab } from '~/core/utils/tabs';

import { triggerToast } from '../components/Toast/Toast';
import * as wallet from '../handlers/wallet';
import { ROUTES } from '../urls';
import { getInputIsFocused } from '../utils/activeElement';
import { clickHeaderRight } from '../utils/clickHeader';

import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useNavigateToSwaps } from './useNavigateToSwaps';
import { useRainbowNavigate } from './useRainbowNavigate';

export function useHomeShortcuts() {
  const { currentAddress: address } = useCurrentAddressStore();
  const { data: ensName } = useEnsName({ address });
  const { selectedToken } = useSelectedTokenStore();
  const { selectedTransaction } = useSelectedTransactionStore();
  const { sheet } = useCurrentHomeSheetStore();
  const navigateToSwaps = useNavigateToSwaps();

  const getHomeShortcutsAreActive = useCallback(() => {
    return sheet === 'none' && !selectedTransaction && !selectedToken;
  }, [sheet, selectedToken, selectedTransaction]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(address as string);
    triggerToast({
      title: i18n.t('wallet_header.copy_toast'),
      description: truncateAddress(address),
    });
  }, [address]);

  const openProfile = useCallback(
    () =>
      goToNewTab({
        url: getProfileUrl(ensName ?? address),
      }),
    [address, ensName],
  );

  const navigate = useRainbowNavigate();
  const handleHomeShortcuts = useCallback(
    (e: KeyboardEvent) => {
      const { key } = e;
      const inputIsFocused = getInputIsFocused();
      if (inputIsFocused) return;
      switch (key) {
        case shortcuts.home.COPY_ADDRESS.key:
          handleCopy();
          break;
        case shortcuts.home.GO_TO_CONNECTED_APPS.key:
          navigate(ROUTES.CONNECTED);
          break;
        case shortcuts.home.GO_TO_SEND.key:
          navigate(ROUTES.SEND);
          break;
        case shortcuts.home.GO_TO_SETTINGS.key:
          navigate(ROUTES.SETTINGS);
          break;
        case shortcuts.home.GO_TO_SWAP.key:
          navigateToSwaps();
          break;
        case shortcuts.home.GO_TO_PROFILE.key:
          openProfile();
          break;
        case shortcuts.home.GO_TO_WALLETS.key:
          navigate(ROUTES.WALLET_SWITCHER);
          break;
        case shortcuts.home.GO_TO_QR.key:
          navigate(ROUTES.QR_CODE);
          break;
        case shortcuts.home.LOCK.key:
          wallet.lock();
          break;
        case shortcuts.home.OPEN_MORE_MENU.key:
          clickHeaderRight();
          break;
      }
    },
    [handleCopy, navigate, navigateToSwaps, openProfile],
  );
  useKeyboardShortcut({
    condition: getHomeShortcutsAreActive,
    handler: handleHomeShortcuts,
  });
}
