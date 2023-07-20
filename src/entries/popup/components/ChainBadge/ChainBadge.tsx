import ArbitrumBadge from 'static/assets/badges/arbitrumBadge.png';
import BscBadge from 'static/assets/badges/bscBadge.png';
import EthereumBadge from 'static/assets/badges/ethereumBadge.png';
import HardhatBadge from 'static/assets/badges/hardhatBadge.png';
import OptimismBadge from 'static/assets/badges/optimismBadge.png';
import PolygonBadge from 'static/assets/badges/polygonBadge.png';
import { ChainId } from '~/core/types/chains';
import { Box } from '~/design-system';

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
  extraSmall: {
    iconSize: 16,
  },
  micro: {
    iconSize: 8,
  },
};

interface ChainIconProps {
  chainId: ChainId;
  shadow?: boolean;
  size: 'large' | 'medium' | 'small' | 'extraSmall' | 'micro';
}

const networkBadges = {
  [ChainId.mainnet]: EthereumBadge,
  [ChainId.polygon]: PolygonBadge,
  [ChainId.optimism]: OptimismBadge,
  [ChainId.arbitrum]: ArbitrumBadge,
  [ChainId.bsc]: BscBadge,
  [ChainId.hardhat]: HardhatBadge,
};

const ChainBadge = ({
  chainId,
  shadow = false,
  size = 'small',
}: ChainIconProps) => {
  const { iconSize } = sizeConfigs[size];
  let boxShadow;
  if (shadow) {
    boxShadow = '0px 4px 12px 0px rgba(0, 0, 0, 0.3)';
  }
  return (
    <Box
      borderRadius="round"
      style={{
        height: iconSize,
        width: iconSize,
        borderRadius: iconSize,
        boxShadow,
      }}
    >
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
