import { useEffect } from 'react';

import { useNavRestorationStore } from '~/core/state/navRestoration';

import { ROUTES } from '../urls';

import { useRainbowNavigate } from './useRainbowNavigate';

const RESTORE_NAV_MAP: Record<string, string[]> = {
  [ROUTES.ADD_WALLET]: [ROUTES.WALLET_SWITCHER, ROUTES.ADD_WALLET],
  [ROUTES.CHOOSE_WALLET_GROUP]: [
    ROUTES.WALLET_SWITCHER,
    ROUTES.ADD_WALLET,
    ROUTES.CHOOSE_WALLET_GROUP,
  ],
  [ROUTES.CONNECTED]: [ROUTES.CONNECTED],
  [ROUTES.HW_CHOOSE]: [
    ROUTES.WALLET_SWITCHER,
    ROUTES.ADD_WALLET,
    ROUTES.HW_CHOOSE,
  ],
  [ROUTES.HW_LEDGER]: [
    ROUTES.WALLET_SWITCHER,
    ROUTES.ADD_WALLET,
    ROUTES.HW_CHOOSE,
    ROUTES.HW_LEDGER,
  ],
  [ROUTES.HW_TREZOR]: [
    ROUTES.WALLET_SWITCHER,
    ROUTES.ADD_WALLET,
    ROUTES.HW_CHOOSE,
    ROUTES.HW_TREZOR,
  ],
  // full screen
  // [ROUTES.HW_SUCCESS]: [],
  // [ROUTES.HW_WALLET_LIST]: [],
  // onboarding
  // [ROUTES.IMPORT_OR_CONNECT]: [],
  // [ROUTES.IMPORT]: [],
  // [ROUTES.IMPORT__SEED]: [],
  // [ROUTES.IMPORT__PRIVATE_KEY]: [],
  // [ROUTES.IMPORT__SELECT]: [],
  // [ROUTES.IMPORT__EDIT]: [],
  // [ROUTES.WATCH]: [],
  // [ROUTES.WELCOME]: [],
  [ROUTES.NEW_IMPORT_WALLET]: [
    ROUTES.WALLET_SWITCHER,
    ROUTES.ADD_WALLET,
    ROUTES.NEW_IMPORT_WALLET,
  ],
  [ROUTES.NEW_IMPORT_WALLET_SELECTION]: [
    ROUTES.WALLET_SWITCHER,
    ROUTES.ADD_WALLET,
    ROUTES.NEW_IMPORT_WALLET,
  ],
  [ROUTES.NEW_IMPORT_WALLET_SELECTION_EDIT]: [
    ROUTES.WALLET_SWITCHER,
    ROUTES.ADD_WALLET,
    ROUTES.NEW_IMPORT_WALLET,
  ],
  [ROUTES.NEW_WATCH_WALLET]: [
    ROUTES.WALLET_SWITCHER,
    ROUTES.ADD_WALLET,
    ROUTES.NEW_WATCH_WALLET,
  ],
  // kicking back all seed reveal flows to /home
  // [ROUTES.SEED_BACKUP_PROMPT]: [],
  // [ROUTES.SEED_REVEAL]: [],
  // [ROUTES.SEED_VERIFY]: [],
  [ROUTES.SEND]: [ROUTES.SEND],
  [ROUTES.SWAP]: [ROUTES.SWAP],
  [ROUTES.SETTINGS]: [ROUTES.SETTINGS],
  [ROUTES.SETTINGS__CURRENCY]: [ROUTES.SETTINGS, ROUTES.SETTINGS__CURRENCY],
  [ROUTES.SETTINGS__NETWORKS]: [ROUTES.SETTINGS, ROUTES.SETTINGS__NETWORKS],
  [ROUTES.SETTINGS__NETWORKS__CUSTOM_RPC]: [
    ROUTES.SETTINGS,
    ROUTES.SETTINGS__NETWORKS__CUSTOM_RPC,
  ],
  [ROUTES.SETTINGS__PRIVACY]: [ROUTES.SETTINGS, ROUTES.SETTINGS__PRIVACY],
  [ROUTES.SETTINGS__PRIVACY__AUTOLOCK]: [
    ROUTES.SETTINGS,
    ROUTES.SETTINGS__PRIVACY,
    ROUTES.SETTINGS__PRIVACY__AUTOLOCK,
  ],
  [ROUTES.SETTINGS__PRIVACY__CHANGE_PASSWORD]: [
    ROUTES.SETTINGS,
    ROUTES.SETTINGS__PRIVACY,
    // make user reenter pw
    // ROUTES.SETTINGS__PRIVACY_CHANGE_PASSWORD
  ],
  [ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS]: [
    ROUTES.SETTINGS,
    ROUTES.SETTINGS__PRIVACY,
    ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS,
  ],
  [ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS]: [
    ROUTES.SETTINGS,
    ROUTES.SETTINGS__PRIVACY,
    ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS,
    ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS,
  ],
  [ROUTES.SETTINGS__TRANSACTIONS]: [
    ROUTES.SETTINGS,
    ROUTES.SETTINGS__TRANSACTIONS,
  ],
  // [ROUTES.UNLOCK]: [],
  [ROUTES.QR_CODE]: [ROUTES.QR_CODE],
  // should appear as standalone window
  // [ROUTES.SIGN]: [],
  // kicking back to /home
  // [ROUTES.TOKEN_DETAILS]: [],
  // dev only not supporting
  // [ROUTES.WALLETS]: [],
  [ROUTES.WALLET_SWITCHER]: [ROUTES.WALLET_SWITCHER],
};

export default function useRestoreNavigation() {
  const navigate = useRainbowNavigate();
  const { setShouldRestoreNavigation, shouldRestoreNavigation, lastPage } =
    useNavRestorationStore();
  const restoreNavigation = async () => {
    if (lastPage && shouldRestoreNavigation) {
      await setShouldRestoreNavigation(false);
      if (RESTORE_NAV_MAP[lastPage]) {
        const navPath = RESTORE_NAV_MAP[lastPage];
        for (const screen of navPath) {
          navigate(screen);
        }
      }
    }
  };

  useEffect(() => {
    restoreNavigation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
