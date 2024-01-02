import { ReactNode, useCallback, useRef } from 'react';

import { i18n } from '~/core/languages';
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
  ContextMenuTrigger,
} from '~/entries/popup/components/ContextMenu/ContextMenu';
import { DetailsMenuWrapper } from '~/entries/popup/components/DetailsMenu';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';

import { getOpenseaUrl } from './utils';

export default function NFTContextMenu({
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
  const blockExplorerUrl = `https://${getBlockExplorerHostForChain(
    chainIdFromChainName(nft?.network as ChainName),
  )}/nft/${nft?.asset_contract.address}/${nft?.id}`;

  const openseaUrl = getOpenseaUrl({ nft });

  const downloadLink = useRef<HTMLAnchorElement>(null);

  const copyId = useCallback(() => {
    navigator.clipboard.writeText(nft?.id as string);
    triggerToast({
      title: i18n.t('nfts.details.id_copied'),
      description: nft?.id,
    });
  }, [nft?.id]);

  return (
    <DetailsMenuWrapper closed={true}>
      <ContextMenuTrigger asChild>
        <Box position="relative">{children}</Box>
      </ContextMenuTrigger>
      <ContextMenuContent marginRight="16px" marginTop="6px">
        <Stack space="4px">
          <Stack>
            <ContextMenuItem symbolLeft={'doc.on.doc.fill'} onSelect={copyId}>
              <Text size="14pt" weight="semibold">
                {i18n.t('nfts.details.copy_token_id')}
              </Text>
              <TextOverflow
                size="11pt"
                color="labelTertiary"
                weight="medium"
                maxWidth={140}
              >
                {nft?.id}
              </TextOverflow>
            </ContextMenuItem>
            {nft?.image_url && (
              <ContextMenuItem
                symbolLeft={'arrow.down.circle.fill'}
                onSelect={() => downloadLink.current?.click()}
              >
                <Text size="14pt" weight="semibold">
                  <a href={nft?.image_url} download ref={downloadLink}>
                    {i18n.t('nfts.details.download')}
                  </a>
                </Text>
              </ContextMenuItem>
            )}
            {hasContractAddress && hasNetwork && (
              <ContextMenuItem
                symbolLeft={'safari'}
                onSelect={() => goToNewTab({ url: openseaUrl })}
              >
                <Text size="14pt" weight="semibold">
                  {'OpenSea'}
                </Text>
              </ContextMenuItem>
            )}
            <ContextMenuItem
              symbolLeft={'binoculars.fill'}
              onSelect={() => goToNewTab({ url: blockExplorerUrl })}
            >
              <Text size="14pt" weight="semibold">
                {explorerTitle}
              </Text>
            </ContextMenuItem>
          </Stack>
        </Stack>
      </ContextMenuContent>
    </DetailsMenuWrapper>
  );
}
