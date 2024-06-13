import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation } from 'wagmi';

import { metadataPostClient } from '~/core/graphql';
import {
  ClaimUserRewardsMutation,
  PointsErrorType,
} from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import {
  convertAmountAndPriceToNativeDisplay,
  convertRawAmountToBalance,
} from '~/core/utils/numbers';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Stack,
  Text,
} from '~/design-system';
import { AnimatedText } from '~/design-system/components/AnimatedText/AnimatedText';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { useNativeAsset } from '~/entries/popup/hooks/useNativeAsset';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWalletName } from '~/entries/popup/hooks/useWalletName';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import ConsoleText from './ConsoleText';
import { CLAIM_MOCK_DATA } from './references';
import { invalidatePointsQuery } from './usePoints';
import { RAINBOW_TEXT, getDelayForRow } from './utils';

export function ClaimOverview() {
  const { state } = useLocation();
  //   const claimNetwork = state?.claimNetwork as ChainId;
  const claimAmount: string = state?.claimAmount;
  const [waitToDisplay, setWaitToDisplay] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState<PointsErrorType | undefined>();
  const navigate = useRainbowNavigate();
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { displayName } = useWalletName({ address: currentAddress });

  const { currentAddress: address } = useCurrentAddressStore();

  const eth = useNativeAsset({ chainId: ChainId.mainnet });
  const ethPrice = eth?.nativeAsset?.price?.value;
  const claimableBalance = convertRawAmountToBalance(claimAmount, {
    decimals: 18,
    symbol: eth?.nativeAsset?.symbol,
  });
  const claimablePriceDisplay = convertAmountAndPriceToNativeDisplay(
    claimableBalance.amount,
    ethPrice || '0',
    currency,
  );

  const { mutate: claimRewards } = useMutation<
    ClaimUserRewardsMutation['claimUserRewards']
  >({
    mutationFn: async () => {
      const response =
        process.env.IS_TESTING === 'true'
          ? CLAIM_MOCK_DATA
          : await metadataPostClient.claimUserRewards({ address });
      const claimInfo = response?.claimUserRewards;

      if (claimInfo?.error) {
        setError(claimInfo?.error.type);
      }

      // clear and refresh claim data so available claim UI disappears
      invalidatePointsQuery(address);

      return claimInfo;
    },
  });

  const backToHome = () => {
    navigate(ROUTES.HOME, {
      state: { tab: 'points', skipTransitionOnRoute: ROUTES.HOME },
    });
  };

  const showPreparingClaim = !showSummary;
  const showSuccess = !waitToDisplay && !showSummary && !error;
  const showError = !waitToDisplay && error;

  useEffect(() => {
    claimRewards();
    setTimeout(() => setWaitToDisplay(false), 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (showSuccess && !showSummary) {
      setTimeout(() => setShowSummary(true), 5000);
    }
  }, [showSuccess, showSummary]);

  return (
    <BottomSheet zIndex={zIndexes.ACTIVITY_DETAILS} show={true}>
      <Box
        display="flex"
        as={motion.div}
        style={{ height: '512px' }}
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.02, delay: 1, type: 'tween' }}
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
            {showPreparingClaim && <PreparingClaimText />}
            {showSuccess && <SuccessText />}
            {showError && <ErrorText error={error} />}
            {showSummary && (
              <ClaimSummary
                amount={claimableBalance.amount}
                price={claimablePriceDisplay.display}
              />
            )}
          </Stack>
        </Stack>

        {(showSummary || showError) && (
          <Button
            onClick={backToHome}
            color="accent"
            width="full"
            borderRadius="12px"
            height="44px"
            variant="transparentShadow"
            tabIndex={0}
          >
            <Text
              size="16pt"
              weight="bold"
              color="accent"
              textShadow="12px accent"
            >
              {i18n.t('points.rewards.done')}
            </Text>
          </Button>
        )}
      </Box>
    </BottomSheet>
  );
}

function PreparingClaimText() {
  return (
    <>
      <ConsoleText>{i18n.t('points.rewards.counting_points')}</ConsoleText>
      <ConsoleText>
        {i18n.t('points.rewards.calculating_referrals')}
      </ConsoleText>
      <ConsoleText>{i18n.t('points.rewards.allocating_earnings')}</ConsoleText>
    </>
  );
}

