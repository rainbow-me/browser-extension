import { useState } from 'react';

import { useCurrentAddressStore } from '~/core/state';

import { useCommandKStatus } from '../components/CommandK/useCommandKStatus';
import {
  getInputIsFocused,
  switchNetworkMenuIsActive,
} from '../utils/activeElement';

import { useAccounts } from './useAccounts';
import { useKeyboardShortcut } from './useKeyboardShortcut';

export function useSwitchWalletShortcuts(disable?: boolean) {
  const { sortedAccounts } = useAccounts();
  const { setCurrentAddress } = useCurrentAddressStore();
  const { isCommandKVisible } = useCommandKStatus();
  const [shouldDebounce, setShouldDebounce] = useState(false);
  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (
        !switchNetworkMenuIsActive() &&
        !getInputIsFocused() &&
        !isCommandKVisible
      ) {
        const regex = /^[1-9]$/;
        if (regex.test(e.key)) {
          const accountIndex = parseInt(e.key, 10) - 1;
          if (sortedAccounts[accountIndex]) {
            setShouldDebounce(true);
            setCurrentAddress(sortedAccounts[accountIndex]?.address);
            setTimeout(() => setShouldDebounce(false), 250);
          }
        }
      }
    },
    condition: () => !disable && !shouldDebounce,
  });
}
