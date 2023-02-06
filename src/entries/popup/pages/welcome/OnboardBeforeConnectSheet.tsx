import React from 'react';

import WalletIcon from 'static/assets/wallet.png';
import {
  Box,
  Button,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';

export const OnboardBeforeConnectSheet = ({
  show,
  onClick,
}: {
  show: boolean;
  onClick: () => void;
}) => {
  return (
    <BottomSheet show={show}>
      <Box paddingHorizontal="32px" paddingVertical="44px">
        <Stack space="20px" alignHorizontal="center">
          <Box style={{ width: '84px', height: '84px' }}>
            <img src={WalletIcon} width="100%" height="100%" />
          </Box>
          <Box>
            <Text color="label" size="20pt" weight="heavy">
              Before you can connect
            </Text>
          </Box>
          <Box style={{ width: '102px' }}>
            <Separator color="separatorTertiary" />
          </Box>
          <Box>
            <Text
              align="center"
              color="labelTertiary"
              size="14pt"
              weight="regular"
            >
              You’re almost done. Quickly finish setting up your wallet with
              Rainbow.
            </Text>
          </Box>
        </Stack>
      </Box>
      <Box padding="20px">
        <Button
          onClick={onClick}
          width="full"
          color="blue"
          height="44px"
          variant="flat"
        >
          <Inline space="4px" alignVertical="center">
            <Text color="label" size="16pt" weight="bold">
              Set up your wallet
            </Text>
            <Symbol symbol="arrow.right" weight="bold" size={14} />
          </Inline>
        </Button>
      </Box>
    </BottomSheet>
  );
};
