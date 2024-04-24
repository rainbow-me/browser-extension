import { useCallback, useMemo } from 'react';
import { Address } from 'wagmi';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { useContactsStore } from '~/core/state/contacts';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { KeychainType } from '~/core/types/keychainTypes';
import { truncateAddress } from '~/core/utils/address';
import { POPUP_URL, goToNewTab } from '~/core/utils/tabs';
import { triggerAlert } from '~/design-system/components/Alert/Alert';

import { useContacts } from '../../hooks/useContacts';
import { useCurrentWalletTypeAndVendor } from '../../hooks/useCurrentWalletType';
import { useIsFullScreen } from '../../hooks/useIsFullScreen';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWallets } from '../../hooks/useWallets';
import { ROUTES } from '../../urls';

import { SearchItemType, WalletSearchItem } from './SearchItems';
import { PAGES } from './pageConfig';
import { actionLabels } from './references';
import { truncateName } from './useSearchableWallets';

export const useContactSearchableWallets = (searchQuery: string) => {
  const contacts = useContacts();
  const { setSelectedContact } = useContactsStore();
  const { isWatchingWallet } = useWallets();
  const { featureFlags } = useFeatureFlagsStore();
  const navigate = useRainbowNavigate();

  const isFullScreen = useIsFullScreen();

  const { type, vendor } = useCurrentWalletTypeAndVendor();

  const isTrezor = useMemo(() => {
    return type === KeychainType.HardwareWalletKeychain && vendor === 'Trezor';
  }, [type, vendor]);

  const allowSend = useMemo(
    () => !isWatchingWallet || featureFlags.full_watching_wallets,
    [featureFlags.full_watching_wallets, isWatchingWallet],
  );

  const shouldNavigateToSend = useMemo(() => {
    // Trezor should always be in a new tab
    return !(isTrezor && !isFullScreen) && allowSend;
  }, [allowSend, isFullScreen, isTrezor]);

  const handleSendFallback = useCallback(
    (address: Address) => {
      if (!allowSend) {
        triggerAlert({ text: i18n.t('alert.wallet_watching_mode') });
        return;
      }

      // Trezor needs to be opened in a new tab because of their own popup
      if (isTrezor && !isFullScreen) {
        setSelectedContact({ address });
        goToNewTab({ url: POPUP_URL + `#${ROUTES.SEND}?hideBack=true` });
      }
    },
    [setSelectedContact, allowSend, isTrezor, isFullScreen],
  );

  const handleSelectAddress = useCallback(
    (address: Address) => {
      if (shouldNavigateToSend) {
        setSelectedContact({ address });
        navigate(ROUTES.SEND);
      } else {
        handleSendFallback(address);
      }
    },
    [handleSendFallback, navigate, setSelectedContact, shouldNavigateToSend],
  );

  const contactWallets = useMemo(() => {
    return contacts.map<WalletSearchItem>((account) => ({
      action: () => handleSelectAddress(account.address),
      actionLabel: actionLabels.sendToWallet,
      actionPage: PAGES.CONTACT_DETAIL,
      address: account.address,
      ensName: account.ensName,
      id: `contact-${account.address}`,
      walletName: account.name,
      name: account.name || account.ensName || truncateAddress(account.address),
      page: PAGES.MY_CONTACTS,
      truncatedName: truncateName(account.name || account.ensName),
      type: SearchItemType.Wallet,
    }));
  }, [contacts, handleSelectAddress]);

  return { contactWallets };
};
