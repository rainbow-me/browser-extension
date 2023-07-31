import React, { useCallback, useMemo, useRef } from 'react';
import { Chain, useNetwork } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { ChainId } from '~/core/types/chains';
import {
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Symbol,
  Text,
} from '~/design-system';
import { Space } from '~/design-system/styles/designTokens';

import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { simulateClick } from '../../utils/simulateClick';
import { ChainBadge } from '../ChainBadge/ChainBadge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItemIndicator,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ContextMenu/ContextMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import { SWAP_INPUT_MASK_ID } from '../InputMask/SwapInputMask/SwapInputMask';

export const SwitchNetworkMenuSelector = ({
  selectedValue,
  highlightAccentColor,
  type,
  showDisconnect,
  disconnect,
  onNetworkSelect,
  onShortcutPress,
}: {
  selectedValue?: string;
  highlightAccentColor?: boolean;
  type: 'dropdown' | 'context';
  showDisconnect: boolean;
  disconnect?: () => void;
  onNetworkSelect?: (event?: Event) => void;
  onShortcutPress: (chainId: string) => void;
}) => {
  const { chains } = useNetwork();

  const { MenuRadioItem, MenuItemIndicator } = useMemo(() => {
    return type === 'dropdown'
      ? {
          MenuRadioItem: DropdownMenuRadioItem,
          MenuItemIndicator: DropdownMenuItemIndicator,
        }
      : {
          MenuRadioItem: ContextMenuRadioItem,
          MenuItemIndicator: ContextMenuItemIndicator,
        };
  }, [type]);

  const handleTokenShortcuts = useCallback(
    (e: KeyboardEvent) => {
      const chainNumber = Number(e.key);
      if (chainNumber) {
        const chain = chains[chainNumber - 1];
        if (chain) {
          onShortcutPress(String(chain.id));
          onNetworkSelect?.();
        } else if (showDisconnect && chainNumber === chains.length + 1) {
          disconnect?.();
        }
      }
    },
    [chains, disconnect, onNetworkSelect, onShortcutPress, showDisconnect],
  );

  useKeyboardShortcut({
    handler: handleTokenShortcuts,
  });

  return (
    <Box id="switch-network-menu-selector">
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
            <Box width="full" testId={`switch-network-item-${i}`}>
              <Columns alignHorizontal="justify" alignVertical="center">
                <Column>
                  <Box testId={`switch-network-item-${i}`}>
                    <Inline space="8px" alignVertical="center">
                      <ChainBadge chainId={chainId} size="18" />
                      <Text color="label" size="14pt" weight="semibold">
                        {name}
                      </Text>
                    </Inline>
                  </Box>
                </Column>

                <Column width="content">
                  {selectedValue === String(chainId) ? (
                    <MenuItemIndicator style={{ marginLeft: 'auto' }}>
                      <Symbol weight="medium" symbol="checkmark" size={11} />
                    </MenuItemIndicator>
                  ) : (
                    <Box
                      background="fillSecondary"
                      padding="4px"
                      borderRadius="3px"
                      boxShadow="1px"
                    >
                      <Text
                        size="12pt"
                        color="labelSecondary"
                        weight="semibold"
                      >
                        {i + 1}
                      </Text>
                    </Box>
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
            <Box
              background="fillSecondary"
              padding="4px"
              borderRadius="3px"
              boxShadow="1px"
            >
              <Text size="12pt" color="labelSecondary" weight="semibold">
                {shortcutLabel}
              </Text>
            </Box>
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
}: SwitchNetworkMenuProps) => {
  const { chains } = useNetwork();
  const triggerRef = useRef<HTMLDivElement>(null);

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
          onValueChange={(chainId) => {
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
          />
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
};
