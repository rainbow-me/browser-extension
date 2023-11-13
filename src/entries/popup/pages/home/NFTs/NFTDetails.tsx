import { DropdownMenuRadioGroup } from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import { ReactNode, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Address, useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { selectNftsByCollection } from '~/core/resources/_selectors/nfts';
import { useNfts } from '~/core/resources/nfts';
import { useCurrentAddressStore } from '~/core/state';
import { AddressOrEth } from '~/core/types/assets';
import { ChainName } from '~/core/types/chains';
import { UniqueAsset } from '~/core/types/nfts';
import { truncateAddress } from '~/core/utils/address';
import {
  chainIdFromChainName,
  getBlockExplorerHostForChain,
} from '~/core/utils/chains';
import { convertRawAmountToDecimalFormat } from '~/core/utils/numbers';
import { capitalize } from '~/core/utils/strings';
import { goToNewTab } from '~/core/utils/tabs';
import {
  AccentColorProvider,
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/design-system/components/Accordion/Accordion';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import {
  TextStyles,
  textStyles,
  transparentAccentColorAsHsl,
} from '~/design-system/styles/core.css';
import { SymbolName } from '~/design-system/styles/designTokens';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import ExternalImage from '~/entries/popup/components/ExternalImage/ExternalImage';
import { HomeMenuRow } from '~/entries/popup/components/HomeMenuRow/HomeMenuRow';
import {
  Navbar,
  NavbarBackButton,
} from '~/entries/popup/components/Navbar/Navbar';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { useDominantColor } from '~/entries/popup/hooks/useDominantColor';
import chunkLinks from '~/entries/popup/utils/chunkLinks';

const getOpenseaUrl = ({ nft }: { nft?: UniqueAsset | null }) => {
  const networkUrlString =
    nft?.network === 'mainnet' ? 'ethereum' : nft?.network;
  const openseaUrl = `https://opensea.io/assets/${networkUrlString}/${nft?.asset_contract.address}/${nft?.id}`;
  return openseaUrl;
};

export default function NFTDetails() {
  const { currentAddress: address } = useCurrentAddressStore();
  const { collectionId, nftId } = useParams<{
    collectionId: string;
    nftId: string;
  }>();
  const { data: nfts } = useNfts(
    { address },
    { select: selectNftsByCollection },
  );
  const nft = useMemo(() => {
    if (!collectionId || !nftId) return null;
    return nfts?.[collectionId]?.assets?.find(
      (asset: UniqueAsset) => asset.id === nftId,
    );
  }, [collectionId, nftId, nfts]);
  const { data: dominantColor } = useDominantColor({
    imageUrl: nft?.image_url || undefined,
  });
  return (
    <Box background="surfacePrimary">
      <AccentColorProvider
        color={nft?.predominantColor || dominantColor || undefined}
      >
        <Box style={{ backgroundColor: transparentAccentColorAsHsl }}>
          <NFTNavbar nft={nft} />
          <Box
            alignItems="center"
            justifyContent="center"
            display="flex"
            style={{
              alignItems: 'center',
              display: 'flex',
              background: transparentAccentColorAsHsl,
            }}
          >
            <Box paddingHorizontal="20px">
              <Box
                background="surfaceSecondary"
                borderRadius="16px"
                style={{ height: 320, width: 320 }}
              >
                <ExternalImage
                  src={nft?.image_url || ''}
                  height={320}
                  width={320}
                  borderRadius="16px"
                />
              </Box>
              <Box paddingTop="20px" paddingBottom="16px">
                <Columns>
                  <Column>
                    <Box paddingBottom="12px">
                      <Text color="label" weight="bold" size="20pt">
                        {nft?.name}
                      </Text>
                    </Box>
                    <Inline alignVertical="center" space="7px">
                      <Box
                        borderRadius="round"
                        style={{
                          overflow: 'none',
                          height: 16,
                          width: 16,
                        }}
                      >
                        <ExternalImage
                          src={nft?.collection.image_url || ''}
                          height={16}
                          width={16}
                          borderRadius="round"
                        />
                      </Box>
                      <TextOverflow
                        size="12pt"
                        weight="bold"
                        color="labelTertiary"
                      >
                        {nft?.collection.name}
                      </TextOverflow>
                    </Inline>
                  </Column>
                  <Column width="content">
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: '100%',
                      }}
                    >
                      <NFTDropdownMenu nft={nft}>
                        <Symbol
                          symbol="ellipsis.circle"
                          color="accent"
                          weight="bold"
                          size={14}
                        />
                      </NFTDropdownMenu>
                    </Box>
                  </Column>
                </Columns>
              </Box>
              <Box paddingVertical="16px">
                <Button
                  width="full"
                  color="accent"
                  height="36px"
                  variant="flat"
                  borderRadius="round"
                  symbol="arrow.up.right.square.fill"
                >
                  {'OpenSea'}
                </Button>
              </Box>
              <NFTPriceSection nft={nft} />
            </Box>
          </Box>
          <Box paddingHorizontal="20px" paddingTop="24px">
            <Accordion
              type="multiple"
              defaultValue={['description', 'properties', 'about']}
              asChild
            >
              <Box display="flex" flexDirection="column" gap="24px">
                {nft?.description && (
                  <NFTAccordionDescriptionSection nft={nft} />
                )}
                {nft?.traits && (
                  <NFTAccordionTraitsSection traits={nft.traits} />
                )}
                <Separator color="separatorTertiary" />
                <NFTAccordionAboutSection nft={nft} />
              </Box>
            </Accordion>
            <Box
              display="flex"
              flexDirection="row"
              paddingBottom="20px"
              paddingTop="24px"
              gap="8px"
              flexWrap="wrap"
            >
              {nft?.collection?.external_url && (
                <NFTCollectionExternalLinkButton
                  url={nft.collection.external_url}
                />
              )}
              {nft?.asset_contract.address && (
                <NFTEtherscanLinkButton
                  contractAddress={nft.asset_contract.address}
                  network={nft.network}
                />
              )}
            </Box>
          </Box>
        </Box>
      </AccentColorProvider>
    </Box>
  );
}

