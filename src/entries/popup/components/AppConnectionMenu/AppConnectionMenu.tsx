import React, {
  ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';

import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';
import { triggerWalletSwitcher } from '../AppConnection/AppConnectionWalletSwitcher';
import { useCommandKStatus } from '../CommandK/useCommandKStatus';
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import {
  DropdownMenuContentWithSubMenu,
  DropdownSubMenu,
} from '../DropdownMenu/DropdownSubMenu';
import { SwitchNetworkMenuSelector } from '../SwitchMenu/SwitchNetworkMenu';

import { AppConnectionMenuHeader } from './AppConnectionMenuHeader';
import { AppInteractionItem } from './AppInteractionItem';

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
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { isCommandKVisible } = useCommandKStatus();
  const { trackShortcut } = useKeyboardAnalytics();
  const { currentAddress } = useCurrentAddressStore();
  const { appHost, appLogo, appName } = useAppMetadata({ url });
  const navigate = useRainbowNavigate();
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);

  const {
    addSession,
    updateAppSessionChainId,
    disconnectAppSession,
    disconnectSession,
    appSession,
    activeSession,
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
    },
    [addSession, appHost, currentAddress, url],
  );

  const disconnectFromApp = useCallback(() => {
    disconnectSession({
      address: currentAddress,
      host: appHost,
    });
  }, [appHost, currentAddress, disconnectSession]);

  const onValueChange = useCallback(
    (
      value:
        | 'connected-apps'
        | 'switch-networks'
        | 'switch-wallets'
        | 'disconnect',
    ) => {
      switch (value) {
        case 'connected-apps':
          navigate(ROUTES.CONNECTED);
          break;
        case 'switch-networks':
          setSubMenuOpen(!subMenuOpen);
          break;
        case 'switch-wallets':
          triggerWalletSwitcher({ show: true });
          break;
        case 'disconnect':
          disconnectFromApp();
          break;
      }
    },
    [disconnectFromApp, navigate, subMenuOpen],
  );

  const disconnect = useCallback(() => {
    disconnectAppSession();
    setSubMenuOpen(false);
    setMenuOpen(false);
  }, [disconnectAppSession]);

  useLayoutEffect(() => {
    if (isCommandKVisible && menuOpen) {
      setMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCommandKVisible]);

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      switch (e.key) {
        case shortcuts.home.SWITCH_NETWORK.key:
          trackShortcut({
            key: shortcuts.home.SWITCH_NETWORK.display,
            type: 'switchNetworkMenu.toggle',
          });
          if (!menuOpen) {
            setMenuOpen(true);
          }
          if (menuOpen && !subMenuOpen) {
            setSubMenuOpen(true);
          }
          if (menuOpen && subMenuOpen) {
            setSubMenuOpen(false);
          }
          break;
        case shortcuts.global.CLOSE.key:
          if (subMenuOpen) {
            trackShortcut({
              key: shortcuts.global.CLOSE.display,
              type: 'switchNetworkMenu.dismiss',
            });
            e.preventDefault();
            setSubMenuOpen(false);
          }
          break;
        case shortcuts.home.SWITCH_WALLETS.key:
          if (!subMenuOpen) {
            trackShortcut({
              key: shortcuts.home.SWITCH_WALLETS.display,
              type: 'switchNetworkMenu.switchWallets',
            });
            e.preventDefault();
            setMenuOpen(false);
            triggerWalletSwitcher({ show: true });
          }
      }
    },
  });

  return (
    <DropdownMenu onOpenChange={setMenuOpen} open={menuOpen}>
      <DropdownMenuTrigger asChild>
        <Box testId={menuTriggerId}>{children}</Box>
      </DropdownMenuTrigger>
      <DropdownMenuContentWithSubMenu
        subMenuRef={dropdownMenuRef}
        sideOffset={sideOffset}
        align={align}
      >
        <>
          {url ? (
            <AppConnectionMenuHeader
              opacity={subMenuOpen ? 0.5 : 1}
              appLogo={appLogo}
              appHost={appHost}
              headerHostId={headerHostId}
              activeSession={activeSession}
              appName={appName || appHost}
            />
          ) : null}

          <DropdownMenuRadioGroup
            onValueChange={(value: string) =>
              onValueChange(
                value as
                  | 'connected-apps'
                  | 'switch-networks'
                  | 'switch-wallets',
              )
            }
          >
            <Stack space="4px">
              <Box>
                {url ? (
                  <DropdownSubMenu
                    menuOpen={menuOpen}
                    parentRef={dropdownMenuRef}
                    setMenuOpen={setMenuOpen}
                    subMenuOpen={subMenuOpen}
                    setSubMenuOpen={setSubMenuOpen}
                    subMenuContent={
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
                          value={`${activeSession?.chainId}`}
                          onValueChange={
                            appSession ? changeChainId : connectToApp
                          }
                        >
                          <SwitchNetworkMenuSelector
                            type="dropdown"
                            highlightAccentColor
                            selectedValue={`${activeSession?.chainId}`}
                            onNetworkSelect={(e) => {
                              e?.preventDefault();
                              setSubMenuOpen(false);
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
                    }
                    subMenuElement={
                      <AppInteractionItem
                        appSession={appSession}
                        chevronDirection={subMenuOpen ? 'down' : 'right'}
                        showChevron
                      />
                    }
                  />
                ) : null}
                {activeSession ? (
                  <>
                    <DropdownMenuRadioItem
                      highlightAccentColor
                      value="switch-wallets"
                    >
                      <Box testId={connectedAppsId}>
                        <Inline alignVertical="center" space="8px">
                          <Box
                            height="fit"
                            style={{ width: '18px', height: '18px' }}
                          >
                            <Inline
                              height="full"
                              alignVertical="center"
                              alignHorizontal="center"
                            >
                              <Symbol
                                size={14}
                                symbol="wand.and.stars"
                                weight="semibold"
                              />
                            </Inline>
                          </Box>

                          <Text size="14pt" weight="semibold">
                            {i18n.t('menu.app_connection_menu.switch_wallets')}
                          </Text>
                        </Inline>
                      </Box>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      highlightAccentColor
                      value="disconnect"
                    >
                      <Box testId={connectedAppsId}>
                        <Inline alignVertical="center" space="8px">
                          <Box
                            height="fit"
                            style={{ width: '18px', height: '18px' }}
                          >
                            <Inline
                              height="full"
                              alignVertical="center"
                              alignHorizontal="center"
                            >
                              <Symbol
                                size={12}
                                symbol="xmark"
                                weight="semibold"
                              />
                            </Inline>
                          </Box>

                          <Text size="14pt" weight="semibold">
                            {i18n.t('menu.app_connection_menu.disconnect')}
                          </Text>
                        </Inline>
                      </Box>
                    </DropdownMenuRadioItem>
                  </>
                ) : null}
              </Box>

              {url ? <DropdownMenuSeparator /> : null}

              <DropdownMenuRadioItem
                highlightAccentColor
                value="connected-apps"
              >
                <Box testId={connectedAppsId}>
                  <Inline alignVertical="center" space="8px">
                    <Box height="fit" style={{ width: '18px', height: '18px' }}>
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
                      {i18n.t('menu.app_connection_menu.all_connected_apps')}
                    </Text>
                  </Inline>
                </Box>
              </DropdownMenuRadioItem>
            </Stack>
          </DropdownMenuRadioGroup>
        </>
      </DropdownMenuContentWithSubMenu>
    </DropdownMenu>
  );
};
