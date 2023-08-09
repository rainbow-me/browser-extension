import { useCallback, useRef, useState } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { Box, ButtonSymbol, Inline, Stack, Text } from '~/design-system';
import { AccentColorProviderWrapper } from '~/design-system/components/Box/ColorContext';
import { Symbol } from '~/design-system/components/Symbol/Symbol';

import { AppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { AppInteractionItem } from '../AppConnectionMenu/AppInteractionItem';
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
import ExternalImage from '../ExternalImage/ExternalImage';
import { SwitchNetworkMenuSelector } from '../SwitchMenu/SwitchNetworkMenu';

interface AppConnectionWalletItemDropdownMenuProps {
  appMetadata: AppMetadata;
  testId?: string;
}

export const AppConnectionWalletItemDropdownMenu = ({
  appMetadata,
  testId,
}: AppConnectionWalletItemDropdownMenuProps) => {
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { updateAppSessionChainId, disconnectAppSession, appSession } =
    useAppSession({ host: appMetadata.appHost });

  const changeChainId = useCallback(
    (chainId: string) => {
      updateAppSessionChainId(Number(chainId));
    },
    [updateAppSessionChainId],
  );

  const disconnect = useCallback(() => {
    disconnectAppSession();
    setSubMenuOpen(false);
    setMenuOpen(false);
  }, [disconnectAppSession]);

  const onValueChange = useCallback(
    (value: 'disconnect' | 'switch-networks' | 'open-dapp') => {
      switch (value) {
        case 'disconnect':
          disconnect();
          break;
        case 'switch-networks':
          setSubMenuOpen(!subMenuOpen);
          break;
        case 'open-dapp':
          break;
      }
    },
    [disconnect, subMenuOpen],
  );

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        e.preventDefault();
      }
    },
  });
  return (
    <Box onClick={(e) => e.stopPropagation()} testId={testId}>
      <DropdownMenu onOpenChange={setMenuOpen} open={menuOpen}>
        <DropdownMenuTrigger asChild>
          <Box style={{ cursor: 'default' }}>
            <ButtonSymbol
              color="labelTertiary"
              height="32px"
              variant="transparent"
              symbol="ellipsis.circle"
            />
          </Box>
        </DropdownMenuTrigger>

        <DropdownMenuContentWithSubMenu reff={dropdownMenuRef} align="end">
          <DropdownMenuRadioGroup
            onValueChange={(value) =>
              onValueChange(
                value as 'disconnect' | 'switch-networks' | 'open-dapp',
              )
            }
          >
            <DropdownSubMenu
              parentRef={dropdownMenuRef}
              setMenuOpen={setMenuOpen}
              subMenuOpen={subMenuOpen}
              setSubMenuOpen={setSubMenuOpen}
              subMenuContent={
                <Stack space="4px">
                  <DropdownMenuRadioGroup
                    value={`${appSession?.chainId}`}
                    onValueChange={changeChainId}
                  >
                    <AccentColorProviderWrapper
                      color={appMetadata.appColor || undefined}
                    >
                      <SwitchNetworkMenuSelector
                        type="dropdown"
                        highlightAccentColor
                        selectedValue={`${appSession?.chainId}`}
                        onNetworkSelect={(e) => {
                          e?.preventDefault();
                          setSubMenuOpen(false);
                          setMenuOpen(false);
                        }}
                        onShortcutPress={changeChainId}
                        showDisconnect={!!appSession}
                        disconnect={disconnect}
                      />
                    </AccentColorProviderWrapper>
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
            <DropdownMenuRadioItem
              value="disconnect"
              onSelect={(e) => e.stopPropagation()}
            >
              <Inline space="8px" alignVertical="center">
                <Box height="fit" style={{ width: '18px', height: '18px' }}>
                  <Inline
                    height="full"
                    alignHorizontal="center"
                    alignVertical="center"
                  >
                    <Symbol
                      size={12}
                      symbol="xmark"
                      weight="semibold"
                      color="label"
                    />
                  </Inline>
                </Box>
                <Text size="14pt" weight="semibold" color="label">
                  {i18n.t(
                    'app_connection_switcher.wallet_item_dropdown_menu.disconnect',
                  )}
                </Text>
              </Inline>
            </DropdownMenuRadioItem>
            <Box paddingVertical="4px">
              <DropdownMenuSeparator />
            </Box>
            <DropdownMenuRadioItem
              value="open-dapp"
              onSelect={(e) => e.preventDefault()}
            >
              <Inline space="8px" alignVertical="center">
                <Box
                  style={{
                    height: '18px',
                    width: '18px',
                    overflow: 'hidden',
                  }}
                  borderRadius="9px"
                >
                  <Inline
                    alignHorizontal="center"
                    alignVertical="center"
                    height="full"
                  >
                    <ExternalImage
                      src={appMetadata.appLogo}
                      width="18"
                      height="18"
                    />
                  </Inline>
                </Box>
                <Text size="14pt" weight="semibold" color="label">
                  {i18n.t(
                    'app_connection_switcher.wallet_item_dropdown_menu.open_app',
                    { appName: appMetadata.appName || appMetadata.appHost },
                  )}
                </Text>
              </Inline>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContentWithSubMenu>
      </DropdownMenu>
    </Box>
  );
};
