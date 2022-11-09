import React from 'react';
import { chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box, Inline, Inset, Text } from '~/design-system';

import { ChainBadge } from '../ChainBadge/ChainBadge';
import {
  Menu,
  MenuContent,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from '../Menu/Menu';
import { SFSymbol } from '../SFSymbol/SFSymbol';

export const supportedChains: { [key: string]: SelectedNetwork } = {
  [chain.mainnet.id]: {
    network: chain.mainnet.network,
    chainId: chain.mainnet.id,
    name: chain.mainnet.name,
  },
  [chain.optimism.id]: {
    network: chain.optimism.network,
    chainId: chain.optimism.id,
    name: chain.optimism.name,
  },
  [chain.polygon.id]: {
    network: chain.polygon.network,
    chainId: chain.polygon.id,
    name: chain.polygon.name,
  },
  [chain.arbitrum.id]: {
    network: chain.arbitrum.network,
    chainId: chain.arbitrum.id,
    name: chain.arbitrum.name,
  },
};

export const SwitchNetworkMenuSelector = () => {
  return (
    <>
      {Object.keys(supportedChains).map((chain, i) => {
        const { chainId, name } = supportedChains[chain];
        return (
          <MenuRadioItem value={chain} key={i}>
            <Box
              style={{
                cursor: 'pointer',
              }}
              id={`switch-network-item-${i}`}
            >
              <Inline space="8px" alignVertical="center">
                <ChainBadge chainId={chainId} size="small" />
                <Text color="label" size="14pt" weight="semibold">
                  {name}
                </Text>
              </Inline>
            </Box>
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
    <Box style={{ cursor: 'pointer' }} as="button" onClick={onDisconnect}>
      <Inset vertical="8px">
        <Inline alignVertical="center" space="8px">
          <Box style={{ width: 18, height: 18 }}>
            <Inline
              height="full"
              alignVertical="center"
              alignHorizontal="center"
            >
              <SFSymbol size={12} symbol="xmark" />
            </Inline>
          </Box>
          <Text size="14pt" weight="bold">
            {i18n.t('page_header.disconnect')}
          </Text>
        </Inline>
      </Inset>
    </Box>
  );
};

interface SwitchNetworkMenuProps {
  title: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  renderMenuTrigger: React.ReactNode;
  onDisconnect?: () => void;
}

interface SelectedNetwork {
  network: string;
  chainId: number;
  name: string;
}

export const SwitchNetworkMenu = ({
  title,
  selectedValue,
  onValueChange,
  renderMenuTrigger,
  onDisconnect,
}: SwitchNetworkMenuProps) => {
  return (
    <Menu>
      <MenuTrigger asChild>{renderMenuTrigger}</MenuTrigger>
      <MenuContent>
        <MenuLabel>{title}</MenuLabel>
        <MenuSeparator />
        <MenuRadioGroup value={selectedValue} onValueChange={onValueChange}>
          <SwitchNetworkMenuSelector />
        </MenuRadioGroup>
        {onDisconnect ? (
          <SwitchNetworkMenuDisconnect onDisconnect={onDisconnect} />
        ) : null}
      </MenuContent>
    </Menu>
  );
};
