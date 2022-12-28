import React, { useCallback, useMemo } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { ParsedAddressAsset } from '~/core/types/assets';
import { truncateAddress } from '~/core/utils/address';
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
  children,
  toAddress,
  closeReview,
  onEdit,
}: {
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
    chrome.tabs.create({
      url: `https://etherscan.io/address/${toAddress}`,
    });
  }, [toAddress]);

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
        <Box position="relative" id="home-page-header-right">
          {children}
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent marginRight="12px">
        <DropdownMenuRadioGroup onValueChange={onValueChange}>
          <Stack space="4px">
            <DropdownMenuRadioItem value={'view'}>
              <Box width="full" paddingVertical="2px">
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
                      {i18n.t('contacts.view_on_etherscan')}
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
            <Box>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value={'edit'}>
                <Box width="full" paddingVertical="2px">
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
                <Box width="full" marginVertical="-1px">
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

  const isToWalletOwner = useMemo(
    () => !!accounts.find((account) => isLowerCaseMatch(account, toAddress)),
    [accounts, toAddress],
  );
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
                      padding="6px"
                      width="fit"
                    >
                      <Inline alignHorizontal="center" alignVertical="center">
                        <Text size="12pt" weight="heavy" color="labelTertiary">
                          {i18n.t('send.review.to')}
                        </Text>
                      </Inline>
                    </Box>
                    <Box
                      style={{
                        width: 44,
                        height: 20,
                      }}
                    >
                      <Inline alignHorizontal="center">
                        <Box paddingVertical="2px">
                          <Box marginTop="-2px">
                            <Symbol
                              weight="bold"
                              symbol="chevron.down"
                              size={13}
                              color="labelQuaternary"
                            />
                          </Box>
                          <Box marginTop="-7px">
                            <Symbol
                              weight="bold"
                              symbol="chevron.down"
                              size={13}
                              color="labelTertiary"
                            />
                          </Box>
                        </Box>
                      </Inline>
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
          </Box>
        </Stack>
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
              onClick={onSend}
            >
              <TextOverflow
                maxWidth={TEXT_OVERFLOW_WIDTH + 20}
                weight="bold"
                size="16pt"
                color="label"
              >
                {i18n.t('send.review.send_to', {
                  toName,
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
