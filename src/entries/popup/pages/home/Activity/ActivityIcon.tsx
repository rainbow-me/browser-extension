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
  if (
    ['wrap', 'undwrap', 'swap'].includes(transaction.type) &&
    !!changes[0] &&
    !!changes[1]
  )
    return <TwoCoinsIcon under={changes[0].asset} over={changes[1].asset} />;

  if (transaction.asset?.type === 'nft')
    return <NFTIcon asset={transaction.asset} size={36} badge />;

  const asset = transaction.asset;
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
