import { format, sub } from 'date-fns';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { createNumberFormatter } from '~/core/utils/formatNumber';
import {
  AccentColorProvider,
  Box,
  Button,
  Inline,
  Stack,
  textStyles,
} from '~/design-system';
import { rainbowColors } from '~/design-system/components/AnimatedText/AnimatedText';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { TextProps } from '~/design-system/components/Text/Text';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWalletName } from '~/entries/popup/hooks/useWalletName';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import { usePoints } from './usePoints';

const { format: formatNumber } = createNumberFormatter({
  maximumSignificantDigits: 8,
});

function ConsoleText({
  children,
  color = 'labelTertiary',
}: {
  color?: TextProps['color'];
  children: string;
}) {
  if (typeof children !== 'string')
    throw '<ConsoleText /> children must be string';

  return (
    <motion.span
      className={textStyles({
        textShadow: `12px ${color}`,
        textAlign: 'left',
        fontSize: '14pt mono',
        fontFamily: 'mono',
        fontWeight: 'semibold',
        color,
      })}
    >
      {children.split('').map((char, i) => (
        <motion.span
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          key={`${char} ${i}`}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

const rainbowColorsArray = Object.values(rainbowColors);

type WeeklyEarning = {
  type:
    | 'new_referrals'
    | 'referral_activity'
    | 'redemption'
    | 'retroactive'
    | 'transaction'
    // eslint-disable-next-line @typescript-eslint/ban-types
    | (string & {});
  earnings: number;
};
const getEarningTypeLabel = (type: WeeklyEarning['type']) => {
  if (type === 'transaction')
    return i18n.t('points.weekly_overview.your_activity');
  if (type === 'referral_activity')
    return i18n.t('points.weekly_overview.referral_activity');
  if (type === 'new_referrals')
    return i18n.t('points.weekly_overview.new_referrals');
  if (type === 'redemption') return i18n.t('points.weekly_overview.bonus');
  if (type === 'retroactive')
    return i18n.t('points.weekly_overview.retroactive');
  return type;
};

export function PointsWeeklyOverview() {
  const navigate = useRainbowNavigate();
  const { currentAddress } = useCurrentAddressStore();
  const { displayName } = useWalletName({ address: currentAddress });

  const backToHome = () => {
    navigate(ROUTES.HOME, {
      state: { tab: 'points', skipTransitionOnRoute: ROUTES.HOME },
    });
  };

  const { data: points } = usePoints(currentAddress);

  const weeklyEarnings = useMemo(() => {
    const differences = points?.user.stats.last_airdrop.differences;
    if (!differences) return null;

    let total = 0;
    const rewardsByType: Record<string, WeeklyEarning> = {};
    for (const diff of differences) {
      if (!diff) continue;
      const type = diff.type === 'referral' ? diff.group_id : diff.type;
      rewardsByType[type] = {
        type,
        earnings: (rewardsByType[type]?.earnings || 0) + diff.earnings.total,
      };
      total += diff.earnings.total;
    }

    const diffs = Object.values(rewardsByType).filter(
      (d) =>
        !(['retroactive', 'redemption'].includes(d.type) && d.earnings === 0),
    );

    return { total, differences: diffs };
  }, [points?.user.stats.last_airdrop.differences]);

  const nextDistributionTime = (points?.meta.distribution.next ?? 0) * 1000;

  return (
    <BottomSheet
      zIndex={zIndexes.ACTIVITY_DETAILS}
      show={!!(weeklyEarnings && points)}
    >
      <Box
        display="flex"
        as={motion.div}
        style={{ height: '512px' }}
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.04, delay: 1, type: 'tween' }}
        flexDirection="column"
        justifyContent="space-between"
        padding="20px"
        paddingTop="36px"
      >
        <Stack space="44px">
          <Stack space="15px">
            <Inline space="4px" alignVertical="center" wrap={false}>
              <ConsoleText>{i18n.t('points.onboarding.account')}</ConsoleText>
              <ConsoleText color="accent">{displayName || ''}</ConsoleText>
            </Inline>
            <ConsoleText>
              {i18n.t('points.weekly_overview.week_of', {
                from: format(sub(nextDistributionTime, { weeks: 2 }), 'MMM dd'),
                to: format(sub(nextDistributionTime, { weeks: 1 }), 'MMM dd'),
              })}
            </ConsoleText>
            <ConsoleText>
              {i18n.t('points.weekly_overview.counting')}
            </ConsoleText>
          </Stack>

          <Stack space="30px">
            {weeklyEarnings?.differences.map(({ type, earnings }, i) => (
              <AccentColorProvider
                key={type}
                color={rainbowColorsArray[i].text}
              >
                <Inline wrap={false} alignHorizontal="justify">
                  <ConsoleText color="accent">
                    {getEarningTypeLabel(type)}
                  </ConsoleText>
                  <ConsoleText color="accent">
                    {earnings === 0
                      ? i18n.t('points.weekly_overview.none')
                      : `+ ${formatNumber(earnings)} Points`}
                  </ConsoleText>
                </Inline>
              </AccentColorProvider>
            ))}
            <Inline wrap={false} alignHorizontal="justify">
              <ConsoleText color="labelTertiary">
                {i18n.t('points.weekly_overview.total')}
              </ConsoleText>
              <ConsoleText color="label">{`+ ${formatNumber(
                weeklyEarnings?.total,
              )} Points`}</ConsoleText>
            </Inline>
          </Stack>

          <Stack space="30px">
            <ConsoleText>
              {i18n.t('points.weekly_overview.weekly_counted')}
            </ConsoleText>

            <Inline
              wrap={false}
              alignVertical="center"
              alignHorizontal="justify"
            >
              <ConsoleText color="label">
                {i18n.t('points.weekly_overview.you_have')}
              </ConsoleText>
              <ConsoleText color="label">{`${formatNumber(
                points?.user.earnings.total,
              )} Points`}</ConsoleText>
            </Inline>
          </Stack>
        </Stack>

        <Button
          onClick={backToHome}
          color="accent"
          width="full"
          borderRadius="12px"
          height="36px"
          variant="shadow"
        >
          {i18n.t('close')}
        </Button>
      </Box>
    </BottomSheet>
  );
}
