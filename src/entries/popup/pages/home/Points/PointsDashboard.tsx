/* eslint-disable react/jsx-props-no-spreading */

import { hex } from 'chroma-js';
import { formatDistanceToNowStrict } from 'date-fns';
import { MotionProps, motion } from 'framer-motion';
import { PropsWithChildren, useEffect, useReducer } from 'react';
import { Address } from 'wagmi';

import { PointsQuery } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { truncateAddress } from '~/core/utils/address';
import { copy } from '~/core/utils/copy';
import { formatDate } from '~/core/utils/formatDate';
import { createNumberFormatter } from '~/core/utils/formatNumber';
import {
  Box,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { BoxProps } from '~/design-system/components/Box/Box';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';
import {
  globalColors,
  linearGradients,
} from '~/design-system/styles/designTokens';
import { AddressOrEns } from '~/entries/popup/components/AddressOrEns/AddressorEns';
import { Link } from '~/entries/popup/components/Link/Link';
import { WalletAvatar } from '~/entries/popup/components/WalletAvatar/WalletAvatar';
import { ROUTES } from '~/entries/popup/urls';

import { AirdropIcon } from './AirdropIcon';
import { usePoints } from './usePoints';

const { format: formatNumber } = createNumberFormatter({
  maximumSignificantDigits: 8,
});

function Card({
  children,
  ...props
}: PropsWithChildren<BoxProps & MotionProps>) {
  return (
    <Box
      as={motion.div}
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      gap="12px"
      paddingVertical="16px"
      paddingHorizontal="18px"
      borderRadius="16px"
      background="surfaceSecondaryElevated"
      width="full"
      boxShadow="12px surfaceSecondaryElevated"
      {...props}
    >
      {children}
    </Box>
  );
}

const LeaderboardPositionNumberDisplay = ({
  position,
  children,
}: PropsWithChildren<{ position: number }>) => {
  const medal = (['🥇', '🥈', '🥉'] as const)[position - 1];

  if (medal)
    return (
      <Inline wrap={false} space="8px" alignVertical="center">
        <Text
          size="12pt"
          weight="bold"
          webkitBackgroundClip="text"
          background={medal}
          color="transparent"
        >
          {children}
        </Text>
        <Text size="16pt" weight="bold">
          {medal}
        </Text>
      </Inline>
    );

  return (
    <Inline wrap={false} space="8px" alignVertical="center">
      <Text size="12pt" weight="bold" color="labelTertiary">
        {children}
      </Text>
      <Text size="10pt" weight="bold" color="labelTertiary">
        #{position}
      </Text>
    </Inline>
  );
};

function Leaderboard() {
  const { currentAddress } = useCurrentAddressStore();
  const { data, isSuccess } = usePoints(currentAddress);
  if (!data || !isSuccess) return null;

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
        {user.stats.position.unranked ? (
          <Text size="16pt" weight="bold" color="labelQuaternary">
            {i18n.t('points.unranked')}
          </Text>
        ) : (
          <Text
            size="16pt"
            weight="bold"
            color="accent"
            textShadow="12px accent"
          >
            #{formatNumber(user.stats.position.current)}
          </Text>
        )}
      </Card>
      <Card paddingVertical="10px" paddingHorizontal="16px">
        <Stack separator={<Separator color="separatorTertiary" />} space="12px">
          {leaderboard.accounts
            ?.slice(0, 100)
            .map(({ address, earnings, ens, avatarURL }, index) => (
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
                    avatarUrl={avatarURL}
                    addressOrName={address}
                    emojiSize="16pt"
                  />
                  <TextOverflow size="14pt" weight="bold">
                    {ens || truncateAddress(address as Address)}
                  </TextOverflow>
                </Inline>
                <LeaderboardPositionNumberDisplay position={index + 1}>
                  {formatNumber(earnings.total)}
                </LeaderboardPositionNumberDisplay>
              </Inline>
            ))}
        </Stack>
      </Card>
    </Stack>
  );
}

function TextWithMoreInfo({ children }: PropsWithChildren) {
  return (
    <Inline wrap={false} space="4px" alignVertical="center">
      <Text size="14pt" weight="semibold" color="labelSecondary">
        {children}
      </Text>
      {/* commented for now, we'll add in the future */}
      {/* <Symbol
        weight="bold"
        symbol="info.circle.fill"
        color="labelQuaternary"
        size={12}
      /> */}
    </Inline>
  );
}

export const copyReferralLink = (referralCode: string) =>
  copy({
    value: `https://rainbow.me/points?ref=${referralCode}`,
    title: i18n.t('points.copied_referral_link'),
    description: `rainbow.me/points?ref=${referralCode}`,
  });

