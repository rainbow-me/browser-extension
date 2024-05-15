import { motion } from 'framer-motion';
import React, { useCallback, useEffect } from 'react';

import { selectNfts } from '~/core/resources/_selectors/nfts';
import { useNftsForCollection } from '~/core/resources/nfts/nftsForCollection';
import { useCurrentAddressStore } from '~/core/state';
import { useNftsStore } from '~/core/state/nfts';
import { ChainName } from '~/core/types/chains';
import { SimpleHashCollectionDetails, UniqueAsset } from '~/core/types/nfts';
import { getSimpleHashSupportedChainNames } from '~/core/utils/chains';
import {
  getUniqueAssetImagePreviewURL,
  getUniqueAssetImageThumbnailURL,
} from '~/core/utils/nfts';
import {
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Row,
  Rows,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import { transitions } from '~/design-system/styles/designTokens';
import { NFTIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';
import { parseNftName } from '~/entries/popup/components/CommandK/useSearchableNFTs';
import ExternalImage from '~/entries/popup/components/ExternalImage/ExternalImage';
import { useWallets } from '~/entries/popup/hooks/useWallets';

import NFTContextMenu from './NFTContextMenu';
import { NFTThumbnail } from './NFTThumbnail';

type NFTCollectionDisplayMode = 'grid' | 'list';

const COLLECTION_IMAGE_SIZE = 16;

export function NFTCollectionSection({
  collection,
  isLast,
  onAssetClick,
  displayMode = 'grid',
}: {
  collection: SimpleHashCollectionDetails;
  isLast: boolean;
  onAssetClick: (asset: UniqueAsset) => void;
  displayMode?: NFTCollectionDisplayMode;
}) {
  const { currentAddress: address } = useCurrentAddressStore();
  const { isWatchingWallet } = useWallets();
  const sections = useNftsStore.use.sections();
  const toggleGallerySectionOpen = useNftsStore.use.toggleGallerySectionOpen();
  const hidden = useNftsStore.use.hidden();
  const hiddenNftsForAddress = hidden[address] || {};
  const sectionsForAddress = sections[address] || {};
  const collectionId = collection?.collection_id;
  const totalCopiesOwned = collection?.distinct_nfts_owned;
  const isHiddenSection =
    collection.collection_details.description === '_hidden';
  const shouldHideHiddenSection = !Object.values(
    hiddenNftsForAddress || {},
  ).filter(Boolean).length;
  const collectionVisible = !!(
    collectionId &&
    sectionsForAddress[isHiddenSection ? '_hidden' : collectionId]
  );
  const { data, hasNextPage, isFetching, isFetchingNextPage, fetchNextPage } =
    useNftsForCollection(
      {
        address,
        collectionId,
        collectionChains: (isHiddenSection
          ? getSimpleHashSupportedChainNames()
          : collection?.collection_details?.chains) as ChainName[],
      },
      {
        enabled: collectionVisible,
      },
    );
  const nfts = selectNfts(data)?.filter((n) => {
    if (isHiddenSection) {
      return hiddenNftsForAddress[n.uniqueId];
    }
    return !hiddenNftsForAddress[n.uniqueId];
  });
  const setCollectionVisible = useCallback(() => {
    toggleGallerySectionOpen({
      address,
      collectionId: isHiddenSection ? '_hidden' : collectionId || '',
    });
  }, [address, collectionId, isHiddenSection, toggleGallerySectionOpen]);
  useEffect(() => {
    if (hasNextPage && !isFetching && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);
  return shouldHideHiddenSection && isHiddenSection ? null : (
    <Rows>
      <Row>
        <Lens onClick={setCollectionVisible} borderRadius="6px">
          <Inset horizontal="4px">
            <Box
              style={{
                paddingTop: 7,
                paddingBottom: isLast && !collectionVisible ? 19 : 7,
              }}
              testId={`nfts-collection-section-${collection.collection_details.name}`}
            >
              <Columns alignVertical="center">
                <Column>
                  <Inline alignVertical="center" space="7px">
                    <Box
                      borderRadius="round"
                      style={{
                        overflow: 'none',
                        height: COLLECTION_IMAGE_SIZE,
                        width: COLLECTION_IMAGE_SIZE,
                      }}
                    >
                      <ExternalImage
                        src={collection.collection_details.image_url || ''}
                        height={COLLECTION_IMAGE_SIZE}
                        width={COLLECTION_IMAGE_SIZE}
                        borderRadius="round"
                      />
                    </Box>
                    <TextOverflow
                      size="14pt"
                      weight="bold"
                      color="label"
                      maxWidth={260}
                    >
                      {collection.collection_details.name}
                    </TextOverflow>
                    <Box paddingTop="1px">
                      {!isHiddenSection && (
                        <Text size="12pt" weight="bold" color="labelQuaternary">
                          {nfts?.length || totalCopiesOwned}
                        </Text>
                      )}
                    </Box>
                  </Inline>
                </Column>
                <Column width="content">
                  <Box
                    as={motion.div}
                    animate={
                      collectionVisible ? { rotate: 0 } : { rotate: -90 }
                    }
                  >
                    <Inline alignVertical="center">
                      <Symbol
                        symbol="chevron.down"
                        weight="bold"
                        size={12}
                        color="labelQuaternary"
                      />
                    </Inline>
                  </Box>
                </Column>
              </Columns>
            </Box>
          </Inset>
        </Lens>
        <Inset horizontal="4px">
          {displayMode === 'grid' && collectionVisible && (
            <Box
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                gap: 16,
                paddingBottom: collectionVisible ? 23 : 0,
                paddingTop: 6,
              }}
            >
              {nfts?.map((asset, i) => {
                return (
                  <NFTContextMenu
                    key={i}
                    nft={asset}
                    offset={isWatchingWallet ? -120 : -220}
                  >
                    <NFTThumbnail
                      borderRadius="10px"
                      size={96}
                      imageSrc={
                        collectionVisible
                          ? getUniqueAssetImageThumbnailURL(asset)
                          : undefined
                      }
                      placeholderSrc={
                        collectionVisible
                          ? getUniqueAssetImagePreviewURL(asset)
                          : undefined
                      }
                      onClick={() => onAssetClick(asset)}
                      index={i}
                    />
                  </NFTContextMenu>
                );
              })}
            </Box>
          )}
          {displayMode === 'list' && collectionVisible && (
            <Rows>
              {nfts?.map((nft, i) => (
                <Row key={`list-row-${i}`}>
                  <NFTCompactListRow
                    nft={nft}
                    handleClick={() => onAssetClick(nft)}
                  />
                </Row>
              ))}
            </Rows>
          )}
        </Inset>
      </Row>
    </Rows>
  );
}

const NFTCompactListRow = ({
  handleClick,
  nft,
}: {
  handleClick: () => void;
  nft: UniqueAsset;
}) => {
  const _NFTIcon = React.useMemo(
    () => <NFTIcon asset={nft} size={20} badge={false} />,
    [nft],
  );
  const NFTBadge = React.useMemo(() => {
    const tokenId = parseInt(nft?.id);
    const hasTokenId = !isNaN(tokenId) && tokenId < 999999999;
    return hasTokenId ? (
      <Box
        alignItems="center"
        borderColor="separatorSecondary"
        borderRadius="7px"
        borderWidth="1px"
        display="flex"
        paddingHorizontal="4px"
        style={{
          height: 20,
          whiteSpace: 'nowrap',
        }}
      >
        <Text
          align="center"
          color="labelQuaternary"
          size="12pt"
          weight="semibold"
        >
          {`#${tokenId}`}
        </Text>
      </Box>
    ) : null;
  }, [nft]);

  return (
    <Box
      as={motion.div}
      style={{
        height: 40,
        willChange: 'transform',
      }}
      transition={transitions.bounce}
      whileTap={{ scale: 0.97 }}
    >
      <Box
        aria-label={nft?.name}
        borderRadius="12px"
        onClick={handleClick}
        paddingVertical="10px"
        paddingHorizontal="2px"
      >
        <Columns alignVertical="center" space="8px">
          <Column width="content">
            <Box
              alignItems="center"
              display="flex"
              justifyContent="center"
              style={{ height: 20, width: 20 }}
            >
              {_NFTIcon}
            </Box>
          </Column>
          <Column>
            <Inline alignVertical="center" space="8px" wrap={false}>
              <Inline alignVertical="bottom" space="8px" wrap={false}>
                <TextOverflow
                  color="labelTertiary"
                  size="12pt"
                  weight="semibold"
                >
                  {parseNftName(nft.name, nft.id)}
                </TextOverflow>
              </Inline>
            </Inline>
          </Column>
          <Column width="content">
            <Inline space="6px" wrap={false}>
              {NFTBadge}
            </Inline>
          </Column>
        </Columns>
      </Box>
    </Box>
  );
};
