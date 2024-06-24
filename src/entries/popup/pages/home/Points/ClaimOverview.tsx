import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { PointsErrorType } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
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
import { useWalletName } from '~/entries/popup/hooks/useWalletName';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import ConsoleText from './ConsoleText';
import { RAINBOW_TEXT, getDelayForRow } from './utils';

export function ClaimOverview({
  claimableAmount,
  claimableDisplay,
  goBack,
  error,
  preparingClaim,
  success,
  show,
}: {
  claimableAmount: string;
  claimableDisplay: string;
  goBack: () => void;
  error?: PointsErrorType | string;
  preparingClaim: boolean;
  success: boolean;
  show: boolean;
}) {
  const { currentAddress } = useCurrentAddressStore();
  const { displayName } = useWalletName({ address: currentAddress });

  const [waitToDisplay, setWaitToDisplay] = useState(true);
  const showSuccess = !waitToDisplay && success && preparingClaim && !error;

  useEffect(() => {
    setTimeout(() => setWaitToDisplay(false), 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BottomSheet zIndex={zIndexes.ACTIVITY_DETAILS} show={show}>
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
            {preparingClaim && <PreparingClaimText />}
            {showSuccess && <SuccessText />}
            {error && <ErrorText error={error} />}
            {!preparingClaim && (
              <ClaimSummary amount={claimableAmount} price={claimableDisplay} />
            )}
          </Stack>
        </Stack>

        {(!preparingClaim || error) && (
          <Button
            onClick={goBack}
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
  `\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0${i18n.t(
    'points.rewards.claiming_your_reward',
  )}`,
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

function ErrorText({ error }: { error?: string }) {
  if (!error) return null;
  const getMessage = () => {
    switch (error) {
      case PointsErrorType.AlreadyClaimed:
        return i18n.t('points.rewards.already_claimed');
      case PointsErrorType.NoClaim:
        return i18n.t('points.rewards.no_claim');
      default:
        return error;
    }
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
