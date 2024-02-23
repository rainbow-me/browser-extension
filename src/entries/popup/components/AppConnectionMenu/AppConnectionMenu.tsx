import React, {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useCurrentAddressStore } from '~/core/state';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';

import { useAppSession } from '../../hooks/useAppSession';
import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';
import { appConnectionSwitchWalletsPromptIsActive } from '../../utils/activeElement';
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
import { HomeMenuRow } from '../HomeMenuRow/HomeMenuRow';
import { ShortcutHint } from '../ShortcutHint/ShortcutHint';
import { SwitchNetworkMenuSelector } from '../SwitchMenu/SwitchNetworkMenu';
import { CursorTooltip } from '../Tooltip/CursorTooltip';

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
  const { data } = useDappMetadata({ url });
  const navigate = useRainbowNavigate();
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
  const pressingNetworkShortcut = useRef<boolean>(false);

  const appHost = data?.appHost || '';
  const appName = data?.appName || '';
  const appLogo = data?.appLogo || '';

  const {
    addSession,
    updateAppSessionChainId,
    disconnectAppSession,
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
          disconnectAppSession();
          break;
      }
    },
    [disconnectAppSession, navigate, subMenuOpen],
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

  useEffect(() => {
    pressingNetworkShortcut.current = true;
    setTimeout(() => {
      pressingNetworkShortcut.current = false;
    }, 400);
  }, []);

  const handleShortcuts = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case shortcuts.home.SWITCH_NETWORK.key:
          if (
            !pressingNetworkShortcut.current &&
            !appConnectionSwitchWalletsPromptIsActive()
          ) {
            pressingNetworkShortcut.current = true;
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
          }
          setTimeout(() => {
            pressingNetworkShortcut.current = false;
          }, 400);
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
          if (!subMenuOpen && activeSession) {
            trackShortcut({
              key: shortcuts.home.SWITCH_WALLETS.display,
              type: 'switchNetworkMenu.switchWallets',
            });
            triggerWalletSwitcher({ show: true });
            setMenuOpen(false);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return;
          }
          break;
        case shortcuts.home.DISCONNECT_APP.key:
          if (activeSession) {
            trackShortcut({
              key: shortcuts.home.DISCONNECT_APP.display,
              type: 'switchNetworkMenu.disconnect',
            });
            disconnectAppSession();
          }
          break;
      }
    },
    [activeSession, disconnectAppSession, menuOpen, subMenuOpen, trackShortcut],
  );

  useKeyboardShortcut({
    condition: menuOpen,
    handler: handleShortcuts,
  });

  return (
    <DropdownMenu onOpenChange={setMenuOpen} open={menuOpen}>
      <DropdownMenuTrigger asChild>
        <Box
          as="div"
          id={`app-connection-menu-selector-${menuOpen ? 'open' : 'closed'}`}
          testId={menuTriggerId}
        >
          <CursorTooltip
            align="start"
            arrowAlignment="left"
            arrowCentered
            arrowDirection="up"
            text={i18n.t('tooltip.switch_network')}
            textWeight="bold"
            textSize="12pt"
            textColor="labelSecondary"
            hint={shortcuts.home.SWITCH_NETWORK.display}
          >
            {children}
          </CursorTooltip>
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContentWithSubMenu
        subMenuRef={dropdownMenuRef}
        sideOffset={sideOffset}
        align={align}
      >
        <Box testId={connectedAppsId}>
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
                          <Box
                            testId="app-connection-menu-networks"
                            paddingTop="12px"
                          >
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
                            showDisconnect={false}
                            disconnect={disconnect}
                          />
                        </DropdownMenuRadioGroup>
                      </Stack>
                    }
                    subMenuElement={
                      <AppInteractionItem
                        appSession={appSession}
                        chevronDirection={subMenuOpen ? 'down' : 'right'}
                        shortcutHint={shortcuts.home.SWITCH_NETWORK.display}
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
                      <HomeMenuRow
                        testId="app-connection-menu-swtch-wallets"
                        leftComponent={
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
                                symbol="person.crop.rectangle.stack.fill"
                                weight="semibold"
                              />
                            </Inline>
                          </Box>
                        }
                        centerComponent={
                          <Text size="14pt" weight="semibold">
                            {i18n.t('menu.app_connection_menu.switch_wallets')}
                          </Text>
                        }
                        rightComponent={
                          <ShortcutHint
                            hint={shortcuts.home.SWITCH_WALLETS.display}
                          />
                        }
                      />
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      highlightAccentColor
                      value="disconnect"
                    >
                      <HomeMenuRow
                        testId="app-connection-menu-disconnect"
                        leftComponent={
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
                                symbol="trash.fill"
                                weight="semibold"
                                color="red"
                              />
                            </Inline>
                          </Box>
                        }
                        centerComponent={
                          <Text size="14pt" weight="semibold" color="red">
                            {i18n.t('menu.app_connection_menu.disconnect')}
                          </Text>
                        }
                        rightComponent={
                          <ShortcutHint
                            hint={shortcuts.home.DISCONNECT_APP.display}
                          />
                        }
                      />
                    </DropdownMenuRadioItem>
                  </>
                ) : null}
              </Box>

              {url ? <DropdownMenuSeparator /> : null}

              <DropdownMenuRadioItem
                highlightAccentColor
                value="connected-apps"
              >
                <HomeMenuRow
                  testId="app-connection-menu-connected-apps"
                  leftComponent={
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
                  }
                  centerComponent={
                    <Text size="14pt" weight="semibold">
                      {i18n.t('menu.app_connection_menu.connected_apps')}
                    </Text>
                  }
                  rightComponent={
                    <ShortcutHint
                      hint={shortcuts.home.GO_TO_CONNECTED_APPS.display}
                    />
                  }
                />
              </DropdownMenuRadioItem>
            </Stack>
          </DropdownMenuRadioGroup>
        </Box>
      </DropdownMenuContentWithSubMenu>
    </DropdownMenu>
  );
};
