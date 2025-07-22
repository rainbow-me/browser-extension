/* eslint-disable no-nested-ternary */
import { useCallback, useEffect } from 'react';
import { NavigateOptions } from 'react-router-dom';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { Box, Separator, Stack, Text } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { OnboardMenu } from '../../components/OnboardMenu/OnboardMenu';
import { removeImportWalletSecrets } from '../../handlers/importWalletSecrets';
import { useBrowser } from '../../hooks/useBrowser';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function ImportOrConnect() {
  const navigate = useRainbowNavigate();
  const { isFirefox } = useBrowser();

  const navigateTo = useCallback(
    (route: string, options?: NavigateOptions) => {
      navigate(route, options);
    },
    [navigate],
  );

  const onImportWalletClick = useCallback(
    () => navigateTo(ROUTES.IMPORT),
    [navigateTo],
  );

  const onConnectHardwareWallet = useCallback(() => {
    config.hw_wallets_enabled
      ? isFirefox
        ? triggerAlert({ text: i18n.t('alert.no_hw_ff') })
        : navigateTo(ROUTES.HW_CHOOSE, {
            state: { direction: 'right', navbarIcon: 'arrow' },
          })
      : triggerAlert({ text: i18n.t('alert.coming_soon') });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.hw_wallets_enabled, isFirefox, navigateTo]);

  const onWatchEthereumAddress = useCallback(
    () => navigateTo(ROUTES.WATCH),
    [navigateTo],
  );
  useEffect(() => {
    // clear secrets if the user backs out of flow entirely
    removeImportWalletSecrets();
  }, []);

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
            <OnboardMenu.Item
              first
              onClick={onImportWalletClick}
              title={i18n.t('import_or_connect.import_wallet')}
              subtitle={i18n.t('import_or_connect.import_wallet_description')}
              symbol="lock.rotation"
              symbolColor="purple"
              testId="import-wallet-option"
            />
            <OnboardMenu.Separator />
            <OnboardMenu.Item
              onClick={onConnectHardwareWallet}
              title={i18n.t('import_or_connect.connect_wallet')}
              subtitle={i18n.t('import_or_connect.connect_wallet_description')}
              symbol="doc.text.magnifyingglass"
              symbolColor="blue"
              testId="connect-wallet-option"
            />

            <OnboardMenu.Separator />
            <OnboardMenu.Item
              onClick={onWatchEthereumAddress}
              title={i18n.t('import_or_connect.watch_address')}
              subtitle={i18n.t('import_or_connect.watch_address_description')}
              symbol="magnifyingglass.circle"
              symbolColor="green"
              testId="watch-wallet-option"
              last
            />
          </OnboardMenu>
        </Box>
      </Stack>
    </FullScreenContainer>
  );
}
