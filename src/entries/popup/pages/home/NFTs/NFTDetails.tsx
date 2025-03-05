import { DropdownMenuRadioGroup } from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import { format, formatDistanceStrict } from 'date-fns';
import { ReactNode, useCallback, useMemo } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { Address } from 'viem';
import { useEnsName } from 'wagmi';

import { analytics } from '~/analytics';
import { i18n } from '~/core/languages';
import { useEnsRegistration } from '~/core/resources/ens/ensRegistration';
import { useNft } from '~/core/resources/nfts/useNft';
import { networkStore } from '~/core/state/networks/networks';
import { useSelectedNftStore } from '~/core/state/selectedNft';
import { AddressOrEth, UniqueId } from '~/core/types/assets';
import { ChainId, ChainName, chainNameToIdMapping } from '~/core/types/chains';
import { UniqueAsset } from '~/core/types/nfts';
import {
  deriveAddressAndChainWithUniqueId,
  truncateAddress,
} from '~/core/utils/address';
import { getBlockExplorerHostForChain } from '~/core/utils/chains';
import { copyAddress } from '~/core/utils/copy';
import {
  getUniqueAssetImagePreviewURL,
  getUniqueAssetImageThumbnailURL,
} from '~/core/utils/nfts';
import { convertRawAmountToDecimalFormat } from '~/core/utils/numbers';
import { goToNewTab } from '~/core/utils/tabs';
import {
  AccentColorProvider,
  Bleed,
  Box,
  Button,
  ButtonSymbol,
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
import { Lens } from '~/design-system/components/Lens/Lens';
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
import {
  ExplainerSheet,
  useExplainerSheetParams,
} from '~/entries/popup/components/ExplainerSheet/ExplainerSheet';
import ExternalImage from '~/entries/popup/components/ExternalImage/ExternalImage';
import { HomeMenuRow } from '~/entries/popup/components/HomeMenuRow/HomeMenuRow';
import {
  Navbar,
  NavbarBackButton,
} from '~/entries/popup/components/Navbar/Navbar';
import { useDominantColor } from '~/entries/popup/hooks/useDominantColor';
import { useEns } from '~/entries/popup/hooks/useEns';
import { useNftShortcuts } from '~/entries/popup/hooks/useNftShortcuts';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useTimeoutEffect } from '~/entries/popup/hooks/useTimeout';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { ROUTES } from '~/entries/popup/urls';
import chunkLinks from '~/entries/popup/utils/chunkLinks';

import { BirdIcon } from './BirdIcon';
import NFTContextMenu from './NFTContextMenu';
import NFTDropdownMenu from './NFTDropdownMenu';
import { getOpenseaUrl, getRaribleUrl } from './utils';

