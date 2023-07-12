import { motion } from 'framer-motion';
import { ReactNode, useCallback, useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { initializeMessenger } from '~/core/messengers';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';

import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
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
import { SwitchNetworkMenuSelector } from '../SwitchMenu/SwitchNetworkMenu';

import { AppConnectionMenuHeader } from './AppConnectionMenuHeader';
import { AppInteractionItem } from './AppInteractionItem';

const inpageMessenger = initializeMessenger({ connect: 'inpage' });

const NETWORK_MENU_HEADER_X = 23;
const NETWORK_MENU_HEADER_Y = 72;
const NETWORK_MENU_HEADER_WIDTH = 190;
const NETWORK_MENU_HEADER_HEIGHT = 52;

const isClickingMenuHeader = ({ x, y }: { x: number; y: number }) =>
  x < NETWORK_MENU_HEADER_X ||
  x > NETWORK_MENU_HEADER_X + NETWORK_MENU_HEADER_WIDTH ||
  y < NETWORK_MENU_HEADER_Y ||
  y > NETWORK_MENU_HEADER_Y + NETWORK_MENU_HEADER_HEIGHT;

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
  const [subMenuOpenDelayed, setSubMenuOpenDelayed] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
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

  const toggleSubMenu = useCallback((open: boolean) => {
    setSubMenuOpen(open);
  }, []);

  const onValueChange = useCallback(
    (value: 'connected-apps' | 'switch-networks') => {
      switch (value) {
        case 'connected-apps':
          navigate(ROUTES.CONNECTED);
          break;
        case 'switch-networks':
          toggleSubMenu(!subMenuOpen);
          break;
      }
    },
    [navigate, subMenuOpen, toggleSubMenu],
  );

  const disconnect = useCallback(() => {
    disconnectAppSession();
    toggleSubMenu(false);
    setMenuOpen(false);
  }, [disconnectAppSession, toggleSubMenu]);

  useEffect(() => {
    setTimeout(
      () => {
        setSubMenuOpenDelayed(subMenuOpen);
      },
      subMenuOpen ? 0 : 250,
    );
  }, [subMenuOpen]);

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.home.SWITCH_NETWORK.key) {
        if (!menuOpen) {
          setMenuOpen(true);
        }
        toggleSubMenu(!subMenuOpen);
      }
    },
  });

  return (
    <DropdownMenu onOpenChange={setMenuOpen} open={menuOpen}>
      <DropdownMenuTrigger asChild>
        <Box testId={menuTriggerId}>{children}</Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        scale={subMenuOpen ? 0.94 : 1}
        sideOffset={sideOffset}
        align={align}
      >
        {url ? (
          <AppConnectionMenuHeader
            opacity={subMenuOpen ? 0.5 : 1}
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
          <Stack space="4px">
            {url ? (
              <DropdownSubMenu
                open={subMenuOpenDelayed}
                openContent={subMenuOpen}
                top={100}
                marginLeft={30}
                subMenuContent={
                  <Stack space="4px">
                    <AppInteractionItem
                      appSession={appSession}
                      chevronDirection={subMenuOpen ? 'down' : 'right'}
                      showChevron
                    />
                    {url ? <DropdownMenuSeparator /> : null}
                    <Box
                      as={motion.div}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Stack space="4px">
                        {!appSession ? (
                          <Box paddingTop="12px">
                            <Text
                              weight="bold"
                              color="labelTertiary"
                              size="11pt"
                            >
                              {i18n.t('menu.app_connection_menu.networks')}
                            </Text>
                          </Box>
                        ) : null}

                        <DropdownMenuRadioGroup
                          value={`${appSession?.chainId}`}
                          onValueChange={
                            appSession ? changeChainId : connectToApp
                          }
                        >
                          <SwitchNetworkMenuSelector
                            type="dropdown"
                            highlightAccentColor
                            selectedValue={`${appSession?.chainId}`}
                            onNetworkSelect={(e) => {
                              e?.preventDefault();
                              toggleSubMenu(false);
                              setMenuOpen(false);
                            }}
                            onShortcutPress={
                              appSession ? changeChainId : connectToApp
                            }
                            showDisconnect={!!appSession}
                            disconnect={disconnect}
                          />
                        </DropdownMenuRadioGroup>
                      </Stack>
                    </Box>
                  </Stack>
                }
                subMenuElement={
                  <AppInteractionItem
                    appSession={appSession}
                    chevronDirection={subMenuOpen ? 'down' : 'right'}
                    showChevron
                  />
                }
                onInteractOutsideContent={(e) => {
                  e.preventDefault();
                  const { x, y } =
                    (e.detail.originalEvent as PointerEvent) || {};
                  if (x && y) {
                    toggleSubMenu(false);
                    if (isClickingMenuHeader({ x, y })) {
                      setMenuOpen(false);
                    }
                  }
                }}
              />
            ) : null}
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
                    {i18n.t('menu.app_connection_menu.all_connected_apps')}
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
