import { zeroAddress } from 'viem';

import { customChainIdsToAssetNames } from '~/core/references/assets';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useNetworkStore } from '~/core/state/networks/networks';
import { getBadgeUrl } from '~/core/state/networks/utils';
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

const ChainBadge = ({
  chainId,
  shadow = false,
  size = '18',
}: ChainIconProps) => {
  const { currentTheme } = useCurrentThemeStore();
  const chainBadges = useNetworkStore((state) => state.getChainsBadgeUrls());
  const chain = useNetworkStore((state) => state.getActiveRpcForChain(chainId));

  let boxShadow;
  if (shadow) {
    boxShadow =
      currentTheme === 'dark'
        ? '0px 2px 6px 0px rgba(0, 0, 0, 0.02), 0px 4px 12px 0px rgba(0, 0, 0, 0.24)'
        : '0px 2px 6px 0px rgba(0, 0, 0, 0.02), 0px 4px 12px 0px rgba(37, 41, 46, 0.08)';
  }
  const iconSize = typeof size === 'number' ? size : chainBadgeSize[size];
  const badgeUrl = getBadgeUrl({
    chainBadges: chainBadges[chainId],
    size: iconSize,
  });

  if (!badgeUrl && !customChainIdsToAssetNames[chainId]) {
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
          src={getCustomChainIconUrl(chainId, zeroAddress)}
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
          src={badgeUrl}
          width={iconSize}
          height={iconSize}
          loading="lazy"
          style={{
            borderRadius: '50%',
            userSelect: 'none',
          }}
          draggable={false}
        />
      )}
    </Box>
  );
};

export { ChainBadge };
