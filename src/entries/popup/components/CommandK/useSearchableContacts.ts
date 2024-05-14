import { useCallback, useMemo } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
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

import { ContactSearchItem, SearchItemType } from './SearchItems';
import { PAGES } from './pageConfig';
import { actionLabels } from './references';
import { truncateName } from './useSearchableWallets';

interface UseSearchableContactsParameters {
  showLabel: boolean;
}

export const useSearchableContacts = ({
  showLabel,
}: UseSearchableContactsParameters) => {
  const contacts = useContacts();
  const { isWatchingWallet } = useWallets();
  const { featureFlags } = useFeatureFlagsStore();
  const navigate = useRainbowNavigate();

  const isFullScreen = useIsFullScreen();

  const { type, vendor } = useCurrentWalletTypeAndVendor();

  const { currentAddress } = useCurrentAddressStore();

  const isTrezor =
    type === KeychainType.HardwareWalletKeychain && vendor === 'Trezor';

  const allowSend = !isWatchingWallet || featureFlags.full_watching_wallets;

  // Trezor should always be in a new tab
  const shouldNavigateToSend = !(isTrezor && !isFullScreen) && allowSend;

  const handleSendFallback = useCallback(
    (address: Address) => {
      if (!allowSend) {
        triggerAlert({ text: i18n.t('alert.wallet_watching_mode') });
        return;
      }

      // Trezor needs to be opened in a new tab because of their own popup
      if (isTrezor && !isFullScreen) {
        goToNewTab({
          url: POPUP_URL + `#${ROUTES.SEND}?hideBack=true&to=${address}`,
        });
      }
    },
    [allowSend, isTrezor, isFullScreen],
  );

  const handleSelectAddress = useCallback(
    (address: Address) => {
      if (shouldNavigateToSend) {
        navigate(`${ROUTES.SEND}?to=${address}`);
      } else {
        handleSendFallback(address);
      }
    },
    [shouldNavigateToSend, handleSendFallback, navigate],
  );

  const searchableContacts = useMemo(() => {
    return contacts.map<ContactSearchItem>((account) => {
      const hideAction = isWatchingWallet || currentAddress === account.address;

      return {
        action: !hideAction
          ? () => handleSelectAddress(account.address)
          : undefined,
        actionLabel: !hideAction
          ? actionLabels.sendToWallet
          : actionLabels.view,
        toPage: hideAction ? PAGES.CONTACT_DETAIL : undefined,
        actionPage: !hideAction ? PAGES.CONTACT_DETAIL : undefined,
        address: account.address,
        ensName: account.ensName,
        id: `contact-${account.address}`,
        walletName: account.name,
        name:
          account.name || account.ensName || truncateAddress(account.address),
        page: PAGES.MY_CONTACTS,
        truncatedName: truncateName(account.name || account.ensName),
        label: showLabel ? 'contact' : undefined,
        type: SearchItemType.Contact,
      };
    });
  }, [
    contacts,
    isWatchingWallet,
    currentAddress,
    showLabel,
    handleSelectAddress,
  ]);

  return { searchableContacts };
};
