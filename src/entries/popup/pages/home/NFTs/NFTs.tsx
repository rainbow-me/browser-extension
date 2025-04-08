import React, { useRef } from 'react';
import { Address } from 'viem';

import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useNftsStore } from '~/core/state/nfts';
import { ChainName, chainNameToIdMapping } from '~/core/types/chains';
import { UniqueAsset } from '~/core/types/nfts';
import { Bleed, Box } from '~/design-system';
import { useNftShortcuts } from '~/entries/popup/hooks/useNftShortcuts';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useUserChains } from '~/entries/popup/hooks/useUserChains';
import { ROUTES } from '~/entries/popup/urls';

import NFTCollections from './NFTCollections';
import NFTGallery from './NFTGallery';

export function NFTs() {
  const { currentAddress: address } = useCurrentAddressStore();
  const { sort, displayMode } = useNftsStore((state) => ({
    sort: state.sort,
    displayMode: state.displayMode,
  }));
  const { testnetMode } = useTestnetModeStore();
  const { chains: userChains } = useUserChains();
  const navigate = useRainbowNavigate();
  const onAssetClick = (asset: UniqueAsset) => {
    const [chainName, contractAddress, tokenId] = asset.fullUniqueId.split(
      '_',
    ) as [ChainName, Address, string];
    const chainId = chainNameToIdMapping[chainName];
    if (!chainId) return;
    navigate(ROUTES.NFT_DETAILS(`${contractAddress}_${chainId}`, tokenId), {
      state: { nft: asset },
    });
  };

  const groupedContainerRef = useRef<HTMLDivElement>(null);
  const byCollectionContainerRef = useRef<HTMLDivElement>(null);
  useNftShortcuts();

  return (
    <Bleed top="10px">
      {displayMode === 'grouped' ? (
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          width="full"
          paddingHorizontal="12px"
          paddingTop="20px"
          paddingBottom="64px"
          ref={groupedContainerRef}
        >
          <NFTGallery
            address={address}
            onAssetClick={onAssetClick}
            sort={sort}
            testnetMode={testnetMode}
            userChains={userChains}
            containerRef={groupedContainerRef}
          />
        </Box>
      ) : (
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          width="full"
          paddingHorizontal="12px"
          paddingTop="20px"
          paddingBottom="64px"
          ref={byCollectionContainerRef}
        >
          <NFTCollections
            address={address}
            onAssetClick={onAssetClick}
            sort={sort}
            testnetMode={testnetMode}
            userChains={userChains}
            containerRef={byCollectionContainerRef}
          />
        </Box>
      )}
    </Bleed>
  );
}
