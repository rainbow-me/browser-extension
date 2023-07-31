import ArbitrumBadge from 'static/assets/badges/arbitrumBadge.png';
import BscBadge from 'static/assets/badges/bscBadge.png';
import EthereumBadge from 'static/assets/badges/ethereumBadge.png';
import HardhatBadge from 'static/assets/badges/hardhatBadge.png';
import OptimismBadge from 'static/assets/badges/optimismBadge.png';
import PolygonBadge from 'static/assets/badges/polygonBadge.png';
import { ChainId } from '~/core/types/chains';
import { Box } from '~/design-system';

const chainBadgeSize = {
  '60': 60,
  '45': 45,
  '18': 18,
  '16': 16,
  '14': 14,
  '8': 8,
};

interface ChainIconProps {
  chainId: ChainId;
  shadow?: boolean;
  size: keyof typeof chainBadgeSize;
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
  size = '18',
}: ChainIconProps) => {
  if (!Object.keys(networkBadges).includes(`${chainId}`)) return null;

  const iconSize = chainBadgeSize[size];

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
        style={{ userSelect: 'none' }}
        draggable={false}
      />
    </Box>
  );
};

export { ChainBadge };
