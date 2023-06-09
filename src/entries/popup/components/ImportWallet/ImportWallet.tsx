/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect } from 'react';
import { NavigateOptions } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { Box, Separator, Stack, Text } from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { OnboardMenu } from '../../components/OnboardMenu/OnboardMenu';
import { removeImportWalletSecrets } from '../../handlers/importWalletSecrets';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function ImportWallet({ onboarding }: { onboarding?: boolean }) {
  const navigate = useRainbowNavigate();

  const navigateTo = useCallback(
    (route: string, options?: NavigateOptions) => {
      navigate(route, options);
    },
    [navigate],
  );

  const onImportWalletViaSeed = useCallback(
    () => navigateTo(ROUTES.IMPORT__SEED, { state: { onboarding } }),
    [navigateTo, onboarding],
  );

  const onImportWalletViaPrivateKey = useCallback(
    () => navigateTo(ROUTES.IMPORT__PRIVATE_KEY, { state: { onboarding } }),
    [navigateTo, onboarding],
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
              {i18n.t('import_wallet_via_secret.title')}
            </Text>
            <Box paddingHorizontal="15px">
              <Text
                size="12pt"
                weight="regular"
                color="labelTertiary"
                align="center"
              >
                {i18n.t('import_wallet_via_secret.explanation')}
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
              onKeyDown={onImportWalletViaSeed}
              borderRadius="16px"
              marginHorizontal="-20px"
              paddingHorizontal="20px"
            >
              <OnboardMenu.Item
                onClick={onImportWalletViaSeed}
                title={i18n.t('import_wallet_via_secret.seed_phrase')}
                subtitle={i18n.t('import_wallet_via_secret.seed_phrase_desc')}
                symbol="ellipsis.rectangle"
                symbolColor="pink"
                testId="import-wallet-option"
              />
            </Lens>

            <OnboardMenu.Separator />
            <Lens
              onKeyDown={onImportWalletViaPrivateKey}
              borderRadius="16px"
              marginHorizontal="-20px"
              paddingHorizontal="20px"
            >
              <OnboardMenu.Item
                onClick={onImportWalletViaPrivateKey}
                title={i18n.t('import_wallet_via_secret.private_key')}
                subtitle={i18n.t('import_wallet_via_secret.private_key_desc')}
                symbol="key.fill"
                symbolColor="orange"
                testId="connect-wallet-option"
              />
            </Lens>
          </OnboardMenu>
        </Box>
      </Stack>
    </FullScreenContainer>
  );
}
