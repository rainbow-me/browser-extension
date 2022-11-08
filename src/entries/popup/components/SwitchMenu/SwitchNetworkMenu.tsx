import React from 'react';
import { chain } from 'wagmi';

import { Box, Inline, Text } from '~/design-system';

import { ChainBadge } from '../ChainBadge/ChainBadge';
import { SFSymbol } from '../SFSymbol/SFSymbol';

import { SwitchMenu } from './SwitchMenu';

interface SwitchMenuProps {
  title: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  renderMenuTrigger: React.ReactNode;
}

interface SelectedNetwork {
  network: string;
  chainId: number;
  name: string;
}

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

export const SwitchNetworkMenu = ({
  title,
  selectedValue,
  onValueChange,
  renderMenuTrigger,
}: SwitchMenuProps) => {
  return (
    <SwitchMenu
      title={title}
      renderMenuTrigger={renderMenuTrigger}
      menuItemIndicator={<SFSymbol symbol="checkMark" size={11} />}
      renderMenuItem={(chain, i) => {
        const { chainId, name } = supportedChains[chain];
        return (
          <Box id={`switch-network-item-${i}`}>
            <Inline space="8px" alignVertical="center">
              <ChainBadge chainId={chainId} size="small" />
              <Text color="label" size="14pt" weight="semibold">
                {name}
              </Text>
            </Inline>
          </Box>
        );
      }}
      menuItems={Object.keys(supportedChains)}
      selectedValue={selectedValue}
      onValueChange={onValueChange}
    />
  );
};
