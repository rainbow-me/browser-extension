import React from 'react';
import { Address } from 'wagmi';

import { ParsedAddressAsset } from '~/core/types/assets';
import { truncateAddress } from '~/core/utils/address';
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
import { useContact } from '../../hooks/useContacts';

import { AccentColorProviderWrapper } from '.';

export const ReviewSheet = ({
  show,
  onCancel,
  onSend,
  accentColor,
  toAddress,
  asset,
}: {
  show: boolean;
  onCancel: () => void;
  onSend: () => void;
  accentColor?: string;
  toAddress: Address;
  fromAddress?: Address;
  asset?: ParsedAddressAsset | null;
}) => {
  const { name } = useContact({ address: toAddress });

  return (
    <BottomSheet show={show}>
      <AccentColorProviderWrapper color={accentColor}>
        <Box background="surfacePrimaryElevatedSecondary">
          <Stack space="20px">
            <Box paddingVertical="26px">
              <Inline alignHorizontal="center" alignVertical="center">
                <Text size="14pt" weight="heavy" color="label">
                  Review & Send
                </Text>
              </Inline>
            </Box>
            <Box paddingHorizontal="24px" paddingVertical="20px">
              <Rows space="10px">
                <Row>
                  <Columns alignHorizontal="justify">
                    <Column>
                      <Box paddingVertical="6px">
                        <Rows space="10px">
                          <Row>
                            <Text size="20pt" weight="bold" color="label">
                              1.098 ETH
                            </Text>
                          </Row>
                          <Row>
                            <Text
                              size="12pt"
                              weight="bold"
                              color="labelTertiary"
                            >
                              $123334
                            </Text>
                          </Row>
                        </Rows>
                      </Box>
                    </Column>
                    <Column>
                      <Inline alignVertical="center" alignHorizontal="right">
                        <CoinIcon asset={asset} size={44} />
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
                          <Text
                            size="12pt"
                            weight="heavy"
                            color="labelTertiary"
                          >
                            to
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
                      <Box paddingVertical="6px">
                        <Rows space="10px">
                          <Row>
                            <Text size="20pt" weight="bold" color="label">
                              {name || truncateAddress(toAddress)}
                            </Text>
                          </Row>
                          <Row>
                            <Text
                              size="12pt"
                              weight="bold"
                              color="labelTertiary"
                            >
                              You own this wallet
                            </Text>
                          </Row>
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
        <Separator />

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
                Send to
              </Button>
            </Row>

            <Row>
              <Inline alignHorizontal="center">
                <Button
                  color="transparent"
                  height="44px"
                  variant="flat"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </Inline>
            </Row>
          </Rows>
        </Box>
      </AccentColorProviderWrapper>
    </BottomSheet>
  );
};
