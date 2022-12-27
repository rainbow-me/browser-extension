import React from 'react';

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

export const ReviewSheet = () => {
  return (
    <BottomSheet show={true}>
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
                          <Text size="12pt" weight="bold" color="labelTertiary">
                            $123334
                          </Text>
                        </Row>
                      </Rows>
                    </Box>
                  </Column>
                  <Column>
                    <Inline alignVertical="center" alignHorizontal="right">
                      <CoinIcon size={44} />
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
                            0xhab.eth
                          </Text>
                        </Row>
                        <Row>
                          <Text size="12pt" weight="bold" color="labelTertiary">
                            You own this wallet
                          </Text>
                        </Row>
                      </Rows>
                    </Box>
                  </Column>
                  <Column>
                    <Inline alignHorizontal="right">
                      <WalletAvatar
                        address={'0x5B570F0F8E2a29B7bCBbfC000f9C7b78D45b7C35'}
                        size={44}
                      />
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
            <Button color="accent" height="44px" variant="flat" width="full">
              Send to
            </Button>
          </Row>

          <Row>
            <Inline alignHorizontal="center">
              <Button color="transparent" height="44px" variant="flat">
                Cancel
              </Button>
            </Inline>
          </Row>
        </Rows>
      </Box>
    </BottomSheet>
  );
};
