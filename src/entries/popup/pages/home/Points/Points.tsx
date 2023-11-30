import { PropsWithChildren } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { TESTNET_MODE_BAR_HEIGHT } from '~/core/utils/dimensions';
import { Box, Inline, Separator, Stack, Symbol, Text } from '~/design-system';
import { StackProps } from '~/design-system/components/Stack/Stack';
import { AddressOrEns } from '~/entries/popup/components/AddressOrEns/AddressorEns';
import { WalletAvatar } from '~/entries/popup/components/WalletAvatar/WalletAvatar';

function Card({ children, ...props }: PropsWithChildren<StackProps>) {
  return (
    <Stack
      paddingVertical="16px"
      paddingHorizontal="18px"
      borderRadius="16px"
      background="surfaceSecondaryElevated"
      gap="12px"
      width="full"
      boxShadow="12px surfaceSecondaryElevated"
      {...props}
    >
      {children}
    </Stack>
  );
}

function Leaderboard() {
  const { currentAddress } = useCurrentAddressStore();

  return (
    <Card
      paddingVertical="10px"
      paddingHorizontal="16px"
      separator={<Separator color="separatorTertiary" />}
    >
      {Array.from({ length: 10 }).map(() => (
        <Inline wrap={false} space="12px" alignVertical="center">
          <WalletAvatar
            size={32}
            addressOrName={currentAddress}
            emojiSize="16pt"
          />
          <AddressOrEns address={currentAddress} size="14pt" weight="bold" />
        </Inline>
      ))}
    </Card>
  );
}

export function Points() {
  const { testnetMode } = useTestnetModeStore();

  const { currentAddress } = useCurrentAddressStore();

  return (
    <Box
      display="flex"
      flexDirection="column"
      padding="20px"
      style={{ height: 336 - (testnetMode ? TESTNET_MODE_BAR_HEIGHT : 0) }}
      width="full"
    >
      <Stack paddingBottom="24px">
        <Text size="26pt" weight="heavy">
          101,428
        </Text>
      </Stack>

      <Stack gap="20px" paddingBottom="120px">
        <Separator color="separatorTertiary" />

        <Inline wrap={false} space="12px">
          <Card>
            <Text size="14pt" weight="semibold" color="labelSecondary">
              Next Drop
            </Text>
            <Text size="20pt" weight="bold">
              2d 19h
            </Text>
            <Text
              size="10pt"
              weight="bold"
              color="accent"
              textShadow="12px accent"
            >
              12pm Nov 7th
            </Text>
          </Card>

          <Card>
            <Text size="14pt" weight="semibold" color="labelSecondary">
              Your Rank
            </Text>
            <Text size="20pt" weight="bold">
              #12
            </Text>
            <Text
              size="10pt"
              weight="bold"
              color="accent"
              textShadow="12px accent"
            >
              Out of 8,025
            </Text>
          </Card>
        </Inline>

        <Separator color="separatorTertiary" />

        <Stack gap="12px">
          <Text size="14pt" weight="semibold" color="labelSecondary">
            Referral Code
          </Text>

          <Inline wrap={false} space="12px">
            <Card paddingVertical="12px">
              <Text size="20pt" weight="bold" align="center">
                A4B-2YK
              </Text>
            </Card>

            <Card
              paddingVertical="12px"
              flexDirection="row"
              alignItems="center"
            >
              <Symbol
                symbol="square.on.square"
                color="accent"
                shadow="12px accent"
                weight="bold"
                size={16}
              />
              <Text
                size="16pt"
                weight="bold"
                color="accent"
                textShadow="12px accent"
                align="center"
              >
                Copy Link
              </Text>
            </Card>
          </Inline>

          <Text size="12pt" weight="medium" color="labelQuaternary">
            Earn points for referring friends once they swap $100 through
            Rainbow
          </Text>
        </Stack>

        <Separator color="separatorTertiary" />

        <Stack gap="16px">
          <Text size="16pt" weight="bold">
            Leaderboard
          </Text>

          <Card
            paddingVertical="12px"
            paddingHorizontal="16px"
            flexDirection="row"
          >
            <Inline wrap={false} space="12px" alignVertical="center">
              <WalletAvatar
                size={32}
                addressOrName={currentAddress}
                emojiSize="16pt"
              />
              <AddressOrEns
                address={currentAddress}
                size="14pt"
                weight="bold"
              />
            </Inline>
          </Card>

          <Leaderboard />
        </Stack>
      </Stack>
    </Box>
  );
}
