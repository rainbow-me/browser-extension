import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import React, { memo, useCallback, useEffect, useMemo } from 'react';

import { selectNftsByCollection } from '~/core/resources/_selectors/nfts';
import { useNfts } from '~/core/resources/nfts';
import { useNftsHistory } from '~/core/resources/nfts/nftsHistory';
import { useCurrentAddressStore } from '~/core/state';
import { useNftsStore } from '~/core/state/nfts';
import { UniqueAsset } from '~/core/types/nfts';
import { chunkArray } from '~/core/utils/assets';
import {
  Bleed,
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
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { Lens } from '~/design-system/components/Lens/Lens';

import ExternalImage from '../../../components/ExternalImage/ExternalImage';

const COLLECTION_IMAGE_SIZE = 16;

export function NFTs() {
  const { currentAddress: address } = useCurrentAddressStore();
  const { displayMode, sort, sections: sectionsState } = useNftsStore();
  const { data: nfts } = useNfts(
    { address },
    { select: selectNftsByCollection },
  );
  const { data: nftsHistory } = useNftsHistory({ address });
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
        const aIndex = nftsHistory?.indexOf(a.collection.collection_id || '');
        const bIndex = nftsHistory?.indexOf(b.collection.collection_id || '');
        const aAbsent = typeof aIndex !== 'number';
        const bAbsent = typeof bIndex !== 'number';
        if (!aAbsent && bAbsent) {
          return -1;
        }
        if (aAbsent && !bAbsent) {
          return 1;
        }
        if (aIndex && bIndex) {
          return aIndex < bIndex ? -1 : 1;
        }
        return 0;
      });
    }
  }, [nftsHistory, sections, sort]);
  const estimateCollectionGalleryRowSize = useCallback(
    (sectionIndex: number) => {
      const COLLECTION_HEADER_HEIGHT = 30;
      const PADDING = 36;

      const collection = sortedSections[sectionIndex];
      const sectionIsOpen = (sectionsState[address] || {})[
        collection.collection.collection_id || ''
      ];
      if (sectionIsOpen) {
        const assetCount = collection.assets.length;
        const sectionRowCount = Math.ceil(assetCount / 3);

        const thumbnailHeight = sectionRowCount * 108;
        return PADDING + COLLECTION_HEADER_HEIGHT + thumbnailHeight;
      } else {
        return COLLECTION_HEADER_HEIGHT;
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
    count: groupedAssetRowData.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 112,
    overscan: 12,
  });

  useEffect(() => {
    if (displayMode === 'byCollection') {
      collectionGalleryRowVirtualizer.measure();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionsState]);

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
                              imageSrc={
                                asset.image_thumbnail_url ||
                                asset.image_preview_url ||
                                asset.image_original_url ||
                                ''
                              }
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
                      <CollectionSection section={section} />
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
}: {
  section: { assets: UniqueAsset[]; collection: UniqueAsset['collection'] };
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
            <Box paddingVertical="7px">
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
                      maxWidth={210}
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
                paddingBottom: collectionVisible ? 30 : 0,
                paddingTop: 6,
              }}
            >
              {section.assets.map((nft, i) => (
                <NftThumbnail
                  imageSrc={nft?.image_thumbnail_url || ''}
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

const NftThumbnail = memo(({ imageSrc }: { imageSrc: string }) => {
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