const NFTPriceSection = ({ nft }: { nft?: UniqueAsset | null }) => {
  const lastSaleDisplay = useMemo(() => {
    if (nft?.last_sale?.unit_price && nft?.last_sale?.payment_token?.decimals) {
      return `${convertRawAmountToDecimalFormat(
        nft.last_sale.unit_price,
        nft.last_sale.payment_token.decimals,
      )} ${nft?.last_sale?.payment_token?.symbol}`;
    }
  }, [nft]);
  return (
    <Box paddingBottom="20px">
      <Columns>
        <Column>
          <Stack space="12px">
            <Text weight="semibold" size="14pt" color="labelTertiary">
              {i18n.t('nfts.details.last_sales_price')}
            </Text>
            {lastSaleDisplay ? (
              <Text weight="bold" size="14pt" color="label">
                {lastSaleDisplay}
              </Text>
            ) : (
              <Text weight="bold" size="14pt" color="labelTertiary">
                {i18n.t('nfts.details.none')}
              </Text>
            )}
          </Stack>
        </Column>
        <Column>
          <Stack space="12px" alignHorizontal="right">
            <Inline alignVertical="center" space="4px">
              <Text
                weight="semibold"
                size="14pt"
                color="labelTertiary"
                align="right"
              >
                {i18n.t('nfts.details.floor_price')}
              </Text>
              <Symbol
                symbol="info.circle"
                color="labelTertiary"
                size={10}
                weight="semibold"
              />
            </Inline>
            {nft?.floorPriceEth ? (
              <Text weight="bold" size="14pt" color="label" align="right">
                {`${nft?.floorPriceEth} ETH`}
              </Text>
            ) : (
              <Text
                weight="bold"
                size="14pt"
                color="labelTertiary"
                align="right"
              >
                {i18n.t('nfts.details.none')}
              </Text>
            )}
          </Stack>
        </Column>
      </Columns>
    </Box>
  );
};

const NFTAccordionDescriptionSection = ({
  nft,
}: {
  nft?: UniqueAsset | null;
}) => {
  return (
    <>
      <AccordionItem value="description">
        <AccordionTrigger>{'Description'}</AccordionTrigger>
        <AccordionContent gap="24px">
          <div />
          <NFTDescription text={nft?.description} />
        </AccordionContent>
      </AccordionItem>
      <Separator color="separatorTertiary" />
    </>
  );
};

