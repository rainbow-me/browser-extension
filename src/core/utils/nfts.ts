import { ChainName } from '../types/chains';
import {
  PolygonAllowListDictionary,
  SimpleHashChain,
  SimpleHashFloorPrice,
  SimpleHashMarketplaceId,
  SimpleHashNFT,
  UniqueAsset,
  UniqueTokenType,
  ValidatedSimpleHashNFT,
  uniqueTokenTypes,
} from '../types/nfts';

import { convertRawAmountToDecimalFormat } from './numbers';

export const POAP_NFT_ADDRESS = '0x22c1f6050e56d2876009903609a2cc3fef83b415';
export const ENS_NFT_CONTRACT_ADDRESS =
  '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85';

export const simpleHashSupportedChainNames = [
  'ethereum',
  ChainName.apechain,
  ChainName.arbitrum,
  ChainName.arbitrumNova,
  ChainName.avalanche,
  ChainName.b3,
  ChainName.base,
  ChainName.blast,
  ChainName.bsc,
  ChainName.canto,
  ChainName.celo,
  ChainName.degen,
  ChainName.fantom,
  ChainName.forma,
  ChainName.gnosis,
  ChainName.godwoken,
  ChainName.immutableZkEvm,
  ChainName.linea,
  ChainName.loot,
  ChainName.manta,
  ChainName.mode,
  ChainName.moonbeam,
  ChainName.optimism,
  ChainName.opbnb,
  ChainName.palm,
  ChainName.polygon,
  ChainName.polygonZkEvm,
  ChainName.proofOfPlayApex,
  ChainName.proofOfPlayBoss,
  ChainName.rari,
  ChainName.scroll,
  ChainName.sei,
  ChainName.xai,
  ChainName.zksync,
  ChainName.zora,
] as (ChainName | 'ethereum' | 'ethereum-sepolia')[];

export const simpleHashSupportedTestnetChainNames = [
  'ethereum-sepolia',
  ChainName.arbitrumSepolia,
  ChainName.baseSepolia,
  ChainName.bscTestnet,
  ChainName.blastSepolia,
  ChainName.optimismSepolia,
  ChainName.polygonAmoy,
  ChainName.zoraSepolia,
] as (ChainName | 'ethereum-sepolia' | 'ethereum')[];

/**
 * Returns an NFT's `UniqueTokenType`.
 * @param contractAddress NFT contract address
 * @returns `UniqueTokenType`
 */
export function getUniqueTokenType(contractAddress: string): UniqueTokenType {
  switch (contractAddress) {
    case POAP_NFT_ADDRESS:
      return uniqueTokenTypes.POAP;
    case ENS_NFT_CONTRACT_ADDRESS:
      return uniqueTokenTypes.ENS;
    default:
      return uniqueTokenTypes.NFT;
  }
}

/**
 * Returns a `ChainName` from a `SimpleHashChain`. If an invalid value is
 * forcably passed in, it will throw.
 * @param chain `SimpleHashChain`
 * @returns `Network`
 */
