import { motion } from 'framer-motion';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
import { nameChains } from '~/core/references/chains';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId, ChainName, chainNameToIdMapping } from '~/core/types/chains';
import { UniqueAsset } from '~/core/types/nfts';
import { truncateAddress } from '~/core/utils/address';
import {
  getBlockExplorerHostForChain,
  isCustomChain,
} from '~/core/utils/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { getExplorerUrl, goToNewTab } from '~/core/utils/tabs';
import { wagmiConfig } from '~/core/wagmi';
import {
  Bleed,
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { Lens } from '~/design-system/components/Lens/Lens';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { ChevronDown } from '../../components/ChevronDown/ChevronDown';
import { CoinIcon, NFTIcon } from '../../components/CoinIcon/CoinIcon';
import { parseNftName } from '../../components/CommandK/useSearchableNFTs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu';
import {
  ExplainerSheet,
  useExplainerSheetParams,
} from '../../components/ExplainerSheet/ExplainerSheet';
import {
  getSideChainExplainerParams,
  isSideChain,
} from '../../components/SideChainExplainer';
import { Spinner } from '../../components/Spinner/Spinner';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import usePrevious from '../../hooks/usePrevious';
import { useWalletInfo } from '../../hooks/useWalletInfo';
import { useWallets } from '../../hooks/useWallets';
import playSound from '../../utils/playSound';

import { ContactAction } from './ContactPrompt';

const EditContactDropdown = ({
  chainId,
  children,
  toAddress,
  closeReview,
  onEdit,
}: {
  chainId?: ChainId;
  children: React.ReactNode;
  toAddress?: Address;
  closeReview: () => void;
  onEdit: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      action: ContactAction;
    }>
  >;
}) => {
  const { isContact } = useWalletInfo({
    address: toAddress,
  });
  const explorer = getBlockExplorerHostForChain(chainId || ChainId.mainnet);

  const viewOnEtherscan = useCallback(() => {
    explorer &&
      goToNewTab({
        url: getExplorerUrl(explorer, toAddress),
        active: false,
      });
  }, [explorer, toAddress]);

  const onValueChange = useCallback(
    (value: string) => {
      switch (value) {
        case 'copy':
          navigator.clipboard.writeText(toAddress as string);
          break;
        case 'edit':
          closeReview();
          onEdit({ show: true, action: isContact ? 'edit' : 'save' });
          break;
        case 'view':
          viewOnEtherscan();
          break;
      }
    },
    [closeReview, isContact, onEdit, toAddress, viewOnEtherscan],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Box position="relative" testId="send-review-edit-contact-trigger">
          {children}
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent marginRight="12px">
        <DropdownMenuRadioGroup onValueChange={onValueChange}>
          <Stack space="4px">
            {explorer && (
              <DropdownMenuRadioItem value={'view'}>
                <Box
                  width="full"
                  paddingVertical="2px"
                  testId="send-review-edit-contact-view"
                >
                  <Inline alignVertical="center" alignHorizontal="justify">
                    <Inline alignVertical="center" space="8px">
                      <Inline alignVertical="center">
                        <Symbol
                          size={18}
                          symbol="binoculars.fill"
                          weight="semibold"
                        />
                      </Inline>
                      <Text size="14pt" weight="semibold">
                        {i18n.t(
                          `contacts.${
                            chainId && explorer !== 'etherscan'
                              ? 'view_on_explorer'
                              : 'view_on_etherscan'
                          }`,
                        )}
                      </Text>
                    </Inline>
                    <Bleed vertical="8px">
                      <Symbol
                        size={14}
                        symbol="arrow.up.forward.circle"
                        weight="semibold"
                        color="labelTertiary"
                      />
                    </Bleed>
                  </Inline>
                </Box>
              </DropdownMenuRadioItem>
            )}
            <DropdownMenuSeparator />
            <Box>
              <DropdownMenuRadioItem value={'edit'}>
                <Box
                  width="full"
                  paddingVertical="2px"
                  testId="send-review-edit-contact-edit"
                >
                  <Inline space="8px" alignVertical="center">
                    <Inline alignVertical="center">
                      <Symbol
                        symbol={
                          isContact
                            ? 'person.crop.circle.fill'
                            : 'person.crop.circle.fill.badge.plus'
                        }
                        weight="semibold"
                        size={18}
                      />
                    </Inline>
                    <Text weight="semibold" size="14pt" color="label">
                      {i18n.t(
                        `contacts.${
                          isContact ? 'edit_contact' : 'add_to_contacts'
                        }`,
                      )}
                    </Text>
                  </Inline>
                </Box>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={'copy'}>
                <Box
                  width="full"
                  marginVertical="-1px"
                  testId="send-review-edit-contact-copy"
                >
                  <Inline space="8px" alignVertical="center">
                    <Box>
                      <Inline alignVertical="center">
                        <Symbol
                          symbol="doc.on.doc.fill"
                          weight="semibold"
                          size={18}
                        />
                      </Inline>
                    </Box>

                    <Box>
                      <Stack space="6px">
                        <Text weight="semibold" size="14pt" color="label">
                          {i18n.t('contacts.copy_address')}
                        </Text>
                        <Text
                          weight="regular"
                          size="11pt"
                          color="labelTertiary"
                        >
                          {truncateAddress(toAddress)}
                        </Text>
                      </Stack>
                    </Box>
                  </Inline>
                </Box>
              </DropdownMenuRadioItem>
            </Box>
          </Stack>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ReviewSheet = ({
  show,
  toAddress,
  asset,
  nft,
  primaryAmountDisplay,
  secondaryAmountDisplay,
  waitingForDevice,
  onCancel,
  onSend,
  onSaveContactAction,
}: {
  show: boolean;
  toAddress: Address;
  asset?: ParsedUserAsset | null;
  nft?: UniqueAsset;
  primaryAmountDisplay: string;
  secondaryAmountDisplay: string;
  waitingForDevice: boolean;
  onCancel: () => void;
  onSend: (callback?: () => void) => Promise<void>;
  onSaveContactAction: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      action: ContactAction;
    }>
  >;
}) => {
  const { visibleOwnedWallets } = useWallets();
  const [notSendingOnEthereumChecks, setNotSendingOnEthereumChecks] =
    useState(false);
  const prevShow = usePrevious(show);
  const [sending, setSending] = useState(false);
  const confirmSendButtonRef = useRef<HTMLButtonElement>(null);
  const { chains } = wagmiConfig;
  const assetChainId =
    asset?.chainId || chainNameToIdMapping[nft?.network || ChainName.mainnet];
  const chain = useMemo(
    () => chains.find((c) => c.id === assetChainId),
    [assetChainId, chains],
  );

  const { displayName: walletDisplayName } = useWalletInfo({
    address: toAddress,
  });

  const shouldHideAmount =
    isCustomChain(chain?.id as ChainId) &&
    asset?.native?.balance?.amount === '0';

  const notSendingOnEthereum = useMemo(
    () => chain?.id !== ChainId.mainnet,
    [chain?.id],
  );

  const chainName =
    nameChains[asset?.chainId || ChainId.mainnet] || chain?.name;

  const isToWalletOwner = useMemo(
    () =>
      !!visibleOwnedWallets
        .map((wallet) => wallet.address)
        .find((account) => isLowerCaseMatch(account, toAddress)),
    [toAddress, visibleOwnedWallets],
  );

  const sendEnabled = useMemo(
    () =>
      !notSendingOnEthereum || notSendingOnEthereumChecks || isToWalletOwner,
    [isToWalletOwner, notSendingOnEthereum, notSendingOnEthereumChecks],
  );

  const handleSend = useCallback(async () => {
    if (sendEnabled && !sending) {
      setSending(true);
      try {
        await onSend();
        playSound('SendSound');
      } catch (e) {
        //
      } finally {
        setSending(false);
      }
    }
  }, [onSend, sendEnabled, sending]);

  const { explainerSheetParams, showExplainerSheet, hideExplainerSheet } =
    useExplainerSheetParams();

  const showL2Explainer = useCallback(() => {
    if (!asset?.chainId || !isSideChain(asset.chainId)) return;
    showExplainerSheet({
      ...getSideChainExplainerParams(asset.chainId, hideExplainerSheet),
      show: true,
    });
  }, [asset?.chainId, hideExplainerSheet, showExplainerSheet]);

  useEffect(() => {
    if (prevShow && !show) {
      setNotSendingOnEthereumChecks(false);
    }
  }, [prevShow, show]);

  useEffect(() => {
    if (show) {
      // using autoFocus breaks the sheet's animation, so we wait for it to finish then focus
      setTimeout(() => {
        confirmSendButtonRef.current?.focus();
      }, 500);
    }
  }, [show]);

  return (
    <>
      <BottomSheet show={show}>
        <ExplainerSheet
          show={explainerSheetParams.show}
          header={explainerSheetParams.header}
          title={explainerSheetParams.title}
          description={explainerSheetParams.description}
          actionButton={explainerSheetParams.actionButton}
          linkButton={explainerSheetParams.linkButton}
        />
        <Box
          style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          background="surfacePrimaryElevatedSecondary"
        >
          <Stack space="20px">
            <Box paddingVertical="26px">
              <Inline alignHorizontal="center" alignVertical="center">
                <Text size="14pt" weight="heavy" color="label">
                  {i18n.t('send.review.title')}
                </Text>
              </Inline>
            </Box>
            <Box paddingHorizontal="24px" paddingVertical="20px">
              <Stack space="20px">
                <Rows space="10px">
                  <Row>
                    <Columns alignHorizontal="justify">
                      <Column>
                        <Box paddingVertical="6px" height="full">
                          <Rows space="10px" alignVertical="center">
                            <Row>
                              {nft ? (
                                <TextOverflow
                                  size="20pt"
                                  weight="bold"
                                  color="label"
                                >
                                  {parseNftName(nft.name, nft.id)}
                                </TextOverflow>
                              ) : (
                                <TextOverflow
                                  size="20pt"
                                  weight="bold"
                                  color="label"
                                >
                                  {primaryAmountDisplay}
                                </TextOverflow>
                              )}
                            </Row>
                            <Row>
                              {nft ? (
                                <TextOverflow
                                  size="12pt"
                                  weight="bold"
                                  color="labelTertiary"
                                >
                                  {`${nft?.collection.name} #${nft.id}`}
                                </TextOverflow>
                              ) : (
                                <TextOverflow
                                  size="12pt"
                                  weight="bold"
                                  color="labelTertiary"
                                >
                                  {shouldHideAmount
                                    ? i18n.t('token_details.not_available')
                                    : secondaryAmountDisplay}
                                </TextOverflow>
                              )}
                            </Row>
                          </Rows>
                        </Box>
                      </Column>
                      <Column>
                        <Inline alignVertical="center" alignHorizontal="right">
                          <Box>
                            {nft ? (
                              <Box>
                                <NFTIcon asset={nft} size={44} badge={true} />
                              </Box>
                            ) : (
                              <CoinIcon asset={asset} size={44} />
                            )}
                          </Box>
                        </Inline>
                      </Column>
                    </Columns>
                  </Row>
                  <Row>
                    <Box>
                      <Inline alignHorizontal="justify">
                        <Box
                          background="surfaceSecondaryElevated"
                          borderRadius="40px"
                          paddingHorizontal="8px"
                          paddingVertical="6px"
                          width="fit"
                        >
                          <Inline
                            alignHorizontal="center"
                            alignVertical="center"
                          >
                            <Text
                              size="12pt"
                              weight="heavy"
                              color="labelTertiary"
                            >
                              {i18n.t('send.review.to')}
                            </Text>
                          </Inline>
                        </Box>
                        <Box style={{ width: 44 }}>
                          <Stack alignHorizontal="center">
                            <Box style={{ height: 10 }}>
                              <ChevronDown color="separatorSecondary" />
                            </Box>
                            <Box style={{ height: 10 }} marginTop="-2px">
                              <ChevronDown color="separator" />
                            </Box>
                          </Stack>
                        </Box>
                      </Inline>
                    </Box>
                  </Row>
                  <Row>
                    <Columns alignHorizontal="justify">
                      <Column width="4/5">
                        <Box paddingVertical="6px" height="full">
                          <Rows space="10px" alignVertical="center">
                            <Row height="content">
                              <Inline space="7px" alignVertical="center">
                                <TextOverflow
                                  size="20pt"
                                  weight="bold"
                                  color="label"
                                >
                                  {walletDisplayName}
                                </TextOverflow>

                                <Box>
                                  <EditContactDropdown
                                    chainId={asset?.chainId}
                                    toAddress={toAddress}
                                    closeReview={onCancel}
                                    onEdit={onSaveContactAction}
                                  >
                                    <Inline alignVertical="center">
                                      <Symbol
                                        symbol="ellipsis.circle"
                                        weight="bold"
                                        size={16}
                                        color="labelTertiary"
                                      />
                                    </Inline>
                                  </EditContactDropdown>
                                </Box>
                              </Inline>
                            </Row>
                            {isToWalletOwner ? (
                              <Row>
                                <Text
                                  size="12pt"
                                  weight="bold"
                                  color="labelTertiary"
                                >
                                  {i18n.t('send.review.you_own_wallet')}
                                </Text>
                              </Row>
                            ) : null}
                          </Rows>
                        </Box>
                      </Column>
                      <Column>
                        <Inline alignHorizontal="right">
                          <WalletAvatar addressOrName={toAddress} size={44} />
                        </Inline>
                      </Column>
                    </Columns>
                  </Row>
                </Rows>
                {notSendingOnEthereum && !isToWalletOwner && (
                  <Separator color="separatorTertiary" />
                )}
              </Stack>
            </Box>
          </Stack>

          {notSendingOnEthereum && !isToWalletOwner && (
            <Box paddingHorizontal="16px" paddingBottom="20px">
              <Stack space="20px">
                <Box
                  as={motion.div}
                  background="fillSecondary"
                  padding="8px"
                  width="full"
                  borderRadius="12px"
                  onClick={() =>
                    isSideChain(chain?.id || ChainId.mainnet)
                      ? showL2Explainer()
                      : null
                  }
                  initial={{ zIndex: 0 }}
                  whileHover={{ scale: transformScales['1.04'] }}
                  whileTap={{ scale: transformScales['0.96'] }}
                  transition={transitions.bounce}
                >
                  <Inline alignVertical="center" alignHorizontal="justify">
                    <Inline alignVertical="center" space="8px" wrap={false}>
                      <ChainBadge
                        chainId={asset?.chainId || ChainId.mainnet}
                        size="16"
                      />
                      <Text size="12pt" weight="bold" color="labelSecondary">
                        {i18n.t('send.review.sending_on_network', {
                          chainName,
                        })}
                      </Text>
                    </Inline>
                    {isSideChain(chain?.id || ChainId.mainnet) ? (
                      <Symbol
                        weight="bold"
                        symbol="info.circle.fill"
                        size={12}
                        color="labelTertiary"
                      />
                    ) : null}
                  </Inline>
                </Box>

                <Box paddingHorizontal="7px">
                  <Stack space="12px">
                    <Columns alignVertical="center" space="7px">
                      <Column width="content">
                        <Checkbox
                          width="16px"
                          height="16px"
                          borderRadius="6px"
                          selected={notSendingOnEthereumChecks}
                          backgroundSelected="blue"
                          borderColorSelected="blue"
                          borderColor="labelTertiary"
                          onClick={() =>
                            setNotSendingOnEthereumChecks(
                              !notSendingOnEthereumChecks,
                            )
                          }
                        />
                      </Column>
                      <Column>
                        <Lens
                          testId="L2-check-1"
                          onClick={() =>
                            setNotSendingOnEthereumChecks(
                              !notSendingOnEthereumChecks,
                            )
                          }
                        >
                          <Text
                            align="left"
                            size="12pt"
                            weight="bold"
                            color="labelSecondary"
                          >
                            {i18n.t('send.review.sending_on_l2_check_1', {
                              chainName,
                            })}
                          </Text>
                        </Lens>
                      </Column>
                    </Columns>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}
        </Box>

        <Separator color="separatorSecondary" />
        <Box width="full" padding="20px">
          <Rows space="8px" alignVertical="center">
            <Row>
              <Button
                color={
                  // eslint-disable-next-line no-nested-ternary
                  waitingForDevice ? 'label' : sendEnabled ? 'accent' : 'fill'
                }
                height="44px"
                variant={waitingForDevice ? 'disabled' : 'flat'}
                width="full"
                onClick={(!waitingForDevice && handleSend) || undefined}
                testId="review-confirm-button"
                tabIndex={0}
                ref={confirmSendButtonRef}
                disabled={sending}
              >
                {sendEnabled ? (
                  <Box>
                    {sending ? (
                      <Box
                        width="fit"
                        alignItems="center"
                        justifyContent="center"
                        style={{ margin: 'auto' }}
                      >
                        <Spinner size={16} color="label" />
                      </Box>
                    ) : (
                      <TextOverflow weight="bold" size="16pt" color="label">
                        {waitingForDevice
                          ? `👀 ${i18n.t('send.review.confirm_hw')}`
                          : i18n.t('send.review.send_to', {
                              toName: walletDisplayName,
                            })}
                      </TextOverflow>
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Inline
                      alignHorizontal="center"
                      alignVertical="center"
                      space="8px"
                    >
                      <Symbol
                        symbol="arrow.up"
                        color="label"
                        weight="bold"
                        size={16}
                      />
                      <TextOverflow weight="bold" size="16pt" color="label">
                        {i18n.t('send.review.complete_checks')}
                      </TextOverflow>
                    </Inline>
                  </Box>
                )}
              </Button>
            </Row>
            <Row>
              <Inline alignHorizontal="center">
                <Button
                  color="transparent"
                  height="44px"
                  variant="tinted"
                  onClick={onCancel}
                  tabIndex={0}
                  width="full"
                >
                  <Text weight="bold" size="16pt" color="labelSecondary">
                    {i18n.t('send.review.cancel')}
                  </Text>
                </Button>
              </Inline>
            </Row>
          </Rows>
        </Box>
      </BottomSheet>
    </>
  );
};