function NFTDetails({
  chainId,
  contractAddress,
  tokenId,
  initialData,
}: {
  chainId: ChainId;
  contractAddress: Address;
  tokenId: string;
  initialData: UniqueAsset;
}) {
  const { data: nft } = useNft(
    { contractAddress, chainId, tokenId },
    { initialData },
  );

  const isPOAP = nft?.familyName === 'POAP';
  const navigate = useRainbowNavigate();
  const { isWatchingWallet } = useWallets();
  const { setSelectedNft } = useSelectedNftStore();

  const {
    ensAddress,
    ensBio,
    ensCover,
    ensTwitter,
    ensWebsite,
    hasProperties,
  } = useEns({
    addressOrName: nft?.name || '',
    enableProfile: nft?.familyName === 'ENS',
  });
  const { data: ensRegistrationData } = useEnsRegistration(
    { name: nft?.name || '' },
    {
      enabled: !!(nft?.name && nft?.familyName === 'ENS'),
    },
  );
  const { data: dominantColor } = useDominantColor({
    imageUrl: nft?.image_url || undefined,
  });
  const { explainerSheetParams, showExplainerSheet, hideExplainerSheet } =
    useExplainerSheetParams();
  const handleSendNft = useCallback(() => {
    if (nft) {
      setSelectedNft(nft);
      navigate(ROUTES.SEND, { replace: true });
    }
  }, [navigate, nft, setSelectedNft]);
  const showFloorPriceExplainerSheet = useCallback(() => {
    showExplainerSheet({
      show: true,
      header: {
        emoji: '📈',
      },
      description: [i18n.t('nfts.details.explainer.floor_price_description')],
      title: i18n.t('nfts.details.explainer.floor_price_title'),
      actionButton: {
        label: i18n.t('nfts.details.explainer.floor_price_action_label'),
        action: hideExplainerSheet,
        labelColor: 'label',
      },
    });
  }, [showExplainerSheet, hideExplainerSheet]);

  useNftShortcuts(nft);

  useTimeoutEffect(
    ({ elapsedTime }) => {
      if (!nft) return;
      const isENS = nft.familyName === 'ENS';
      const { address, chain: chainId } = deriveAddressAndChainWithUniqueId(
        nft.uniqueId,
      );
      const isParty = !!nft.external_link?.includes('party.app');
      analytics.track(analytics.event.nftDetailsViewed, {
        eventSentAfterMs: elapsedTime,
        token: {
          isENS,
          isParty,
          isPoap: !!nft.isPoap,
          image_url: nft.image_url,
          name: nft.name,
          address,
          chainId,
        },
        available_data: {
          description: !!nft.description,
          floorPrice: !!nft.floorPriceEth,
          image_url: !!nft.image_url,
        },
      });
    },
    { timeout: 2 * 1000, enabled: !!nft },
  );

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
                background="fillQuaternary"
                borderRadius="16px"
                style={{ height: 320, width: 320 }}
              >
                <NFTContextMenu nft={nft} offset={0}>
                  <ExternalImage
                    src={nft ? getUniqueAssetImageThumbnailURL(nft) : ''}
                    placeholderSrc={
                      nft ? getUniqueAssetImagePreviewURL(nft) : ''
                    }
                    height={320}
                    width={320}
                    borderRadius="16px"
                  />
                </NFTContextMenu>
              </Box>
              <Box paddingTop="20px" paddingBottom="16px">
                <Columns>
                  <Column>
                    <NFTCollectionDropdownMenu nft={nft}>
                      <Box paddingBottom="12px">
                        <TextOverflow
                          color="label"
                          weight="bold"
                          size="20pt"
                          maxWidth={256}
                        >
                          {nft?.name}
                        </TextOverflow>
                      </Box>
                      <Lens borderRadius="6px" bubblesOnKeyDown padding="2px">
                        <Bleed vertical="2px" horizontal="2px">
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
                              maxWidth={236}
                              cursor="pointer"
                            >
                              {nft?.collection.name}
                            </TextOverflow>
                            <Symbol
                              color="labelTertiary"
                              cursor="pointer"
                              size={10}
                              symbol="chevron.right"
                              weight="bold"
                            />
                          </Inline>
                        </Bleed>
                      </Lens>
                    </NFTCollectionDropdownMenu>
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
                        <ButtonSymbol
                          symbol="ellipsis.circle"
                          color="accent"
                          height={'32px'}
                          variant="transparent"
                          tabIndex={0}
                        />
                      </NFTDropdownMenu>
                    </Box>
                  </Column>
                </Columns>
              </Box>
              <Box paddingVertical="16px">
                <Inline space="6px"></Inline>
                <Columns space="8px">
                  {!isPOAP && (
                    <Column>
                      <Button
                        width="full"
                        color="accent"
                        height="36px"
                        variant="flat"
                        borderRadius="round"
                        symbol="arrow.up.right.square.fill"
                        onClick={() =>
                          goToNewTab({ url: getOpenseaUrl({ nft }) })
                        }
                        tabIndex={0}
                      >
                        {'OpenSea'}
                      </Button>
                    </Column>
                  )}
                  {!isPOAP && isWatchingWallet && (
                    <Column>
                      <Button
                        width="full"
                        color="accent"
                        height="36px"
                        variant="flat"
                        borderRadius="round"
                        symbol="arrow.up.right.square.fill"
                        onClick={() =>
                          goToNewTab({ url: getRaribleUrl({ nft }) })
                        }
                        tabIndex={0}
                      >
                        {'Rarible'}
                      </Button>
                    </Column>
                  )}
                  {!isWatchingWallet && nft?.isSendable && (
                    <Column>
                      <Button
                        width="full"
                        color="accent"
                        height="36px"
                        variant="flat"
                        borderRadius="round"
                        symbol="paperplane.fill"
                        onClick={handleSendNft}
                        tabIndex={0}
                      >
                        {i18n.t('nfts.details.send')}
                      </Button>
                    </Column>
                  )}
                </Columns>
              </Box>
              {ensRegistrationData ? (
                <EnsRegistrationSection
                  registration={ensRegistrationData.registration}
                />
              ) : (
                <NFTPriceSection
                  nft={nft}
                  showFloorPriceExplainerSheet={showFloorPriceExplainerSheet}
                />
              )}
            </Box>
          </Box>
          <Box paddingHorizontal="20px" paddingTop="24px">
            <Accordion
              type="multiple"
              defaultValue={['profile', 'description', 'properties', 'about']}
              asChild
            >
              <Box display="flex" flexDirection="column" gap="24px">
                {hasProperties && (
                  <NFTAccordionSectionEnsProfile
                    cover={ensCover}
                    bio={ensBio}
                    address={ensAddress}
                    twitter={ensTwitter}
                    website={ensWebsite}
                  />
                )}
                {!hasProperties && nft?.description && (
                  <NFTAccordionDescriptionSection nft={nft} />
                )}
                {!hasProperties && nft?.traits && nft?.traits.length > 0 && (
                  <>
                    <NFTAccordionTraitsSection traits={nft.traits} />
                    <Separator color="separatorTertiary" />
                  </>
                )}
                <NFTAccordionAboutSection
                  nft={nft}
                  showFloorPriceExplainerSheet={showFloorPriceExplainerSheet}
                />
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
                  poapDropId={nft.poapDropId}
                  network={nft.network}
                />
              )}
            </Box>
          </Box>
        </Box>
        <ExplainerSheet
          show={explainerSheetParams.show}
          header={explainerSheetParams.header}
          title={explainerSheetParams.title}
          description={explainerSheetParams.description}
          actionButton={explainerSheetParams.actionButton}
        />
      </AccentColorProvider>
    </Box>
  );
}

