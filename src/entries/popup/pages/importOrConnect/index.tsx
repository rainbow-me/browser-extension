/* eslint-disable no-nested-ternary */
import React, { useCallback } from 'react';

import { i18n } from '~/core/languages';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { Box, Separator, Stack, Text } from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { OnboardMenu } from '../../components/OnboardMenu/OnboardMenu';
import { useAlert } from '../../hooks/useAlert';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function ImportOrConnect() {
  const navigate = useRainbowNavigate();
  const { triggerAlert } = useAlert();
  const { featureFlags } = useFeatureFlagsStore();

  const navigateTo = useCallback(
    (route: string) => {
      navigate(route);
    },
    [navigate],
  );

  const onImportWalletClick = useCallback(
    () => navigateTo(ROUTES.IMPORT),
    [navigateTo],
  );

  const onConnectHardwareWallet = useCallback(() => {
    featureFlags.hw_wallets_enabled
      ? navigateTo(ROUTES.HW_CHOOSE)
      : triggerAlert({ text: i18n.t('alert.coming_soon') });
  }, [featureFlags.hw_wallets_enabled, navigateTo, triggerAlert]);

  const onWatchEthereumAddress = useCallback(
    () => navigateTo(ROUTES.WATCH),
    [navigateTo],
  );

  return (
    <FullScreenContainer>
      <Stack space="24px" alignHorizontal="center">
        <Box alignItems="center">
          <Stack space="12px">
            <Text size="16pt" weight="bold" color="label" align="center">
              {i18n.t('import_or_connect.title')}
            </Text>
            <Box paddingHorizontal="15px">
              <Text
                size="12pt"
                weight="regular"
                color="labelTertiary"
                align="center"
              >
                {i18n.t('import_or_connect.explanation')}
              </Text>
            </Box>
          </Stack>
        </Box>
        <Box alignItems="center" width="full" style={{ width: '106px' }}>
          <Separator color="separatorTertiary" strokeWeight="1px" />
        </Box>
        <Box>
          <OnboardMenu>
            <Lens
              onKeyDown={onImportWalletClick}
              borderRadius="16px"
              marginHorizontal="-20px"
              paddingHorizontal="20px"
            >
              <OnboardMenu.Item
                onClick={onImportWalletClick}
                title={i18n.t('import_or_connect.import_wallet')}
                subtitle={i18n.t('import_or_connect.import_wallet_description')}
                symbol="lock.rotation"
                symbolColor="purple"
                testId="import-wallet-option"
              />
            </Lens>

            <OnboardMenu.Separator />
            <Lens
              onKeyDown={onConnectHardwareWallet}
              borderRadius="16px"
              marginHorizontal="-20px"
              paddingHorizontal="20px"
            >
              <OnboardMenu.Item
                onClick={onConnectHardwareWallet}
                title={i18n.t('import_or_connect.connect_wallet')}
                subtitle={i18n.t(
                  'import_or_connect.connect_wallet_description',
                )}
                symbol="doc.text.magnifyingglass"
                symbolColor="blue"
                testId="connect-wallet-option"
              />
            </Lens>

            <OnboardMenu.Separator />
            <Lens
              onKeyDown={onWatchEthereumAddress}
              borderRadius="16px"
              marginHorizontal="-20px"
              paddingHorizontal="20px"
            >
              <OnboardMenu.Item
                onClick={onWatchEthereumAddress}
                title={i18n.t('import_or_connect.watch_address')}
                subtitle={i18n.t('import_or_connect.watch_address_description')}
                symbol="magnifyingglass.circle"
                symbolColor="green"
                testId="watch-wallet-option"
              />
            </Lens>
          </OnboardMenu>
        </Box>
      </Stack>
    </FullScreenContainer>
  );
}
