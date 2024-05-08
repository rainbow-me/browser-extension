import { useCallback, useRef, useState } from 'react';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { DappMetadata } from '~/core/resources/metadata/dapp';
import { goToNewTab } from '~/core/utils/tabs';
import { Box, ButtonSymbol, Inline, Text } from '~/design-system';
import { Symbol } from '~/design-system/components/Symbol/Symbol';

import { useAppSession } from '../../../hooks/useAppSession';
import { useKeyboardShortcut } from '../../../hooks/useKeyboardShortcut';
import { AppInteractionItem } from '../../AppConnectionMenu/AppInteractionItem';
import { DappIcon } from '../../DappIcon/DappIcon';
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../DropdownMenu/DropdownMenu';
import {
  DropdownMenuContentWithSubMenu,
  DropdownSubMenu,
} from '../../DropdownMenu/DropdownSubMenu';
import { SwitchNetworkMenuSelector } from '../../SwitchMenu/SwitchNetworkMenu';

interface AppConnectionWalletItemDropdownMenuProps {
  dappMetadata?: DappMetadata | null;
  address: Address;
}

export const AppConnectionWalletItemDropdownMenu = ({
  dappMetadata,
  address,
}: AppConnectionWalletItemDropdownMenuProps) => {
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { updateSessionChainId, disconnectSession, appSession } = useAppSession(
    { host: dappMetadata?.appHost || '' },
  );

  const changeChainId = useCallback(
    (chainId: string) => {
      updateSessionChainId({ address, chainId: Number(chainId) });
    },
    [address, updateSessionChainId],
  );

  const disconnect = useCallback(() => {
    dappMetadata?.appHost &&
      disconnectSession({ address, host: dappMetadata?.appHost });
    setSubMenuOpen(false);
    setMenuOpen(false);
  }, [address, dappMetadata?.appHost, disconnectSession]);

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
          goToNewTab({
            url: dappMetadata?.url,
            active: false,
          });
          break;
      }
    },
    [dappMetadata?.url, disconnect, subMenuOpen],
  );

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        e.preventDefault();
      }
    },
  });
  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <DropdownMenu onOpenChange={setMenuOpen} open={menuOpen}>
        <DropdownMenuTrigger asChild>
          <Box
            testId={`app-connection-wallet-item-dropdown-menu-${address}`}
            style={{ cursor: 'default' }}
          >
            <ButtonSymbol
              color="labelTertiary"
              height="32px"
              variant="transparent"
              symbol="ellipsis.circle"
            />
          </Box>
        </DropdownMenuTrigger>

        <DropdownMenuContentWithSubMenu
          subMenuRef={dropdownMenuRef}
          align="end"
        >
          <DropdownMenuRadioGroup
            onValueChange={(value: string) =>
              onValueChange(
                value as 'disconnect' | 'switch-networks' | 'open-dapp',
              )
            }
          >
            <DropdownSubMenu
              parentRef={dropdownMenuRef}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              subMenuOpen={subMenuOpen}
              setSubMenuOpen={setSubMenuOpen}
              subMenuContent={
                <DropdownMenuRadioGroup
                  value={`${appSession.sessions[address]}`}
                  onValueChange={changeChainId}
                >
                  <SwitchNetworkMenuSelector
                    type="dropdown"
                    highlightAccentColor
                    selectedValue={`${appSession.sessions[address]}`}
                    onNetworkSelect={(e) => {
                      e?.preventDefault();
                      setSubMenuOpen(false);
                      setMenuOpen(false);
                    }}
                    onShortcutPress={changeChainId}
                    showDisconnect={false}
                    disconnect={disconnect}
                  />
                </DropdownMenuRadioGroup>
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
                <DappIcon appLogo={dappMetadata?.appLogo} size="18px" />
                <Text size="14pt" weight="semibold" color="label">
                  {i18n.t(
                    'app_connection_switcher.wallet_item_dropdown_menu.open_app',
                    { appName: dappMetadata?.appName || dappMetadata?.appHost },
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
