import clsx from 'clsx';
import { ReactNode, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { selectNftsByCollection } from '~/core/resources/_selectors/nfts';
import { useNfts } from '~/core/resources/nfts';
import { useCurrentAddressStore } from '~/core/state';
import { AddressOrEth } from '~/core/types/assets';
import { UniqueAsset } from '~/core/types/nfts';
import { truncateAddress } from '~/core/utils/address';
import { convertRawAmountToNativeDisplay } from '~/core/utils/numbers';
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
import { TextStyles, textStyles } from '~/design-system/styles/core.css';
import { SymbolName } from '~/design-system/styles/designTokens';
import ExternalImage from '~/entries/popup/components/ExternalImage/ExternalImage';
import {
  Navbar,
  NavbarBackButton,
} from '~/entries/popup/components/Navbar/Navbar';
import { useDominantColor } from '~/entries/popup/hooks/useDominantColor';
import chunkLinks from '~/entries/popup/utils/chunkLinks';

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
  console.log('NFT: ', nft);
  const { data: dominantColor } = useDominantColor({
    imageUrl: nft?.image_url || undefined,
  });
  const backgroundColor = useMemo(() => {
    return dominantColor ? hexToRGBA(dominantColor, 0.1) : 'transparent';
  }, [dominantColor]);
  const backgroundColorBright = useMemo(() => {
    return dominantColor ? hexToRGBA(dominantColor, 0.16) : 'transparent';
  }, [dominantColor]);
  return (
    <Box background="surfacePrimary">
      <AccentColorProvider color={dominantColor || undefined}>
        <Navbar
          style={{ backgroundColor: backgroundColorBright }}
          leftComponent={<NavbarBackButton variant="transparent" />}
        />
        <Box
          alignItems="center"
          justifyContent="center"
          display="flex"
          style={{
            alignItems: 'center',
            display: 'flex',
            backgroundColor: backgroundColorBright,
          }}
        >
          <Box paddingHorizontal="20px">
            <Box borderRadius="16px" style={{ height: 320, width: 320 }}>
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
                    <Symbol
                      symbol="ellipsis.circle"
                      color="accent"
                      weight="bold"
                      size={14}
                    />
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
                symbol="link"
              >
                {'OpenSea'}
              </Button>
            </Box>
            <Box paddingBottom="20px">
              <Columns>
                <Column>
                  <Stack space="12px">
                    <Text weight="semibold" size="14pt" color="labelTertiary">
                      {'Last Sales Price'}
                    </Text>
                    <Text weight="bold" size="14pt" color="label">
                      {nft?.last_sale?.unit_price &&
                        (convertRawAmountToNativeDisplay(
                          nft.last_sale.unit_price,
                          nft.last_sale.payment_token?.decimals || 18,
                          nft.last_sale.quantity || 0,
                          'ETH',
                        ).display ||
                          'none')}
                    </Text>
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
                        {'Floor Price'}
                      </Text>
                      <Symbol
                        symbol="info.circle"
                        color="labelTertiary"
                        size={14}
                        weight="semibold"
                      />
                    </Inline>
                    <Text weight="bold" size="14pt" color="label" align="right">
                      {nft?.floorPriceEth}
                    </Text>
                  </Stack>
                </Column>
              </Columns>
            </Box>
          </Box>
        </Box>
        <Box background="surfacePrimary">
          <Box
            style={{
              backgroundColor,
            }}
          >
            <Box paddingHorizontal="20px" paddingTop="24px">
              <Accordion
                type="multiple"
                defaultValue={['description', 'properties', 'about']}
                asChild
              >
                <Box display="flex" flexDirection="column" gap="24px">
                  {nft?.description && (
                    <>
                      <AccordionItem value="description">
                        <AccordionTrigger>{'Description'}</AccordionTrigger>
                        <AccordionContent gap="24px">
                          <div />
                          <Description text={nft?.description} />
                        </AccordionContent>
                      </AccordionItem>
                      <Separator color="separatorTertiary" />
                    </>
                  )}

                  {nft?.traits && (
                    <AccordionItem value="properties">
                      <AccordionTrigger>{'Properties'}</AccordionTrigger>
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
                          {nft.traits.map((trait) => (
                            <Box
                              key={trait.trait_type}
                              borderColor="accent"
                              borderWidth="2px"
                              borderRadius="16px"
                            >
                              <Box
                                paddingVertical="12px"
                                paddingHorizontal="10px"
                              >
                                <Stack space="6px">
                                  <Text
                                    color="labelSecondary"
                                    size="11pt"
                                    weight="semibold"
                                  >
                                    {String(
                                      trait.trait_type || '',
                                    ).toUpperCase()}
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
                  )}
                  <Separator color="separatorTertiary" />
                  <AccordionItem value="about">
                    <AccordionTrigger>{'About'}</AccordionTrigger>
                    <AccordionContent gap="24px">
                      <div />
                      <InfoRow
                        symbol="dollarsign.square"
                        label={'Owners'}
                        value={nft?.floorPriceEth}
                      />
                      <InfoRow
                        symbol="dollarsign.square"
                        label={'Unique Owners'}
                        value={nft?.floorPriceEth}
                      />
                      <Separator color="separatorSecondary" />
                      <InfoRow
                        symbol="dollarsign.square"
                        label={'Token Standard'}
                        value={nft?.floorPriceEth}
                      />
                      {nft?.asset_contract?.address && (
                        <InfoRow
                          symbol="dollarsign.square"
                          label={'Token Contract'}
                          value={truncateAddress(
                            nft?.asset_contract?.address as AddressOrEth,
                          )}
                        />
                      )}
                      <InfoRow
                        symbol="dollarsign.square"
                        label={'Contract Creator'}
                        value={nft?.asset_contract?.name}
                      />
                      <InfoRow
                        symbol="dollarsign.square"
                        label={'Chain'}
                        value={nft?.floorPriceEth}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Box>
              </Accordion>
            </Box>
          </Box>
        </Box>
      </AccentColorProvider>
    </Box>
  );
}

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

function Description({ text = '' }: { text?: string | null }) {
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

export const InfoRow = ({
  symbol,
  label,
  value,
}: {
  symbol: SymbolName;
  label: ReactNode;
  value: ReactNode;
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
    <TextOverflow
      color="labelSecondary"
      size="12pt"
      weight="semibold"
      cursor="text"
      userSelect="all"
    >
      {value}
    </TextOverflow>
  </Box>
);

function hexToRGBA(hex: string, alpha: number) {
  // Remove the '#' character if present
  const hexTrimmed = hex.replace(/^#/, '');

  // Parse the hex values for red, green, and blue
  const red = parseInt(hexTrimmed.slice(0, 2), 16);
  const green = parseInt(hexTrimmed.slice(2, 4), 16);
  const blue = parseInt(hexTrimmed.slice(4, 6), 16);

  // Return the RGBA string
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
