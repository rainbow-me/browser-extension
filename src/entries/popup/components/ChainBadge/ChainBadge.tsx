import { AddressZero } from '@ethersproject/constants';

import ArbitrumBadge from 'static/assets/badges/arbitrumBadge@3x.png';
import BaseBadge from 'static/assets/badges/baseBadge@3x.png';
import BscBadge from 'static/assets/badges/bscBadge@3x.png';
import EthereumBadge from 'static/assets/badges/ethereumBadge@3x.png';
import HardhatBadge from 'static/assets/badges/hardhatBadge@3x.png';
import OptimismBadge from 'static/assets/badges/optimismBadge@3x.png';
import PolygonBadge from 'static/assets/badges/polygonBadge@3x.png';
import ZoraBadge from 'static/assets/badges/zoraBadge@3x.png';
import { getCustomChainIconUrl } from '~/core/resources/assets/customNetworkAssets';
import { rainbowChainsStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { customChainIdsToAssetNames } from '~/core/utils/chains';
import { Box, Text } from '~/design-system';
import { colors as emojiColors } from '~/entries/popup/utils/emojiAvatarBackgroundColors';

import { pseudoRandomArrayItemFromString } from '../../utils/pseudoRandomArrayItemFromString';
import ExternalImage from '../ExternalImage/ExternalImage';

const chainBadgeSize = {
  '60': 60,
  '45': 45,
  '18': 18,
  '16': 16,
  '14': 14,
  '10': 10,
  '8': 8,
};

export interface ChainIconProps {
  chainId: ChainId;
  shadow?: boolean;
  size: keyof typeof chainBadgeSize | number;
}

const networkBadges = {
  [ChainId.mainnet]: EthereumBadge,
  [ChainId.polygon]: PolygonBadge,
  [ChainId.optimism]: OptimismBadge,
  [ChainId.arbitrum]: ArbitrumBadge,
  [ChainId.base]: BaseBadge,
  [ChainId.zora]: ZoraBadge,
  [ChainId.bsc]: BscBadge,
  [ChainId.hardhat]: HardhatBadge,
  [ChainId.hardhatOptimism]: HardhatBadge,
  [ChainId.goerli]: EthereumBadge,
  [ChainId.sepolia]: EthereumBadge,
  [ChainId.holesky]: EthereumBadge,
  [ChainId.optimismGoerli]: OptimismBadge,
  [ChainId.optimismSepolia]: OptimismBadge,
  [ChainId.bscTestnet]: BscBadge,
  [ChainId.polygonMumbai]: PolygonBadge,
  [ChainId.arbitrumGoerli]: ArbitrumBadge,
  [ChainId.arbitrumSepolia]: ArbitrumBadge,
  [ChainId.baseGoerli]: BaseBadge,
  [ChainId.baseSepolia]: BaseBadge,
  [ChainId.zoraTestnet]: ZoraBadge,
  [ChainId.zoraSepolia]: ZoraBadge,
};

const ChainBadge = ({
  chainId,
  shadow = false,
  size = '18',
}: ChainIconProps) => {
  let boxShadow;
  if (shadow) {
    boxShadow = '0px 4px 12px 0px rgba(0, 0, 0, 0.3)';
  }
  const iconSize = typeof size === 'number' ? size : chainBadgeSize[size];

  if (
    !Object.keys(networkBadges).includes(`${chainId}`) &&
    !customChainIdsToAssetNames[chainId]
  ) {
    const chain = rainbowChainsStore.getState().getActiveChain({ chainId });
    return (
      <Box
        borderRadius="round"
        style={{
          height: iconSize,
          width: iconSize,
          borderRadius: iconSize,
          boxShadow,
          backgroundColor: pseudoRandomArrayItemFromString<string>(
            chain?.name || '',
            emojiColors,
          ),
        }}
      >
        <Box
          height="full"
          alignItems="center"
          flexDirection="row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            size={Number(size) < 12 ? '7pt' : '9pt'}
            color="labelWhite"
            weight="bold"
            align="center"
          >
            {chain?.name.substring(0, 1).toUpperCase()}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      borderRadius="round"
      style={{
        width: iconSize,
        borderRadius: iconSize,
        boxShadow,
      }}
    >
      {customChainIdsToAssetNames[chainId] ? (
        <ExternalImage
          src={getCustomChainIconUrl(chainId, AddressZero)}
          width={iconSize}
          height={iconSize}
          loading="lazy"
          style={{
            userSelect: 'none',
            height: iconSize,
            width: iconSize,
            borderRadius: iconSize,
          }}
          draggable={false}
        />
      ) : (
        <img
          src={networkBadges[chainId]}
          width={iconSize}
          height={iconSize}
          loading="lazy"
          style={{
            userSelect: 'none',
          }}
          draggable={false}
        />
      )}
    </Box>
  );
};

export { ChainBadge };
