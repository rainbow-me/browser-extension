import { motion } from 'framer-motion';
import React, { ReactNode, useCallback, useState } from 'react';

import { i18n } from '~/core/languages';
import { initializeMessenger } from '~/core/messengers';
import { useCurrentAddressStore } from '~/core/state';
import { AppSession } from '~/core/state/appSessions';
import { ChainNameDisplay } from '~/core/types/chains';
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
import { ChevronDown } from '../ChevronDown/ChevronDown';
import {
  DropdownMenu,
  DropdownMenuContent,
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

const inpageMessenger = initializeMessenger({ connect: 'inpage' });

const AppInteractionItem = ({
  connectedAppsId,
  appSession,
  chevronDirection,
}: {
  connectedAppsId?: string;
  appSession: AppSession;
  chevronDirection: 'right' | 'down';
}) => {
  return (
    <DropdownMenuRadioItem
      onSelect={(e) => {
        e.preventDefault();
      }}
      highlightAccentColor
      value="switch-networks"
    >
      <Box width="full" testId={connectedAppsId}>
        <Columns alignVertical="center" space="8px">
          <Column width="content">
            <Inline alignVertical="center" alignHorizontal="center">
              <Symbol
                size={12}
                symbol={
                  !appSession ? 'app.connected.to.app.below.fill' : 'network'
                }
                weight="semibold"
              />
            </Inline>
          </Column>
          <Column>
            <Text size="14pt" weight="semibold">
              {!appSession ? 'Connect' : 'Switch networks'}
            </Text>
          </Column>
          <Column width="content">
            <Box
              as={motion.div}
              animate={{ rotate: chevronDirection === 'right' ? -90 : 0 }}
              initial={{ rotate: chevronDirection === 'right' ? 0 : -90 }}
            >
              <ChevronDown color="labelTertiary" />
            </Box>
          </Column>
        </Columns>
      </Box>
    </DropdownMenuRadioItem>
  );
};

interface AppNetworkMenuProps {
  children: ReactNode;
  url: string;
  align?: 'center' | 'end' | 'start';
  sideOffset?: number;
  menuTriggerId?: string;
  headerHostId?: string;
  connectedAppsId?: string;
}

export const AppNetworkMenu = ({
  children,
  url,
  align,
  sideOffset,
  menuTriggerId,
  headerHostId,
  connectedAppsId,
}: AppNetworkMenuProps) => {
  const [showNetworks, setShowNetworks] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { currentAddress } = useCurrentAddressStore();

  const { appHost, appLogo, appName } = useAppMetadata({ url });
  const navigate = useRainbowNavigate();

  const {
    addSession,
    updateAppSessionChainId,
    disconnectAppSession,
    appSession,
  } = useAppSession({ host: appHost });

  const changeChainId = useCallback(
    (chainId: string) => {
      updateAppSessionChainId(Number(chainId));
    },
    [updateAppSessionChainId],
  );

  const connectToApp = useCallback(
    (chainId: string) => {
      addSession({
        host: appHost,
        address: currentAddress,
        chainId: Number(chainId),
        url,
      });
      inpageMessenger.send(`connect:${appHost}`, {
        address: currentAddress,
        chainId: Number(chainId),
      });
      inpageMessenger.send('rainbow_reload', null);
    },
    [addSession, appHost, currentAddress, url],
  );

  const disconnect = useCallback(
    () => disconnectAppSession(),
    [disconnectAppSession],
  );

  const onValueChange = useCallback(
    (value: 'connected-apps' | 'switch-networks') => {
      switch (value) {
        case 'connected-apps':
          navigate(ROUTES.CONNECTED);
          break;
        case 'switch-networks':
          setShowNetworks((showNetworks) => !showNetworks);
          break;
      }
    },
    [navigate],
  );

  return (
    <DropdownMenu onOpenChange={setMenuOpen} open={menuOpen}>
      <DropdownMenuTrigger asChild>
        <Box testId={menuTriggerId}>{children}</Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        width={showNetworks ? 190 : undefined}
        marginLeft={showNetworks ? 7 : undefined}
        sideOffset={sideOffset}
        align={align}
      >
        <Box opacity={showNetworks ? '0.5' : undefined}>
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
                  <ExternalImage src={appLogo} width="14" height="14" />
                </Box>
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
                    <Row>
                      <Text size="11pt" weight="bold">
                        {!appSession
                          ? i18n.t('menu.home_header_left.not_connected')
                          : ChainNameDisplay[appSession.chainId] || ''}
                      </Text>
                    </Row>
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
        </Box>

        <DropdownMenuRadioGroup
          onValueChange={(value) =>
            onValueChange(value as 'connected-apps' | 'switch-networks')
          }
        >
          {!showNetworks && (
            <AppInteractionItem
              connectedAppsId={connectedAppsId}
              appSession={appSession}
              chevronDirection="right"
            />
          )}

          {showNetworks && (
            <DropdownMenuContent
              top={51.5}
              position="absolute"
              onInteractOutside={(e) => {
                e.preventDefault();
                setShowNetworks(false);
                setMenuOpen(false);
              }}
            >
              <AppInteractionItem
                connectedAppsId={connectedAppsId}
                appSession={appSession}
                chevronDirection="down"
              />

              <DropdownMenuRadioGroup
                value={`${appSession?.chainId}`}
                onValueChange={appSession ? changeChainId : connectToApp}
              >
                <SwitchNetworkMenuSelector
                  type="dropdown"
                  highlightAccentColor
                  selectedValue={`${appSession?.chainId}`}
                  onNetworkSelect={(e) => e.preventDefault()}
                />
              </DropdownMenuRadioGroup>
              <SwitchNetworkMenuDisconnect onDisconnect={disconnect} />
            </DropdownMenuContent>
          )}

          <Stack space="4px">
            {url ? <DropdownMenuSeparator /> : null}

            <DropdownMenuRadioItem highlightAccentColor value="connected-apps">
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
            </DropdownMenuRadioItem>
          </Stack>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
