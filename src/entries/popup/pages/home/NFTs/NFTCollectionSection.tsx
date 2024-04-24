import { motion } from 'framer-motion';
import React, { useCallback } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { useNftsStore } from '~/core/state/nfts';
import { UniqueAsset } from '~/core/types/nfts';
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
  section,
  isLast,
  onAssetClick,
  displayMode = 'grid',
}: {
  section: { assets: UniqueAsset[]; collection: UniqueAsset['collection'] };
  isLast: boolean;
  onAssetClick: (asset: UniqueAsset) => void;
  displayMode?: NFTCollectionDisplayMode;
}) {
  const { currentAddress: address } = useCurrentAddressStore();
  const { sections, toggleGallerySectionOpen } = useNftsStore();
  const { isWatchingWallet } = useWallets();
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
              {section.assets.map((asset, i) => {
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
                        // we hold off on providing the src field until opened so that
                        // we don't request images for collections that are never opened
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
              {section.assets.map((nft, i) => (
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
