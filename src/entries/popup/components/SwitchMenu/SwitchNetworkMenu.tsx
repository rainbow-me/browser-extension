import React, { useCallback, useMemo, useRef } from 'react';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { ChainId } from '~/core/types/chains';
import { isCustomChain } from '~/core/utils/chains';
import {
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { Space } from '~/design-system/styles/designTokens';

import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useUserChains } from '../../hooks/useUserChains';
import { simulateClick } from '../../utils/simulateClick';
import { ChainBadge } from '../ChainBadge/ChainBadge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ContextMenu/ContextMenu';
import {
  DROPDOWN_MENU_ITEM_HEIGHT,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import { SWAP_INPUT_MASK_ID } from '../InputMask/SwapInputMask/SwapInputMask';
import { ShortcutHint } from '../ShortcutHint/ShortcutHint';

const MENU_SELECTOR_MAX_HEIGHT = DROPDOWN_MENU_ITEM_HEIGHT * 6.5;

export const SwitchNetworkMenuSelector = ({
  selectedValue,
  highlightAccentColor,
  type,
  showDisconnect,
  disconnect,
  onNetworkSelect,
  onShortcutPress,
  onlySwapSupportedNetworks = false,
}: {
  selectedValue?: string;
  highlightAccentColor?: boolean;
  type: 'dropdown' | 'context';
  showDisconnect: boolean;
  disconnect?: () => void;
  onNetworkSelect?: (event?: Event) => void;
  onShortcutPress: (chainId: string) => void;
  onlySwapSupportedNetworks?: boolean;
}) => {
  const { trackShortcut } = useKeyboardAnalytics();
  const { chains: userChains } = useUserChains();

  const chains = useMemo(() => {
    return onlySwapSupportedNetworks
      ? userChains.filter((chain) => !isCustomChain(chain.id))
      : userChains;
  }, [onlySwapSupportedNetworks, userChains]);

  const { MenuRadioItem } = useMemo(() => {
    return type === 'dropdown'
      ? {
          MenuRadioItem: DropdownMenuRadioItem,
        }
      : {
          MenuRadioItem: ContextMenuRadioItem,
        };
  }, [type]);

  const handleTokenShortcuts = useCallback(
    (e: KeyboardEvent) => {
      const chainNumber = Number(e.key);
      if (chainNumber) {
        const chain = chains[chainNumber - 1];
        if (chain) {
          trackShortcut({
            key: chainNumber.toString(),
            type: 'switchNetworkMenu.selectChain',
          });
          onShortcutPress(String(chain.id));
          onNetworkSelect?.();
        } else if (showDisconnect && chainNumber === chains.length + 1) {
          trackShortcut({
            key: chainNumber.toString(),
            type: 'switchNetworkMenu.disconnect',
          });
          disconnect?.();
        }
      }
    },
    [
      chains,
      disconnect,
      onNetworkSelect,
      onShortcutPress,
      showDisconnect,
      trackShortcut,
    ],
  );

  useKeyboardShortcut({
    handler: handleTokenShortcuts,
  });

  return (
    <Box
      id="switch-network-menu-selector"
      paddingHorizontal="8px"
      marginHorizontal="-8px"
      style={{ maxHeight: MENU_SELECTOR_MAX_HEIGHT, overflow: 'scroll' }}
    >
      {chains.map((chain, i) => {
        const { id: chainId, name } = chain;
        return (
          <MenuRadioItem
            highlightAccentColor={highlightAccentColor}
            value={String(chainId)}
            key={i}
            selectedValue={selectedValue}
            onSelect={onNetworkSelect}
          >
            <Box width="full">
              <Columns alignHorizontal="justify" alignVertical="center">
                <Column>
                  <Box
                    testId={`switch-network-item-${chainId}`}
                    style={{ maxWidth: 180 }}
                  >
                    <Inline space="8px" alignVertical="center" wrap={false}>
                      <ChainBadge chainId={chainId} size="18" />
                      <TextOverflow color="label" size="14pt" weight="semibold">
                        {name}
                      </TextOverflow>
                    </Inline>
                  </Box>
                </Column>

                <Column width="content">
                  {selectedValue === String(chainId) ? (
                    <Box style={{ height: '18px', width: '18px' }}>
                      <Inline alignHorizontal="center" alignVertical="center">
                        <Inset vertical="3px">
                          <Symbol weight="bold" symbol="checkmark" size={12} />
                        </Inset>
                      </Inline>
                    </Box>
                  ) : (
                    i < 9 && <ShortcutHint hint={`${i + 1}`} />
                  )}
                </Column>
              </Columns>
            </Box>
          </MenuRadioItem>
        );
      })}
      {showDisconnect && disconnect && (
        <SwitchNetworkMenuDisconnect
          onDisconnect={disconnect}
          shortcutLabel={String(chains.length + 1)}
        />
      )}
    </Box>
  );
};

export const SwitchNetworkMenuDisconnect = ({
  shortcutLabel,
  onDisconnect,
}: {
  shortcutLabel: string;
  onDisconnect: () => void;
}) => {
  return (
    <Box
      testId="switch-network-menu-disconnect"
      as="button"
      onClick={onDisconnect}
      width="full"
    >
      <Inset vertical="8px">
        <Columns alignHorizontal="justify" alignVertical="center">
          <Column>
            <Inline alignVertical="center" space="8px">
              <Box style={{ width: 18, height: 18 }}>
                <Inline
                  height="full"
                  alignVertical="center"
                  alignHorizontal="center"
                >
                  <Symbol size={12} symbol="xmark" weight="semibold" />
                </Inline>
              </Box>
              <Text size="14pt" weight="bold">
                {i18n.t('menu.network.disconnect')}
              </Text>
            </Inline>
          </Column>
          <Column width="content">
            <ShortcutHint hint={shortcutLabel} />
          </Column>
        </Columns>
      </Inset>
    </Box>
  );
};

interface SwitchNetworkMenuProps {
  accentColor?: string;
  chainId: ChainId;
  onChainChanged: (chainId: ChainId, chain: Chain) => void;
  onDisconnect?: () => void;
  triggerComponent: React.ReactNode;
  type: 'dropdown' | 'context';
  marginRight?: Space;
  onOpenChange?: (open: boolean) => void;
  onlySwapSupportedNetworks?: boolean;
}

export const SwitchNetworkMenu = ({
  accentColor,
  chainId,
  onChainChanged,
  onDisconnect,
  triggerComponent,
  type,
  marginRight,
  onOpenChange,
  onlySwapSupportedNetworks,
}: SwitchNetworkMenuProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const { chains } = useUserChains();

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.swap.OPEN_NETWORK_MENU.key) {
        const activeElement = document.activeElement;
        const tagName = activeElement?.tagName;
        if (tagName !== 'INPUT' || activeElement?.id === SWAP_INPUT_MASK_ID) {
          simulateClick(triggerRef?.current);
        }
      }
    },
  });

  const {
    Menu,
    MenuTrigger,
    MenuContent,
    MenuLabel,
    MenuSeparator,
    MenuRadioGroup,
  } = useMemo(() => {
    return type === 'dropdown'
      ? {
          Menu: DropdownMenu,
          MenuTrigger: DropdownMenuTrigger,
          MenuContent: DropdownMenuContent,
          MenuLabel: DropdownMenuLabel,
          MenuSeparator: DropdownMenuSeparator,
          MenuRadioGroup: DropdownMenuRadioGroup,
        }
      : {
          Menu: ContextMenu,
          MenuTrigger: ContextMenuTrigger,
          MenuContent: ContextMenuContent,
          MenuLabel: ContextMenuLabel,
          MenuSeparator: ContextMenuSeparator,
          MenuRadioGroup: ContextMenuRadioGroup,
        };
  }, [type]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange?.(isOpen);
  };

  return (
    <Menu onOpenChange={handleOpenChange}>
      <MenuTrigger asChild>
        <Box style={{ cursor: 'default' }} ref={triggerRef}>
          {triggerComponent}
        </Box>
      </MenuTrigger>
      <MenuContent
        accentColor={accentColor}
        sideOffset={1}
        marginRight={marginRight}
      >
        <MenuLabel>{i18n.t('menu.network.title')}</MenuLabel>
        <MenuSeparator />
        <MenuRadioGroup
          value={String(chainId)}
          onValueChange={(chainId: string) => {
            const chain = chains.find(
              ({ id }) => String(id) === chainId,
            ) as Chain;
            onChainChanged(chain?.id, chain);
          }}
        >
          <SwitchNetworkMenuSelector
            type={type}
            selectedValue={String(chainId)}
            onShortcutPress={(chainId) => {
              const chain = chains.find(
                ({ id }) => String(id) === chainId,
              ) as Chain;
              onChainChanged(chain?.id, chain);
            }}
            showDisconnect={!!onDisconnect}
            disconnect={onDisconnect}
            onlySwapSupportedNetworks={onlySwapSupportedNetworks}
          />
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
};