const formatReferralCode = (referralCode: string) =>
  referralCode.slice(0, 3) + '-' + referralCode.slice(-3);
function ReferralCode() {
  const { currentAddress } = useCurrentAddressStore();
  const { data, isSuccess } = usePoints(currentAddress);

  return (
    <Stack gap="12px">
      <TextWithMoreInfo>{i18n.t('points.referral_code')}</TextWithMoreInfo>

      <Inline wrap={false} space="12px">
        {data && isSuccess ? (
          <>
            <Card
              paddingVertical="12px"
              whileTap={{ scale: 0.98 }}
              whileFocus={{ scale: 1.02 }}
              whileHover={{ scale: 1.02 }}
              onTap={() =>
                copy({
                  value: data.user.referralCode,
                  title: i18n.t('points.copied_referral_code'),
                  description: formatReferralCode(data.user.referralCode),
                })
              }
            >
              <Text size="20pt" weight="bold" align="center">
                {formatReferralCode(data.user.referralCode)}
              </Text>
            </Card>

            <Card
              paddingVertical="12px"
              flexDirection="row"
              alignItems="center"
              whileTap={{ scale: 0.98 }}
              whileFocus={{ scale: 1.02 }}
              whileHover={{ scale: 1.02 }}
              onTap={() => copyReferralLink(data.user.referralCode)}
            >
              <Symbol
                symbol="square.on.square"
                color="accent"
                filter="shadow 12px accent"
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
                {i18n.t('copy_link')}
              </Text>
            </Card>
          </>
        ) : (
          <>
            <CardSkeleton height="40px" />
            <CardSkeleton height="40px" />
          </>
        )}
      </Inline>

      <Text size="12pt" weight="medium" color="labelQuaternary">
        {i18n.t('points.referral_code_description')}
      </Text>
    </Stack>
  );
}

function CardSkeleton({ height }: { height: string }) {
  return <Skeleton height={height} width="100%" style={{ borderRadius: 16 }} />;
}

function NextDistributionIn({ nextDistribution }: { nextDistribution: Date }) {
  const [nextDistributionIn, recalcNextDistributionDistance] = useReducer(
    () => formatDistanceToNowStrict(nextDistribution),
    formatDistanceToNowStrict(nextDistribution),
  );

  useEffect(() => {
    const interval = setInterval(recalcNextDistributionDistance, 1000);
    return () => clearInterval(interval);
  }, [nextDistribution]);

  return (
    <Text size="20pt" weight="bold">
      {nextDistributionIn}
    </Text>
  );
}

function getRankDifference(
  stats: NonNullable<PointsQuery['points']>['user']['stats'],
) {
  const lastWeekRank = stats.last_airdrop.position.current;
  const currentRank = stats.position.current;
  const difference = currentRank - lastWeekRank;

  if (difference === 0)
    return {
      symbol: 'chart.line.flattrend.xyaxis',
      color: 'yellow',
      difference,
    } as const;

  if (difference > 0)
    return {
      symbol: 'chart.line.uptrend.xyaxis',
      color: 'green',
      difference,
    } as const;

  return {
    symbol: 'chart.line.downtrend.xyaxis',
    color: 'red',
    difference,
  } as const;
}

function YourRankAndNextDrop() {
  const { currentAddress } = useCurrentAddressStore();
  const { data, isSuccess } = usePoints(currentAddress);

  if (!data || !isSuccess)
    return (
      <Inline wrap={false} space="12px">
        <CardSkeleton height="89px" />
        <CardSkeleton height="89px" />
      </Inline>
    );

  const { meta, leaderboard, user } = data;
  const currentRank = user.stats.position.current;
  const nextDistribution = new Date(meta.distribution.next * 1000);

  const { difference, symbol, color } = getRankDifference(user.stats);

  return (
    <Inline wrap={false} space="12px">
      <Card>
        <TextWithMoreInfo>{i18n.t('points.next_drop')}</TextWithMoreInfo>

        <NextDistributionIn nextDistribution={nextDistribution} />
        <Inline alignVertical="center" space="4px" wrap={false}>
          <Symbol
            size={12}
            symbol="calendar"
            weight="bold"
            color="accent"
            filter="shadow 12px accent"
          />
          <Text
            size="10pt"
            weight="bold"
            color="accent"
            textShadow="12px accent"
          >
            {formatDate(nextDistribution)}
          </Text>
        </Inline>
      </Card>

      <Card>
        <TextWithMoreInfo>{i18n.t('points.your_rank')}</TextWithMoreInfo>
        {user.stats.position.unranked ? (
          <>
            <TextOverflow size="20pt" weight="bold" color="labelTertiary">
              {i18n.t('points.unranked')}
            </TextOverflow>
            <TextOverflow
              size="10pt"
              weight="bold"
              color="accent"
              textShadow="12px accent"
            >
              {i18n.t('points.points_to_rank', {
                rank_cutoff: leaderboard.stats.rank_cutoff,
              })}
            </TextOverflow>
          </>
        ) : (
          <>
            <TextOverflow size="20pt" weight="bold">
              #{formatNumber(currentRank)}
            </TextOverflow>
            <Inline alignVertical="center" space="4px" wrap={false}>
              <Symbol
                size={12}
                symbol={symbol}
                weight="bold"
                color={color}
                filter={`shadow 12px ${color}`}
              />
              <Text
                size="10pt"
                weight="bold"
                color={color}
                textShadow={`12px ${color}`}
              >
                {formatNumber(difference)}
              </Text>
            </Inline>
          </>
        )}
      </Card>
    </Inline>
  );
}

