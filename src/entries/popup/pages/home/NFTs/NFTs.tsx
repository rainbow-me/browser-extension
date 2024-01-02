import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import React, { memo, useCallback, useEffect, useMemo } from 'react';

import { i18n } from '~/core/languages';
import { selectNftCollections } from '~/core/resources/_selectors/nfts';
import { useNfts } from '~/core/resources/nfts';
import { getNftCount } from '~/core/resources/nfts/nfts';
import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useNftsStore } from '~/core/state/nfts';
import { UniqueAsset } from '~/core/types/nfts';
import { chunkArray } from '~/core/utils/assets';
import { getUniqueAssetImageThumbnailURL } from '~/core/utils/nfts';
import {
  Bleed,
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Row,
  Rows,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { Lens } from '~/design-system/components/Lens/Lens';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';
import { useCoolMode } from '~/entries/popup/hooks/useCoolMode';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import ExternalImage from '../../../components/ExternalImage/ExternalImage';

import NFTContextMenu from './NFTContextMenu';
import { fadeOutMask } from './NFTs.css';

const NFTS_LIMIT = 2000;
const COLLECTION_IMAGE_SIZE = 16;

export function NFTs() {
  const { currentAddress: address } = useCurrentAddressStore();
  const { displayMode, sort, sections: sectionsState } = useNftsStore();
  const { testnetMode } = useTestnetModeStore();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useNfts({ address, testnetMode });
  const nftData = useMemo(() => {
    return {
      ...data,
      nfts: selectNftCollections(data),
    };
  }, [data]);
  const { nfts } = nftData || {};
  const navigate = useRainbowNavigate();
  const containerRef = useContainerRef();
  const sections = Object.values(nfts || {});
  const sortedSections = useMemo(() => {
    if (sort === 'alphabetical') {
      return sections.sort((a, b) => {
        const aName = a.collection.name.toLowerCase();
        const bName = b.collection.name.toLowerCase();
        if (aName < bName) {
          return -1;
        }
        if (aName > bName) {
          return 1;
        }
        return 0;
      });
    } else {
      return sections.sort((a, b) => {
        const earliestDate = new Date(-8640000000000000);
        const aCollectionAcquisition = a.lastCollectionAcquisition;
        const bCollectionAcquisition = b.lastCollectionAcquisition;
        const dateA = aCollectionAcquisition
          ? new Date(aCollectionAcquisition)
          : earliestDate;
        const dateB = bCollectionAcquisition
          ? new Date(bCollectionAcquisition)
          : earliestDate;
        return dateB.getTime() - dateA.getTime();
      });
    }
  }, [sections, sort]);
  const estimateCollectionGalleryRowSize = useCallback(
    (sectionIndex: number) => {
      const COLLECTION_HEADER_HEIGHT = 30;
      const PADDING = 29;

      const collection = sortedSections[sectionIndex];
      const sectionIsOpen = (sectionsState[address] || {})[
        collection?.collection?.collection_id || ''
      ];
      if (sectionIsOpen) {
        const assetCount = collection.assets?.length;
        const sectionRowCount = Math.ceil(assetCount / 3);

        const thumbnailHeight =
          sectionRowCount * (sectionRowCount > 1 ? 112 : 96);
        return PADDING + COLLECTION_HEADER_HEIGHT + thumbnailHeight;
      } else {
        const finalCellPadding =
          !sectionIsOpen && sectionIndex === sortedSections?.length - 1
            ? 12
            : 0;
        return COLLECTION_HEADER_HEIGHT + finalCellPadding;
      }
    },
    [address, sortedSections, sectionsState],
  );
  const collectionGalleryRowVirtualizer = useVirtualizer({
    count: sortedSections?.length || 0,
    getScrollElement: () => containerRef.current,
    estimateSize: estimateCollectionGalleryRowSize,
    overscan: 12,
  });
  const groupedAssets = sortedSections.map((section) => section.assets).flat();
  const groupedAssetRowData = chunkArray(groupedAssets, 3);
  const groupedGalleryRowVirtualizer = useVirtualizer({
    count: groupedAssetRowData?.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 112,
    overscan: 12,
  });
  const onAssetClick = (asset: UniqueAsset) => {
    navigate(
      ROUTES.NFT_DETAILS(asset?.collection.collection_id || '', asset?.id),
    );
  };

  useEffect(() => {
    collectionGalleryRowVirtualizer.measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionsState, sort]);

  const nftCount = getNftCount({ address, testnetMode });
  const isPaginating = hasNextPage && nftCount < NFTS_LIMIT;

  useEffect(() => {
    if (
      hasNextPage &&
      !isFetching &&
      !isFetchingNextPage &&
      nftCount < NFTS_LIMIT
    ) {
      fetchNextPage();
    }
  }, [
    address,
    data?.pages?.length,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    nftCount,
  ]);

  if (!isLoading && Object.values(nfts || {}).length === 0) {
    return <NFTEmptyState />;
  }

  return (
    <Bleed top="10px">
      <Box
        alignItems="center"
        display="flex"
        flexDirection="column"
        width="full"
        paddingHorizontal="12px"
      >
        {displayMode === 'grouped' && (
          <>
            {isLoading ? (
              <Box width="full">
                <Inset horizontal="8px">
                  <GroupedNFTsSkeleton />
                </Inset>
              </Box>
            ) : (
              <Box
                width="full"
                style={{
                  height: groupedGalleryRowVirtualizer.getTotalSize(),
                  position: 'relative',
                }}
              >
                <Box style={{ overflow: 'auto' }}>
                  {groupedGalleryRowVirtualizer
                    .getVirtualItems()
                    .map((virtualItem) => {
                      const { key, size, start, index } = virtualItem;
                      const rowData = groupedAssetRowData[index];
                      return (
                        <Box
                          key={key}
                          as={motion.div}
                          position="absolute"
                          width="full"
                          style={{ height: size, y: start }}
                        >
                          <Inset horizontal="8px">
                            <Box
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                gap: 16,
                                paddingBottom: 16,
                              }}
                            >
                              {rowData.map((asset, i) => (
                                <NFTContextMenu key={i} nft={asset}>
                                  <NftThumbnail
                                    imageSrc={getUniqueAssetImageThumbnailURL(
                                      asset,
                                    )}
                                    key={i}
                                    onClick={() => onAssetClick(asset)}
                                    index={i}
                                  />
                                </NFTContextMenu>
                              ))}
                              {rowData.length < 3 &&
                                isPaginating &&
                                Array.from({ length: 3 - rowData.length }).map(
                                  (_, i) => {
                                    return (
                                      <Skeleton
                                        key={i}
                                        height={'96px'}
                                        style={{ borderRadius: 10 }}
                                        width={'96px'}
                                      />
                                    );
                                  },
                                )}
                            </Box>
                          </Inset>
                        </Box>
                      );
                    })}
                </Box>
              </Box>
            )}
            {isPaginating && (
              <Box width="full" className={fadeOutMask} paddingHorizontal="8px">
                <GroupedNFTsSkeleton skeletonLength={3} />
              </Box>
            )}
          </>
        )}
        {displayMode === 'byCollection' && (
          <>
            {isLoading ? (
              <Box width="full">
                <Inset horizontal="8px">
                  <CollectionNFTsSkeleton />
                </Inset>
              </Box>
            ) : (
              <Box
                width="full"
                style={{
                  height: collectionGalleryRowVirtualizer.getTotalSize(),
                  position: 'relative',
                  marginBottom: isPaginating ? -6 : 0,
                }}
              >
                <Box style={{ overflow: 'auto' }}>
                  {collectionGalleryRowVirtualizer
                    .getVirtualItems()
                    .map((virtualItem) => {
                      const { key, size, start, index } = virtualItem;
                      const section = sortedSections[index];
                      const isLast = index === sortedSections.length - 1;
                      return (
                        <Box
                          key={key}
                          as={motion.div}
                          position="absolute"
                          width="full"
                          style={{ height: size, y: start }}
                          ref={collectionGalleryRowVirtualizer.measureElement}
                          data-index={index}
                        >
                          <CollectionSection
                            isLast={isLast}
                            section={section}
                            onAssetClick={onAssetClick}
                          />
                        </Box>
                      );
                    })}
                </Box>
              </Box>
            )}
            {isPaginating && (
              <Box width="full" className={fadeOutMask} paddingHorizontal="4px">
                <CollectionNFTsSkeleton skeletonLength={4} />
              </Box>
            )}
          </>
        )}
      </Box>
    </Bleed>
  );
}