const NFTAccordionTraitsSection = ({
  traits,
}: {
  traits: UniqueAsset['traits'];
}) => {
  return (
    <AccordionItem value="properties">
      <AccordionTrigger>{i18n.t('nfts.details.properties')}</AccordionTrigger>
      <AccordionContent gap="24px">
        <div />
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          {traits.map((trait) => (
            <Box
              key={trait.trait_type}
              borderColor="accent"
              borderWidth="2px"
              borderRadius="16px"
            >
              <Box paddingVertical="12px" paddingHorizontal="10px">
                <Stack space="6px">
                  <Text color="labelSecondary" size="11pt" weight="semibold">
                    {String(trait.trait_type || '').toUpperCase()}
                  </Text>
                  <Text color="label" size="14pt" weight="bold">
                    {String(trait.value || '').toUpperCase()}
                  </Text>
                </Stack>
              </Box>
            </Box>
          ))}
        </Box>
      </AccordionContent>
    </AccordionItem>
  );
};

const NFTAccordionAboutSection = ({ nft }: { nft?: UniqueAsset | null }) => {
  const network = useMemo(() => {
    if (nft?.network === 'mainnet') {
      return 'Ethereum';
    }
    return nft?.network && capitalize(nft.network);
  }, [nft?.network]);
  const deployedBy = nft?.asset_contract?.deployed_by;
  const { data: creatorEnsName } = useEnsName({
    address: (deployedBy as Address) || undefined,
  });
  const goToDeployerURL = useCallback(
    (deployedBy: string) =>
      goToNewTab({
        url: `https://etherscan.io/address/${deployedBy}`,
      }),
    [],
  );
  const copyTokenContract = useCallback((contractAddress: Address) => {
    navigator.clipboard.writeText(contractAddress as string);
    triggerToast({
      title: i18n.t('nfts.details.address_copied'),
      description: truncateAddress(contractAddress),
    });
  }, []);
  return (
    <AccordionItem value="about">
      <AccordionTrigger>{i18n.t('nfts.details.about')}</AccordionTrigger>
      <AccordionContent gap="24px">
        <div />
        {nft?.floorPriceEth && (
          <NFTInfoRow
            symbol="dollarsign.square"
            label={i18n.t('nfts.details.floor_price')}
            value={nft?.floorPriceEth}
          />
        )}
        {nft?.asset_contract.schema_name && (
          <NFTInfoRow
            symbol="info.circle"
            label={i18n.t('nfts.details.token_standard')}
            value={nft?.asset_contract.schema_name}
          />
        )}
        {nft?.asset_contract?.address && (
          <NFTInfoRow
            symbol="doc.plaintext"
            label={i18n.t('nfts.details.token_contract')}
            value={truncateAddress(
              nft?.asset_contract?.address as AddressOrEth,
            )}
            valueSymbol="doc.on.doc"
            onClick={() =>
              copyTokenContract(nft.asset_contract.address as Address)
            }
          />
        )}
        {nft?.asset_contract?.deployed_by && (
          <NFTInfoRow
            symbol="doc.plaintext"
            label={i18n.t('nfts.details.contract_creator')}
            value={
              creatorEnsName ||
              truncateAddress(nft?.asset_contract.deployed_by as AddressOrEth)
            }
            valueSymbol="arrow.up.right.circle"
            onClick={() =>
              goToDeployerURL(nft.asset_contract.deployed_by as Address)
            }
          />
        )}
        {network && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap="4px"
          >
            <Inline alignVertical="center" space="12px" wrap={false}>
              <Symbol
                size={14}
                symbol="point.3.filled.connected.trianglepath.dotted"
                weight="medium"
                color="labelTertiary"
              />
              <Text color="labelTertiary" size="12pt" weight="semibold">
                {i18n.t('nfts.details.chain')}
              </Text>
            </Inline>
            <Inline alignVertical="center" space="6px">
              <ChainBadge
                chainId={chainIdFromChainName(
                  nft?.network || ChainName.mainnet,
                )}
                size={12}
              />
              <TextOverflow
                color="labelSecondary"
                size="12pt"
                weight="semibold"
                cursor="text"
                userSelect="all"
              >
                {network}
              </TextOverflow>
            </Inline>
          </Box>
        )}
        {nft?.description && (
          <>
            <Separator color="separatorTertiary" />
            <Box paddingBottom="18px">
              <NFTDescription text={nft.description} />
            </Box>
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

const NFTNavbar = ({ nft }: { nft?: UniqueAsset | null }) => {
  return (
    <Navbar
      style={{ backgroundColor: transparentAccentColorAsHsl }}
      leftComponent={<NavbarBackButton variant="transparent" />}
      rightComponent={
        <Box>
          <Inline alignVertical="center" space="8px">
            {/** Share Button Placeholder */}
            {/* <Box paddingBottom="1px">
              <Navbar.SymbolButton
                symbolSize={14}
                symbol="square.and.arrow.up"
                height="32px"
                variant="transparent"
              />
            </Box> */}
            <NFTDropdownMenu nft={nft}>
              <Navbar.SymbolButton
                symbolSize={15}
                symbol="ellipsis.circle"
                height="32px"
                variant="transparent"
              />
            </NFTDropdownMenu>
          </Inline>
        </Box>
      }
    />
  );
};

const NFTDropdownMenu = ({
  children,
  nft,
}: {
  children: ReactNode;
  nft?: UniqueAsset | null;
}) => {
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

  const onValueChange = (
    value: 'copy' | 'download' | 'opensea' | 'explorer',
  ) => {
    switch (value) {
      case 'copy':
        copyId();
        break;
      case 'explorer':
        goToNewTab({ url: blockExplorerUrl });
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
};

const NFTCollectionExternalLinkButton = ({ url }: { url: string }) => {
  const title = url
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '');
  return <NFTLinkButton symbol="safari" title={title} url={url} />;
};

const NFTEtherscanLinkButton = ({
  contractAddress,
  network,
}: {
  contractAddress: string;
  network: string;
}) => {
  const blockExplorerUrl = `https://${getBlockExplorerHostForChain(
    chainIdFromChainName(network as ChainName),
  )}/token/${contractAddress}`;
  const title =
    network === 'mainnet' ? 'Etherscan' : i18n.t('nfts.details.explorer');
  return <NFTLinkButton symbol="link" title={title} url={blockExplorerUrl} />;
};

const NFTLinkButton = ({
  symbol,
  title,
  url,
}: {
  symbol: SymbolProps['symbol'];
  title: string;
  url: string;
}) => {
  return (
    <Button
      width="fit"
      variant="tinted"
      color="accent"
      symbol={symbol}
      height="32px"
      onClick={() => goToNewTab({ url })}
    >
      {title}
    </Button>
  );
};

const LinkInline = ({
  children,
  color,
  weight,
  href,
}: {
  children: ReactNode;
  color?: TextStyles['color'];
  highlight?: boolean;
  weight?: TextStyles['fontWeight'];
  href: string;
}) => (
  <Box
    rel="noopener noreferrer"
    target="_blank"
    href={href}
    as="a"
    className={clsx([textStyles({ color, fontWeight: weight })])}
  >
    {children}
  </Box>
);

function NFTDescription({ text = '' }: { text?: string | null }) {
  if (!text) return null;
  const chunks = chunkLinks(text);
  return (
    <Text color="labelTertiary" size="14pt" weight="regular">
      {chunks.map((chunk, i) => {
        if (chunk.type === 'text') {
          return chunk.value;
        } else if (chunk.href) {
          return (
            <LinkInline key={i} href={chunk.href} color="accent">
              {chunk.value}
            </LinkInline>
          );
        }
      })}
    </Text>
  );
}

export const NFTInfoRow = ({
  symbol,
  label,
  onClick,
  value,
  valueSymbol,
}: {
  symbol: SymbolName;
  label: ReactNode;
  onClick?: () => void;
  value: ReactNode;
  valueSymbol?: SymbolName;
}) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    gap="4px"
  >
    <Inline alignVertical="center" space="12px" wrap={false}>
      <Symbol size={14} symbol={symbol} weight="medium" color="labelTertiary" />
      <Text color="labelTertiary" size="12pt" weight="semibold">
        {label}
      </Text>
    </Inline>
    <Box onClick={onClick} cursor="pointer">
      <Inline alignVertical="center" space="6px">
        <TextOverflow
          color="labelSecondary"
          size="12pt"
          weight="semibold"
          cursor="text"
          userSelect="all"
        >
          {value}
        </TextOverflow>
        {valueSymbol && (
          <Symbol
            size={14}
            symbol={valueSymbol}
            weight="medium"
            color="labelTertiary"
            cursor="pointer"
          />
        )}
      </Inline>
    </Box>
  </Box>
);
