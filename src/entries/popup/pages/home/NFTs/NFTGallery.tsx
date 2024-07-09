import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Address, Chain } from 'viem';

import { shortcuts } from '~/core/references/shortcuts';
import { selectNfts } from '~/core/resources/_selectors/nfts';
import { useGalleryNfts } from '~/core/resources/nfts/galleryNfts';
import { NftSort, useNftsStore } from '~/core/state/nfts';
import { UniqueAsset } from '~/core/types/nfts';
import { chunkArray } from '~/core/utils/assets';
import {
  getUniqueAssetImagePreviewURL,
  getUniqueAssetImageThumbnailURL,
} from '~/core/utils/nfts';
import { Box, Inset } from '~/design-system';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';

import NFTContextMenu from './NFTContextMenu';
import { NFTThumbnail } from './NFTThumbnail';
import { fadeOutMask } from './NFTs.css';
import { NftsEmptyState } from './NftsEmptyState';

interface NFTGalleryProps {
  address: Address;
  containerRef: React.RefObject<HTMLDivElement> | null;
  onAssetClick: (asset: UniqueAsset) => void;
  sort: NftSort;
  testnetMode: boolean;
  userChains: Chain[];
}

export default function NFTGallery({
  address,
  containerRef,
  onAssetClick,
  sort,
  testnetMode,
  userChains,
}: NFTGalleryProps) {
  const { displayMode, hidden } = useNftsStore();
  const hiddenNftsForAddress = hidden[address] || {};
  const [manuallyRefetching, setManuallyRefetching] = useState(false);
  const {
    data: allNfts,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useGalleryNfts(
    { address, sort, testnetMode, userChains },
    {
      select: (data) => selectNfts(data),
      enabled: displayMode === 'grouped',
    },
  );
  const nfts = allNfts?.filter((nft) => !hiddenNftsForAddress[nft.uniqueId]);
  const nftRowData = chunkArray(nfts || [], 3);
  const rowVirtualizer = useVirtualizer({
    count: nftRowData.length,
    getScrollElement: () => containerRef?.current || null,
    estimateSize: () => 122,
    overscan: 12,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const shouldDisplay = displayMode === 'grouped';

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
      lastRow.index >= nftRowData.length - 1 &&
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
    nftRowData.length,
    shouldDisplay,
    virtualRows,
  ]);

  useEffect(() => {
    rowVirtualizer.measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayMode]);

  if (!shouldDisplay) return null;
  if (!isLoading && !nfts?.length) return <NftsEmptyState />;

  return (
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
            height: rowVirtualizer.getTotalSize(),
            position: 'relative',
          }}
        >
          <Box style={{ overflow: 'auto' }}>
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const { key, size, start, index } = virtualItem;
              const rowData = nftRowData[index];
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
                          key={`gallery-nft-thumbnail-${asset.uniqueId}`}
                          nft={asset}
                        >
                          <NFTThumbnail
                            borderRadius="10px"
                            size={96}
                            imageSrc={getUniqueAssetImageThumbnailURL(asset)}
                            placeholderSrc={getUniqueAssetImagePreviewURL(
                              asset,
                            )}
                            onClick={() => onAssetClick(asset)}
                            index={i}
                          />
                        </NFTContextMenu>
                      ))}
                      {rowData.length < 3 &&
                        isFetchingNextPage &&
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
      {isFetchingNextPage && (
        <Box width="full" className={fadeOutMask} paddingHorizontal="8px">
          <GroupedNFTsSkeleton skeletonLength={3} />
        </Box>
      )}
    </>
  );
}

export function GroupedNFTsSkeleton({
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
