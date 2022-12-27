import React, { useMemo } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { ParsedAddressAsset } from '~/core/types/assets';
import { truncateAddress } from '~/core/utils/address';
import { isLowerCaseMatch } from '~/core/utils/strings';
import {
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

import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { useBackgroundAccounts } from '../../hooks/useBackgroundAccounts';
import { useContact } from '../../hooks/useContacts';

export const ReviewSheet = ({
  show,
  toAddress,
  asset,
  primaryAmountDisplay,
  secondaryAmountDisplay,
  onCancel,
  onSend,
}: {
  show: boolean;
  toAddress: Address;
  asset?: ParsedAddressAsset | null;
  primaryAmountDisplay: string;
  secondaryAmountDisplay: string;
  onCancel: () => void;
  onSend: () => void;
}) => {
  const { accounts } = useBackgroundAccounts();

  const { name: toName } = useContact({ address: toAddress });

  const isToWalletOwner = useMemo(
    () => !!accounts.find((account) => isLowerCaseMatch(account, toAddress)),
    [accounts, toAddress],
  );
  return (
    <BottomSheet show={show}>
      <Box background="surfacePrimaryElevatedSecondary">
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
                          <Text size="20pt" weight="bold" color="label">
                            {primaryAmountDisplay}
                          </Text>
                        </Row>
                        <Row>
                          <Text size="12pt" weight="bold" color="labelTertiary">
                            {secondaryAmountDisplay}
                          </Text>
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
                  <Column>
                    <Box paddingVertical="6px" height="full">
                      <Rows space="10px" alignVertical="center">
                        <Row height="content">
                          <Text size="20pt" weight="bold" color="label">
                            {toName || truncateAddress(toAddress)}
                          </Text>
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
        <Rows space="8px">
          <Row>
            <Button
              color="accent"
              height="44px"
              variant="flat"
              width="full"
              onClick={onSend}
            >
              <Text weight="bold" size="16pt" color="label">
                {i18n.t('send.review.send_to', { toName })}
              </Text>
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
