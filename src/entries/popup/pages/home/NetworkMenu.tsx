import * as React from 'react';
import { Link } from 'react-router-dom';

import { i18n } from '~/core/languages';
import {
  Box,
  Inline,
  Inset,
  Row,
  Rows,
  Stack,
  Symbol,
  Text,
} from '~/design-system';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu';
import {
  SwitchNetworkMenuDisconnect,
  SwitchNetworkMenuSelector,
} from '../../components/SwitchMenu/SwitchNetworkMenu';
import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';

export const NetworkMenu = ({ children }: { children: React.ReactNode }) => {
  const [url, setUrl] = React.useState('');
  const { appHost, appLogo, appName } = useAppMetadata({ url });
  const { updateAppSessionChainId, disconnectAppSession, appSession } =
    useAppSession({ host: appHost });

  const changeChainId = React.useCallback(
    (chainId: string) => {
      updateAppSessionChainId(Number(chainId));
    },
    [updateAppSessionChainId],
  );

  const disconnect = React.useCallback(() => {
    disconnectAppSession();
  }, [disconnectAppSession]);

  React.useEffect(() => {
    chrome?.tabs?.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const url = tabs[0].url;
      try {
        if (url) {
          const urlObject = new URL(url ?? '');
          if (
            urlObject.protocol === 'http:' ||
            urlObject.protocol === 'https:'
          ) {
            setUrl(url);
          }
        }
      } catch (e) {
        //
      }
    });
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Box position="relative" id="home-page-header-left">
          {children}
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {url ? (
          <Inset top="8px" bottom="12px">
            <Inline
              alignHorizontal="justify"
              alignVertical="center"
              space="8px"
            >
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
                        {appName ?? appHost}
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
              <Symbol
                size={6}
                color={appSession ? 'green' : 'labelQuaternary'}
                symbol="circle.fill"
                weight="semibold"
              />
            </Inline>
          </Inset>
        ) : null}

        <Stack space="4px">
          {appSession ? (
            <>
              <Stack space="12px">
                <DropdownMenuSeparator />
                <Text color="label" size="14pt" weight="semibold">
                  {i18n.t('menu.home_header_left.networks')}
                </Text>
              </Stack>

              <Box>
                <DropdownMenuRadioGroup
                  value={`${appSession?.chainId}`}
                  onValueChange={changeChainId}
                >
                  <SwitchNetworkMenuSelector />
                </DropdownMenuRadioGroup>
                <SwitchNetworkMenuDisconnect onDisconnect={disconnect} />
              </Box>
            </>
          ) : null}

          <Stack space="4px">
            {url ? <DropdownMenuSeparator /> : null}

            <Inset vertical="8px">
              <Link id="home-page-header-connected-apps" to={'/connected'}>
                <Inline alignVertical="center" space="8px">
                  <Box style={{ width: 18, height: 18 }}>
                    <Inline
                      height="full"
                      alignVertical="center"
                      alignHorizontal="center"
                    >
                      <Symbol
                        size={14}
                        symbol="square.on.square.dashed"
                        weight="semibold"
                      />
                    </Inline>
                  </Box>
                  <Text size="14pt" weight="semibold">
                    {i18n.t('menu.home_header_left.all_connected_apps')}
                  </Text>
                </Inline>
              </Link>
            </Inset>
          </Stack>
        </Stack>

        <DropdownMenuItemIndicator style={{ marginLeft: 'auto' }}>
          o
        </DropdownMenuItemIndicator>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
