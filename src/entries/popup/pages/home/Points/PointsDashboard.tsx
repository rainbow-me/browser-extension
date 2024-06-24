/* eslint-disable react/jsx-props-no-spreading */

import { hex } from 'chroma-js';
import { format, intervalToDuration } from 'date-fns';
import { MotionProps, motion } from 'framer-motion';
import {
  PropsWithChildren,
  memo,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { Address } from 'viem';

import rainbowIcon from 'static/images/icon-16@2x.png';
import { analytics } from '~/analytics';
import { PointsQuery } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { copy } from '~/core/utils/copy';
import { createNumberFormatter } from '~/core/utils/formatNumber';
import {
  convertAmountAndPriceToNativeDisplay,
  convertRawAmountToBalance,
  convertRawAmountToDecimalFormat,
} from '~/core/utils/numbers';
import {
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Row,
  Rows,
  Separator,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { BoxProps } from '~/design-system/components/Box/Box';
import { Lens } from '~/design-system/components/Lens/Lens';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';
import { TextProps } from '~/design-system/components/Text/Text';
import { BoxStyles, transparentOnHover } from '~/design-system/styles/core.css';
import {
  globalColors,
  linearGradients,
} from '~/design-system/styles/designTokens';
import { AddressOrEns } from '~/entries/popup/components/AddressOrEns/AddressorEns';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import ExternalImage from '~/entries/popup/components/ExternalImage/ExternalImage';
import { WalletAvatar } from '~/entries/popup/components/WalletAvatar/WalletAvatar';
import { useNativeAsset } from '~/entries/popup/hooks/useNativeAsset';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import { AirdropIcon } from './AirdropIcon';
import { usePoints } from './usePoints';

const { format: formatNumber } = createNumberFormatter({
  maximumSignificantDigits: 8,
});

const trackSharedReferralLink = (linkOrCode: string) => {
  analytics.track(analytics.event.sharedReferralLink, { linkOrCode });
};

// TODO: Also track amount in USD
const trackTappedClaimButton = (claimAmount: number) => {
  analytics.track(analytics.event.tappedClaimButton, { claimAmount });
};

function Card({
  children,
  ...props
}: PropsWithChildren<BoxProps & MotionProps> & {
  onClick?: () => void;
}) {
  return (
    <Lens
      onClick={props.onClick}
      borderRadius="16px"
      width={props.width || 'full'}
      tabIndex={typeof props.tabIndex === 'number' ? props.tabIndex : 0}
    >
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
        boxShadow="12px surfaceSecondaryElevated"
        {...props}
      >
        {children}
      </Box>
    </Lens>
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
      <Card paddingVertical="12px" paddingHorizontal="16px">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="full"
        >
          <Inline wrap={false} space="12px" alignVertical="center">
            <WalletAvatar
              size={32}
              addressOrName={currentAddress}
              emojiSize="16pt"
            />
            <AddressOrEns address={currentAddress} size="16pt" weight="bold" />
          </Inline>
          <ExternalImage
            src={rainbowIcon}
            borderRadius="8px"
            height={28}
            width={28}
          />
        </Box>
        <Separator color="separatorTertiary" />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="full"
          paddingBottom="8px"
        >
          <Inline wrap={false} space="12px" alignVertical="center">
            <Stack space="12px">
              <Text size="14pt" color="label" weight="bold">
                {i18n.t('points.my_points')}
              </Text>
              <RainbowText size="26pt" weight="heavy" inline>
                {formatNumber(data?.user?.earnings.total)}
              </RainbowText>
            </Stack>
          </Inline>
          <Stack space="12px">
            <Text size="14pt" color="accent" weight="bold" align="right">
              {i18n.t('points.rank')}
            </Text>
            {user.stats.position.unranked ? (
              <Text size="26pt" weight="bold" color="labelQuaternary">
                {i18n.t('points.unranked')}
              </Text>
            ) : (
              <Text
                size="26pt"
                weight="bold"
                color="accent"
                textShadow="12px accent"
              >
                #{formatNumber(user.stats.position.current)}
              </Text>
            )}
          </Stack>
        </Box>
      </Card>
      <Box paddingTop="10px">
        <Text size="16pt" weight="bold">
          {i18n.t('points.top_holders')}
        </Text>
      </Box>
      <Card paddingVertical="10px" paddingHorizontal="16px" tabIndex={-1}>
        <Stack separator={<Separator color="separatorTertiary" />} space="12px">
          {leaderboard.accounts
            ?.slice(0, 100)
            .map(({ address, earnings, ens, avatarURL }, index) => (
              <Lens
                key={address}
                marginHorizontal="-16px"
                marginVertical="-10px"
                style={{
                  borderTopLeftRadius: index === 0 ? 16 : 6,
                  borderTopRightRadius: index === 0 ? 16 : 6,
                  borderBottomLeftRadius: index === 99 ? 16 : 6,
                  borderBottomRightRadius: index === 99 ? 16 : 6,
                }}
              >
                <Inset horizontal="16px" vertical="10px">
                  <Inline
                    wrap={false}
                    space="12px"
                    alignVertical="center"
                    alignHorizontal="justify"
                  >
                    <Inline wrap={false} space="12px" alignVertical="center">
                      <WalletAvatar
                        size={32}
                        avatarUrl={avatarURL || null}
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
                </Inset>
              </Lens>
            ))}
        </Stack>
      </Card>
    </Stack>
  );
}

function TextWithMoreInfo({ children }: PropsWithChildren) {
  return (
    <Inline wrap={false} space="4px" alignVertical="center">
      <Text size="14pt" weight="bold" color="labelSecondary">
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

export const copyReferralLink = (referralCode: string) => {
  trackSharedReferralLink('link');
  copy({
    value: `https://rainbow.me/points?ref=${referralCode}`,
    title: i18n.t('points.copied_referral_link'),
    description: `rainbow.me/points?ref=${referralCode}`,
  });
};

const formatReferralCode = (referralCode: string) =>
  referralCode.slice(0, 3) + '-' + referralCode.slice(-3);
function ReferralCode() {
  const { currentAddress } = useCurrentAddressStore();
  const { data, isSuccess } = usePoints(currentAddress);
  const copyReferralCode = () => {
    trackSharedReferralLink('code');
    copy({
      value: data?.user.referralCode || '',
      title: i18n.t('points.copied_referral_code'),
      description: formatReferralCode(data?.user.referralCode || ''),
    });
  };
  return (
    <Stack gap="12px">
      <Text size="16pt" weight="bold" color="label">
        {i18n.t('points.referral_code')}
      </Text>
      <Inline wrap={false} space="12px">
        {data && isSuccess ? (
          <>
            <Card
              paddingVertical="12px"
              whileTap={{ scale: 0.98 }}
              whileFocus={{ scale: 1.02 }}
              whileHover={{ scale: 1.02 }}
              onTap={copyReferralCode}
              onClick={copyReferralCode}
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
              onClick={() => copyReferralLink(data.user.referralCode)}
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

function CardSkeleton({
  height,
  borderRadius,
}: {
  height: string;
  borderRadius?: BoxStyles['borderRadius'];
}) {
  return (
    <Skeleton
      height={height}
      width="100%"
      style={{ borderRadius: borderRadius || 16 }}
    />
  );
}

function NextDistributionIn({ nextDistribution }: { nextDistribution: Date }) {
  const [nextDistributionIn, recalcNextDistributionDistance] = useReducer(
    () =>
      intervalToDuration({
        start: Date.now(),
        end: nextDistribution,
      }),
    intervalToDuration({
      start: Date.now(),
      end: nextDistribution,
    }),
  );

  useEffect(() => {
    const interval = setInterval(recalcNextDistributionDistance, 1000);
    return () => clearInterval(interval);
  }, [nextDistribution]);

  const { days, hours, minutes } = nextDistributionIn;
  const dayStr = days ? `${days}d` : '';
  const hourStr = hours ? `${hours}h` : '';
  const minuteStr = minutes ? `${minutes}m` : '';

  return (
    <Box padding="12px">
      <Text
        size="14pt"
        weight="heavy"
        color="labelSecondary"
        textShadow="16px label"
      >
        {`${dayStr} ${hourStr} ${minuteStr}`}
      </Text>
    </Box>
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

  if (difference < 0)
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

const StatsCarousel = memo(function YourRankAndNextDrop() {
  const { currentAddress } = useCurrentAddressStore();
  const { data, isSuccess } = usePoints(currentAddress);

  if (!data || !isSuccess)
    return (
      <Inline wrap={false} space="12px">
        <CardSkeleton height="89px" />
        <CardSkeleton height="89px" />
      </Inline>
    );

  const { leaderboard, user } = data;
  const currentRank = user.stats.position.current;
  const earningsFromReferrals =
    user.earnings_by_type.find((e) => e?.type === 'referral')?.earnings.total ||
    0;
  const { last_period: lastPeriod } = user.stats;

  const { difference, symbol, color } = getRankDifference(user.stats);

  const MIN_CARD_WIDTH = 130;
  const CARD_HEIGHT = 100;

  return (
    <Box
      style={{
        overflowX: 'scroll',
        overflowY: 'hidden',
        whiteSpace: 'nowrap',
        padding: 12,
        margin: -12,
      }}
    >
      <Inline wrap={false} space="12px">
        <Card style={{ height: CARD_HEIGHT, minWidth: MIN_CARD_WIDTH }}>
          <TextWithMoreInfo>
            {i18n.t('points.rewards.earned_last_week')}
          </TextWithMoreInfo>
          <Text size="20pt" weight="bold">
            {lastPeriod.earnings.total || 0}
          </Text>
          <Inline alignVertical="center" space="4px" wrap={false}>
            <Symbol
              size={12}
              symbol={'trophy.fill'}
              weight="heavy"
              color={'accent'}
              filter={`shadow 12px accent`}
            />
            {lastPeriod.position.unranked ? (
              <Text
                size="12pt"
                weight="heavy"
                color="accent"
                textShadow="16px accent"
              >
                {i18n.t('points.unranked')}
              </Text>
            ) : (
              <Text
                size="12pt"
                weight="heavy"
                color="accent"
                textShadow="16px accent"
              >
                {i18n.t('points.ranking', {
                  rank: lastPeriod.position.current,
                })}
              </Text>
            )}
          </Inline>
        </Card>
        <Card style={{ height: CARD_HEIGHT, minWidth: MIN_CARD_WIDTH }}>
          <TextWithMoreInfo>
            {i18n.t('points.rewards.my_referrals')}
          </TextWithMoreInfo>
          <Text size="20pt" weight="bold">
            {user.stats.referral.total_referees}
          </Text>
          <Inline alignVertical="center" space="4px" wrap={false}>
            <Symbol
              size={12}
              symbol={'rays'}
              weight="bold"
              color={'accent'}
              filter={`shadow 12px accent`}
            />
            <Text
              size="12pt"
              weight="heavy"
              color="accent"
              textShadow="16px accent"
            >
              {i18n.t('points.referral_earnings', {
                earnings: earningsFromReferrals,
              })}
            </Text>
          </Inline>
        </Card>
        <Card style={{ height: CARD_HEIGHT, minWidth: MIN_CARD_WIDTH }}>
          <TextWithMoreInfo>{i18n.t('points.your_rank')}</TextWithMoreInfo>
          {user.stats.position.unranked ? (
            <>
              <Text size="20pt" weight="bold" color="labelTertiary">
                {i18n.t('points.unranked')}
              </Text>
              <Text
                size="12pt"
                weight="heavy"
                color="accent"
                textShadow="16px accent"
              >
                {i18n.t('points.points_to_rank', {
                  rank_cutoff: leaderboard.stats.rank_cutoff,
                })}
              </Text>
            </>
          ) : (
            <>
              <Text size="20pt" weight="bold">
                #{formatNumber(currentRank)}
              </Text>
              <Inline alignVertical="center" space="4px" wrap={false}>
                <Symbol
                  size={12}
                  symbol={symbol}
                  weight="heavy"
                  color={color}
                  filter={`shadow 12px ${color}`}
                />
                <Text
                  size="12pt"
                  weight="heavy"
                  color={color}
                  textShadow={`16px ${color}`}
                >
                  {formatNumber(difference)}
                </Text>
              </Inline>
            </>
          )}
        </Card>
      </Inline>
    </Box>
  );
});

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
      gap="20px"
    >
      <Text size="16pt" weight="bold" color="label">
        {i18n.t('points.my_points')}
      </Text>
      <RainbowText size="44pt" weight="heavy" inline>
        {formatNumber(earnings.total)}
      </RainbowText>
    </Box>
  );
}

function RainbowText(props: TextProps & { inline?: boolean }) {
  const content = (
    <Text
      size={props.size}
      weight={props.weight}
      background="points"
      webkitBackgroundClip="text"
      webkitTextFillColor="transparent"
      textShadow={props.textShadow}
    >
      {props.children}
    </Text>
  );
  return props.inline ? <Inline>{content}</Inline> : content;
}

function ClaimYourPoints({
  claimableReward,
  showClaimSheet,
}: {
  claimableReward?: string;
  showClaimSheet: () => void;
}) {
  const eth = useNativeAsset({ chainId: ChainId.mainnet });
  const ethPrice = eth?.nativeAsset?.price?.value;
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  if (!claimableReward || claimableReward === '0' || !ethPrice) return null;
  const claimableBalance = convertRawAmountToBalance(claimableReward || '0', {
    decimals: 18,
    symbol: eth?.nativeAsset?.symbol,
  });
  return (
    <Card>
      <Box paddingTop="6px">
        <Text size="16pt" weight="bold" align="center" textShadow="16px label">
          {i18n.t('points.rewards.available_to_claim')}
        </Text>
      </Box>
      <Box
        alignItems="center"
        justifyContent="center"
        display="flex"
        paddingBottom="8px"
        paddingTop="6px"
      >
        <Inline alignVertical="center" space="8px">
          <ChainBadge chainId={ChainId.mainnet} size="45" />
          <Text size="44pt" weight="heavy" textShadow="16px label">
            {
              convertAmountAndPriceToNativeDisplay(
                claimableBalance.amount,
                ethPrice || 0,
                currency,
              )?.display
            }
          </Text>
        </Inline>
      </Box>
      <ClaimYourPointsCta
        claimableReward={claimableReward || '0'}
        showClaimSheet={showClaimSheet}
      />
    </Card>
  );
}

function ClaimYourPointsCta({
  claimableReward,
  showClaimSheet,
}: {
  claimableReward: string;
  showClaimSheet: () => void;
}) {
  const { currentTheme } = useCurrentThemeStore();
  const buttonBackground =
    currentTheme === 'dark'
      ? 'linear-gradient(to right, #242529, #242529)'
      : 'linear-gradient(to right, #fff, #fff)';
  return (
    <Box
      as={motion.div}
      style={{
        background: `${buttonBackground}, ${linearGradients.points}`,
        backgroundClip: 'padding-box, border-box',
        backgroundOrigin: 'padding-box, border-box',
        border: '2px solid transparent',
        textAlign: 'center',
        height: 56,
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      whileTap={{ scale: 0.98 }}
      whileFocus={{ scale: 1.02 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => {
        trackTappedClaimButton(parseInt(claimableReward));
        showClaimSheet();
      }}
    >
      <RainbowText size="20pt" weight="heavy">
        {i18n.t('points.rewards.claim_reward', {
          reward: `${convertRawAmountToDecimalFormat(claimableReward, 18)} ETH`,
        })}
      </RainbowText>
      <Box
        style={{
          background: linearGradients.points,
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          opacity: 0.14,
          filter: 'blur(12px)',
          borderRadius: 20,
          marginTop: 0,
          marginBottom: -6,
          marginLeft: -6,
          marginRight: -6,
        }}
        className={transparentOnHover}
      />
    </Box>
  );
}

const cyanAlpha = (alpha: number) =>
  hex(globalColors.cyan50).alpha(alpha).css();
function YourEarningsLastWeek() {
  const navigate = useRainbowNavigate();
  return (
    <Card
      flexDirection="row"
      justifyContent="flex-start"
      alignItems="center"
      gap="12px"
      borderColor="separatorSecondary"
      borderWidth="1px"
      onClick={() =>
        navigate(ROUTES.POINTS_WEEKLY_OVERVIEW, {
          state: {
            tab: 'points',
            skipTransitionOnRoute: ROUTES.HOME,
          },
        })
      }
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
        <Text color="cyan" size="12pt" weight="heavy" textShadow="12px blue">
          {i18n.t('points.weekly_overview.view_now')}
        </Text>
      </Stack>
    </Card>
  );
}

function NextDrop() {
  const { currentAddress } = useCurrentAddressStore();
  const { data, isSuccess } = usePoints(currentAddress);

  if (!data || !isSuccess)
    return <CardSkeleton height="69px" borderRadius="32px" />;

  const { meta } = data;
  const nextDistribution = new Date(meta.distribution.next * 1000);
  return (
    <Card borderRadius="32px">
      <Box display="flex" justifyContent="space-between">
        <Inline alignVertical="center" space="12px">
          <Symbol
            size={18}
            symbol="clock"
            weight="heavy"
            color="accent"
            filter="shadow 12px accent"
          />
          <Stack gap="10px">
            <Text
              size="14pt"
              color="label"
              weight="heavy"
              textShadow="16px label"
            >
              {i18n.t('points.next_drop')}
            </Text>
            <Text size="12pt" color="labelQuaternary" weight="bold">
              {format(nextDistribution, 'cccc p')}
            </Text>
          </Stack>
        </Inline>
        <Box
          borderRadius="20px"
          borderColor={'separatorSecondary'}
          borderWidth="1px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <NextDistributionIn nextDistribution={nextDistribution} />
        </Box>
      </Box>
    </Card>
  );
}

function RainbowUserEarnings({ totalEarnings }: { totalEarnings: string }) {
  return (
    <Inline alignVertical="center" space="6px" alignHorizontal="center">
      <Text size="12pt" color="labelTertiary" weight="bold">
        {i18n.t('points.rewards.program_earnings')}
      </Text>
      <ChainBadge chainId={ChainId.mainnet} size={'14'} />
      <Text size="12pt" color="labelSecondary" weight="heavy">
        {`${convertRawAmountToDecimalFormat(totalEarnings, 18)} ETH`}
      </Text>
    </Inline>
  );
}

function MyEarnings({ earnings = '0' }: { earnings?: string }) {
  const eth = useNativeAsset({ chainId: ChainId.mainnet });
  const ethPrice = eth?.nativeAsset?.price?.value;
  const { currentCurrency: currency } = useCurrentCurrencyStore();

  if (!ethPrice) return null;

  const earningsBalance = convertRawAmountToBalance(earnings, {
    decimals: 18,
    symbol: eth?.nativeAsset?.symbol,
  });
  return (
    <Card borderColor="separatorSecondary" display="flex">
      <Stack space="20px">
        <Box display="flex" justifyContent="space-between">
          <Inline space="12px" alignVertical="center">
            <Symbol
              symbol="chart.bar"
              weight="heavy"
              size={20}
              color="accent"
              filter="shadow 12px accent"
            />
            <Text
              size="14pt"
              color="label"
              weight="heavy"
              textShadow="16px label"
            >
              {i18n.t('points.rewards.my_earnings')}
            </Text>
          </Inline>
          <Symbol
            symbol="questionmark.circle.fill"
            weight="heavy"
            size={16}
            color="labelQuaternary"
          />
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Inline space="10px" alignVertical="center">
            <ChainBadge chainId={ChainId.mainnet} size="32" />
            <Stack space="10px">
              <Text size="12pt" color="labelQuaternary" weight="bold">
                {i18n.t('points.rewards.claimed_earnings')}
              </Text>
              <Text size="14pt" color="label" weight="heavy">
                {`${convertRawAmountToDecimalFormat(earnings, 18)} ETH`}
              </Text>
            </Stack>
          </Inline>
          {ethPrice && (
            <Stack space="10px">
              <Text
                size="12pt"
                color="labelQuaternary"
                weight="bold"
                align="right"
              >
                {i18n.t('points.rewards.current_value')}
              </Text>
              <Text size="14pt" color="label" weight="bold" align="right">
                {`${
                  convertAmountAndPriceToNativeDisplay(
                    earningsBalance.amount,
                    ethPrice,
                    currency,
                  ).display
                }`}
              </Text>
            </Stack>
          )}
        </Box>
      </Stack>
    </Card>
  );
}

function NoHistoricalRewards() {
  return (
    <Card borderColor="separatorSecondary" display="flex">
      <Stack space="16px">
        <Box display="flex" justifyContent="center" alignItems="center">
          <Inline space="10px" alignVertical="center">
            <Symbol
              symbol="chart.bar"
              weight="heavy"
              size={20}
              color="accent"
              filter="shadow 12px accent"
            />
            <Text
              size="16pt"
              color="label"
              weight="heavy"
              textShadow="16px label"
            >
              {i18n.t('points.rewards.earn_eth_rewards')}
            </Text>
          </Inline>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Text
            weight="bold"
            color="labelQuaternary"
            size="12pt"
            align="center"
          >
            {i18n.t('points.rewards.points_explanation')}
          </Text>
        </Box>
      </Stack>
    </Card>
  );
}

function Rewards() {
  const { currentAddress } = useCurrentAddressStore();
  const { data: points } = usePoints(currentAddress);
  const navigate = useRainbowNavigate();

  const hasLastAirdropPoints = points?.user.stats.last_airdrop.differences.some(
    (d) => d && d.earnings.total > 0,
  );
  const shouldShowWeeklyOverview =
    points && (points.user.earnings.total > 0 || hasLastAirdropPoints);
  const rewards = points?.user?.rewards;
  const { claimable, claimed } = rewards || {};
  const showClaimYourPoints = claimable && claimable !== '0';
  const showMyEarnings = showClaimYourPoints || (claimed && claimed !== '0');
  const showNoHistoricalRewards = !showMyEarnings;
  return (
    <>
      <Stack gap="20px">
        {showClaimYourPoints && (
          <ClaimYourPoints
            claimableReward={claimable}
            showClaimSheet={() =>
              navigate(ROUTES.CLAIM_SHEET, {
                state: {
                  tab: 'points',
                  skipTransitionOnRoute: ROUTES.HOME,
                },
              })
            }
          />
        )}
        {showMyEarnings && <MyEarnings earnings={claimed} />}
        {showNoHistoricalRewards && <NoHistoricalRewards />}
        <RainbowUserEarnings
          totalEarnings={points?.meta?.rewards?.total || '0'}
        />
        <NextDrop />
        {shouldShowWeeklyOverview && <YourEarningsLastWeek />}
        <Separator color="separatorTertiary" />
        <YourPoints />
        <StatsCarousel />
        <Separator color="separatorTertiary" />
        <ReferralCode />
      </Stack>
    </>
  );
}

type PointsDisplayMode = 'rewards' | 'leaderboard';

function PointsDisplayModeCard({
  mode,
  currentMode,
  onPress,
}: {
  mode: PointsDisplayMode;
  currentMode: PointsDisplayMode;
  onPress: () => void;
}) {
  const { currentTheme } = useCurrentThemeStore();
  const active = mode === currentMode;
  const title = mode === 'rewards' ? 'Rewards' : 'Leaderboard';
  const getGradientBackground = () => {
    if (currentTheme === 'dark') {
      return mode === 'rewards'
        ? linearGradients.subtleDarkRight
        : linearGradients.subtleDarkLeft;
    }
    return mode === 'rewards'
      ? linearGradients.subtleLightRight
      : linearGradients.subtleLightLeft;
  };
  return active ? (
    <Card
      borderRadius="20px"
      tabIndex={-1}
      borderColor="separatorSecondary"
      borderWidth="1px"
      paddingVertical="10px"
      style={{ flex: 1 }}
    >
      <Text
        size="16pt"
        color={'label'}
        weight="heavy"
        align="center"
        textShadow="16px label"
      >
        {title}
      </Text>
    </Card>
  ) : (
    <Box
      as={motion.div}
      whileTap={{ scale: 0.98 }}
      whileFocus={{ scale: 1.02 }}
      whileHover={{ scale: 1.02 }}
      onTap={onPress}
      onClick={onPress}
      tabIndex={0}
      paddingVertical="10px"
      paddingHorizontal="18px"
      borderRadius="20px"
      justifyContent="center"
      borderWidth="1px"
      borderColor="transparent"
      style={{
        background: getGradientBackground(),
        flex: 1,
      }}
    >
      <Text size="16pt" color="labelTertiary" weight="heavy" align="center">
        {title}
      </Text>
    </Box>
  );
}

export function PointsDashboard() {
  const { currentTheme } = useCurrentThemeStore();
  const [displayMode, setDisplayMode] = useState<'rewards' | 'leaderboard'>(
    'rewards',
  );
  return (
    <>
      <Stack
        gap="24px"
        width="full"
        marginTop="-30px"
        padding="20px"
        background={currentTheme === 'light' ? 'surfaceSecondary' : undefined}
      >
        <Rows>
          <Row>
            <Columns alignVertical="top">
              <Column>
                <PointsDisplayModeCard
                  mode={'rewards'}
                  currentMode={displayMode}
                  onPress={() => setDisplayMode('rewards')}
                />
              </Column>
              <Column>
                <PointsDisplayModeCard
                  mode={'leaderboard'}
                  currentMode={displayMode}
                  onPress={() => setDisplayMode('leaderboard')}
                />
              </Column>
            </Columns>
          </Row>
        </Rows>
        {displayMode === 'rewards' ? <Rewards /> : <Leaderboard />}
      </Stack>
    </>
  );
}
