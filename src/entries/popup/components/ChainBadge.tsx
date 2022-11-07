import React from 'react';

import { ChainName } from '~/core/types/chains';
import { Box } from '~/design-system';
import { useAccentColorContext } from '~/design-system/components/Box/ColorContext';

import ArbitrumBadge from '../../../../static/images/badges/arbitrumBadge.png';
import ArbitrumBadgeDark from '../../../../static/images/badges/arbitrumBadgeDark.png';
import BscBadge from '../../../../static/images/badges/bscBadge.png';
import BscBadgeDark from '../../../../static/images/badges/bscBadgeDark.png';
import OptimismBadge from '../../../../static/images/badges/optimismBadge.png';
import OptimismBadgeDark from '../../../../static/images/badges/optimismBadgeDark.png';
import PolygonBadge from '../../../../static/images/badges/polygonBadge.png';
import PolygonBadgeDark from '../../../../static/images/badges/polygonBadgeDark.png';

const AssetIconsByTheme: {
  [key in ChainName]?: {
    dark: string;
    light: string;
  };
} = {
  [ChainName.arbitrum]: {
    dark: ArbitrumBadgeDark,
    light: ArbitrumBadge,
  },
  [ChainName.optimism]: {
    dark: OptimismBadgeDark,
    light: OptimismBadge,
  },
  [ChainName.polygon]: {
    dark: PolygonBadgeDark,
    light: PolygonBadge,
  },
  [ChainName.bsc]: {
    dark: BscBadgeDark,
    light: BscBadge,
  },
};

export const ChainBadge = React.memo(function ChainBadge({
  chain,
}: {
  chain: ChainName;
}) {
  const colorContext = useAccentColorContext();
  const isDarkMode = colorContext === 'dark';
  const source = AssetIconsByTheme[chain]?.[isDarkMode ? 'dark' : 'light'];
  if (!source) return null;

  const imageStyles = {
    height: 36,
    width: 36,
  };

  return (
    <Box
      marginRight="-8px"
      style={{
        position: 'relative',
      }}
    >
      <Box
        style={{
          alignItems: 'center',
          position: 'absolute',
          left: -60,
          top: 14,
        }}
      >
        <img src={source} style={imageStyles} />
      </Box>
    </Box>
  );
});
