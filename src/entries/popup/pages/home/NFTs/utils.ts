import { UniqueAsset } from '~/core/types/nfts';

export const getOpenseaUrl = ({
  nft,
  collectionPage,
}: {
  nft?: UniqueAsset | null;
  collectionPage?: boolean;
}) => {
  const networkUrlString =
    nft?.network === 'mainnet' ? 'ethereum' : nft?.network;
  const openseaNftUrl = `https://opensea.io/assets/${networkUrlString}/${nft?.asset_contract.address}/${nft?.id}`;
  const openseaCollectionUrl = `https://opensea.io/assets/${networkUrlString}/${nft?.asset_contract.address}`;
  return collectionPage ? openseaCollectionUrl : openseaNftUrl;
};
