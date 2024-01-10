import { ReactNode, useCallback, useRef } from 'react';

import { i18n } from '~/core/languages';
import { ChainName } from '~/core/types/chains';
import { UniqueAsset } from '~/core/types/nfts';
import {
  chainIdFromChainName,
  getBlockExplorerHostForChain,
} from '~/core/utils/chains';
import { goToNewTab } from '~/core/utils/tabs';
import { Box, Stack, Symbol, Text, TextOverflow } from '~/design-system';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { HomeMenuRow } from '~/entries/popup/components/HomeMenuRow/HomeMenuRow';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';

import { getOpenseaUrl } from './utils';

export default function NFTDropdownMenu({
  children,
  nft,
}: {
  children: ReactNode;
  nft?: UniqueAsset | null;
}) {
  const hasContractAddress = !!nft?.asset_contract.address;
  const hasNetwork = !!nft?.network;

  const explorerTitle =
    nft?.network === 'mainnet' ? 'Etherscan' : i18n.t('nfts.details.explorer');

  const getBlockExplorerUrl = () => {
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

  const onValueChange = (
    value: 'copy' | 'download' | 'opensea' | 'explorer',
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
                  />
                </DropdownMenuRadioItem>
              )}
              {hasContractAddress && hasNetwork && (
                <DropdownMenuRadioItem highlightAccentColor value="opensea">
                  <HomeMenuRow
                    leftComponent={
                      <Symbol size={18} symbol="safari" weight="semibold" />
                    }
                    centerComponent={
                      <Box paddingVertical="6px">
                        <Text size="14pt" weight="semibold">
                          {'OpenSea'}
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
                        {explorerTitle}
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