const EnsRegistrationSection = ({
  registration,
}: {
  registration?: {
    expiryDate: string | undefined;
    registrationDate: string | undefined;
  };
}) => {
  const expiryDate = useMemo(() => {
    const dateStr = registration?.expiryDate;
    if (dateStr) {
      const date = new Date(parseInt(dateStr) * 1000);
      return formatDistanceStrict(new Date(), date);
    }
    return '';
  }, [registration]);
  const registrationDate = useMemo(() => {
    const dateStr = registration?.registrationDate;
    if (dateStr) {
      const date = new Date(parseInt(dateStr) * 1000);
      return format(date, 'MMM d, Y');
    }
    return '';
  }, [registration]);
  return (
    <Box paddingBottom="20px">
      <Columns>
        <Column>
          <Stack space="12px">
            <Text weight="semibold" size="14pt" color="labelTertiary">
              {i18n.t('nfts.details.registered_on')}
            </Text>
            <Text weight="bold" size="14pt" color="label">
              {registrationDate}
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
                {i18n.t('nfts.details.expires_in')}
              </Text>
            </Inline>
            <Text
              weight="bold"
              size="14pt"
              color="label"
              testId="ens-expiry-value"
            >
              {expiryDate}
            </Text>
          </Stack>
        </Column>
      </Columns>
    </Box>
  );
};

