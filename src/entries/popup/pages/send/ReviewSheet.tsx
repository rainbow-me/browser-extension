import React, { useCallback, useMemo } from 'react';
import { Address } from 'wagmi';

import SendSound from 'static/assets/audio/woosh.wav';
import { i18n } from '~/core/languages';
import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { getBlockExplorerHostForChain, isL2Chain } from '~/core/utils/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';
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
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { ChevronDown } from '../../components/ChevronDown/ChevronDown';
import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { useBackgroundAccounts } from '../../hooks/useBackgroundAccounts';
import { useContact } from '../../hooks/useContacts';

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
  const contact = useContact({ address: toAddress });

  const viewOnEtherscan = useCallback(() => {
    const explorer = getBlockExplorerHostForChain(chainId || ChainId.mainnet);
    chrome.tabs.create({
      url: `https://${explorer}/address/${toAddress}`,
    });
  }, [chainId, toAddress]);

  const onValueChange = useCallback(
    (value: string) => {
      switch (value) {
        case 'copy':
          navigator.clipboard.writeText(toAddress as string);
          break;
        case 'edit':
          closeReview();
          onEdit({ show: true, action: contact.isContact ? 'edit' : 'save' });
          break;
        case 'view':
          viewOnEtherscan();
          break;
      }
    },
    [closeReview, contact.isContact, onEdit, toAddress, viewOnEtherscan],
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
                          chainId && isL2Chain(chainId)
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
                          contact.isContact
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
                          contact.isContact ? 'edit_contact' : 'add_to_contacts'
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

const { innerWidth: windowWidth } = window;

const TEXT_OVERFLOW_WIDTH = windowWidth - 160;

export const ReviewSheet = ({
  show,
  toAddress,
  asset,
  primaryAmountDisplay,
  secondaryAmountDisplay,
  onCancel,
  onSend,
  onSaveContactAction,
}: {
  show: boolean;
  toAddress: Address;
  asset?: ParsedAddressAsset | null;
  primaryAmountDisplay: string;
  secondaryAmountDisplay: string;
  onCancel: () => void;
  onSend: () => void;
  onSaveContactAction: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      action: ContactAction;
    }>
  >;
}) => {
  const { accounts } = useBackgroundAccounts();

  const { display: toName } = useContact({ address: toAddress });

  // const sendingOnL2 = useMemo(
  //   () => isL2Chain(asset?.chainId || ChainId.mainnet),
  //   [asset?.chainId],
  // );

  const isToWalletOwner = useMemo(
    () => !!accounts.find((account) => isLowerCaseMatch(account, toAddress)),
    [accounts, toAddress],
  );

  const playSound = useCallback(() => {
    const sound = new Audio(SendSound);
    sound.play();
  }, []);

  const handleSend = useCallback(() => {
    playSound();
    onSend();
  }, [onSend, playSound]);

  return (
    <BottomSheet show={show}>
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
                            <TextOverflow
                              maxWidth={TEXT_OVERFLOW_WIDTH}
                              size="20pt"
                              weight="bold"
                              color="label"
                            >
                              <Box paddingVertical="2px">
                                {primaryAmountDisplay}
                              </Box>
                            </TextOverflow>
                          </Row>
                          <Row>
                            <TextOverflow
                              maxWidth={TEXT_OVERFLOW_WIDTH}
                              size="12pt"
                              weight="bold"
                              color="labelTertiary"
                            >
                              {secondaryAmountDisplay}
                            </TextOverflow>
                          </Row>
                        </Rows>
                      </Box>
                    </Column>
                    <Column>
                      <Inline alignVertical="center" alignHorizontal="right">
                        <Box>
                          <CoinIcon asset={asset} size={44} />
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
                        <Inline alignHorizontal="center" alignVertical="center">
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
                                maxWidth={TEXT_OVERFLOW_WIDTH}
                                size="20pt"
                                weight="bold"
                                color="label"
                              >
                                {toName || truncateAddress(toAddress)}
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
                        <WalletAvatar address={toAddress} size={44} />
                      </Inline>
                    </Column>
                  </Columns>
                </Row>
              </Rows>
              <Separator color="separatorTertiary" />
            </Stack>
          </Box>
        </Stack>

        <Box paddingHorizontal="16px" paddingBottom="20px">
          <Stack space="20px">
            <Box
              background="fillSecondary"
              padding="8px"
              width="full"
              borderRadius="12px"
            >
              <Inline alignVertical="center" alignHorizontal="justify">
                <Inline alignVertical="center" space="8px">
                  <ChainBadge chainId={ChainId.optimism} size="extraSmall" />
                  <Text size="12pt" weight="bold" color="labelSecondary">
                    Sending on the Optimism network
                  </Text>
                </Inline>
                <Symbol
                  weight="bold"
                  symbol="info.circle.fill"
                  size={12}
                  color="labelTertiary"
                />
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
                      selected={true}
                      backgroundSelected="blue"
                      borderColorSelected="blue"
                      borderColor="separator"
                    />
                  </Column>
                  <Column>
                    <Text
                      align="left"
                      size="12pt"
                      weight="bold"
                      color="labelSecondary"
                    >
                      I’m not sending to an exchange
                    </Text>
                  </Column>
                </Columns>
                <Columns space="7px">
                  <Column width="content">
                    <Checkbox
                      width="16px"
                      height="16px"
                      borderRadius="6px"
                      selected={false}
                    />
                  </Column>
                  <Column>
                    <Text size="12pt" weight="bold" color="labelSecondary">
                      The person I’m sending to has a wallet that support
                      Polygon
                    </Text>
                  </Column>
                </Columns>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Separator color="separatorSecondary" />
      <Box width="full" padding="20px">
        <Rows space="8px" alignVertical="center">
          <Row>
            <Button
              color="accent"
              height="44px"
              variant="flat"
              width="full"
              onClick={handleSend}
              testId="review-confirm-button"
            >
              <TextOverflow
                maxWidth={TEXT_OVERFLOW_WIDTH + 20}
                weight="bold"
                size="16pt"
                color="label"
              >
                {i18n.t('send.review.send_to', {
                  toName: toName || truncateAddress(toAddress),
                })}
              </TextOverflow>
            </Button>
          </Row>

          <Row>
            <Inline alignHorizontal="center">
              <Button
                color="transparent"
                height="44px"
                variant="tinted"
                onClick={onCancel}
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
  );
};
