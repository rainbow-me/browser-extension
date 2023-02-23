import React, { useMemo } from 'react';
import { Chain, useNetwork } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box, Inline, Inset, Symbol, Text } from '~/design-system';

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

export const SwitchNetworkMenuSelector = ({
  selectedValue,
  highlightAccentColor,
  type,
}: {
  selectedValue?: string;
  highlightAccentColor?: boolean;
  type: 'dropdown' | 'context';
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

  return (
    <>
      {chains.map((chain, i) => {
        const { id: chainId, name } = chain;
        return (
          <MenuRadioItem
            highlightAccentColor={highlightAccentColor}
            value={String(chainId)}
            key={i}
            selectedValue={selectedValue}
          >
            <Box id={`switch-network-item-${i}`}>
              <Inline space="8px" alignVertical="center">
                <ChainBadge chainId={chainId} size="small" />
                <Text color="label" size="14pt" weight="semibold">
                  {name}
                </Text>
              </Inline>
            </Box>
            <MenuItemIndicator style={{ marginLeft: 'auto' }}>
              <Symbol weight="medium" symbol="checkmark" size={11} />
            </MenuItemIndicator>
          </MenuRadioItem>
        );
      })}
    </>
  );
};

export const SwitchNetworkMenuDisconnect = ({
  onDisconnect,
}: {
  onDisconnect: () => void;
}) => {
  return (
    <Box id="switch-network-menu-disconnect" as="button" onClick={onDisconnect}>
      <Inset vertical="8px">
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
      </Inset>
    </Box>
  );
};

interface SwitchNetworkMenuProps {
  accentColor?: string;
  chainId: Chain['id'];
  onChainChanged: (chainId: Chain['id'], chain: Chain) => void;
  onDisconnect?: () => void;
  triggerComponent: React.ReactNode;
  type: 'dropdown' | 'context';
}

export const SwitchNetworkMenu = ({
  accentColor,
  chainId,
  onChainChanged,
  onDisconnect,
  triggerComponent,
  type,
}: SwitchNetworkMenuProps) => {
  const { chains } = useNetwork();

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

  return (
    <Menu>
      <MenuTrigger asChild>
        <Box style={{ cursor: 'default' }}>{triggerComponent}</Box>
      </MenuTrigger>
      <MenuContent accentColor={accentColor} sideOffset={1}>
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
          />
        </MenuRadioGroup>
        {onDisconnect ? (
          <SwitchNetworkMenuDisconnect onDisconnect={onDisconnect} />
        ) : null}
      </MenuContent>
    </Menu>
  );
};