const NFTPriceSection = ({
  nft,
  showFloorPriceExplainerSheet,
}: {
  nft?: UniqueAsset | null;
  showFloorPriceExplainerSheet: () => void;
}) => {
  const lastSaleDisplay = useMemo(() => {
    if (nft?.last_sale?.unit_price && nft?.last_sale?.payment_token?.decimals) {
      return `${convertRawAmountToDecimalFormat(
        nft.last_sale.unit_price,
        nft.last_sale.payment_token.decimals,
      )} ${nft?.last_sale?.payment_token?.symbol || 'ETH'}`;
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
              <Box onClick={showFloorPriceExplainerSheet}>
                <Symbol
                  symbol="info.circle"
                  color="labelTertiary"
                  size={11}
                  weight="semibold"
                />
              </Box>
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

const NFTAccordionSectionEnsProfile = ({
  cover,
  bio,
  address,
  twitter,
  website,
}: {
  cover?: string;
  bio?: string;
  address?: string;
  twitter?: string;
  website?: string;
}) => {
  const visitTwitter = () => {
    goToNewTab({
      url: `https://www.twitter.com/${twitter}`,
    });
  };
  const visitWebsite = () => {
    const fragment = website
      ?.replace('https://', '')
      .replace('http://', '')
      .replace('www.', '');
    goToNewTab({
      url: `https://www.${fragment}`,
    });
  };
  return (
    <>
      <AccordionItem value="profile">
        <AccordionTrigger>
          {i18n.t('nfts.details.ens_profile_info')}
        </AccordionTrigger>
        <AccordionContent gap="24px">
          <div />
          {cover && <ENSProfileInfoCover src={cover} />}
          {bio && <ENSProfileInfoBio bio={bio} />}
          {address && (
            <NFTInfoRow
              symbol={'person.crop.rectangle.fill'}
              label={i18n.t('nfts.details.ens_address')}
              value={truncateAddress(address as AddressOrEth)}
              valueSymbol={'doc.on.doc'}
              onClick={() => copyAddress(address as Address)}
            />
          )}
          {twitter && (
            <NFTInfoRow
              symbol={'person.crop.rectangle.fill'}
              label={'Twitter'}
              value={twitter}
              valueSymbol={'arrow.up.right.circle'}
              symbolOverride={<BirdIcon />}
              onClick={visitTwitter}
            />
          )}
          {website && (
            <NFTInfoRow
              symbol={'safari'}
              label={i18n.t('nfts.details.ens_website')}
              value={website}
              valueSymbol={'arrow.up.right.circle'}
              onClick={visitWebsite}
            />
          )}
        </AccordionContent>
      </AccordionItem>
      <Separator color="separatorTertiary" />
    </>
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
        <AccordionTrigger>
          {i18n.t('nfts.details.description')}
        </AccordionTrigger>
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
                  <TextOverflow
                    color="labelSecondary"
                    size="11pt"
                    weight="semibold"
                    userSelect="all"
                    cursor="text"
                    maxWidth={300}
                  >
                    {String(trait.trait_type || '').toUpperCase()}
                  </TextOverflow>
                  <TextOverflow
                    color="label"
                    size="14pt"
                    weight="bold"
                    userSelect="all"
                    cursor="text"
                    maxWidth={300}
                  >
                    {String(trait.value || '').toUpperCase()}
                  </TextOverflow>
                </Stack>
              </Box>
            </Box>
          ))}
        </Box>
      </AccordionContent>
    </AccordionItem>
  );
};

const NFTAccordionAboutSection = ({
  nft,
  showFloorPriceExplainerSheet,
}: {
  nft?: UniqueAsset | null;
  showFloorPriceExplainerSheet: () => void;
}) => {
  const chainsLabel = networkStore((state) => state.getChainsLabel());
  const networkDisplay = nft?.network
    ? chainsLabel[chainNameToIdMapping[nft?.network]]
    : '';
  const deployedBy = nft?.asset_contract?.deployed_by;
  const { data: creatorEnsName } = useEnsName({
    address: (deployedBy as Address) || undefined,
    chainId: ChainId.mainnet,
  });
  const goToDeployerURL = useCallback(
    (deployedBy: string) =>
      goToNewTab({
        url: `https://etherscan.io/address/${deployedBy}`,
      }),
    [],
  );
  return (
    <AccordionItem value="about">
      <AccordionTrigger>{`${i18n.t('nfts.details.about')} ${nft?.collection
        .name}`}</AccordionTrigger>
      <AccordionContent gap="24px">
        <div />
        {nft?.floorPriceEth && (
          <NFTInfoRow
            symbol="dollarsign.square"
            label={i18n.t('nfts.details.floor_price')}
            labelSymbol="info.circle"
            value={`${nft?.floorPriceEth} ETH`}
            onClickLabel={showFloorPriceExplainerSheet}
          />
        )}
        {nft?.collection.total_quantity &&
          nft.collection.distinct_owner_count && (
            <>
              {nft?.floorPriceEth && <Separator color="separatorTertiary" />}
              <NFTInfoRow
                symbol="person"
                label={i18n.t('nfts.details.owners')}
                value={nft.collection.total_quantity}
              />
              <NFTInfoRow
                symbol="percent"
                label={i18n.t('nfts.details.unique_owners')}
                subValue={`(${Math.floor(
                  (nft.collection.distinct_owner_count /
                    nft.collection.total_quantity) *
                    100,
                )}%)`}
                value={nft.collection.distinct_owner_count}
              />
              <Separator color="separatorTertiary" />
            </>
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
            onClick={() => copyAddress(nft.asset_contract.address as Address)}
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
        {networkDisplay && (
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
                chainId={
                  chainNameToIdMapping[nft?.network || ChainName.mainnet]
                }
                size={12}
              />
              <TextOverflow
                color="labelSecondary"
                size="12pt"
                weight="semibold"
                cursor="text"
                userSelect="all"
              >
                {networkDisplay}
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
                tabIndex={0}
              />
            </NFTDropdownMenu>
          </Inline>
        </Box>
      }
    />
  );
};

const NFTCollectionDropdownMenu = ({
  children,
  nft,
}: {
  children: ReactNode;
  nft?: UniqueAsset | null;
}) => {
  const marketplaceUrl = nft?.marketplaceCollectionUrl;
  const marketplaceName = nft?.marketplaceName;
  const externalUrl = nft?.collection?.external_url;
  const twitterUrl = nft?.collection?.twitter_username;
  const discordUrl = nft?.collection.discord_url;

  const externalUrlDisplay = externalUrl
    ?.replace('https://', '')
    .replace('http://', '')
    .replace('www.', '');

  if (!marketplaceUrl && !externalUrl && !twitterUrl && !discordUrl) {
    return <Box>{children}</Box>;
  }

  const onValueChange = (
    value: 'marketplace' | 'external' | 'twitter' | 'discord',
  ) => {
    switch (value) {
      case 'marketplace':
        goToNewTab({ url: marketplaceUrl || '' });
        break;
      case 'external':
        goToNewTab({ url: externalUrl || '' });
        break;
      case 'twitter':
        goToNewTab({ url: `https://www.twitter.com/${twitterUrl}` || '' });
        break;
      case 'discord':
        goToNewTab({ url: discordUrl || '' });
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
            onValueChange(
              value as 'marketplace' | 'external' | 'twitter' | 'discord',
            )
          }
        >
          <Stack space="4px">
            <Stack>
              {marketplaceUrl && (
                <DropdownMenuRadioItem highlightAccentColor value="marketplace">
                  <HomeMenuRow
                    leftComponent={
                      <Symbol
                        size={18}
                        symbol="square.grid.2x2"
                        weight="semibold"
                      />
                    }
                    centerComponent={
                      <Stack space="6px">
                        <Text size="14pt" weight="semibold">
                          {i18n.t('nfts.details.view_collection')}
                        </Text>
                        <TextOverflow
                          size="11pt"
                          weight="semibold"
                          color="labelTertiary"
                        >
                          {marketplaceName}
                        </TextOverflow>
                      </Stack>
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
              {externalUrl && (
                <DropdownMenuRadioItem highlightAccentColor value="external">
                  <HomeMenuRow
                    leftComponent={
                      <Symbol size={18} symbol="safari" weight="semibold" />
                    }
                    centerComponent={
                      <Stack space="6px">
                        <Text size="14pt" weight="semibold">
                          {i18n.t('nfts.details.collection_website')}
                        </Text>
                        <TextOverflow
                          size="11pt"
                          weight="semibold"
                          color="labelTertiary"
                        >
                          {externalUrlDisplay}
                        </TextOverflow>
                      </Stack>
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
              {twitterUrl && (
                <DropdownMenuRadioItem highlightAccentColor value="twitter">
                  <HomeMenuRow
                    leftComponent={
                      <Symbol
                        size={18}
                        symbol="at.circle.fill"
                        weight="semibold"
                      />
                    }
                    centerComponent={
                      <Box paddingVertical="6px">
                        <Text size="14pt" weight="semibold">
                          {'Twitter'}
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
              {discordUrl && (
                <DropdownMenuRadioItem highlightAccentColor value="discord">
                  <HomeMenuRow
                    leftComponent={
                      <Symbol
                        size={18}
                        symbol="ellipsis.bubble.fill"
                        weight="semibold"
                      />
                    }
                    centerComponent={
                      <Box paddingVertical="6px">
                        <Text size="14pt" weight="semibold">
                          {'Discord'}
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
  poapDropId,
  network,
}: {
  contractAddress: string;
  poapDropId: string | null;
  network: string;
}) => {
  if (poapDropId) {
    return (
      <NFTLinkButton
        symbol="link"
        title={i18n.t('nfts.details.gallery')}
        url={`https://collectors.poap.xyz/drop/${poapDropId}`}
      />
    );
  }

  const blockExplorerUrl = `https://${getBlockExplorerHostForChain(
    chainNameToIdMapping[network as ChainName],
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
      tabIndex={0}
      testId={`nft-link-button-${title}`}
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

export const ENSProfileInfoCover = ({ src }: { src?: string }) => (
  <Box
    display="flex"
    alignItems="flex-start"
    justifyContent="space-between"
    gap="4px"
  >
    <Inline alignVertical="center" space="12px" wrap={false}>
      <Symbol
        size={14}
        symbol={'photo'}
        weight="medium"
        color="labelTertiary"
      />
      <Text color="labelTertiary" size="12pt" weight="semibold">
        {i18n.t('nfts.details.ens_cover')}
      </Text>
    </Inline>
    <Box borderRadius="12px">
      <ExternalImage src={src} height={64} width={241} borderRadius="12px" />
    </Box>
  </Box>
);

export const ENSProfileInfoBio = ({ bio }: { bio?: string }) => (
  <Box
    display="flex"
    alignItems="flex-start"
    justifyContent="space-between"
    gap="4px"
  >
    <Inline alignVertical="center" space="12px" wrap={false}>
      <Symbol
        size={14}
        symbol={'info.circle'}
        weight="medium"
        color="labelTertiary"
      />
      <Text color="labelTertiary" size="12pt" weight="semibold">
        {i18n.t('nfts.details.ens_bio')}
      </Text>
    </Inline>
    <Box
      style={{
        minHeight: 64,
        width: 236,
        borderRadius: 12,
      }}
      background={'fillTertiary'}
    >
      <Box paddingVertical="9px" paddingHorizontal="12px">
        <Text size="12pt" weight="bold" color="labelSecondary">
          {bio}
        </Text>
      </Box>
    </Box>
  </Box>
);

export const NFTInfoRow = ({
  symbol,
  label,
  onClick,
  onClickLabel,
  value,
  subValue,
  valueSymbol,
  symbolOverride,
  labelSymbol,
}: {
  symbol: SymbolName;
  label: ReactNode;
  onClick?: () => void;
  onClickLabel?: () => void;
  value: ReactNode;
  subValue?: string;
  valueSymbol?: SymbolName;
  symbolOverride?: ReactNode;
  labelSymbol?: SymbolName;
}) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    gap="4px"
  >
    <Box onClick={onClickLabel}>
      <Inline alignVertical="center" space="12px" wrap={false}>
        {!symbolOverride && (
          <Symbol
            size={14}
            symbol={symbol}
            weight="medium"
            color="labelTertiary"
          />
        )}
        {!!symbolOverride && symbolOverride}
        <Inline space="3px" alignVertical="center">
          <Text color="labelTertiary" size="12pt" weight="semibold">
            {label}
          </Text>
          {labelSymbol && (
            <Symbol
              size={10}
              symbol={labelSymbol}
              weight="medium"
              color="labelTertiary"
            />
          )}
        </Inline>
      </Inline>
    </Box>
    <Box onClick={onClick} cursor="pointer" padding="2px">
      <Inline alignVertical="center" space="6px">
        <Inline space="2px">
          <TextOverflow
            color="labelSecondary"
            size="12pt"
            weight="semibold"
            cursor={valueSymbol ? 'pointer' : 'text'}
            userSelect={valueSymbol ? 'none' : 'all'}
          >
            {value}
          </TextOverflow>
          <Text
            color="labelQuaternary"
            size="12pt"
            weight="semibold"
            cursor="text"
          >
            {subValue}
          </Text>
        </Inline>
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

const parseUniqueId = (uniqueId: string | undefined) =>
  (uniqueId?.split('_') || []) as [address?: Address, chainId?: ChainId];
export function NftDetailsRoute() {
  const { state } = useLocation();
  const { collectionUniqueId, tokenId } = useParams<{
    collectionUniqueId: UniqueId;
    tokenId: string;
  }>();
  const [contractAddress, chainId] = parseUniqueId(collectionUniqueId);

  if (!contractAddress || !chainId || !tokenId) {
    return <Navigate to={ROUTES.HOME} state={{ tab: 'nfts' }} replace />;
  }
  return (
    <NFTDetails
      chainId={+chainId}
      contractAddress={contractAddress}
      tokenId={tokenId}
      initialData={state.nft}
    />
  );
}
