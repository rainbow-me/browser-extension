import React, { useCallback } from 'react';

import { i18n } from '~/core/languages';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { Box } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/util';

import { OnboardMenu } from '../../components/OnboardMenu/OnboardMenu';
import { removeImportWalletSecrets } from '../../handlers/importWalletSecrets';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

const AddWallet = () => {
  const navigate = useRainbowNavigate();
  const { featureFlags } = useFeatureFlagsStore();

  const handleCreateWallet = useCallback(async () => {
    navigate(ROUTES.CHOOSE_WALLET_GROUP);
  }, [navigate]);

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
            onClick={handleCreateWallet}
            title={i18n.t('add_wallet.create_wallet')}
            subtitle={i18n.t('add_wallet.create_wallet_description')}
            symbolColor="pink"
            symbol="plus.circle"
            testId={'create-wallets-button'}
          />
          <OnboardMenu.Separator />
          <OnboardMenu.Item
            onClick={() =>
              navigate(ROUTES.NEW_IMPORT_WALLET, {
                state: {
                  onBack: () => removeImportWalletSecrets(),
                },
              })
            }
            title={i18n.t('add_wallet.import_wallet')}
            subtitle={i18n.t('add_wallet.import_wallet_description')}
            symbolColor="purple"
            symbol="lock.rotation"
            testId={'import-wallets-button'}
          />
          <OnboardMenu.Separator />
          <OnboardMenu.Item
            onClick={() =>
              featureFlags.hw_wallets_enabled
                ? navigate(ROUTES.HW_CHOOSE)
                : triggerAlert({ text: i18n.t('alert.coming_soon') })
            }
            title={i18n.t('add_wallet.hardware_wallet')}
            subtitle={i18n.t('add_wallet.hardware_wallet_description')}
            symbolColor="blue"
            symbol="doc.text.magnifyingglass"
            testId={'hardware-wallets-button'}
          />
          <OnboardMenu.Separator />
          <OnboardMenu.Item
            onClick={() => navigate(ROUTES.NEW_WATCH_WALLET)}
            title={i18n.t('add_wallet.watch_address')}
            subtitle={i18n.t('add_wallet.watch_address_description')}
            symbolColor="green"
            symbol="magnifyingglass.circle"
            testId={'watch-wallets-button'}
          />
        </OnboardMenu>
      </Box>
    </Box>
  );
};

export { AddWallet };
