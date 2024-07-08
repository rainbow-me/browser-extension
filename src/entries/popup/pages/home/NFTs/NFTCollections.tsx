import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address, Chain } from 'viem';

import { shortcuts } from '~/core/references/shortcuts';
import { selectNftCollections } from '~/core/resources/_selectors/nfts';
import { useNftCollections } from '~/core/resources/nfts/collections';
import { NftSort, useNftsStore } from '~/core/state/nfts';
import { UniqueAsset } from '~/core/types/nfts';
import {
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Stack,
  Symbol,
} from '~/design-system';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';

import { NFTCollectionSection } from './NFTCollectionSection';
import { fadeOutMask } from './NFTs.css';
import { NftsEmptyState } from './NftsEmptyState';

const COLLECTION_IMAGE_SIZE = 16;

interface NFTGalleryProps {
  address: Address;
  onAssetClick: (asset: UniqueAsset) => void;
  sort: NftSort;
  testnetMode: boolean;
  userChains: Chain[];
}

export default function NFTCollections({
  address,
  onAssetClick,
  sort,
  testnetMode,
  userChains,
}: NFTGalleryProps) {
  const containerRef = useContainerRef();
  const { displayMode, hidden, sections } = useNftsStore();
  const [manuallyRefetching, setManuallyRefetching] = useState(false);
  const hiddenNftsForAddress = useMemo(
    () => hidden[address] || {},
    [address, hidden],
  );
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useNftCollections(
    { address, sort, testnetMode, userChains },
    {
      select: (data) => selectNftCollections(data, hiddenNftsForAddress) || [],
    },
  );
  const collections = useMemo(() => data || [], [data]);
  const estimateCollectionGalleryRowSize = useCallback(
    (sectionIndex: number) => {
      const COLLECTION_HEADER_HEIGHT = 30;
      const PADDING = 29;

      const collection = collections[sectionIndex];
      const isHiddenSection =
        collection.collection_details.description === '_hidden';
      const sectionIsOpen = (sections[address] || {})[
        isHiddenSection ? '_hidden' : collection?.collection_id || ''
      ];
      let assetCount = 0;
      if (isHiddenSection) {
        assetCount = Object.values(hiddenNftsForAddress).filter(
          (v) => v,
        ).length;
      } else {
        assetCount =
          collection.nft_ids
            .map((s) => s.split('.'))
            .filter(
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              ([_, id, num]) => !hiddenNftsForAddress?.[`${id}_${num}`],
            ).length || 0;
      }
      if (isHiddenSection && assetCount === 0) {
        return 12;
      }
      if (sectionIsOpen) {
        const sectionRowCount = Math.ceil(assetCount / 3);
        const thumbnailHeight =
          sectionRowCount * (sectionRowCount > 1 ? 112 : 96);
        return PADDING + COLLECTION_HEADER_HEIGHT + thumbnailHeight;
      } else {
        const finalCellPadding =
          !sectionIsOpen && sectionIndex === collections?.length - 1 ? 12 : 0;
        return COLLECTION_HEADER_HEIGHT + finalCellPadding;
      }
    },
    [address, collections, hiddenNftsForAddress, sections],
  );
  const rowVirtualizer = useVirtualizer({
    count: collections.length,
    getScrollElement: () => containerRef.current,
    estimateSize: estimateCollectionGalleryRowSize,
    overscan: 12,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

  const shouldDisplay = displayMode === 'byCollection';
  useKeyboardShortcut({
    handler: async (e: KeyboardEvent) => {
      if (e.key === shortcuts.nfts.REFRESH_NFTS.key) {
        setManuallyRefetching(true);
        await refetch();
        setManuallyRefetching(false);
      }
    },
  });

  useEffect(() => {
    const [lastRow] = [...virtualRows].reverse();
    if (!lastRow || !shouldDisplay) return;
    if (
      lastRow.index >= collections.length - 1 &&
      hasNextPage &&
      !isFetching &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    collections.length,
    shouldDisplay,
    virtualRows,
  ]);

  useEffect(() => {
    rowVirtualizer.measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, sort, hiddenNftsForAddress]);

  if (!shouldDisplay) return null;
  if (!isLoading && collections.length === 1) return <NftsEmptyState />;

  return (
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
            height: rowVirtualizer.getTotalSize(),
            position: 'relative',
            marginBottom: isFetchingNextPage ? -6 : 0,
          }}
        >
          <Box style={{ overflow: 'auto' }}>
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const { key, size, start, index } = virtualItem;
              const section = collections[index];
              const isLast = index === collections.length - 1;
              return (
                <Box
                  key={key}
                  as={motion.div}
                  position="absolute"
                  width="full"
                  style={{ height: size, y: start }}
                  ref={rowVirtualizer.measureElement}
                  data-index={index}
                >
                  <NFTCollectionSection
                    isLast={isLast}
                    collection={section}
                    onAssetClick={onAssetClick}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
      {isFetchingNextPage && (
        <Box width="full" className={fadeOutMask} paddingHorizontal="8px">
          <CollectionNFTsSkeleton skeletonLength={4} />
        </Box>
      )}
    </>
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
