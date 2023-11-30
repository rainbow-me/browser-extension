import { PropsWithChildren } from 'react';

import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { TESTNET_MODE_BAR_HEIGHT } from '~/core/utils/dimensions';
import { Box, Inline, Separator, Stack, Text } from '~/design-system';

function Card({ children }: PropsWithChildren) {
  return (
    <Stack
      paddingVertical="16px"
      paddingHorizontal="18px"
      borderRadius="16px"
      background="surfaceSecondaryElevated"
      gap="12px"
      width="full"
      boxShadow="12px surfaceSecondaryElevated"
    >
      {children}
    </Stack>
  );
}

export function Points() {
  const { testnetMode } = useTestnetModeStore();

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
            <Card>
              <Text size="20pt" weight="bold" align="center">
                A4B-2YK
              </Text>
            </Card>

            <Card>
              <Text
                size="20pt"
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

        <Text size="16pt" weight="bold">
          Leaderboard
        </Text>
      </Stack>
    </Box>
  );
}