export function getNetworkFromSimpleHashChain(
  chain: SimpleHashChain,
): ChainName {
  switch (chain) {
    case SimpleHashChain.Apechain:
      return ChainName.apechain;
    case SimpleHashChain.Avalanche:
      return ChainName.avalanche;
    case SimpleHashChain.AvalancheFuji:
      return ChainName.avalancheFuji;
    case SimpleHashChain.Arbitrum:
      return ChainName.arbitrum;
    case SimpleHashChain.ArbitrumNova:
      return ChainName.arbitrumNova;
    case SimpleHashChain.ArbitrumSepolia:
      return ChainName.arbitrumSepolia;
    case SimpleHashChain.Base:
      return ChainName.base;
    case SimpleHashChain.BaseSepolia:
      return ChainName.baseSepolia;
    case SimpleHashChain.B3:
      return ChainName.b3;
    case SimpleHashChain.Blast:
      return ChainName.blast;
    case SimpleHashChain.BlastSepolia:
      return ChainName.blastSepolia;
    case SimpleHashChain.Bsc:
      return ChainName.bsc;
    case SimpleHashChain.BscTestnet:
      return ChainName.bscTestnet;
    case SimpleHashChain.Canto:
      return ChainName.canto;
    case SimpleHashChain.Celo:
      return ChainName.celo;
    case SimpleHashChain.Degen:
      return ChainName.degen;
    case SimpleHashChain.Ethereum:
    case SimpleHashChain.Gnosis:
      return ChainName.mainnet;
    case SimpleHashChain.EthereumSepolia:
      return ChainName.sepolia;
    case SimpleHashChain.Fantom:
      return ChainName.fantom;
    case SimpleHashChain.Forma:
      return ChainName.forma;
    case SimpleHashChain.Godwoken:
      return ChainName.godwoken;
    case SimpleHashChain.ImmutableZkEvm:
      return ChainName.immutableZkEvm;
    case SimpleHashChain.Linea:
      return ChainName.linea;
    case SimpleHashChain.Loot:
      return ChainName.loot;
    case SimpleHashChain.Manta:
      return ChainName.manta;
    case SimpleHashChain.Mode:
      return ChainName.mode;
    case SimpleHashChain.Moonbeam:
      return ChainName.moonbeam;
    case SimpleHashChain.OpBnb:
      return ChainName.opbnb;
    case SimpleHashChain.Optimism:
      return ChainName.optimism;
    case SimpleHashChain.OptimismSepolia:
      return ChainName.optimismSepolia;
    case SimpleHashChain.Palm:
      return ChainName.palm;
    case SimpleHashChain.Polygon:
      return ChainName.polygon;
    case SimpleHashChain.PolygonAmoy:
      return ChainName.polygonAmoy;
    case SimpleHashChain.PolygonZkEvm:
      return ChainName.polygonZkEvm;
    case SimpleHashChain.ProofOfPlayApex:
      return ChainName.proofOfPlayApex;
    case SimpleHashChain.ProofOfPlayBoss:
      return ChainName.proofOfPlayBoss;
    case SimpleHashChain.Rari:
      return ChainName.rari;
    case SimpleHashChain.Scroll:
      return ChainName.scroll;
    case SimpleHashChain.Sei:
      return ChainName.sei;
    case SimpleHashChain.Xai:
      return ChainName.xai;
    case SimpleHashChain.ZkSync:
      return ChainName.zksync;
    case SimpleHashChain.Zora:
      return ChainName.zora;
    case SimpleHashChain.ZoraSepolia:
      return ChainName.zoraSepolia;
    default:
      /*
       * Throws here because according to TS types, we should NEVER hit this
       * default branch in the logic
       */
      throw new Error(
        `getNetworkFromSimpleHashChain received unknown chain: ${chain}`,
      );
  }
}

export function filterSimpleHashNFTs(
  nfts: SimpleHashNFT[],
  allowList: PolygonAllowListDictionary,
): ValidatedSimpleHashNFT[] {
  return nfts
    .filter((nft) => {
      const lowercasedContractAddress = nft.contract_address?.toLowerCase();
      const network = getNetworkFromSimpleHashChain(nft.chain);

      const isMissingRequiredFields =
        !nft.name ||
        !nft.collection?.name ||
        !nft.contract_address ||
        !nft.token_id ||
        !network;
      const isPolygonAndNotAllowed =
        allowList &&
        nft.chain === SimpleHashChain.Polygon &&
        !allowList[lowercasedContractAddress];
      const isGnosisAndNotPOAP =
        nft.chain === SimpleHashChain.Gnosis &&
        lowercasedContractAddress !== POAP_NFT_ADDRESS;

      if (
        isMissingRequiredFields ||
        isPolygonAndNotAllowed ||
        isGnosisAndNotPOAP
      ) {
        return false;
      }

      return true;
    })
    .map((nft) => ({
      ...nft,
      name: nft.name || '',
      contract_address: nft.contract_address,
      chain: getNetworkFromSimpleHashChain(nft.chain),
      collection: { ...nft.collection, name: nft.collection.name || '' },
      token_id: nft.token_id || '',
    }));
}

export function extractPoapDropId(externalUrl: string) {
  const parsedUrl = new URL(externalUrl);
  const pathParts = parsedUrl.pathname.split('/');
  return pathParts[2];
}

/**
 * Maps a `SimpleHashNFT` to a `UniqueAsset`.
 * @param nft `SimpleHashNFT`
 * @returns `UniqueAsset`
 */
