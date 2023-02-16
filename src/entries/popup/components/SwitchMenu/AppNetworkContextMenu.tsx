import React, { ReactNode, useCallback } from 'react';

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
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItemIndicator,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ContextMenu/ContextMenu';

import { SwitchNetworkContextMenuSelector } from './SwitchNetworkContextMenu';
import { SwitchNetworkMenuDisconnect } from './SwitchNetworkMenu';

interface AppNetworkMenuProps {
  children: ReactNode;
  url: string;
  align?: 'center' | 'end' | 'start';
  displayConnectedRoute?: boolean;
  sideOffset?: number;
  menuTriggerId?: string;
  headerHostId?: string;
  connectedAppsId?: string;
}

export const AppNetworkContextMenu = ({
  children,
  url,
  displayConnectedRoute = true,
  sideOffset,
  menuTriggerId,
  headerHostId,
  connectedAppsId,
}: AppNetworkMenuProps) => {
  const { appHost, appLogo, appName } = useAppMetadata({ url });
  const navigate = useRainbowNavigate();

  const { updateAppSessionChainId, disconnectAppSession, appSession } =
    useAppSession({ host: appHost });

  const onValueChange = useCallback(
    (value: 'connected-apps') => {
      switch (value) {
        case 'connected-apps':
          navigate(ROUTES.CONNECTED);
          break;
      }
    },
    [navigate],
  );

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
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Box id={menuTriggerId}>{children}</Box>
      </ContextMenuTrigger>
      <ContextMenuContent sideOffset={sideOffset}>
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
                    marginRight: 2,
                  }}
                >
                  <img src={appLogo} width="100%" height="100%" />
                </Box>
                <Box
                  id={`${headerHostId}-${
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
                <ContextMenuSeparator />
                <Text color="labelTertiary" size="11pt" weight="bold">
                  {i18n.t('menu.home_header_left.networks')}
                </Text>
              </Stack>

              <Box paddingTop="4px">
                <ContextMenuRadioGroup
                  value={`${appSession?.chainId}`}
                  onValueChange={changeChainId}
                >
                  <SwitchNetworkContextMenuSelector
                    selectedValue={`${appSession?.chainId}`}
                  />
                </ContextMenuRadioGroup>
                <SwitchNetworkMenuDisconnect onDisconnect={disconnect} />
              </Box>
            </>
          ) : null}

          {displayConnectedRoute && (
            <ContextMenuRadioGroup
              onValueChange={(value) =>
                onValueChange(value as 'connected-apps')
              }
            >
              <Stack space="4px">
                {url ? <ContextMenuSeparator /> : null}

                <ContextMenuRadioItem value="connected-apps">
                  <Box id={connectedAppsId}>
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
                  </Box>
                </ContextMenuRadioItem>
              </Stack>
            </ContextMenuRadioGroup>
          )}
        </Stack>

        <ContextMenuItemIndicator style={{ marginLeft: 'auto' }}>
          o
        </ContextMenuItemIndicator>
      </ContextMenuContent>
    </ContextMenu>
  );
};
