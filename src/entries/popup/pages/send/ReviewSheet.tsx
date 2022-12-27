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
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';

import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';

// type ReviewSheetProps = {};

export const ReviewSheet = () => {
  return (
    <BottomSheet show={true}>
      <Stack space="20px">
        <Box paddingTop="14px" paddingBottom="26px">
          <Inline alignHorizontal="center" alignVertical="center">
            <Text size="14pt" weight="bold" color="label">
              Review & Send
            </Text>
          </Inline>
        </Box>
        <Box padding="8px">
          <Rows space="10px">
            <Row>
              <Columns alignHorizontal="justify">
                <Column>
                  <Rows space="8px">
                    <Row>
                      <Text size="20pt" weight="bold" color="label">
                        1.098 ETH
                      </Text>
                    </Row>
                    <Row>
                      <Text size="12pt" weight="bold" color="label">
                        $123334
                      </Text>
                    </Row>
                  </Rows>
                </Column>
                <Column>
                  <Inline alignHorizontal="right">
                    <CoinIcon />
                  </Inline>
                </Column>
              </Columns>
            </Row>
            <Row>
              <Text size="14pt" weight="bold" color="label">
                to
              </Text>
            </Row>
            <Row>
              <Columns alignHorizontal="justify">
                <Column>
                  <Rows space="8px">
                    <Row>
                      <Text size="20pt" weight="bold" color="label">
                        0xhab.eth
                      </Text>
                    </Row>
                    <Row>
                      <Text size="12pt" weight="bold" color="label">
                        You own this wallet
                      </Text>
                    </Row>
                  </Rows>
                </Column>
                <Column>
                  <Inline alignHorizontal="right">
                    <WalletAvatar
                      address={'0x5B570F0F8E2a29B7bCBbfC000f9C7b78D45b7C35'}
                      size={30}
                    />
                  </Inline>
                </Column>
              </Columns>
            </Row>
          </Rows>
        </Box>
      </Stack>
      <Separator />

      <Box padding="20px" width="full">
        <Rows space="8px">
          <Row>
            <Button color="accent" height="36px" variant="flat" width="full">
              Send to
            </Button>
          </Row>

          <Row>
            <Inline alignHorizontal="center">
              <Button color="transparent" height="36px" variant="flat">
                Cancel
              </Button>
            </Inline>
          </Row>
        </Rows>
      </Box>
    </BottomSheet>
  );
};