export function simpleHashNFTToUniqueAsset(
  nft: ValidatedSimpleHashNFT,
): UniqueAsset {
  const collection = nft.collection;
  const lowercasedContractAddress = nft.contract_address?.toLowerCase();

  const marketplace = nft.collection.marketplace_pages?.[0];

  const floorPrice = collection?.floor_prices?.find(
    (floorPrice: SimpleHashFloorPrice) =>
      floorPrice?.marketplace_id === SimpleHashMarketplaceId.OpenSea &&
      floorPrice?.payment_token?.payment_token_id === 'ethereum.native',
  );

  const isENS = lowercasedContractAddress === ENS_NFT_CONTRACT_ADDRESS;

  const standard = nft.contract.type;

  const isPoap = nft.contract_address.toLowerCase() === POAP_NFT_ADDRESS;
  const poapDropId = !isPoap ? null : extractPoapDropId(nft.external_url || '');

  return {
    animation_url:
      nft?.video_url ??
      nft.audio_url ??
      nft.model_url ??
      nft.extra_metadata?.animation_original_url ??
      undefined,
    asset_contract: {
      address: lowercasedContractAddress,
      name: nft.contract.name || undefined,
      schema_name: standard,
      symbol: nft.contract.symbol || undefined,
      deployed_by: nft.contract.deployed_by,
    },
    background: nft.background_color,
    collection: {
      description: collection.description,
      discord_url: collection.discord_url,
      external_url: collection.external_url,
      image_url: collection.image_url,
      name: isENS ? 'ENS' : collection.name,
      slug: marketplace?.marketplace_collection_id ?? '',
      twitter_username: collection.twitter_username,
      collection_id: collection.collection_id,
    },
    description: nft.description,
    external_link: nft.external_url,
    familyImage: collection.image_url,
    familyName: isENS ? 'ENS' : collection.name,
    floorPriceEth:
      floorPrice?.value !== null && floorPrice?.value !== undefined
        ? convertRawAmountToDecimalFormat(
            floorPrice?.value,
            floorPrice?.payment_token?.decimals,
          )
        : undefined,
    fullUniqueId: `${nft.chain}_${nft.contract_address}_${nft.token_id}`,
    id: nft.token_id,
    image_original_url: nft.extra_metadata?.image_original_url,
    image_preview_url: nft.previews.image_small_url,
    image_thumbnail_url: nft.previews.image_large_url,
    image_url: nft.image_url ?? nft.extra_metadata?.image_original_url,
    isPoap,
    isSendable:
      !isPoap &&
      (nft.contract.type === 'ERC721' || nft.contract.type === 'ERC1155'),
    lastSalePaymentToken: nft.last_sale?.payment_token?.symbol,
    lowResUrl: nft.previews.image_large_url || null,
    marketplaceCollectionUrl: marketplace?.collection_url,
    marketplaceId: marketplace?.marketplace_id ?? null,
    marketplaceName: marketplace?.marketplace_name ?? null,
    name: nft.name,
    network: nft.chain,
    permalink: marketplace?.nft_url ?? '',
    poapDropId,
    predominantColor: nft.previews?.predominant_color ?? undefined,
    traits: nft.extra_metadata?.attributes ?? [],
    uniqueId: `${nft.contract_address}_${nft.token_id}`,
    urlSuffixForAsset: `${nft.contract_address}/${nft.token_id}`,
    video_url: nft.video_url,
    video_properties: nft.video_properties,
    audio_url: nft.audio_url,
    audio_properties: nft.audio_properties,
    model_url: nft.model_url,
    model_properties: nft.model_properties,
    last_sale: nft.last_sale,
  };
}

export const getUniqueAssetImageThumbnailURL = (asset: UniqueAsset) => {
  return asset.image_thumbnail_url || asset.image_original_url || '';
};

export const getUniqueAssetImagePreviewURL = (asset: UniqueAsset) => {
  return asset.image_preview_url || getUniqueAssetImageThumbnailURL(asset);
};

export const isENS = (asset: UniqueAsset) => {
  const lowercasedContractAddress = asset.asset_contract.address?.toLowerCase();
  return lowercasedContractAddress === ENS_NFT_CONTRACT_ADDRESS;
};

export const ENS_COLLECTION_ID = 'e34baafc65deb66d52d11be5d44f523e';
