import * as React from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box, Inline, Inset, Stack, Symbol, Text } from '~/design-system';

import {
  Menu,
  MenuContent,
  MenuSeparator,
  MenuTrigger,
} from '../../components/Menu/Menu';

export const MoreMenu = ({ children }: { children: React.ReactNode }) => {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address });

  const openProfile = React.useCallback(() => {
    chrome.tabs.create({
      url: `https://rainbow.me/${ensName ?? address}`,
    });
  }, [address, ensName]);

  return (
    <Menu>
      <MenuTrigger asChild>
        <Box position="relative" id="home-page-header-right">
          {children}
        </Box>
      </MenuTrigger>
      <MenuContent>
        <Stack space="4px">
          <Stack>
            <Inset vertical="8px">
              <Link to={'/settings'} id="settings-link">
                <Inline alignVertical="center" space="8px">
                  <Symbol size={12} symbol="gearshape.fill" weight="semibold" />
                  <Text size="14pt" weight="semibold">
                    {i18n.t('menu.home_header_right.settings')}
                  </Text>
                </Inline>
              </Link>
            </Inset>
            <Inset vertical="8px">
              <Inline alignVertical="center" space="8px">
                <Symbol size={12} symbol="qrcode" weight="semibold" />
                <Text size="14pt" weight="semibold">
                  {i18n.t('menu.home_header_right.qr_code')}
                </Text>
              </Inline>
            </Inset>
          </Stack>
          <Stack space="4px">
            <MenuSeparator />
            <Box>
              <Box width="full" as="button" onClick={openProfile}>
                <Inset vertical="8px">
                  <Inline alignVertical="center" alignHorizontal="justify">
                    <Inline alignVertical="center" space="8px">
                      <Symbol
                        size={12}
                        symbol="person.crop.circle.fill"
                        weight="semibold"
                      />
                      <Text size="14pt" weight="semibold">
                        {i18n.t('menu.home_header_right.rainbow_profile')}
                      </Text>
                    </Inline>
                    <Symbol
                      size={12}
                      symbol="arrow.up.forward.circle"
                      weight="semibold"
                      color="labelTertiary"
                    />
                  </Inline>
                </Inset>
              </Box>
            </Box>
          </Stack>
        </Stack>
      </MenuContent>
    </Menu>
  );
};
