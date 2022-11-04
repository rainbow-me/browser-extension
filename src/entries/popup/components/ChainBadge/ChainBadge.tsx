import React from 'react';

import { ChainType } from '~/core/references';
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
  chainType: keyof typeof ChainType;
  size: 'large' | 'medium' | 'small';
}

const networkBadges = {
  [ChainType.ethereum]: EthereumBadge,
  [ChainType.polygon]: PolygonBadge,
  [ChainType.optimism]: OptimismBadge,
  [ChainType.arbitrum]: ArbitrumBadge,
};

const ChainBadge = ({ chainType, size = 'small' }: ChainIconProps) => {
  const { iconSize } = sizeConfigs[size];

  return (
    <Box style={{ height: iconSize, width: iconSize }}>
      <img
        src={networkBadges[chainType]}
        width="100%"
        height="100%"
        loading="lazy"
      />
    </Box>
  );
};

export { ChainBadge };
