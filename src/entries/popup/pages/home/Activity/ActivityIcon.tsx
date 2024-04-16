import { RainbowTransaction } from '~/core/types/transactions';
import {
  CoinIcon,
  ContractIcon,
  NFTIcon,
  TwoCoinsIcon,
} from '~/entries/popup/components/CoinIcon/CoinIcon';

export const ActivityIcon = ({
  transaction: { type, changes, asset, chainId, contract },
  size = 36,
  badge = true,
}: {
  transaction: RainbowTransaction;
  badge?: boolean;
  size?: 36 | 20 | 14 | 16;
}) => {
  if (['wrap', 'unwrap', 'swap'].includes(type)) {
    const inAsset = changes?.find((a) => a?.direction === 'in')?.asset;
    const outAsset = changes?.find((a) => a?.direction === 'out')?.asset;

    if (!!inAsset && !!outAsset)
      return (
        <TwoCoinsIcon
          size={size}
          under={outAsset}
          over={inAsset}
          badge={badge}
        />
      );
  }

  if (asset?.type === 'nft')
    return <NFTIcon asset={asset} size={size} badge={badge} />;

  if (asset)
    return (
      <CoinIcon
        asset={asset}
        fallbackText={asset.name}
        size={size}
        badge={badge}
      />
    );

  return (
    <ContractIcon
      iconUrl={contract?.iconUrl}
      size={size}
      badge={badge}
      chainId={chainId}
    />
  );
};
