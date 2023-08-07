import { useCallback, useRef, useState } from 'react';
import { Address } from 'wagmi';

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
  DropdownMenuItem,
  DropdownMenuRadioGroup,
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
  address: Address;
}

export const AppConnectionWalletItemDropdownMenu = ({
  appMetadata,
  testId,
  address,
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

        <DropdownMenuContentWithSubMenu
          subMenuRef={dropdownMenuRef}
          align="end"
        >
          <DropdownMenuRadioGroup
            onValueChange={(value) =>
              onValueChange(
                value as 'disconnect' | 'switch-networks' | 'open-dapp',
              )
            }
          >
            <Box key="switch-networks">
              <DropdownSubMenu
                menuOpen={menuOpen}
                parentRef={dropdownMenuRef}
                setMenuOpen={setMenuOpen}
                subMenuOpen={subMenuOpen}
                setSubMenuOpen={setSubMenuOpen}
                subMenuContent={
                  <Stack space="4px">
                    <DropdownMenuRadioGroup
                      value={`${appSession.sessions[address]}`}
                      onValueChange={changeChainId}
                    >
                      <AccentColorProviderWrapper
                        color={appMetadata.appColor || undefined}
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
            </Box>
            <Box key="disconnect">
              <DropdownMenuItem
                color="label"
                leftComponent={
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
                }
                onSelect={() => null}
              >
                <Stack space="8px">
                  <Text size="14pt" weight="semibold" color="label">
                    {'Disconnect'}
                  </Text>
                </Stack>
              </DropdownMenuItem>
              <Box paddingVertical="4px">
                <DropdownMenuSeparator />
              </Box>
            </Box>
            <Box key="open-dapp">
              <DropdownMenuItem
                color="label"
                leftComponent={
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
                }
                onSelect={() => null}
              >
                <Stack space="8px">
                  <Text size="14pt" weight="semibold" color="label">
                    {`Open ${appMetadata.appName || appMetadata.appHost}`}
                  </Text>
                </Stack>
              </DropdownMenuItem>
            </Box>
          </DropdownMenuRadioGroup>
        </DropdownMenuContentWithSubMenu>
      </DropdownMenu>
    </Box>
  );
};
