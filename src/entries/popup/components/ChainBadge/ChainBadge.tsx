import { AddressZero } from '@ethersproject/constants';

import ApeChainBadge from 'static/assets/badges/apechainBadge@3x.png';
import ArbitrumBadge from 'static/assets/badges/arbitrumBadge@3x.png';
import AvalancheBadge from 'static/assets/badges/avalancheBadge@3x.png';
import BaseBadge from 'static/assets/badges/baseBadge@3x.png';
import BlastBadge from 'static/assets/badges/blastBadge@3x.png';
import BscBadge from 'static/assets/badges/bscBadge@3x.png';
import DegenBadge from 'static/assets/badges/degenBadge@3x.png';
import EthereumBadge from 'static/assets/badges/ethereumBadge@3x.png';
import HardhatBadge from 'static/assets/badges/hardhatBadge@3x.png';
import OptimismBadge from 'static/assets/badges/optimismBadge@3x.png';
import PolygonBadge from 'static/assets/badges/polygonBadge@3x.png';
import ZoraBadge from 'static/assets/badges/zoraBadge@3x.png';
import { customChainIdsToAssetNames } from '~/core/references/assets';
import { rainbowChainsStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { ChainId } from '~/core/types/chains';
import { getCustomChainIconUrl } from '~/core/utils/assets';
import { Box, Text } from '~/design-system';
import { colors as emojiColors } from '~/entries/popup/utils/emojiAvatarBackgroundColors';

import { pseudoRandomArrayItemFromString } from '../../utils/pseudoRandomArrayItemFromString';
import ExternalImage from '../ExternalImage/ExternalImage';

const chainBadgeSize = {
  '60': 60,
  '45': 45,
  '32': 32,
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
  [ChainId.avalanche]: AvalancheBadge,
  [ChainId.hardhat]: HardhatBadge,
  [ChainId.hardhatOptimism]: HardhatBadge,
  [ChainId.sepolia]: EthereumBadge,
  [ChainId.holesky]: EthereumBadge,
  [ChainId.optimismSepolia]: OptimismBadge,
  [ChainId.bscTestnet]: BscBadge,
  [ChainId.polygonAmoy]: PolygonBadge,
  [ChainId.arbitrumSepolia]: ArbitrumBadge,
  [ChainId.baseSepolia]: BaseBadge,
  [ChainId.zoraSepolia]: ZoraBadge,
  [ChainId.avalancheFuji]: AvalancheBadge,
  [ChainId.blast]: BlastBadge,
  [ChainId.blastSepolia]: BlastBadge,
  [ChainId.degen]: DegenBadge,
  [ChainId.apechain]: ApeChainBadge,
  [ChainId.apechainCurtis]: ApeChainBadge,
};

const ChainBadge = ({
  chainId,
  shadow = false,
  size = '18',
}: ChainIconProps) => {
  const { currentTheme } = useCurrentThemeStore();

  let boxShadow;
  if (shadow) {
    boxShadow =
      currentTheme === 'dark'
        ? '0px 2px 6px 0px rgba(0, 0, 0, 0.02), 0px 4px 12px 0px rgba(0, 0, 0, 0.24)'
        : '0px 2px 6px 0px rgba(0, 0, 0, 0.02), 0px 4px 12px 0px rgba(37, 41, 46, 0.08)';
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
        height: iconSize,
        width: iconSize,
        borderRadius: iconSize,
        ...(customChainIdsToAssetNames[chainId] ? {} : { boxShadow }),
      }}
    >
      {customChainIdsToAssetNames[chainId] ? (
        <ExternalImage
          src={getCustomChainIconUrl(chainId, AddressZero)}
          borderRadius={iconSize}
          boxShadow={boxShadow}
          width={iconSize}
          height={iconSize}
          customFallbackSymbol="globe"
          loading="lazy"
          style={{
            userSelect: 'none',
            height: iconSize,
            width: iconSize,
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
            borderRadius: iconSize,
            userSelect: 'none',
          }}
          draggable={false}
        />
      )}
    </Box>
  );
};

export { ChainBadge };
