import React, { ReactNode, useCallback } from 'react';
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
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';

import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import { ROUTES } from '../../urls';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';

import {
  SwitchNetworkMenuDisconnect,
  SwitchNetworkMenuSelector,
} from './SwitchNetworkMenu';

interface AppNetworkMenuProps {
  children: ReactNode;
  url: string;
  align?: 'center' | 'end' | 'start';
  displayConnectedRoute?: boolean;
  sideOffset?: number;
}

export const AppNetworkMenu = ({
  children,
  url,
  align,
  displayConnectedRoute = true,
  sideOffset,
}: AppNetworkMenuProps) => {
  const { appHost, appLogo, appName } = useAppMetadata({ url });

  const { updateAppSessionChainId, disconnectAppSession, appSession } =
    useAppSession({ host: appHost });

  const changeChainId = useCallback(
    (chainId: string) => {
      updateAppSessionChainId(Number(chainId));
    },
    [updateAppSessionChainId],
  );

  const disconnect = useCallback(() => {
    disconnectAppSession();
  }, [disconnectAppSession]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Box position="relative" id="home-page-header-left">
          {children}
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={sideOffset} align={align}>
        {url ? (
          <Inset top="10px" bottom="14px">
            <Inline alignHorizontal="justify" alignVertical="center">
              <Inline space="10px" alignVertical="center">
                <Box
                  style={{
                    height: 14,
                    width: 14,
                    borderRadius: 3.5,
                    overflow: 'hidden',
                  }}
                  paddingLeft="2px"
                >
                  <img src={appLogo} width="100%" height="100%" />
                </Box>
                <Box
                  id={`home-page-header-host-${
                    appSession ? appHost : 'not-connected'
                  }`}
                >
                  <Rows space="10px">
                    <Row>
                      <TextOverflow
                        maxWidth={140}
                        size="14pt"
                        weight="bold"
                        color="label"
                      >
                        {appName ?? appHost}
                      </TextOverflow>
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
                <Text color="labelTertiary" size="11pt" weight="bold">
                  {i18n.t('menu.home_header_left.networks')}
                </Text>
              </Stack>

              <Box paddingTop="4px">
                <DropdownMenuRadioGroup
                  value={`${appSession?.chainId}`}
                  onValueChange={changeChainId}
                >
                  <SwitchNetworkMenuSelector
                    selectedValue={`${appSession?.chainId}`}
                  />
                </DropdownMenuRadioGroup>
                <SwitchNetworkMenuDisconnect onDisconnect={disconnect} />
              </Box>
            </>
          ) : null}

          {displayConnectedRoute && (
            <Stack space="4px">
              {url ? <DropdownMenuSeparator /> : null}

              <Inset vertical="8px">
                <Link
                  id="home-page-header-connected-apps"
                  to={ROUTES.CONNECTED}
                >
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
          )}
        </Stack>

        <DropdownMenuItemIndicator style={{ marginLeft: 'auto' }}>
          o
        </DropdownMenuItemIndicator>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
