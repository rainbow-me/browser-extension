import { motion } from 'framer-motion';
import React from 'react';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useNftsStore } from '~/core/state/nfts';
import { UniqueAsset } from '~/core/types/nfts';
import { Bleed, Box, Inset, Stack, Symbol, Text } from '~/design-system';
import { useCoolMode } from '~/entries/popup/hooks/useCoolMode';
import { useNftShortcuts } from '~/entries/popup/hooks/useNftShortcuts';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useUserChains } from '~/entries/popup/hooks/useUserChains';
import { ROUTES } from '~/entries/popup/urls';

import NFTCollections from './NFTCollections';
import NFTGallery from './NFTGallery';

export function NFTs() {
  const { currentAddress: address } = useCurrentAddressStore();
  const sort = useNftsStore.use.sort();
  const { testnetMode } = useTestnetModeStore();
  const { chains: userChains } = useUserChains();
  const navigate = useRainbowNavigate();
  const onAssetClick = (asset: UniqueAsset) => {
    navigate(
      ROUTES.NFT_DETAILS(asset?.collection.collection_id || '', asset?.id),
      {
        state: {
          nft: asset,
        },
      },
    );
  };

  useNftShortcuts();

  return (
    <Bleed top="10px">
      <Box
        alignItems="center"
        display="flex"
        flexDirection="column"
        width="full"
        paddingHorizontal="12px"
      >
        <NFTGallery
          address={address}
          onAssetClick={onAssetClick}
          sort={sort}
          testnetMode={testnetMode}
          userChains={userChains}
        />
        <NFTCollections
          address={address}
          onAssetClick={onAssetClick}
          sort={sort}
          testnetMode={testnetMode}
          userChains={userChains}
        />
      </Box>
    </Bleed>
  );
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
