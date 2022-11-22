import * as React from 'react';
import { Link } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { Box, Inline, Inset, Stack, Symbol, Text } from '~/design-system';

import {
  Menu,
  MenuContent,
  MenuItemIndicator,
  MenuSeparator,
  MenuTrigger,
} from '../../components/Menu/Menu';

export const MoreMenu = ({ children }: { children: React.ReactNode }) => {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Box position="relative">{children}</Box>
      </MenuTrigger>
      <MenuContent>
        <Stack space="4px">
          <Inset top="8px" bottom="8px">
            <Link to={'/settings'}>
              <Inline alignVertical="center" space="8px">
                <Symbol size={12} symbol="gearshape.fill" weight="semibold" />
                <Text size="14pt" weight="bold">
                  {i18n.t('menu.home_header_right.settings')}
                </Text>
              </Inline>
            </Link>
          </Inset>
          <Inset top="8px" bottom="8px">
            <Inline alignVertical="center" space="8px">
              <Symbol size={12} symbol="qrcode" weight="semibold" />
              <Text size="14pt" weight="bold">
                {i18n.t('menu.home_header_right.qr_code')}
              </Text>
            </Inline>
          </Inset>
        </Stack>
        <Stack space="4px">
          <MenuSeparator />
          <Box>
            <Inset top="8px" bottom="8px">
              <Inline alignVertical="center" space="8px">
                <Symbol
                  size={12}
                  symbol="person.crop.circle.fill"
                  weight="semibold"
                />
                <Text size="14pt" weight="bold">
                  {i18n.t('menu.home_header_right.rainbow_profile')}
                </Text>
              </Inline>
            </Inset>
            <Inset top="8px" bottom="8px">
              <Inline alignVertical="center" space="8px">
                <Symbol size={12} symbol="binoculars.fill" weight="semibold" />
                <Text size="14pt" weight="bold">
                  {i18n.t('menu.home_header_right.view_on_explorer')}
                </Text>
              </Inline>
            </Inset>
          </Box>
        </Stack>

        <MenuItemIndicator style={{ marginLeft: 'auto' }}>o</MenuItemIndicator>
      </MenuContent>
    </Menu>
  );
};
