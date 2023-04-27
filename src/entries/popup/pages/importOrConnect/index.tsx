/* eslint-disable no-nested-ternary */
import React, { useCallback } from 'react';

import { i18n } from '~/core/languages';
import { Box, Separator, Text } from '~/design-system';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { OnboardMenu } from '../../components/OnboardMenu/OnboardMenu';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function ImportOrConnect() {
  const navigate = useRainbowNavigate();

  const navigateTo = useCallback(
    (route: string) => {
      navigate(route);
    },
    [navigate],
  );

  return (
    <FullScreenContainer>
      <Box alignItems="center" paddingBottom="10px">
        <Text size="16pt" weight="bold" color="label" align="center">
          {i18n.t('import_or_connect.title')}
        </Text>
        <Box padding="16px" paddingTop="12px">
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {i18n.t('import_or_connect.explanation')}
          </Text>
        </Box>
      </Box>
      <Box width="full" style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Box paddingTop="24px">
        <OnboardMenu>
          <OnboardMenu.Item
            onClick={() => navigateTo(ROUTES.IMPORT)}
            title={i18n.t('import_or_connect.import_wallet')}
            subtitle={i18n.t('import_or_connect.import_wallet_description')}
            symbol="lock.rotation"
            symbolColor="purple"
            testId="import-wallet-option"
          />
          <OnboardMenu.Separator />
          <OnboardMenu.Item
            onClick={() => alert('coming soon!')}
            title={i18n.t('import_or_connect.connect_wallet')}
            subtitle={i18n.t('import_or_connect.connect_wallet_description')}
            symbol="doc.text.magnifyingglass"
            symbolColor="blue"
            testId="connect-wallet-option"
          />
          <OnboardMenu.Separator />
          <OnboardMenu.Item
            onClick={() => navigateTo(ROUTES.WATCH)}
            title={i18n.t('import_or_connect.watch_address')}
            subtitle={i18n.t('import_or_connect.watch_address_description')}
            symbol="magnifyingglass.circle"
            symbolColor="green"
            testId="watch-wallet-option"
          />
        </OnboardMenu>
      </Box>
    </FullScreenContainer>
  );
}
