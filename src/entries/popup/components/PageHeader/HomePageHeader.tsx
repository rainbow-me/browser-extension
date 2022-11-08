import * as React from 'react';

import { getConnectedAppIcon } from '~/core/utils/connectedApps';
import { Box, Inline, Inset, Row, Rows, Stack, Text } from '~/design-system';

import {
  Menu,
  MenuContent,
  MenuItemIndicator,
  MenuSeparator,
  MenuTrigger,
} from '../Menu/Menu';
import { SFSymbol, Symbols } from '../SFSymbol/SFSymbol';

interface HomePageHeaderProps {
  title: string;
  leftSymbol: Symbols;
  rightSymbol: Symbols;
  mainPage?: boolean;
}

const HeaderActionButton = ({ symbol }: { symbol: Symbols }) => {
  return (
    <Box
      style={{
        height: '32px',
        width: '32px',
      }}
      background="surfaceSecondaryElevated"
      borderRadius="round"
      boxShadow="30px accent"
      borderColor="buttonStroke"
      borderWidth="1px"
    >
      <Inline
        space="4px"
        height="full"
        alignHorizontal="center"
        alignVertical="center"
      >
        <Inline alignHorizontal="center" alignVertical="center">
          <SFSymbol symbol={symbol} size={14} />
        </Inline>
      </Inline>
    </Box>
  );
};

const HeaderLeftMenu = ({ children }: { children: React.ReactNode }) => {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Box>{children}</Box>
      </MenuTrigger>
      <MenuContent>
        <Inset top="8px" bottom="12px">
          <Inline alignHorizontal="justify" alignVertical="center" space="8px">
            <Inline space="8px" alignVertical="center">
              <Box
                style={{
                  height: 14,
                  width: 14,
                }}
              >
                <img
                  src={getConnectedAppIcon('uniswap.org')}
                  width="100%"
                  height="100%"
                />
              </Box>
              <Box>
                <Rows space="8px">
                  <Row>
                    <Text size="14pt" weight="bold">
                      Page
                    </Text>
                  </Row>
                  <Row>
                    <Text size="11pt" weight="bold">
                      Not connected
                    </Text>
                  </Row>
                </Rows>
              </Box>
            </Inline>
            <SFSymbol size={6} symbol="circleFill" />
          </Inline>
        </Inset>

        <Stack space="4px">
          <MenuSeparator />
          <Inset top="8px" bottom="8px">
            <Inline alignVertical="center" space="8px">
              <SFSymbol size={12} symbol="squareOnSquareDashed" />
              <Text size="14pt" weight="bold">
                All connected apps
              </Text>
            </Inline>
          </Inset>
        </Stack>

        <MenuItemIndicator style={{ marginLeft: 'auto' }}>o</MenuItemIndicator>
      </MenuContent>
    </Menu>
  );
};

const HeaderRighttMenu = ({ children }: { children: React.ReactNode }) => {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Box>{children}</Box>
      </MenuTrigger>
      <MenuContent>
        <Stack space="4px">
          <Inset top="8px" bottom="8px">
            <Inline alignVertical="center" space="8px">
              <SFSymbol size={12} symbol="gearshapeFill" />
              <Text size="14pt" weight="bold">
                Settings
              </Text>
            </Inline>
          </Inset>
          <Inset top="8px" bottom="8px">
            <Inline alignVertical="center" space="8px">
              <SFSymbol size={12} symbol="qrcode" />
              <Text size="14pt" weight="bold">
                My QR Code
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
                  Rainbow Profile
                </Text>
              </Inline>
            </Inset>
            <Inset top="8px" bottom="8px">
              <Inline alignVertical="center" space="8px">
                <SFSymbol size={12} symbol="binocularsFill" />
                <Text size="14pt" weight="bold">
                  View on Explorer
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

export function HomePageHeader({
  title,
  leftSymbol,
  rightSymbol,
}: HomePageHeaderProps) {
  return (
    <Box
      style={{
        height: '62px',
      }}
      paddingHorizontal="10px"
    >
      <Inline alignVertical="center" height="full" alignHorizontal="justify">
        {/* <Link id="page-header-left-action" to={leftRoute || ''}> */}
        {/*  */}
        <Box as="button">
          <HeaderLeftMenu>
            <HeaderActionButton symbol={leftSymbol} />
          </HeaderLeftMenu>
        </Box>
        {/* </Link> */}

        <Box>
          <Text size="14pt" weight="heavy">
            {title}
          </Text>
        </Box>

        <HeaderRighttMenu>
          <HeaderActionButton symbol={rightSymbol} />
        </HeaderRighttMenu>
      </Inline>
    </Box>
  );
}
