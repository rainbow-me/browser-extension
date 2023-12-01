import { useQuery } from '@tanstack/react-query';
import { PropsWithChildren, ReactElement } from 'react';
import { Address } from 'wagmi';

import { metadataClient } from '~/core/graphql';
import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { formatDate } from '~/core/utils/formatDate';
import { formatNumber } from '~/core/utils/formatNumber';
import { Box, Inline, Separator, Stack, Symbol, Text } from '~/design-system';
import { StackProps } from '~/design-system/components/Stack/Stack';
import { SymbolName, TextColor } from '~/design-system/styles/designTokens';
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

const leaderboardPosition = (
  position: number,
): { symbol: ReactElement; color: TextColor } => {
  if (position > 3 && position <= 50)
    return {
      symbol: (
        <Symbol
          symbol={`${position}.circle` as SymbolName}
          size={14}
          color="labelTertiary"
          weight="bold"
        />
      ),
      color: 'labelTertiary',
    };

  if (position === 1)
    return {
      symbol: (
        <Text size="16pt" weight="bold">
          🥇
        </Text>
      ),
      color: 'yellow',
    }; // hsla(50, 100%, 67%, 1), hsla(43, 100%, 41%, 1)
  if (position === 2)
    return {
      symbol: (
        <Text size="16pt" weight="bold">
          🥈
        </Text>
      ),
      color: 'yellow',
    }; // hsla(212, 60%, 99%, 1), hsla(212, 15%, 74%, 1)
  if (position === 3)
    return {
      symbol: (
        <Text size="16pt" weight="bold">
          🥉
        </Text>
      ),
      color: 'yellow',
    }; // hsla(31, 72%, 55%, 1), hsla(25, 65%, 41%, 1)

  return {
    symbol: (
      <Text size="10pt" weight="bold" color="labelTertiary">
        #{position}
      </Text>
    ),
    color: 'labelTertiary',
  };
};

const usePoints = (
  address: Address = '0x52c717ce5a6b483a890bcdc3114ff140e679b43f',
) => {
  return useQuery({
    queryKey: ['pointss', address],
    queryFn: async () => {
      const result = await metadataClient.points({ address });
      return result.points;
    },
  });
};

function Leaderboard() {
  const { currentAddress } = useCurrentAddressStore();

  const { data } = usePoints();
  if (!data) return null;

  const { user, leaderboard } = data;

  return (
    <Stack gap="16px">
      <Text size="16pt" weight="bold">
        {i18n.t('points.leaderboard')}
      </Text>

      <Card
        paddingVertical="12px"
        paddingHorizontal="16px"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Inline wrap={false} space="12px" alignVertical="center">
          <WalletAvatar
            size={32}
            addressOrName={currentAddress}
            emojiSize="16pt"
          />
          <AddressOrEns address={currentAddress} size="14pt" weight="bold" />
        </Inline>
        <Text
          size="16pt"
          weight="bold"
          color="accent"
          textShadow="12px accent text"
        >
          #{user.stats.position.current}
        </Text>
      </Card>
      <Card
        paddingVertical="10px"
        paddingHorizontal="16px"
        separator={<Separator color="separatorTertiary" />}
      >
        {leaderboard.accounts
          ?.slice(0, 10)
          .map(({ address, earnings }, index) => {
            const { color, symbol } = leaderboardPosition(index + 1);
            return (
              <Inline
                key={address}
                wrap={false}
                space="12px"
                alignVertical="center"
                alignHorizontal="justify"
              >
                <Inline wrap={false} space="12px" alignVertical="center">
                  <WalletAvatar
                    size={32}
                    addressOrName={address}
                    emojiSize="16pt"
                  />
                  <AddressOrEns address={address} size="14pt" weight="bold" />
                </Inline>
                <Inline wrap={false} space="8px" alignVertical="center">
                  <Text size="12pt" weight="bold" color={color}>
                    {formatNumber(earnings.total)}
                  </Text>
                  {symbol}
                </Inline>
              </Inline>
            );
          })}
      </Card>
    </Stack>
  );
}

function ReferralCode() {
  const { data } = usePoints();

  return (
    <Stack gap="12px">
      <Text size="14pt" weight="semibold" color="labelSecondary">
        {i18n.t('points.referral_code')}
      </Text>

      <Inline wrap={false} space="12px">
        <Card paddingVertical="12px">
          <Text size="20pt" weight="bold" align="center">
            {data?.user.referralCode}
          </Text>
        </Card>

        <Card paddingVertical="12px" flexDirection="row" alignItems="center">
          <Symbol
            symbol="square.on.square"
            color="accent"
            shadow="12px accent text"
            weight="bold"
            size={16}
          />
          <Text
            size="16pt"
            weight="bold"
            color="accent"
            textShadow="12px accent text"
            align="center"
          >
            {i18n.t('copy_link')}
          </Text>
        </Card>
      </Inline>

      <Text size="12pt" weight="medium" color="labelQuaternary">
        {i18n.t('points.referral_code_description')}
      </Text>
    </Stack>
  );
}

function YourRankAndNextDrop() {
  const { data } = usePoints();

  if (!data) return null;
  const { meta, leaderboard, user } = data;

  const nextDistribution = new Date(meta.distribution.next * 1000);
  const nextDistributionIn = new Date(
    nextDistribution.getTime() - Date.now(),
  ).toLocaleDateString(undefined, { day: 'numeric', hour: 'numeric' });

  return (
    <Inline wrap={false} space="12px">
      <Card>
        <Text size="14pt" weight="semibold" color="labelSecondary">
          {i18n.t('points.next_drop')}
        </Text>
        <Text size="20pt" weight="bold">
          {nextDistributionIn}
        </Text>
        <Text
          size="10pt"
          weight="bold"
          color="accent"
          textShadow="12px accent text"
        >
          {formatDate(nextDistribution)}
        </Text>
      </Card>

      <Card>
        <Text size="14pt" weight="semibold" color="labelSecondary">
          {i18n.t('points.your_rank')}
        </Text>
        <Text size="20pt" weight="bold">
          #{user.stats.position.current}
        </Text>
        <Text
          size="10pt"
          weight="bold"
          color="accent"
          textShadow="12px accent text"
        >
          {i18n.t('points.out_of', {
            total: leaderboard.stats.total_users,
          })}
        </Text>
      </Card>
    </Inline>
  );
}

function YourPoints() {
  const { data } = usePoints();

  return (
    <Stack paddingBottom="24px">
      <Text size="26pt" weight="heavy">
        {formatNumber(data?.user.earnings.total)}
      </Text>
    </Stack>
  );
}

export function Points() {
  const { testnetMode } = useTestnetModeStore();

  const { currentAddress } = useCurrentAddressStore();

  return (
    <Box display="flex" flexDirection="column" padding="20px" width="full">
      <YourPoints />

      <Separator color="separatorTertiary" />

      <Stack
        gap="20px"
        paddingBottom="120px"
        separator={<Separator color="separatorTertiary" />}
      >
        <YourRankAndNextDrop />
        <ReferralCode />
        <Leaderboard />
      </Stack>
    </Box>
  );
}
