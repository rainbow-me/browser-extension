import React from 'react';
import { chain } from 'wagmi';

import { Box } from '~/design-system';

import ArbitrumBadge from '../../../../assets/badges/arbitrumBadge.png';
import EthereumBadge from '../../../../assets/badges/ethereumBadge.png';
import OptimismBadge from '../../../../assets/badges/optimismBadge.png';
import PolygonBadge from '../../../../assets/badges/polygonBadge.png';

const sizeConfigs = {
  large: {
    iconSize: 60,
  },
  medium: {
    iconSize: 45,
  },
  small: {
    iconSize: 18,
  },
};

interface ChainIconProps {
  chainId: number;
  size: 'large' | 'medium' | 'small';
}

const networkBadges = {
  [chain.mainnet.id]: EthereumBadge,
  [chain.polygon.id]: PolygonBadge,
  [chain.optimism.id]: OptimismBadge,
  [chain.arbitrum.id]: ArbitrumBadge,
};

const ChainBadge = ({ chainId, size = 'small' }: ChainIconProps) => {
  const { iconSize } = sizeConfigs[size];

  return (
    <Box style={{ height: iconSize, width: iconSize }}>
      <img
        src={networkBadges[chainId]}
        width="100%"
        height="100%"
        loading="lazy"
      />
    </Box>
  );
};

export { ChainBadge };
