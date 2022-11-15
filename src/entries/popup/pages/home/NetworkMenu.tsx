import * as React from 'react';
import { Link } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { Box, Inline, Inset, Row, Rows, Stack, Text } from '~/design-system';

import {
  Menu,
  MenuContent,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuSeparator,
  MenuTrigger,
} from '../../components/Menu/Menu';
import { SFSymbol } from '../../components/SFSymbol/SFSymbol';
import {
  SwitchNetworkMenuDisconnect,
  SwitchNetworkMenuSelector,
} from '../../components/SwitchMenu/SwitchNetworkMenu';
import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';

export const NetworkMenu = ({ children }: { children: React.ReactNode }) => {
  const [url, setUrl] = React.useState('');
  const { appHost, appLogo } = useAppMetadata({ url });
  const { updateAppSessionChainId, disconnectAppSession, appSession } =
    useAppSession({ host: appHost });

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
                  appSession ? appHost : 'not-connected'
                }`}
              >
                <Rows space="8px">
                  <Row>
                    <Text size="14pt" weight="bold">
                      {appHost}
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
