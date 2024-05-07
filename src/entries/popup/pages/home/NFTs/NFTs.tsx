import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import {
  NFTCollectionSectionData,
  selectSortedNftCollections,
} from '~/core/resources/_selectors/nfts';
import { useNfts } from '~/core/resources/nfts';
import { getNftCount } from '~/core/resources/nfts/nfts';
import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useNftsStore } from '~/core/state/nfts';
import { useSelectedNftStore } from '~/core/state/selectedNft';
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
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';
import { useCoolMode } from '~/entries/popup/hooks/useCoolMode';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';
import { useNftShortcuts } from '~/entries/popup/hooks/useNftShortcuts';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useUserChains } from '~/entries/popup/hooks/useUserChains';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { ROUTES } from '~/entries/popup/urls';

import { NFTCollectionSection } from './NFTCollectionSection';
import NFTContextMenu from './NFTContextMenu';
import { NFTThumbnail } from './NFTThumbnail';
import { fadeOutMask } from './NFTs.css';

const NFTS_LIMIT = 2000;
const COLLECTION_IMAGE_SIZE = 16;

export function NFTs() {
  const { currentAddress: address } = useCurrentAddressStore();
  const { displayMode, hidden, sort, sections: sectionsState } = useNftsStore();
  const { isWatchingWallet } = useWallets();
  const hiddenNftsForAddress = useMemo(
    () => hidden[address] || {},
    [hidden, address],
  );
  const { testnetMode } = useTestnetModeStore();
  const { chains: userChains } = useUserChains();
  const [manuallyRefetching, setManuallyRefetching] = useState(false);
  const {
    data: sortedSections = [],
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useNfts(
    { address, testnetMode, userChains },
    { select: (data) => selectSortedNftCollections(sort, data) },
  );

  const navigate = useRainbowNavigate();
  const containerRef = useContainerRef();
  const { selectedNft } = useSelectedNftStore();
  const groupedAssets = sortedSections
    .map((section) => section.assets)
    .flat()
    .filter((nft) => !hiddenNftsForAddress[nft.uniqueId]);
  const hiddenAssets = sortedSections
    .map((section) => section.assets)
    .flat()
    .filter((nft) => hiddenNftsForAddress[nft.uniqueId]);
  const allSections = sortedSections
    .reduce((cumulativeSections, currentSection) => {
      const unhiddenAssets = currentSection.assets.filter(
        (nft) => !hiddenNftsForAddress[nft.uniqueId],
      );
      if (unhiddenAssets.length) {
        cumulativeSections.push({
          ...currentSection,
          assets: unhiddenAssets,
        });
      }
      return cumulativeSections;
    }, [] as NFTCollectionSectionData[])
    .concat(
      hiddenAssets.length
        ? {
          assets: hiddenAssets,
          collection: {
            collection_id: '_hidden',
            description: null,
            discord_url: null,
            total_quantity: null,
            distinct_nft_count: null,
            distinct_owner_count: null,
            external_url: null,
            featured_image_url: null,
            hidden: null,
            image_url: null,
            name: i18n.t('nfts.hidden_section_title'),
            short_description: null,
            slug: '',
            twitter_username: null,
            wiki_link: null,
          },
        }
        : [],
    );

  const estimateCollectionGalleryRowSize = useCallback(
    (sectionIndex: number) => {
      const COLLECTION_HEADER_HEIGHT = 30;
      const PADDING = 29;

      const collection = allSections?.[sectionIndex];
      const sectionIsOpen = (sectionsState[address] || {})[
        collection?.collection?.collection_id || ''
      ];
      if (sectionIsOpen && collection) {
        const displayedAssets = collection.assets.filter((asset) => {
          return (
            collection.collection.collection_id === '_hidden' ||
            !hiddenNftsForAddress[asset.uniqueId]
          );
        });
        const assetCount = displayedAssets?.length;
        const sectionRowCount = Math.ceil(assetCount / 3);

        const thumbnailHeight =
          sectionRowCount * (sectionRowCount > 1 ? 112 : 96);
        return PADDING + COLLECTION_HEADER_HEIGHT + thumbnailHeight;
      } else {
        const finalCellPadding =
          !sectionIsOpen && sectionIndex === (allSections?.length || 0) - 1
            ? 12
            : 0;
        return COLLECTION_HEADER_HEIGHT + finalCellPadding;
      }
    },
    [address, allSections, hiddenNftsForAddress, sectionsState],
  );
  const collectionGalleryRowVirtualizer = useVirtualizer({
    count: allSections?.length || 0,
    getScrollElement: () => containerRef.current,
    estimateSize: estimateCollectionGalleryRowSize,
    overscan: 12,
  });
  const groupedAssetRowData = chunkArray(groupedAssets || [], 3);
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

  const handleShortcuts = useCallback(
    async (e: KeyboardEvent) => {
      if (e.key === shortcuts.nfts.REFRESH_NFTS.key && !selectedNft) {
        setManuallyRefetching(true);
        await refetch();
        setManuallyRefetching(false);
      }
    },
    [refetch, selectedNft],
  );

  useKeyboardShortcut({
    handler: handleShortcuts,
  });

  useEffect(() => {
    collectionGalleryRowVirtualizer.measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenNftsForAddress, sectionsState, sort]);

  const nftCount = getNftCount({
    address,
    testnetMode,
    userChains,
  });
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
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    nftCount,
  ]);

  useNftShortcuts();

  const isEmpty =
    displayMode === 'grouped'
      ? !groupedAssetRowData.length
      : !allSections.length;

  if (!isLoading && isEmpty) {
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
            {isLoading || manuallyRefetching ? (
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
                                <NFTContextMenu
                                  key={i}
                                  nft={asset}
                                  offset={isWatchingWallet ? -120 : -220}
                                >
                                  <NFTThumbnail
                                    borderRadius="10px"
                                    size={96}
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
            {isLoading || manuallyRefetching ? (
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
                      const section = allSections?.[index];
                      const isLast = index === (allSections?.length || 0) - 1;
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
                          <NFTCollectionSection
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
