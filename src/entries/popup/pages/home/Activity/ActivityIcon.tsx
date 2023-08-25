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
  transaction,
}: {
  transaction: RainbowTransaction;
}) => {
  if (['wrap', 'undwrap', 'swap'].includes(transaction.type)) {
    const inAsset = transaction.changes.find(
      (a) => a?.direction === 'in',
    )?.asset;
    const outAsset = transaction.changes.find(
      (a) => a?.direction === 'out',
    )?.asset;

    if (!!inAsset && !!outAsset)
      return <TwoCoinsIcon under={outAsset} over={inAsset} />;
  }

  const asset = transaction.asset;

  if (asset?.type === 'nft') return <NFTIcon asset={asset} size={36} badge />;

  if (asset) return <CoinIcon asset={asset} fallbackText={asset.symbol} />;

  return (
    <Box position="relative">
      <ContractInteractionIcon />
      {transaction.chainId !== ChainId.mainnet && (
        <Box position="absolute" bottom="0" style={{ zIndex: 2, left: '-6px' }}>
          <ChainBadge chainId={transaction.chainId} shadow size="16" />
        </Box>
      )}
    </Box>
  );
};