const ROWS_TEXT = [
  `${i18n.t('points.rewards.your_reward_is_ready')}`,
  `${RAINBOW_TEXT.row1}`,
  `${RAINBOW_TEXT.row2}`,
  `${RAINBOW_TEXT.row3}`,
  `${RAINBOW_TEXT.row4}`,
  `${RAINBOW_TEXT.row5}`,
  `${RAINBOW_TEXT.row6}`,
  `${RAINBOW_TEXT.row7}`,
  `${RAINBOW_TEXT.row8}`,
  `${i18n.t('points.rewards.claiming_your_reward')}`,
];

function SuccessText() {
  return (
    <Stack space="12px">
      <AnimatedText
        align="left"
        size="14pt mono"
        weight="bold"
        delay={0}
        color="green"
        textShadow="12px green"
      >
        {ROWS_TEXT[0]}
      </AnimatedText>
      <RainbowSlant />
      <AnimatedText
        align="left"
        size="14pt mono"
        weight="bold"
        delay={getDelayForRow(ROWS_TEXT, 8)}
        color="label"
        textShadow="12px label"
      >
        {ROWS_TEXT[9]}
      </AnimatedText>
    </Stack>
  );
}

function ErrorText({
  error,
  bridgeError,
}: {
  error?: PointsErrorType;
  bridgeError?: string;
}) {
  if (!error && !bridgeError) return null;
  const getMessage = () => {
    if (error) {
      return error === PointsErrorType.AlreadyClaimed
        ? i18n.t('points.rewards.already_claimed')
        : i18n.t('points.rewards.no_claim');
    }
    return bridgeError;
  };
  return (
    <AnimatedText
      align="left"
      size="14pt mono"
      weight="bold"
      delay={0}
      color="red"
      textShadow="12px red"
    >
      {getMessage()}
    </AnimatedText>
  );
}

function RainbowSlant() {
  return (
    <Box paddingTop="30px">
      <Stack space="12px">
        {Object.values(RAINBOW_TEXT).map((val, i) => {
          return (
            <Box key={`rainbow-text-${i}`} paddingLeft="4px">
              <AnimatedText
                align="left"
                size="14pt mono"
                weight="bold"
                delay={getDelayForRow(ROWS_TEXT, 0 + i)}
                rainbowColor
              >
                {val}
              </AnimatedText>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

function ClaimSummary({ amount, price }: { amount: string; price: string }) {
  return (
    <Box
      display="flex"
      as={motion.div}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.02, delay: 1, type: 'tween' }}
      flexDirection="column"
      justifyContent="space-between"
    >
      <ConsoleText color="green">
        {i18n.t('points.rewards.claim_complete')}
      </ConsoleText>
      <Box paddingVertical="44px">
        <Rows space="12px">
          <Row>
            <Columns>
              <Column>
                <ConsoleText color="accent">
                  {i18n.t('points.rewards.your_rewards')}
                </ConsoleText>
              </Column>
              <Column>
                <Box display="flex" justifyContent="flex-end">
                  <ConsoleText color="accent">{price}</ConsoleText>
                </Box>
              </Column>
            </Columns>
          </Row>
          <Row>
            <Columns>
              <Column>
                <ConsoleText color="label">
                  {i18n.t('points.rewards.in_eth')}
                </ConsoleText>
              </Column>
              <Column>
                <Box display="flex" justifyContent="flex-end">
                  <ConsoleText color="label">
                    {i18n.t('points.rewards.amount_in_eth', {
                      amount,
                    })}
                  </ConsoleText>
                </Box>
              </Column>
            </Columns>
          </Row>
        </Rows>
      </Box>
      <ConsoleText>{i18n.t('points.rewards.ready_to_spend')}</ConsoleText>
      <Box paddingVertical="30px">
        <ConsoleText>{i18n.t('points.rewards.keep_earning')}</ConsoleText>
      </Box>
      <ConsoleText>{i18n.t('points.rewards.use_rainbow')}</ConsoleText>
    </Box>
  );
}