const mapToRange = (
  num: number,
  inputRange = [0, 3_000_000],
  outputRange = [30, 300],
) => {
  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;
  const result = ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  return result > outMax ? outMax : result;
};

function YourPoints() {
  const { currentAddress } = useCurrentAddressStore();
  const { data, isSuccess } = usePoints(currentAddress);

  if (!data || !isSuccess)
    return (
      <Stack space="12px">
        <Skeleton height="18px" width="90px" />
        <Skeleton height="10px" width="40px" />
        <Skeleton height="9px" width="200px" />
      </Stack>
    );

  const { earnings } = data.user;

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      display="flex"
      flexDirection="column"
      gap="12px"
    >
      <Text size="26pt" weight="heavy">
        {formatNumber(earnings.total)}
      </Text>
      <Box
        as={motion.div}
        borderRadius="round"
        initial={{ width: 40 }}
        transition={{ duration: 1 }}
        animate={{
          width: mapToRange(earnings.total, [0, 2_000_000], [40, 300]),
        }}
        style={{ height: 10, background: linearGradients.points }}
      />
    </Box>
  );
}

const cyanAlpha = (alpha: number) =>
  hex(globalColors.cyan50).alpha(alpha).css();
function YourEarningsLastWeek() {
  return (
    <Card
      flexDirection="row"
      justifyContent="flex-start"
      alignItems="center"
      gap="12px"
      borderColor="separatorSecondary"
      borderWidth="1px"
    >
      <Box
        style={{
          height: 36,
          width: 36,
          background: `linear-gradient(315deg, ${cyanAlpha(
            0.2,
          )} -0.69%, ${cyanAlpha(0.4)} 99.31%)`,
          borderColor: cyanAlpha(0.06),
        }}
        borderWidth="1px"
        borderRadius="10px"
      >
        <AirdropIcon
          size={50}
          color={globalColors.cyan50}
          style={{ marginTop: -8, marginLeft: -8 }}
        />
      </Box>
      <Stack space="10px">
        <Text size="14pt" weight="heavy">
          {i18n.t('points.weekly_overview.your_earnings')}
        </Text>
        <Text color="labelTertiary" size="12pt" weight="bold">
          {i18n.t('points.weekly_overview.view_breakdown')}
        </Text>
        <Link
          to={ROUTES.POINTS_WEEKLY_OVERVIEW}
          state={{ tab: 'points', skipTransitionOnRoute: ROUTES.HOME }}
        >
          <Text color="cyan" size="12pt" weight="heavy" textShadow="12px blue">
            {i18n.t('points.weekly_overview.view_now')}
          </Text>
        </Link>
      </Stack>
    </Card>
  );
}

export function PointsDashboard() {
  const { currentTheme } = useCurrentThemeStore();
  const { currentAddress } = useCurrentAddressStore();
  const { data: points } = usePoints(currentAddress);

  const hasLastAirdropPoints = points?.user.stats.last_airdrop.differences.some(
    (d) => d && d.earnings.total > 0,
  );
  const shouldShowWeeklyOverview =
    points && (points.user.earnings.total > 0 || hasLastAirdropPoints);

  return (
    <Stack
      gap="20px"
      separator={<Separator color="separatorTertiary" />}
      width="full"
      marginTop="-20px" // there is a 20px top inset wrapping all tabs, I don't wanna mess with that rn afraid of breaking something somewhere else
      padding="20px"
      background={currentTheme === 'light' ? 'surfaceSecondary' : undefined}
    >
      <Stack gap="20px">
        <YourPoints />
        {shouldShowWeeklyOverview && <YourEarningsLastWeek />}
      </Stack>
      <YourRankAndNextDrop />
      <ReferralCode />
      <Leaderboard />
    </Stack>
  );
}
