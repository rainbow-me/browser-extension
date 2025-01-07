/* eslint-disable no-nested-ternary */
import { useCallback } from 'react';

import { i18n } from '~/core/languages';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { Box } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';

import { OnboardMenu } from '../../components/OnboardMenu/OnboardMenu';
import { removeImportWalletSecrets } from '../../handlers/importWalletSecrets';
import { useBrowser } from '../../hooks/useBrowser';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

const AddWallet = () => {
  const navigate = useRainbowNavigate();
  const { isFirefox } = useBrowser();
  const { featureFlags } = useFeatureFlagsStore();

  const handleCreateWallet = useCallback(async () => {
    navigate(ROUTES.CHOOSE_WALLET_GROUP, {
      state: { goHomeOnWalletCreation: true },
    });
  }, [navigate]);

  const onImportWallet = () => {
    navigate(ROUTES.NEW_IMPORT_WALLET, {
      state: {
        // Force isBack to false because the onBack function otherwise
        // causes this to be interpreted as a backward navigation
        isBack: false,
        onBack: () => removeImportWalletSecrets(),
      },
    });
  };

  const onAddHardwareWallet = () => {
    if (featureFlags.hw_wallets_enabled) {
      triggerAlert({ text: i18n.t('alert.coming_soon') });
      return;
    }
    if (isFirefox) {
      triggerAlert({ text: i18n.t('alert.no_hw_ff') });
      return;
    }
    navigate(ROUTES.HW_CHOOSE);
  };

  const onWatchWallet = () => {
    navigate(ROUTES.NEW_WATCH_WALLET);
  };

  return (
    <Box height="full">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        paddingHorizontal="20px"
        paddingBottom="20px"
        height="full"
      >
        <OnboardMenu>
          <OnboardMenu.Item
            first
            onClick={handleCreateWallet}
            title={i18n.t('add_wallet.create_wallet')}
            subtitle={i18n.t('add_wallet.create_wallet_description')}
            symbolColor="pink"
            symbol="plus.circle"
            testId={'create-wallets-button'}
          />
          <OnboardMenu.Separator />
          <OnboardMenu.Item
            onClick={onImportWallet}
            title={i18n.t('add_wallet.import_wallet')}
            subtitle={i18n.t('add_wallet.import_wallet_description')}
            symbolColor="purple"
            symbol="lock.rotation"
            testId={'import-wallets-button'}
          />
          <OnboardMenu.Separator />
          <OnboardMenu.Item
            onClick={onAddHardwareWallet}
            title={i18n.t('add_wallet.hardware_wallet')}
            subtitle={i18n.t('add_wallet.hardware_wallet_description')}
            symbolColor="blue"
            symbol="doc.text.magnifyingglass"
            testId={'hardware-wallets-button'}
          />
          <OnboardMenu.Separator />
          <OnboardMenu.Item
            onClick={onWatchWallet}
            title={i18n.t('add_wallet.watch_address')}
            subtitle={i18n.t('add_wallet.watch_address_description')}
            symbolColor="green"
            symbol="magnifyingglass.circle"
            testId={'watch-wallets-button'}
            last
          />
        </OnboardMenu>
      </Box>
    </Box>
  );
};

export { AddWallet };
