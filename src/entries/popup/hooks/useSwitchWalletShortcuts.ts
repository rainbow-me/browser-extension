import { useCurrentAddressStore } from '~/core/state';

import {
  getInputIsFocused,
  switchNetworkMenuIsActive,
} from '../utils/activeElement';

import { useAccounts } from './useAccounts';
import { useKeyboardShortcut } from './useKeyboardShortcut';

export function useSwitchWalletShortcuts(disable?: boolean) {
  const { sortedAccounts } = useAccounts();
  const { setCurrentAddress } = useCurrentAddressStore();
  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (!switchNetworkMenuIsActive() && !getInputIsFocused()) {
        const regex = /^[1-9]$/;
        if (regex.test(e.key)) {
          const accountIndex = parseInt(e.key, 10) - 1;
          if (sortedAccounts[accountIndex]) {
            setCurrentAddress(sortedAccounts[accountIndex]?.address);
          }
        }
      }
    },
    condition: () => !disable,
  });
}
