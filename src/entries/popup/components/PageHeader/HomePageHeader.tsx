import * as React from 'react';
import { Link } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { Box, Inline, Inset, Row, Rows, Stack, Text } from '~/design-system';

import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import {
  Menu,
  MenuContent,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuSeparator,
  MenuTrigger,
} from '../Menu/Menu';
import { SFSymbol, Symbols } from '../SFSymbol/SFSymbol';
import {
  SwitchNetworkMenuDisconnect,
  SwitchNetworkMenuSelector,
} from '../SwitchMenu/SwitchNetworkMenu';

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
  const [url, setUrl] = React.useState('');
  const { host, appLogo } = useAppMetadata({ url });
  const { updateAppSessionChainId, disconnectAppSession, appSession } =
    useAppSession({ host });

  chrome?.tabs?.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    const url = tabs[0].url;
    if (url) {
      setUrl(url);
    }
  });

  const changeChainId = React.useCallback(
    (chainId: string) => {
      updateAppSessionChainId(Number(chainId));
    },
    [updateAppSessionChainId],
  );

  const disconnect = React.useCallback(() => {
    disconnectAppSession();
  }, [disconnectAppSession]);
  console.log('--- appSession', appSession);
  return (
    <Menu>
      <MenuTrigger asChild>
        <Box
          position="relative"
          style={{
            cursor: 'pointer',
          }}
          id="home-page-header-left"
        >
          {children}
        </Box>
      </MenuTrigger>
      <MenuContent>
        <Inset top="8px" bottom="12px">
          <Inline alignHorizontal="justify" alignVertical="center" space="8px">
            <Inline space="8px" alignVertical="center">
              <Box
                style={{
                  height: 14,
                  width: 14,
                  borderRadius: 3.5,
                  overflow: 'hidden',
                }}
              >
                <img src={appLogo} width="100%" height="100%" />
              </Box>
              <Box
                id={`home-page-header-host-${
                  appSession ? host : 'not-connected'
                }`}
              >
                <Rows space="8px">
                  <Row>
                    <Text size="14pt" weight="bold">
                      {host}
                    </Text>
                  </Row>
                  {!appSession && (
                    <Row>
                      <Text size="11pt" weight="bold">
                        {i18n.t('menu.home_header_left.not_connected')}
                      </Text>
                    </Row>
                  )}
                </Rows>
              </Box>
            </Inline>
            <SFSymbol
              size={6}
              color={appSession ? 'green' : undefined}
              symbol="circleFill"
            />
          </Inline>
        </Inset>

        <Stack space="4px">
          {appSession ? (
            <>
              <Stack space="12px">
                <MenuSeparator />
                <Text color="label" size="14pt" weight="semibold">
                  {i18n.t('menu.home_header_left.networks')}
                </Text>
              </Stack>

              <Box>
                <MenuRadioGroup
                  value={`${appSession?.chainId}`}
                  onValueChange={changeChainId}
                >
                  <SwitchNetworkMenuSelector />
                </MenuRadioGroup>
                <SwitchNetworkMenuDisconnect onDisconnect={disconnect} />
              </Box>
            </>
          ) : null}

          <Stack space="4px">
            <MenuSeparator />

            <Inset vertical="8px">
              <Link id="home-page-header-connected-apps" to={'/connected'}>
                <Inline alignVertical="center" space="8px">
                  <Box style={{ width: 18, height: 18 }}>
                    <Inline
                      height="full"
                      alignVertical="center"
                      alignHorizontal="center"
                    >
                      <SFSymbol size={14} symbol="squareOnSquareDashed" />
                    </Inline>
                  </Box>
                  <Text size="14pt" weight="bold">
                    {i18n.t('menu.home_header_left.all_connected_apps')}
                  </Text>
                </Inline>
              </Link>
            </Inset>
          </Stack>
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
        <HeaderLeftMenu>
          <HeaderActionButton symbol={leftSymbol} />
        </HeaderLeftMenu>

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
