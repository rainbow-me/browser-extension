/* eslint-disable no-nested-ternary */
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import {
  Box,
  Column,
  Columns,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';

import { ChevronRight } from '../../components/ChevronRight';
import { FullScreenContainerWithNavbar } from '../../components/FullScreen/FullScreenContainerWithNavbar';

export function ImportOrConnect() {
  const navigate = useNavigate();

  const navigateTo = useCallback(
    (route: string) => {
      navigate(route);
    },
    [navigate],
  );

  return (
    <FullScreenContainerWithNavbar>
      <Box alignItems="center" paddingBottom="10px">
        <Inline
          wrap={false}
          alignVertical="center"
          alignHorizontal="center"
          space="5px"
        >
          <Symbol
            symbol="doc.plaintext"
            size={16}
            color="transparent"
            weight={'bold'}
          />
          <Text size="16pt" weight="bold" color="label" align="center">
            {i18n.t('import_or_connect.title')}
          </Text>
        </Inline>
        <Box padding="16px" paddingTop="10px">
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
        <Box
          background="surfaceSecondaryElevated"
          borderRadius="16px"
          paddingVertical="24px"
          paddingHorizontal="20px"
          borderColor={'separatorSecondary'}
          borderWidth={'1px'}
        >
          <Box
            width="full"
            paddingBottom="20px"
            onClick={() => navigateTo('/import')}
          >
            <Columns alignHorizontal="center" alignVertical="center">
              <Column>
                <Symbol
                  weight="bold"
                  symbol="lock.rotation"
                  size={20}
                  color="purple"
                />
                <Box paddingTop="14px">
                  <Stack space="14px">
                    <Text size="16pt" weight="bold" color="label">
                      {i18n.t('import_or_connect.import_wallet')}
                    </Text>
                    <Text size="14pt" weight="regular" color="labelTertiary">
                      {i18n.t('import_or_connect.import_wallet_description')}
                    </Text>
                  </Stack>
                </Box>
              </Column>
              <Column width="content">
                <ChevronRight color="separatorSecondary" />
              </Column>
            </Columns>
          </Box>
          <Separator color="separatorTertiary" strokeWeight="1px" />
          <Box
            paddingBottom="20px"
            paddingTop="20px"
            onClick={() => navigateTo('/connect')}
          >
            <Columns alignHorizontal="center" alignVertical="center">
              <Column>
                <Symbol
                  weight="bold"
                  symbol="doc.text.magnifyingglass"
                  size={20}
                  color="accent"
                />
                <Box paddingTop="14px">
                  <Stack space="14px">
                    <Text size="16pt" weight="bold" color="label">
                      {i18n.t('import_or_connect.connect_wallet')}
                    </Text>
                    <Text size="14pt" weight="regular" color="labelTertiary">
                      {i18n.t('import_or_connect.connect_wallet_description')}
                    </Text>
                  </Stack>
                </Box>
              </Column>
              <Column width="content">
                <ChevronRight color="separatorSecondary" />
              </Column>
            </Columns>
          </Box>
          <Separator color="separatorTertiary" strokeWeight="1px" />
          <Box paddingTop="20px" onClick={() => navigateTo('/watch')}>
            <Columns alignHorizontal="center" alignVertical="center">
              <Column>
                <Symbol
                  weight="bold"
                  symbol="magnifyingglass.circle"
                  size={20}
                  color="green"
                />
                <Box paddingTop="14px">
                  <Stack space="14px">
                    <Text size="16pt" weight="bold" color="label">
                      {i18n.t('import_or_connect.watch_address')}
                    </Text>
                    <Text size="14pt" weight="regular" color="labelTertiary">
                      {i18n.t('import_or_connect.watch_address_description')}
                    </Text>
                  </Stack>
                </Box>
              </Column>
              <Column width="content">
                <ChevronRight color="separatorSecondary" />
              </Column>
            </Columns>
          </Box>
        </Box>
      </Box>

      <Box width="full" paddingTop="80px" paddingBottom="60px"></Box>
    </FullScreenContainerWithNavbar>
  );
}
