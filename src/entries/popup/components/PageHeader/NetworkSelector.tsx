import * as React from 'react';

import { Box, Inline, Text } from '~/design-system';

import { ChainBadge } from '../ChainBadge/ChainBadge';
import { MenuRadioItem } from '../Menu/Menu';
import { supportedChains } from '../SwitchMenu/SwitchNetworkMenu';

export const NetworkSelector = () => {
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