function GroupedNFTsSkeleton({
  skeletonLength = 9,
}: {
  skeletonLength?: number;
}) {
  return (
    <Box
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 16,
        paddingBottom: 16,
      }}
    >
      {Array.from({ length: skeletonLength }).map((_, i) => {
        return (
          <Skeleton
            key={i}
            height={'96px'}
            style={{ borderRadius: 10 }}
            width={'96px'}
          />
        );
      })}
    </Box>
  );
}

function CollectionNFTsSkeleton({
  skeletonLength = 15,
}: {
  skeletonLength?: number;
}) {
  return (
    <Stack space="7px">
      {Array.from({ length: skeletonLength }).map((_, i) => (
        <Box key={i} paddingBottom="5px">
          <Columns alignVertical="center">
            <Column>
              <Inline alignVertical="center" space="7px">
                <Skeleton
                  circle
                  height={`${COLLECTION_IMAGE_SIZE}px`}
                  width={`${COLLECTION_IMAGE_SIZE}px`}
                  style={{
                    overflow: 'none',
                  }}
                />
                <CollectionNameSkeleton />
              </Inline>
            </Column>
            <Column width="content">
              <Inline alignVertical="center">
                <Symbol
                  symbol="chevron.right"
                  weight="bold"
                  size={12}
                  color="labelQuaternary"
                />
              </Inline>
            </Column>
          </Columns>
        </Box>
      ))}
    </Stack>
  );
}

