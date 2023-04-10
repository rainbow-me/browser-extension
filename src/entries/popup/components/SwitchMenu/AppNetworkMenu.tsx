import React, { ReactNode, useCallback, useMemo } from 'react';

import { i18n } from '~/core/languages';
import {
  Box,
  Column,
  Columns,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import ExternalImage from '../ExternalImage/ExternalImage';

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
  menuTriggerId?: string;
  headerHostId?: string;
  connectedAppsId?: string;
  type: 'dropdown' | 'context';
}

export const AppNetworkMenu = ({
  children,
  url,
  align,
  displayConnectedRoute = true,
  sideOffset,
  menuTriggerId,
  headerHostId,
  connectedAppsId,
  type,
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

  const {
    Menu,
    MenuTrigger,
    MenuContent,
    MenuSeparator,
    MenuRadioGroup,
    MenuRadioItem,
    MenuItemIndicator,
  } = useMemo(() => {
    return type === 'context'
      ? {
          Menu: ContextMenu,
          MenuTrigger: ContextMenuTrigger,
          MenuContent: ContextMenuContent,
          MenuSeparator: ContextMenuSeparator,
          MenuRadioGroup: ContextMenuRadioGroup,
          MenuRadioItem: ContextMenuRadioItem,
          MenuItemIndicator: ContextMenuItemIndicator,
        }
      : {
          Menu: DropdownMenu,
          MenuTrigger: DropdownMenuTrigger,
          MenuContent: DropdownMenuContent,
          MenuSeparator: DropdownMenuSeparator,
          MenuRadioGroup: DropdownMenuRadioGroup,
          MenuRadioItem: DropdownMenuRadioItem,
          MenuItemIndicator: DropdownMenuItemIndicator,
        };
  }, [type]);

  return (
    <Menu>
      <MenuTrigger asChild>
        <Box testId={menuTriggerId}>{children}</Box>
      </MenuTrigger>
      <MenuContent sideOffset={sideOffset} align={align}>
        {url ? (
          <Inset top="10px" bottom="14px">
            <Columns
              alignHorizontal="justify"
              alignVertical="center"
              space="4px"
            >
              <Column>
                <Columns space="10px" alignVertical="center">
                  <Column width="content">
                    <Box
                      style={{
                        height: 14,
                        width: 14,
                        borderRadius: 3.5,
                        overflow: 'hidden',
                        marginRight: 2,
                      }}
                    >
                      <ExternalImage src={appLogo} width="14" height="14" />
                    </Box>
                  </Column>
                  <Column>
                    <Box
                      id={`${headerHostId}-${
                        appSession ? appHost : 'not-connected'
                      }`}
                    >
                      <Rows space="10px">
                        <Row>
                          <TextOverflow size="14pt" weight="bold" color="label">
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
                  </Column>
                </Columns>
              </Column>
              <Column width="content">
                <Symbol
                  size={6}
                  color={appSession ? 'green' : 'labelQuaternary'}
                  symbol="circle.fill"
                  weight="semibold"
                />
              </Column>
            </Columns>
          </Inset>
        ) : null}

        <Stack space="4px">
          {appSession ? (
            <>
              <Stack space="12px">
                <MenuSeparator />
                <Text color="labelTertiary" size="11pt" weight="bold">
                  {i18n.t('menu.home_header_left.networks')}
                </Text>
              </Stack>

              <Box paddingTop="4px">
                <MenuRadioGroup
                  value={`${appSession?.chainId}`}
                  onValueChange={changeChainId}
                >
                  <SwitchNetworkMenuSelector
                    type={type}
                    highlightAccentColor
                    selectedValue={`${appSession?.chainId}`}
                  />
                </MenuRadioGroup>
                <SwitchNetworkMenuDisconnect onDisconnect={disconnect} />
              </Box>
            </>
          ) : null}

          {displayConnectedRoute && (
            <MenuRadioGroup
              onValueChange={(value) =>
                onValueChange(value as 'connected-apps')
              }
            >
              <Stack space="4px">
                {url ? <MenuSeparator /> : null}

                <MenuRadioItem highlightAccentColor value="connected-apps">
                  <Box testId={connectedAppsId}>
                    <Inline alignVertical="center" space="8px">
                      <Inline alignVertical="center" alignHorizontal="center">
                        <Symbol
                          size={12}
                          symbol="square.on.square.dashed"
                          weight="semibold"
                        />
                      </Inline>
                      <Text size="14pt" weight="semibold">
                        {i18n.t('menu.home_header_left.all_connected_apps')}
                      </Text>
                    </Inline>
                  </Box>
                </MenuRadioItem>
              </Stack>
            </MenuRadioGroup>
          )}
        </Stack>

        <MenuItemIndicator style={{ marginLeft: 'auto' }}>o</MenuItemIndicator>
      </MenuContent>
    </Menu>
  );
};
