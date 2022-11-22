import React from 'react';
import { Chain, useNetwork } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box, Inline, Inset, Symbol, Text } from '~/design-system';

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

export const SwitchNetworkMenuSelector = () => {
  const { chains } = useNetwork();
  return (
    <>
      {chains.map((chain, i) => {
        const { id: chainId, name } = chain;
        return (
          <MenuRadioItem value={String(chainId)} key={i}>
            <Box id={`switch-network-item-${i}`}>
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
    <Menu>
      <MenuTrigger asChild>
        <Box style={{ cursor: 'default' }}>{triggerComponent}</Box>
      </MenuTrigger>
      <MenuContent>
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
          <SwitchNetworkMenuSelector />
        </MenuRadioGroup>
        {onDisconnect ? (
          <SwitchNetworkMenuDisconnect onDisconnect={onDisconnect} />
        ) : null}
      </MenuContent>
    </Menu>
  );
};
