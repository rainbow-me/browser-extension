import { ReactNode, useCallback, useRef } from 'react';

import { i18n } from '~/core/languages';
import { reportNftAsSpam } from '~/core/network/nfts';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useNftsStore } from '~/core/state/nfts';
import { useSelectedNftStore } from '~/core/state/selectedNft';
import { ChainName } from '~/core/types/chains';
import { UniqueAsset } from '~/core/types/nfts';
import {
  chainIdFromChainName,
  getBlockExplorerHostForChain,
} from '~/core/utils/chains';
import { goToNewTab } from '~/core/utils/tabs';
import { Box, Stack, Text, TextOverflow } from '~/design-system';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '~/entries/popup/components/ContextMenu/ContextMenu';
import { DetailsMenuWrapper } from '~/entries/popup/components/DetailsMenu';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import { getOpenseaUrl } from './utils';

export default function NFTContextMenu({
  children,
  nft,
  offsetOverride,
}: {
  children: ReactNode;
  nft?: UniqueAsset | null;
  offsetOverride?: boolean;
}) {
  const { currentAddress: address } = useCurrentAddressStore();
  const { hidden, toggleHideNFT } = useNftsStore();
  const { selectedNft, setSelectedNft } = useSelectedNftStore();
  const navigate = useRainbowNavigate();
  const hiddenNftsForAddress = hidden[address] || {};
  const nftToFocus = selectedNft ?? nft;
  const hasContractAddress = !!nftToFocus?.asset_contract.address;
  const hasNetwork = !!nftToFocus?.network;
  const displayed = !hiddenNftsForAddress[nftToFocus?.uniqueId || ''];

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
        chainIdFromChainName(nftToFocus?.network as ChainName),
      )}/nft/${nftToFocus?.asset_contract.address}/${nft?.id}`;
    } else {
      return `https://${getBlockExplorerHostForChain(
        chainIdFromChainName(nftToFocus?.network as ChainName),
      )}/token/${nftToFocus?.asset_contract.address}?a=${nft?.id}`;
    }
  };

  const openseaUrl = getOpenseaUrl({ nft: nftToFocus });

  const downloadLink = useRef<HTMLAnchorElement>(null);

  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(nftToFocus?.id as string);
    triggerToast({
      title: i18n.t('nfts.details.id_copied'),
      description: nftToFocus?.id,
    });
  }, [nftToFocus?.id]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen && nft) {
        setSelectedNft(nft);
      }
    },
    [nft, setSelectedNft],
  );

  const handleSendNft = useCallback(() => {
    navigate(ROUTES.SEND);
  }, [navigate]);

  const handleReportNft = useCallback(() => {
    if (nftToFocus) {
      reportNftAsSpam(nftToFocus);
      triggerToast({ title: i18n.t('nfts.toast.spam_reported') });
    }
  }, [nftToFocus]);

  return (
    <DetailsMenuWrapper closed={true} onOpenChange={handleOpenChange}>
      <ContextMenuTrigger asChild>
        <Box position="relative">{children}</Box>
      </ContextMenuTrigger>
      <ContextMenuContent
        marginRight="16px"
        marginTop="6px"
        position="absolute"
        top={offsetOverride ? 0 : -220}
      >
        <Stack space="4px">
          <Stack>
            <ContextMenuItem
              symbolLeft="paperplane.fill"
              onSelect={handleSendNft}
              shortcut={shortcuts.nfts.SEND_NFT.display}
            >
              <Text size="14pt" weight="semibold">
                {i18n.t('nfts.details.send')}
              </Text>
            </ContextMenuItem>
            <ContextMenuItem
              symbolLeft={displayed ? 'eye.slash.fill' : 'eye.fill'}
              onSelect={() =>
                toggleHideNFT(address, nftToFocus?.uniqueId || '')
              }
              shortcut={shortcuts.nfts.HIDE_NFT.display}
            >
              <Text size="14pt" weight="semibold">
                {displayed
                  ? i18n.t('nfts.details.hide')
                  : i18n.t('nfts.details.unhide')}
              </Text>
            </ContextMenuItem>
            <ContextMenuItem
              symbolLeft={'exclamationmark.circle.fill'}
              onSelect={handleReportNft}
            >
              <Text size="14pt" weight="semibold">
                {i18n.t('nfts.details.report')}
              </Text>
            </ContextMenuItem>
            {nftToFocus?.image_url && (
              <ContextMenuItem
                symbolLeft={'arrow.down.circle.fill'}
                onSelect={() => downloadLink.current?.click()}
                shortcut={shortcuts.nfts.DOWNLOAD_NFT.display}
              >
                <Text size="14pt" weight="semibold">
                  <a href={nftToFocus?.image_url} download ref={downloadLink}>
                    {i18n.t('nfts.details.download')}
                  </a>
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
            {hasContractAddress && hasNetwork && (
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
