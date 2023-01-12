import React from 'react';
import { Chain, useNetwork } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box, Inline, Inset, Symbol, Text } from '~/design-system';

import { ChainBadge } from '../ChainBadge/ChainBadge';
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
}: {
  selectedValue?: string;
}) => {
  const { chains } = useNetwork();
  return (
    <>
      {chains.map((chain, i) => {
        const { id: chainId, name } = chain;
        return (
          <DropdownMenuRadioItem
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
            <DropdownMenuItemIndicator style={{ marginLeft: 'auto' }}>
              <Symbol weight="medium" symbol="checkmark" size={11} />
            </DropdownMenuItemIndicator>
          </DropdownMenuRadioItem>
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
  chainId: Chain['id'];
  onChainChanged: (chainId: Chain['id'], chain: Chain) => void;
  onDisconnect?: () => void;
  triggerComponent: React.ReactNode;
}

export const SwitchNetworkMenu = ({
  chainId,
  onChainChanged,
  onDisconnect,
  triggerComponent,
}: SwitchNetworkMenuProps) => {
  const { chains } = useNetwork();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Box style={{ cursor: 'default' }}>{triggerComponent}</Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={1}>
        <DropdownMenuLabel>{i18n.t('menu.network.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={String(chainId)}
          onValueChange={(chainId) => {
            const chain = chains.find(
              ({ id }) => String(id) === chainId,
            ) as Chain;
            onChainChanged(chain?.id, chain);
          }}
        >
          <SwitchNetworkMenuSelector selectedValue={String(chainId)} />
        </DropdownMenuRadioGroup>
        {onDisconnect ? (
          <SwitchNetworkMenuDisconnect onDisconnect={onDisconnect} />
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
