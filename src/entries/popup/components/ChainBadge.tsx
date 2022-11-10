import React from 'react';

import ArbitrumBadge from 'static/assets/badges/arbitrumBadge.png';
import OptimismBadge from 'static/assets/badges/optimismBadge.png';
import PolygonBadge from 'static/assets/badges/polygonBadge.png';
import ArbitrumBadgeDark from 'static/images/badges/arbitrumBadgeDark.png';
import BscBadge from 'static/images/badges/bscBadge.png';
import BscBadgeDark from 'static/images/badges/bscBadgeDark.png';
import OptimismBadgeDark from 'static/images/badges/optimismBadgeDark.png';
import PolygonBadgeDark from 'static/images/badges/polygonBadgeDark.png';
import { ChainName } from '~/core/types/chains';
import { Box } from '~/design-system';
import { useAccentColorContext } from '~/design-system/components/Box/ColorContext';

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
          top: -22,
          left: -15,
        }}
      >
        <img src={source} style={imageStyles} />
      </Box>
    </Box>
  );
});
