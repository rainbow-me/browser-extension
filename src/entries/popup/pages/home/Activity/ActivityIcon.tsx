import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { Box } from '~/design-system';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import {
  CoinIcon,
  NFTIcon,
  TwoCoinsIcon,
} from '~/entries/popup/components/CoinIcon/CoinIcon';

import { ContractInteractionIcon } from './ContractInteractionIcon';

export const ActivityIcon = ({
  transaction: { type, changes, asset, chainId },
  size = 36,
  badge = true,
}: {
  transaction: RainbowTransaction;
  badge?: boolean;
  size?: 36 | 20 | 14 | 16;
}) => {
  if (['wrap', 'undwrap', 'swap'].includes(type)) {
    const inAsset = changes?.find((a) => a?.direction === 'in')?.asset;
    const outAsset = changes?.find((a) => a?.direction === 'out')?.asset;

    if (!!inAsset && !!outAsset)
      return <TwoCoinsIcon size={size} under={outAsset} over={inAsset} />;
  }

  if (asset?.type === 'nft')
    return <NFTIcon asset={asset} size={size} badge={badge} />;

  if (asset)
    return (
      <CoinIcon
        asset={asset}
        fallbackText={asset.symbol}
        size={size}
        badge={badge}
      />
    );

  return (
    <Box position="relative">
      <ContractInteractionIcon size={size} />
      {badge && chainId !== ChainId.mainnet && (
        <Box position="absolute" bottom="0" style={{ zIndex: 2, left: '-6px' }}>
          <ChainBadge chainId={chainId} shadow size="16" />
        </Box>
      )}
    </Box>
  );
};
