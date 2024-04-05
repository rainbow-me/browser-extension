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
import {
  Box,
  Separator,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { HomeMenuRow } from '~/entries/popup/components/HomeMenuRow/HomeMenuRow';
import { ShortcutHint } from '~/entries/popup/components/ShortcutHint/ShortcutHint';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import { getOpenseaUrl } from './utils';

export default function NFTDropdownMenu({
  children,
  nft,
}: {
  children: ReactNode;
  nft?: UniqueAsset | null;
}) {
  const { currentAddress: address } = useCurrentAddressStore();
  const { hidden, toggleHideNFT } = useNftsStore();
  const { setSelectedNft } = useSelectedNftStore();
  const navigate = useRainbowNavigate();
  const hiddenNftsForAddress = hidden[address] || {};
  const displayed = !hiddenNftsForAddress[nft?.uniqueId || ''];
  const hasContractAddress = !!nft?.asset_contract.address;
  const hasNetwork = !!nft?.network;

  const explorerTitle =
    nft?.network === 'mainnet' ? 'Etherscan' : i18n.t('nfts.details.explorer');

  const getBlockExplorerUrl = () => {
    if (nft?.poapDropId) {
      return `https://collectors.poap.xyz/drop/${nft.poapDropId}`;
    }

    if (nft?.network === 'mainnet') {
      return `https://${getBlockExplorerHostForChain(
        chainIdFromChainName(nft?.network as ChainName),
      )}/nft/${nft?.asset_contract.address}/${nft?.id}`;
    } else {
      return `https://${getBlockExplorerHostForChain(
        chainIdFromChainName(nft?.network as ChainName),
      )}/token/${nft?.asset_contract.address}?a=${nft?.id}`;
    }
  };

  const openseaUrl = getOpenseaUrl({ nft });

  const downloadLink = useRef<HTMLAnchorElement>(null);

  const copyId = useCallback(() => {
    navigator.clipboard.writeText(nft?.id as string);
    triggerToast({
      title: i18n.t('nfts.details.id_copied'),
      description: nft?.id,
    });
  }, [nft?.id]);

  const handleSendNft = useCallback(() => {
    if (nft) {
      setSelectedNft(nft);
      navigate(ROUTES.SEND, { replace: true });
    }
  }, [navigate, nft, setSelectedNft]);

  const handleReportNft = useCallback(() => {
    if (nft) {
      reportNftAsSpam(nft);
      triggerToast({ title: i18n.t('nfts.toast.spam_reported') });
    }
  }, [nft]);

  const onValueChange = (
    value:
      | 'send'
      | 'copy'
      | 'download'
      | 'opensea'
      | 'explorer'
      | 'hide'
      | 'report',
  ) => {
    switch (value) {
      case 'copy':
        copyId();
        break;
      case 'explorer':
        goToNewTab({ url: getBlockExplorerUrl() });
        break;
      case 'opensea':
        goToNewTab({ url: openseaUrl });
        break;
      case 'download':
        downloadLink.current?.click();
        break;
      case 'hide':
        toggleHideNFT(address, nft?.uniqueId || '');
        break;
      case 'send':
        handleSendNft();
        break;
      case 'report':
        handleReportNft();
        break;
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger accentColor={nft?.predominantColor} asChild>
        <Box position="relative">{children}</Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        marginRight="16px"
        marginTop="6px"
        accentColor={nft?.predominantColor}
      >
        <DropdownMenuRadioGroup
          onValueChange={(value) =>
            onValueChange(value as 'copy' | 'download' | 'opensea' | 'explorer')
          }
        >
          <Stack space="4px">
            <Stack>
              <DropdownMenuRadioItem highlightAccentColor value="send">
                <HomeMenuRow
                  leftComponent={
                    <Symbol
                      size={18}
                      symbol="paperplane.fill"
                      weight="semibold"
                    />
                  }
                  centerComponent={
                    <Stack space="6px">
                      <Text size="14pt" weight="semibold">
                        {i18n.t('nfts.details.send')}
                      </Text>
                    </Stack>
                  }
                  rightComponent={
                    <ShortcutHint hint={shortcuts.nfts.SEND_NFT.display} />
                  }
                />
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem highlightAccentColor value="hide">
                <HomeMenuRow
                  leftComponent={
                    <Symbol
                      size={18}
                      symbol={displayed ? 'eye.slash.fill' : 'eye.fill'}
                      weight="semibold"
                    />
                  }
                  centerComponent={
                    <Box paddingVertical="6px" paddingLeft="2px">
                      <Text size="14pt" weight="semibold">
                        {displayed
                          ? i18n.t('nfts.details.hide')
                          : i18n.t('nfts.details.unhide')}
                      </Text>
                    </Box>
                  }
                  rightComponent={
                    <ShortcutHint hint={shortcuts.nfts.HIDE_NFT.display} />
                  }
                />
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem highlightAccentColor value="report">
                <HomeMenuRow
                  leftComponent={
                    <Symbol
                      size={18}
                      symbol="exclamationmark.circle.fill"
                      weight="semibold"
                    />
                  }
                  centerComponent={
                    <Box paddingVertical="6px" paddingLeft="2px">
                      <Text size="14pt" weight="semibold">
                        {i18n.t('nfts.details.report')}
                      </Text>
                    </Box>
                  }
                />
              </DropdownMenuRadioItem>
              {nft?.image_url && (
                <DropdownMenuRadioItem
                  highlightAccentColor
                  value="download"
                  cursor="pointer"
                >
                  <HomeMenuRow
                    leftComponent={
                      <Symbol
                        size={18}
                        symbol="arrow.down.circle.fill"
                        weight="semibold"
                        cursor="pointer"
                      />
                    }
                    centerComponent={
                      <Box paddingVertical="6px" cursor="pointer">
                        <Text size="14pt" weight="semibold" cursor="pointer">
                          <a href={nft?.image_url} download ref={downloadLink}>
                            {i18n.t('nfts.details.download')}
                          </a>
                        </Text>
                      </Box>
                    }
                    rightComponent={
                      <ShortcutHint
                        hint={shortcuts.nfts.DOWNLOAD_NFT.display}
                      />
                    }
                  />
                </DropdownMenuRadioItem>
              )}
              <DropdownMenuRadioItem
                highlightAccentColor
                value="copy"
                cursor="copy"
              >
                <HomeMenuRow
                  leftComponent={
                    <Symbol
                      cursor="copy"
                      size={18}
                      symbol="doc.on.doc.fill"
                      weight="semibold"
                    />
                  }
                  centerComponent={
                    <Stack space="6px">
                      <Text size="14pt" weight="semibold" cursor="copy">
                        {i18n.t('nfts.details.copy_token_id')}
                      </Text>
                      <TextOverflow
                        size="11pt"
                        weight="semibold"
                        color="labelTertiary"
                        cursor="copy"
                        maxWidth={140}
                      >
                        {nft?.id}
                      </TextOverflow>
                    </Stack>
                  }
                  rightComponent={
                    <ShortcutHint hint={shortcuts.nfts.COPY_NFT_ID.display} />
                  }
                />
              </DropdownMenuRadioItem>
              <Separator color="separatorSecondary" />
              {hasContractAddress && hasNetwork && (
                <DropdownMenuRadioItem highlightAccentColor value="opensea">
                  <HomeMenuRow
                    leftComponent={
                      <Symbol size={18} symbol="safari" weight="semibold" />
                    }
                    centerComponent={
                      <Box paddingVertical="6px">
                        <Text size="14pt" weight="semibold">
                          {i18n.t('nfts.details.view_on_opensea')}
                        </Text>
                      </Box>
                    }
                    rightComponent={
                      <Symbol
                        symbol="arrow.up.right.circle"
                        weight="regular"
                        size={12}
                        color="labelTertiary"
                      />
                    }
                  />
                </DropdownMenuRadioItem>
              )}
              <DropdownMenuRadioItem highlightAccentColor value="explorer">
                <HomeMenuRow
                  leftComponent={
                    <Symbol
                      size={18}
                      symbol="binoculars.fill"
                      weight="semibold"
                    />
                  }
                  centerComponent={
                    <Box paddingVertical="6px">
                      <Text size="14pt" weight="semibold">
                        {nft?.poapDropId
                          ? i18n.t('nfts.details.view_gallery')
                          : i18n.t('nfts.details.view_on_explorer', {
                              explorerTitle,
                            })}
                      </Text>
                    </Box>
                  }
                  rightComponent={
                    <Symbol
                      symbol="arrow.up.right.circle"
                      weight="regular"
                      size={12}
                      color="labelTertiary"
                    />
                  }
                />
              </DropdownMenuRadioItem>
            </Stack>
          </Stack>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
