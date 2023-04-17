import { motion } from 'framer-motion';
import React, { ReactNode, useCallback, useState } from 'react';

import { i18n } from '~/core/languages';
import { initializeMessenger } from '~/core/messengers';
import { useCurrentAddressStore } from '~/core/state';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';

import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import { DropdownSubMenu } from '../DropdownMenu/DropdownSubMenu';
import {
  SwitchNetworkMenuDisconnect,
  SwitchNetworkMenuSelector,
} from '../SwitchMenu/SwitchNetworkMenu';

import { AppConnectionMenuHeader } from './AppConnectionMenuHeader';
import { AppInteractionItem } from './AppInteractionItem';

const inpageMessenger = initializeMessenger({ connect: 'inpage' });

const NETWORK_MENU_HEADER_X = 23;
const NETWORK_MENU_HEADER_Y = 72;
const NETWORK_MENU_HEADER_WIDTH = 190;
const NETWORK_MENU_HEADER_HEIGHT = 52;

interface AppConnectionMenuProps {
  children: ReactNode;
  url: string;
  align?: 'center' | 'end' | 'start';
  sideOffset?: number;
  menuTriggerId?: string;
  headerHostId?: string;
  connectedAppsId?: string;
}

export const AppConnectionMenu = ({
  children,
  url,
  align,
  sideOffset,
  menuTriggerId,
  headerHostId,
  connectedAppsId,
}: AppConnectionMenuProps) => {
  const [showNetworks, setShowNetworks] = useState(false);
  const [showNetworksMenu, setShowNetworksMenu] = useState(false);
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
          setShowNetworks(!showNetworks);
          setTimeout(
            () => {
              setShowNetworksMenu(!showNetworksMenu);
            },
            showNetworks ? 250 : 0,
          );
          setshowMenuHeader((showMenuHeader) => !showMenuHeader);
          break;
      }
    },
    [navigate, showNetworks, showNetworksMenu],
  );

  return (
    <DropdownMenu onOpenChange={setMenuOpen} open={menuOpen}>
      <DropdownMenuTrigger asChild>
        <Box testId={menuTriggerId}>{children}</Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        scale={showMenuHeader ? 0.94 : 1}
        sideOffset={sideOffset}
        align={align}
      >
        {url ? (
          <AppConnectionMenuHeader
            showMenuHeader={showMenuHeader}
            appLogo={appLogo}
            appHost={appHost}
            headerHostId={headerHostId}
            appSession={appSession}
            appName={appName}
          />
        ) : null}

        <DropdownMenuRadioGroup
          onValueChange={(value) =>
            onValueChange(value as 'connected-apps' | 'switch-networks')
          }
        >
          <DropdownSubMenu
            open={showNetworksMenu}
            openContent={showNetworks}
            top={100.5}
            marginLeft={30}
            subMenuContent={
              <>
                {url ? <DropdownMenuSeparator /> : null}

                <Box
                  as={motion.div}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
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
                        setShowNetworks(false);
                        setTimeout(() => {
                          setShowNetworksMenu(false);
                        }, 250);
                        setshowMenuHeader(false);
                        setMenuOpen(false);
                      }}
                    />
                  </DropdownMenuRadioGroup>
                  {appSession && (
                    <SwitchNetworkMenuDisconnect onDisconnect={disconnect} />
                  )}
                </Box>
              </>
            }
            subMenuElement={
              <AppInteractionItem
                connectedAppsId={connectedAppsId}
                appSession={appSession}
                chevronDirection={showNetworks ? 'down' : 'right'}
                showChevron
              />
            }
            onInteractOutsideContent={(e) => {
              e.preventDefault();
              const x = (e.detail.originalEvent as PointerEvent).x;
              const y = (e.detail.originalEvent as PointerEvent).y;
              if (x && y) {
                setShowNetworks(false);
                setTimeout(() => {
                  setShowNetworksMenu(false);
                }, 250);
                setshowMenuHeader(false);
                if (
                  x < NETWORK_MENU_HEADER_X ||
                  x > NETWORK_MENU_HEADER_X + NETWORK_MENU_HEADER_WIDTH ||
                  y < NETWORK_MENU_HEADER_Y ||
                  y > NETWORK_MENU_HEADER_Y + NETWORK_MENU_HEADER_HEIGHT
                ) {
                  setMenuOpen(false);
                }
              }
            }}
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
