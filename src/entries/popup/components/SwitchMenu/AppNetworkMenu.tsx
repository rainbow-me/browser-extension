import { AnimatePresence, motion } from 'framer-motion';
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
  showChevron,
}: {
  connectedAppsId?: string;
  appSession: AppSession;
  chevronDirection: 'right' | 'down';
  showChevron: boolean;
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
          {showChevron && (
            <Column width="content">
              <Box style={{ rotate: '-90deg' }}>
                <Box
                  as={motion.div}
                  animate={{ rotate: chevronDirection === 'right' ? 0 : 90 }}
                  initial={{ rotate: chevronDirection === 'right' ? 90 : 0 }}
                  exit={{ rotate: chevronDirection === 'right' ? 90 : 0 }}
                >
                  <ChevronDown color="labelTertiary" />
                </Box>
              </Box>
            </Column>
          )}
        </Columns>
      </Box>
    </DropdownMenuRadioItem>
  );
};

const MenuHeader = ({
  showMenuHeader,
  appLogo,
  headerHostId,
  appSession,
  appHost,
  appName,
}: {
  showMenuHeader: boolean;
  appLogo?: string;
  headerHostId?: string;
  appSession?: AppSession;
  appHost?: string;
  appName?: string;
}) => {
  return (
    <Box
      as={motion.div}
      initial={false}
      animate={{ opacity: showMenuHeader ? 0.5 : 1 }}
    >
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
              id={`${headerHostId}-${appSession ? appHost : 'not-connected'}`}
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
  );
};

const ActionButtons = ({
  appSession,
  connectedAppsId,
  url,
  showChevron,
  onValueChange,
}: {
  appSession: AppSession;
  connectedAppsId?: string;
  url?: string;
  showChevron: boolean;
  onValueChange: (value: 'connected-apps' | 'switch-networks') => void;
}) => {
  return (
    <DropdownMenuRadioGroup
      onValueChange={(value) =>
        onValueChange(value as 'connected-apps' | 'switch-networks')
      }
    >
      <AppInteractionItem
        connectedAppsId={connectedAppsId}
        appSession={appSession}
        chevronDirection="right"
        showChevron={showChevron}
      />
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
  );
};

const NETWORK_MENU_HEADER_X = 23;
const NETWORK_MENU_HEADER_Y = 72;
const NETWORK_MENU_HEADER_WIDTH = 190;
const NETWORK_MENU_HEADER_HEIGHT = 52;

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
  const [showMenuHeader, setshowMenuHeader] = useState(false);
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
          setTimeout(
            () => {
              setShowNetworks(!showNetworks);
            },
            showNetworks ? 200 : 0,
          );
          setshowMenuHeader((showMenuHeader) => !showMenuHeader);
          break;
      }
    },
    [navigate, showNetworks],
  );

  return (
    <DropdownMenu onOpenChange={setMenuOpen} open={menuOpen}>
      <DropdownMenuTrigger asChild>
        <Box testId={menuTriggerId}>{children}</Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        width={showMenuHeader ? 190 : undefined}
        sideOffset={sideOffset}
        align={align}
      >
        <MenuHeader
          showMenuHeader={showMenuHeader}
          appLogo={appLogo}
          appHost={appHost}
          headerHostId={headerHostId}
          appSession={appSession}
          appName={appName}
        />
        <ActionButtons
          appSession={appSession}
          connectedAppsId={connectedAppsId}
          url={url}
          onValueChange={onValueChange}
          showChevron
        />
      </DropdownMenuContent>
      {(showMenuHeader || showNetworks) && (
        <DropdownMenuContent align={align} marginTop={51.5}>
          {showNetworks && (
            <ActionButtons
              appSession={appSession}
              connectedAppsId={connectedAppsId}
              url={url}
              onValueChange={onValueChange}
              showChevron={false}
            />
          )}
        </DropdownMenuContent>
      )}
      <AnimatePresence>
        {showNetworks && (
          <DropdownMenuContent
            animate
            key="kjgiuyg"
            top={51.5}
            width={204}
            position="absolute"
            onInteractOutside={(e) => {
              e.preventDefault();
              const x = (e.detail.originalEvent as PointerEvent).x;
              const y = (e.detail.originalEvent as PointerEvent).y;
              setTimeout(() => {
                setShowNetworks(false);
              }, 200);
              setshowMenuHeader(false);
              if (
                x < NETWORK_MENU_HEADER_X ||
                x > NETWORK_MENU_HEADER_X + NETWORK_MENU_HEADER_WIDTH ||
                y < NETWORK_MENU_HEADER_Y ||
                y > NETWORK_MENU_HEADER_Y + NETWORK_MENU_HEADER_HEIGHT
              ) {
                setMenuOpen(false);
              }
            }}
          >
            <DropdownMenuRadioGroup
              onValueChange={(value) =>
                onValueChange(value as 'connected-apps' | 'switch-networks')
              }
            >
              <AppInteractionItem
                connectedAppsId={connectedAppsId}
                appSession={appSession}
                chevronDirection="down"
                showChevron
              />
            </DropdownMenuRadioGroup>
            <DropdownMenuRadioGroup
              value={`${appSession?.chainId}`}
              onValueChange={appSession ? changeChainId : connectToApp}
            >
              <SwitchNetworkMenuSelector
                type="dropdown"
                highlightAccentColor
                selectedValue={`${appSession?.chainId}`}
                onNetworkSelect={(e) => {
                  e.preventDefault();
                  setTimeout(() => {
                    setShowNetworks(false);
                  }, 200);
                  setshowMenuHeader(false);
                  setMenuOpen(false);
                }}
              />
            </DropdownMenuRadioGroup>
            {appSession && (
              <SwitchNetworkMenuDisconnect onDisconnect={disconnect} />
            )}
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
};
