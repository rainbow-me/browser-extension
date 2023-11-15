import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { useNfts } from '~/core/resources/nfts';
import { getNftCount } from '~/core/resources/nfts/nfts';
import { useCurrentAddressStore } from '~/core/state';
import { useNftsStore } from '~/core/state/nfts';
import { UniqueAsset } from '~/core/types/nfts';
import { chunkArray } from '~/core/utils/assets';
import { getUniqueAssetImageThumbnailURL } from '~/core/utils/nfts';
import { getProfileUrl, goToNewTab } from '~/core/utils/tabs';
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
import { useCoolMode } from '~/entries/popup/hooks/useCoolMode';

import ExternalImage from '../../../components/ExternalImage/ExternalImage';

const NFTS_LIMIT = 2000;
const COLLECTION_IMAGE_SIZE = 16;

export function PostReleaseNFTs() {
  const { currentAddress: address } = useCurrentAddressStore();
  const { displayMode, sort, sections: sectionsState } = useNftsStore();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isInitialLoading,
  } = useNfts({ address });
  const nftData = useMemo(() => {
    const nfts = data?.pages?.map((page) => page.nfts).flat();
    return {
      ...data,
      nfts:
        nfts?.reduce(
          (collections, nft) => {
            const currentCollectionId = nft.collection.collection_id;
            if (currentCollectionId) {
              const existingCollection = collections[currentCollectionId];
              if (existingCollection) {
                existingCollection.assets.push(nft);
              } else {
                collections[currentCollectionId] = {
                  assets: [nft],
                  collection: nft.collection,
                  lastCollectionAcquisition: nft.last_collection_acquisition,
                };
              }
            }
            return collections;
          },
          {} as Record<
            string,
            {
              assets: UniqueAsset[];
              collection: UniqueAsset['collection'];
              lastCollectionAcquisition?: string;
            }
          >,
        ) || {},
    };
  }, [data]);
  const { nfts } = nftData || {};
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
          sectionRowCount * (sectionRowCount > 1 ? 106 : 96);
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

  useEffect(() => {
    collectionGalleryRowVirtualizer.measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionsState, sort]);

  useEffect(() => {
    const nftCount = getNftCount({ address });
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
  ]);

  // we don't have a design for loading / empty state yet
  if (isInitialLoading || Object.values(nfts || {}).length === 0) {
    return <PreReleaseNFTs />;
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
          <Box
            width="full"
            style={{
              height: groupedGalleryRowVirtualizer.getTotalSize(),
              minHeight: '436px',
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
                            <NftThumbnail
                              imageSrc={getUniqueAssetImageThumbnailURL(asset)}
                              key={i}
                            />
                          ))}
                        </Box>
                      </Inset>
                    </Box>
                  );
                })}
            </Box>
          </Box>
        )}
        {displayMode === 'byCollection' && (
          <Box
            width="full"
            style={{
              height: collectionGalleryRowVirtualizer.getTotalSize(),
              minHeight: '436px',
              position: 'relative',
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
                      <CollectionSection isLast={isLast} section={section} />
                    </Box>
                  );
                })}
            </Box>
          </Box>
        )}
      </Box>
    </Bleed>
  );
}

function CollectionSection({
  section,
  isLast,
}: {
  section: { assets: UniqueAsset[]; collection: UniqueAsset['collection'] };
  isLast: boolean;
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
              {section.assets.map((asset, i) => (
                <NftThumbnail
                  imageSrc={
                    // we hold off on providing the src field until opened so that
                    // we don't request images for collections that are never opened
                    collectionVisible
                      ? getUniqueAssetImageThumbnailURL(asset)
                      : undefined
                  }
                  key={i}
                />
              ))}
            </Box>
          )}
        </Inset>
      </Row>
    </Rows>
  );
}

const NftThumbnail = memo(({ imageSrc }: { imageSrc?: string }) => {
  return (
    <Box
      style={{ height: 96, width: 96 }}
      borderRadius="10px"
      background="fillQuaternary"
    >
      <ExternalImage
        borderRadius="10px"
        src={imageSrc}
        height={96}
        width={96}
      />
    </Box>
  );
});

NftThumbnail.displayName = 'NftThumbnail';

export function PreReleaseNFTs() {
  const ref = useCoolMode({ emojis: ['🌈', '🖼️'] });
  const { currentAddress: address } = useCurrentAddressStore();
  const { data: ensName } = useEnsName({ address });

  const openProfile = useCallback(
    () =>
      goToNewTab({
        url: getProfileUrl(ensName ?? address),
      }),
    [address, ensName],
  );

  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      marginTop="-20px"
      paddingTop="80px"
      ref={ref}
      style={{ height: 336 }}
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
            {i18n.t('nfts.coming_soon_header')}
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
          {i18n.t('nfts.coming_soon_description')}
        </Text>
      </Inset>
      <Lens
        borderRadius="8px"
        cursor="pointer"
        onClick={openProfile}
        padding="6px"
        width="fit"
      >
        <Inline alignHorizontal="center" alignVertical="center" space="3px">
          <Text
            align="center"
            color="accent"
            cursor="pointer"
            size="12pt"
            weight="heavy"
          >
            {i18n.t('nfts.view_on_web')}
          </Text>
          <Symbol
            color="accent"
            cursor="pointer"
            size={9.5}
            symbol="chevron.right"
            weight="heavy"
          />
        </Inline>
      </Lens>
    </Box>
  );
}
