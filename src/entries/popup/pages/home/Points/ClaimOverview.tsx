import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

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
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWalletName } from '~/entries/popup/hooks/useWalletName';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import ConsoleText from './ConsoleText';
import { usePoints } from './usePoints';
import { RAINBOW_TEXT, getDelayForRow, getWeeklyEarnings } from './utils';

export function ClaimOverview() {
  const [success, setSuccess] = useState(false);
  //   const [error, setError] = useState<string | undefined>();
  const [showSummary, setShowSummary] = useState(false);
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
    return getWeeklyEarnings(points);
  }, [points]);

  useEffect(() => {
    setTimeout(() => setSuccess(true), 5000);
    setTimeout(() => setShowSummary(true), 10000);
  }, []);

  const showPreparingClaim = !showSummary;
  const showSuccess = success && !showSummary;

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
            {showSummary && <ClaimSummary />}
          </Stack>
        </Stack>

        {showSummary && (
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
              {'Done'}
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
      <ConsoleText>{`> Counting earned points...`}</ConsoleText>
      <ConsoleText>{`> Calculating your referrals...`}</ConsoleText>
      <ConsoleText>{`> Allocating your earnings...`}</ConsoleText>
    </>
  );
}

const ROWS_TEXT = [
  `> Your reward is ready`,
  `${RAINBOW_TEXT.row1}`,
  `${RAINBOW_TEXT.row2}`,
  `${RAINBOW_TEXT.row3}`,
  `${RAINBOW_TEXT.row4}`,
  `${RAINBOW_TEXT.row5}`,
  `${RAINBOW_TEXT.row6}`,
  `${RAINBOW_TEXT.row7}`,
  `${RAINBOW_TEXT.row8}`,
  `\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0CLAIMING YOUR REWARD`,
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

function ClaimSummary() {
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
      <ConsoleText color="green">{`> Claim Complete`}</ConsoleText>
      <Box paddingVertical="44px">
        <Rows>
          <Row>
            <Columns>
              <Column>
                <ConsoleText color="pink">{'Your reward'}</ConsoleText>
              </Column>
              <Column>
                <Box display="flex" justifyContent="flex-end">
                  <ConsoleText color="pink">{'+ 0.2 Base ETH'}</ConsoleText>
                </Box>
              </Column>
            </Columns>
          </Row>
        </Rows>
      </Box>
      <ConsoleText>{`Your ETH is in your wallet and ready to spend. You're all set.`}</ConsoleText>
      <Box paddingVertical="30px">
        <ConsoleText>{`Keep earning points and your share of Rainbow rewards by swapping, bridging, minting, referring friends, and more`}</ConsoleText>
      </Box>
      <ConsoleText>{`The more you use Rainbow, the more you'll be rewarded`}</ConsoleText>
    </Box>
  );
}
