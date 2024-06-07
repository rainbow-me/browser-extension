import { ReactNode, useCallback, useRef } from 'react';

import { i18n } from '~/core/languages';
import { reportNftAsSpam } from '~/core/network/nfts';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useNftsStore } from '~/core/state/nfts';
import { useSelectedNftStore } from '~/core/state/selectedNft';
import { ChainName, chainNameToIdMapping } from '~/core/types/chains';
import { UniqueAsset } from '~/core/types/nfts';
import { getBlockExplorerHostForChain } from '~/core/utils/chains';
import { goToNewTab } from '~/core/utils/tabs';
import { Box, Stack, Text, TextOverflow } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '~/entries/popup/components/ContextMenu/ContextMenu';
import { DetailsMenuWrapper } from '~/entries/popup/components/DetailsMenu';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { ROUTES } from '~/entries/popup/urls';
import { simulateClick } from '~/entries/popup/utils/simulateClick';

import { getOpenseaUrl } from './utils';

export default function NFTContextMenu({
  children,
  nft,
  offset,
}: {
  children: ReactNode;
  nft?: UniqueAsset | null;
  offset?: number;
}) {
  const { currentAddress: address } = useCurrentAddressStore();
  const containerRef = useContainerRef();
  const hidden = useNftsStore.use.hidden();
  const toggleHideNFT = useNftsStore.use.toggleHideNFT();
  const { selectedNft, setSelectedNft } = useSelectedNftStore();
  const navigate = useRainbowNavigate();
  const hiddenNftsForAddress = hidden[address] || {};
  const nftToFocus = selectedNft ?? nft;
  const hasContractAddress = !!nftToFocus?.asset_contract.address;
  const hasNetwork = !!nftToFocus?.network;
  const displayed = !hiddenNftsForAddress[nftToFocus?.uniqueId || ''];
  const nftUniqueId = nftToFocus?.uniqueId || '';

  const navigatingRef = useRef(false);
  const isPOAP = nftToFocus?.familyName === 'POAP';
  const { isWatchingWallet } = useWallets();
  const explorerTitle =
    nftToFocus?.network === 'mainnet'
      ? 'Etherscan'
      : i18n.t('nfts.details.explorer');
  const getBlockExplorerUrl = () => {
    if (nftToFocus?.poapDropId) {
      return `https://collectors.poap.xyz/drop/${nftToFocus.poapDropId}`;
    }
    if (nftToFocus?.network === 'mainnet') {
      return `https://${getBlockExplorerHostForChain(
        chainNameToIdMapping[nftToFocus?.network as ChainName],
      )}/nft/${nftToFocus?.asset_contract.address}/${nft?.id}`;
    } else {
      return `https://${getBlockExplorerHostForChain(
        chainNameToIdMapping[nftToFocus?.network as ChainName],
      )}/token/${nftToFocus?.asset_contract.address}?a=${nft?.id}`;
    }
  };

  const openseaUrl = getOpenseaUrl({ nft: nftToFocus });

  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(nftToFocus?.id as string);
    triggerToast({
      title: i18n.t('nfts.details.id_copied'),
      description: nftToFocus?.id,
    });
  }, [nftToFocus?.id]);

  const handleOpenChange = (isOpen: boolean) => {
    if (nft) {
      setSelectedNft(isOpen || navigatingRef.current ? nft : undefined);
    }
  };

  const handleSendNft = useCallback(() => {
    if (nft) {
      navigatingRef.current = true;
      setSelectedNft(nft);
    }
    navigate(ROUTES.SEND);
  }, [nft, navigate, setSelectedNft]);

  const handleReportNft = useCallback(() => {
    if (nftToFocus) {
      reportNftAsSpam(nftToFocus);
      if (displayed) {
        toggleHideNFT(address, nftUniqueId);
      }
      triggerToast({ title: i18n.t('nfts.toast.spam_reported') });
    }
  }, [displayed, nftToFocus, address, nftUniqueId, toggleHideNFT]);

  const handleDownload = useCallback(() => {
    simulateClick(containerRef.current);
    const link = document.createElement('a');
    link.setAttribute('download', '');
    link.href = nftToFocus?.image_url || '';
    link.click();
    link.remove();
  }, [containerRef, nftToFocus?.image_url]);

  return (
    <DetailsMenuWrapper closed={true} onOpenChange={handleOpenChange}>
      <ContextMenuTrigger asChild>
        <Box position="relative">{children}</Box>
      </ContextMenuTrigger>
      <ContextMenuContent
        marginRight="16px"
        marginTop="6px"
        position="absolute"
        top={typeof offset == 'number' ? offset : -220}
      >
        <Stack space="4px">
          <Stack>
            {!isPOAP && !isWatchingWallet && (
              <ContextMenuItem
                symbolLeft="paperplane.fill"
                onSelect={handleSendNft}
                shortcut={shortcuts.nfts.SEND_NFT.display}
              >
                <Text size="14pt" weight="semibold">
                  {i18n.t('nfts.details.send')}
                </Text>
              </ContextMenuItem>
            )}
            {!isWatchingWallet && (
              <ContextMenuItem
                symbolLeft={displayed ? 'eye.slash.fill' : 'eye.fill'}
                onSelect={() => {
                  simulateClick(containerRef.current);
                  toggleHideNFT(address, nftUniqueId);
                  if (displayed) {
                    triggerToast({
                      title: i18n.t('nfts.toast.hidden'),
                    });
                  } else {
                    triggerToast({
                      title: i18n.t('nfts.toast.unhidden'),
                    });
                  }
                }}
                shortcut={shortcuts.nfts.HIDE_NFT.display}
              >
                <Text size="14pt" weight="semibold">
                  {displayed
                    ? i18n.t('nfts.details.hide')
                    : i18n.t('nfts.details.unhide')}
                </Text>
              </ContextMenuItem>
            )}
            {!isWatchingWallet && (
              <ContextMenuItem
                symbolLeft={'exclamationmark.circle.fill'}
                onSelect={() => {
                  simulateClick(containerRef.current);
                  triggerAlert({
                    action: handleReportNft,
                    actionText: i18n.t('nfts.report_nft_action_text'),
                    text: i18n.t('nfts.report_nft_confirm_description'),
                    dismissText: i18n.t('alert.cancel'),
                  });
                }}
                shortcut={shortcuts.nfts.REPORT_NFT.display}
              >
                <Text size="14pt" weight="semibold">
                  {i18n.t('nfts.details.report')}
                </Text>
              </ContextMenuItem>
            )}
            {nftToFocus?.image_url && (
              <ContextMenuItem
                symbolLeft={'arrow.down.circle.fill'}
                onSelect={handleDownload}
                shortcut={shortcuts.nfts.DOWNLOAD_NFT.display}
              >
                <Text size="14pt" weight="semibold">
                  {i18n.t('nfts.details.download')}
                </Text>
              </ContextMenuItem>
            )}
            <ContextMenuItem
              symbolLeft={'doc.on.doc.fill'}
              onSelect={handleCopyId}
              shortcut={shortcuts.nfts.COPY_NFT_ID.display}
            >
              <Text size="14pt" weight="semibold">
                {i18n.t('nfts.details.copy_token_id')}
              </Text>
              <TextOverflow
                size="11pt"
                color="labelTertiary"
                weight="medium"
                maxWidth={140}
              >
                {nftToFocus?.id}
              </TextOverflow>
            </ContextMenuItem>
            <ContextMenuSeparator />
            {hasContractAddress && hasNetwork && !isPOAP && (
              <ContextMenuItem
                external
                symbolLeft={'safari'}
                onSelect={() => goToNewTab({ url: openseaUrl })}
              >
                <Text size="14pt" weight="semibold">
                  {i18n.t('nfts.details.view_on_opensea')}
                </Text>
              </ContextMenuItem>
            )}
            <ContextMenuItem
              external
              symbolLeft={'binoculars.fill'}
              onSelect={() => goToNewTab({ url: getBlockExplorerUrl() })}
            >
              <Text size="14pt" weight="semibold">
                {nftToFocus?.poapDropId
                  ? i18n.t('nfts.details.view_gallery')
                  : i18n.t('nfts.details.view_on_explorer', { explorerTitle })}
              </Text>
            </ContextMenuItem>
          </Stack>
        </Stack>
      </ContextMenuContent>
    </DetailsMenuWrapper>
  );
}
