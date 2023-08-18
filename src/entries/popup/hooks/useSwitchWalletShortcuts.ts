import { useState } from 'react';

import { useCurrentAddressStore } from '~/core/state';

import {
  getInputIsFocused,
  switchNetworkMenuIsActive,
} from '../utils/activeElement';

import { useAccounts } from './useAccounts';
import useKeyboardAnalytics from './useKeyboardAnalytics';
import { useKeyboardShortcut } from './useKeyboardShortcut';

export function useSwitchWalletShortcuts(disable?: boolean) {
  const { sortedAccounts } = useAccounts();
  const { setCurrentAddress } = useCurrentAddressStore();
  const [shouldDebounce, setShouldDebounce] = useState(false);
  const { trackShortcut } = useKeyboardAnalytics();
  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (!switchNetworkMenuIsActive() && !getInputIsFocused()) {
        const regex = /^[1-9]$/;
        if (regex.test(e.key)) {
          const accountIndex = parseInt(e.key, 10) - 1;
          if (sortedAccounts[accountIndex]) {
            trackShortcut({
              key: e.key.toString(),
              type: 'global.switchWallet',
            });
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
