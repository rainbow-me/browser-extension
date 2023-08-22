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
  const changes = transaction.changes || [];

  const firstChangedAsset = transaction.changes[0]?.asset;
  const secondChangedAsset = transaction.changes[1]?.asset;
  // const assetsIn = changes.filter((change) => change?.direction === 'in');
  // const assetsOut = changes.filter((change) => change?.direction === 'out');

  if (
    ['wrap', 'undwrap', 'swap'].includes(transaction.type) &&
    !!firstChangedAsset &&
    !!secondChangedAsset
  )
    return <TwoCoinsIcon under={firstChangedAsset} over={secondChangedAsset} />;

  if (firstChangedAsset?.type === 'nft')
    return <NFTIcon asset={firstChangedAsset} size={36} badge />;

  if (firstChangedAsset)
    return (
      <CoinIcon
        asset={firstChangedAsset}
        fallbackText={firstChangedAsset.symbol}
      />
    );

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