function CollectionNameSkeleton() {
  const width = useMemo(() => Math.random() * 230 + 30, []);
  return <Skeleton height="14px" width={`${width}px`} />;
}

function CollectionSection({
  section,
  isLast,
  onAssetClick,
}: {
  section: { assets: UniqueAsset[]; collection: UniqueAsset['collection'] };
  isLast: boolean;
  onAssetClick: (asset: UniqueAsset) => void;
}) {
  const { currentAddress: address } = useCurrentAddressStore();
  const { sections, toggleGallerySectionOpen } = useNftsStore();
  const sectionsForAddress = sections[address] || {};
  const collectionId = section?.collection?.collection_id;
  const collectionVisible = collectionId && sectionsForAddress[collectionId];
  const setCollectionVisible = useCallback(() => {
    toggleGallerySectionOpen({
      address,
      collectionId: collectionId || '',
    });
  }, [address, collectionId, toggleGallerySectionOpen]);
  return (
    <Rows>
      <Row>
        <Lens onClick={setCollectionVisible} borderRadius="6px">
          <Inset horizontal="4px">
            <Box
              style={{
                paddingTop: 7,
                paddingBottom: isLast && !collectionVisible ? 19 : 7,
              }}
              testId={`nfts-collection-section-${section.collection.name}`}
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
                        src={section.collection.image_url || ''}
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
                      {section.collection.name}
                    </TextOverflow>
                    <Box paddingTop="1px">
                      <Text size="12pt" weight="bold" color="labelQuaternary">
                        {section.assets.length}
                      </Text>
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
          {collectionVisible && (
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
              {section.assets.map((asset, i) => {
                return (
                  <NFTContextMenu key={i} nft={asset}>
                    <NftThumbnail
                      imageSrc={
                        // we hold off on providing the src field until opened so that
                        // we don't request images for collections that are never opened
                        collectionVisible
                          ? getUniqueAssetImageThumbnailURL(asset)
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
        </Inset>
      </Row>
    </Rows>
  );
}

const NftThumbnail = memo(function NftThumbnail({
  imageSrc,
  onClick,
  index,
}: {
  imageSrc?: string;
  onClick: () => void;
  index: number;
}) {
  return (
    <Lens
      style={{ height: 96, width: 96 }}
      borderRadius="10px"
      background="fillQuaternary"
      onClick={onClick}
      testId={`nft-thumbnail-${imageSrc}-${index}`}
    >
      <ExternalImage
        borderRadius="10px"
        src={imageSrc}
        height={96}
        width={96}
      />
    </Lens>
  );
});

export function NFTEmptyState() {
  const ref = useCoolMode({ emojis: ['🌈', '🖼️'] });

  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      marginTop="-20px"
      paddingTop="80px"
      ref={ref}
      style={{ height: 336 - 64 }}
      width="full"
    >
      <Box paddingBottom="14px">
        <Stack alignHorizontal="center" space="16px">
          <Box>
            <Box
              animate={{
                scale: [0.8, 1, 0.8, 1, 0.8],
                rotate: [0, 90, 180, 270, 360],
                y: [4, -4, 4, -4, 4],
              }}
              as={motion.div}
              initial={{ scale: 0.75, rotate: 0, y: 4 }}
              key="sparkleAnimation"
              transition={{
                delay: 0.5,
                duration: 8,
                ease: [0.2, 0, 0, 1],
                repeat: Infinity,
              }}
            >
              <Symbol
                color="yellow"
                disableSmoothing
                size={28}
                symbol="sparkle"
                weight="heavy"
              />
            </Box>
          </Box>
          <Text
            align="center"
            size="20pt"
            weight="semibold"
            color="labelTertiary"
          >
            {i18n.t('nfts.empty_state_header')}
          </Text>
        </Stack>
      </Box>
      <Inset bottom="10px" horizontal="40px">
        <Text
          align="center"
          color="labelQuaternary"
          size="12pt"
          weight="medium"
        >
          {i18n.t('nfts.empty_state_description')}
        </Text>
      </Inset>
    </Box>
  );
}
