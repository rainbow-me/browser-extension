import * as React from 'react';
import { Link } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { Box, Inline, Inset, Stack, Text } from '~/design-system';

import {
  Menu,
  MenuContent,
  MenuItemIndicator,
  MenuSeparator,
  MenuTrigger,
} from '../../components/Menu/Menu';
import { SFSymbol } from '../../components/SFSymbol/SFSymbol';

export const MoreMenu = ({ children }: { children: React.ReactNode }) => {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Box
          position="relative"
          style={{
            cursor: 'pointer',
          }}
        >
          {children}
        </Box>
      </MenuTrigger>
      <MenuContent>
        <Stack space="4px">
          <Inset top="8px" bottom="8px">
            <Link to={'/settings'}>
              <Inline alignVertical="center" space="8px">
                <SFSymbol size={12} symbol="gearshapeFill" />
                <Text size="14pt" weight="bold">
                  {i18n.t('menu.home_header_right.settings')}
                </Text>
              </Inline>
            </Link>
          </Inset>
          <Inset top="8px" bottom="8px">
            <Inline alignVertical="center" space="8px">
              <SFSymbol size={12} symbol="qrcode" />
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
                <SFSymbol size={12} symbol="personCropCircleFill" />
                <Text size="14pt" weight="bold">
                  {i18n.t('menu.home_header_right.rainbow_profile')}
                </Text>
              </Inline>
            </Inset>
            <Inset top="8px" bottom="8px">
              <Inline alignVertical="center" space="8px">
                <SFSymbol size={12} symbol="binocularsFill" />
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
