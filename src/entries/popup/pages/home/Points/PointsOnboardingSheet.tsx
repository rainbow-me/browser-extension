import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { metadataPostClient } from '~/core/graphql';
import {
  GetPointsOnboardChallengeQuery,
  PointsErrorType,
  PointsOnboardingCategory,
  ValidatePointsSignatureMutation,
} from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { KeychainType } from '~/core/types/keychainTypes';
import { convertAmountToNativeDisplay } from '~/core/utils/numbers';
import {
  AccentColorProvider,
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Stack,
  Text,
} from '~/design-system';
import { AnimatedText } from '~/design-system/components/AnimatedText/AnimatedText';
import { AnimatedTextRows } from '~/design-system/components/AnimatedText/AnimatedTextRows';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import {
  accentColorAsHsl,
  transparentAccentColorAsHsl20,
} from '~/design-system/styles/core.css';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { Spinner } from '~/entries/popup/components/Spinner/Spinner';
import { useCurrentWalletTypeAndVendor } from '~/entries/popup/hooks/useCurrentWalletType';
import { useDebounce } from '~/entries/popup/hooks/useDebounce';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWalletName } from '~/entries/popup/hooks/useWalletName';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import * as wallet from '../../../handlers/wallet';

import { seedPointsQueryCache } from './usePoints';
import { usePointsChallenge } from './usePointsChallenge';
import {
  RAINBOW_TEXT,
  RAINBOW_TEXT_WELCOME,
  getDelayForRow,
  getDelayForRows,
  getErrorString,
} from './utils';

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.5 } },
  exit: { opacity: 0, transition: { delay: 0.5 } },
};

const SiginAction = ({
  data,
  isWaitingForSignature,
  validatingSignature,
  signChallenge,
}: {
  data?: GetPointsOnboardChallengeQuery;
  isWaitingForSignature?: boolean;
  validatingSignature: boolean;
  signChallenge: () => void;
}) => {
  const { type } = useCurrentWalletTypeAndVendor();
  const isHardwareWallet = type === KeychainType.HardwareWalletKeychain;
  return (
    <Box
      as={motion.div}
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      key="signin_action-button"
    >
      <AccentColorProvider color="#00D348">
        <Button
          disabled={!data?.pointsOnboardChallenge}
          width="full"
          borderRadius="12px"
          onClick={signChallenge}
          color="accent"
          height="36px"
          variant="shadow"
        >
          <Text
            textShadow="12px accent"
            align="center"
            size="15pt"
            weight="heavy"
            color="accent"
          >
            {isWaitingForSignature && isHardwareWallet
              ? i18n.t('approve_request.confirm_hw')
              : i18n.t('points.onboarding.sign_in')}
          </Text>
          {(isWaitingForSignature || validatingSignature) && (
            <Box
              style={{
                boxShadow: `0px 0px 12px 0px ${accentColorAsHsl}`,
                backgroundColor: transparentAccentColorAsHsl20,
              }}
              borderRadius="10px"
            >
              <Spinner color="accent" />
            </Box>
          )}
        </Button>
      </AccentColorProvider>
    </Box>
  );
};

const RegistrationAction = ({
  data,
}: {
  data?: GetPointsOnboardChallengeQuery;
}) => {
  return (
    <Box
      as={motion.div}
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      key="action-button"
    >
      <Button
        disabled={!data?.pointsOnboardChallenge}
        width="full"
        borderRadius="12px"
        // onClick={registrationAction === 'swap' ? goToSwap : goToBuy}
        color="accent"
        height="36px"
        variant="shadow"
      >
        <Text
          align="center"
          size="15pt"
          weight="heavy"
          color="accent"
          textShadow="12px accent"
        >
          Continue
        </Text>
      </Button>
    </Box>
  );
};

export const PointsOnboardingSheet = () => {
  const navigate = useRainbowNavigate();
  const { currentAddress } = useCurrentAddressStore();
  const { displayName } = useWalletName({ address: currentAddress });
  const { state } = useLocation();

  const { data } = usePointsChallenge({
    address: currentAddress,
    referralCode: state.referralCode,
  });

  const backToHome = () =>
    navigate(ROUTES.HOME, {
      state: { skipTransitionOnRoute: ROUTES.HOME },
    });

  const {
    data: validSignatureResponse,
    error,
    mutate: validateSignature,
    isLoading: validatingSignature,
    isSuccess: accessGranted,
  } = useMutation<
    ValidatePointsSignatureMutation['onboardPoints'],
    PointsErrorType,
    { signature: string }
  >({
    mutationFn: async ({ signature }) => {
      const { onboardPoints } =
        await metadataPostClient.validatePointsSignature({
          address: currentAddress,
          signature,
          referral: state.referralCode,
        });
      if (onboardPoints?.error) throw onboardPoints.error.type;
      return onboardPoints;
    },
    onSuccess: (data) => {
      if (!data) return;
      seedPointsQueryCache(currentAddress, data);
    },
  });

  const userOnboarding = validSignatureResponse?.user.onboarding;

  const { mutate: signChallenge, isLoading: isWaitingForSignature } =
    useMutation({
      mutationFn: async () => {
        if (!data) return;
        return wallet.personalSign(data.pointsOnboardChallenge, currentAddress);
      },
      onSuccess: (signature) => {
        if (!signature) return;
        validateSignature({ signature });
      },
    });

  const debouncedAccessGranted = useDebounce(accessGranted, 9000);

  const userOnboardingCategories = useMemo(() => {
    const userCategories = userOnboarding?.categories?.reduce(
      (acc, current) => {
        acc[current.type] = current;
        return acc;
      },
      {} as Record<string, PointsOnboardingCategory>,
    );
    return userCategories;
  }, [userOnboarding?.categories]);

  const userHasEarnings = useMemo(() => {
    const userHasEarnings =
      userOnboardingCategories?.['rainbow-swaps'].data.usd_amount &&
      userOnboardingCategories?.['nft-collections'].data.owned_collections &&
      userOnboardingCategories?.['historic-balance'].data.usd_amount &&
      userOnboardingCategories?.['metamask-swaps'].data.usd_amount &&
      userOnboardingCategories?.['bonus'].earnings.total;
    return userHasEarnings;
  }, [userOnboardingCategories]);

  const showRegisteredCallToAction = useDebounce(
    accessGranted && !userHasEarnings,
    13000,
  );

  const loadingRowsText = useMemo(
    () =>
      [
        `> ${i18n.t('points.onboarding.authorization_required')}`,
        `> ${i18n.t('points.onboarding.sign_in_with_your_wallet')}`,
        `> ${i18n.t('points.onboarding.access_granted')}`,
        `${RAINBOW_TEXT.row1}`,
        `${RAINBOW_TEXT.row2}`,
        `${RAINBOW_TEXT.row3}`,
        `${RAINBOW_TEXT.row4}`,
        `${RAINBOW_TEXT.row5}`,
        `${RAINBOW_TEXT.row6}`,
        `${RAINBOW_TEXT.row7}`,
        `${RAINBOW_TEXT.row8}`,
        `${RAINBOW_TEXT_WELCOME.row1}`,
        `> ${getErrorString(error)}`,
      ].filter(Boolean),
    [error],
  );

  const rainbowText = useMemo(() => {
    const rnbwText = Object.values(RAINBOW_TEXT).map((val, i) => {
      return (
        <Box key={`loading-${i}`} paddingLeft="16px">
          <AnimatedText
            key={`loading-${i}`}
            align="left"
            size="15pt"
            weight="bold"
            delay={getDelayForRow(loadingRowsText, 2 + i)}
            rainbowColor
          >
            {val}
          </AnimatedText>
        </Box>
      );
    });

    const welcomeText = (
      <Box key={`loading-welcome`} paddingLeft="64px">
        <AccentColorProvider color="#fff">
          <AnimatedText
            textShadow="12px accent"
            align="left"
            size="15pt"
            weight="bold"
            color="accent"
            customTypingSpeed={0.15}
            delay={getDelayForRow(
              loadingRowsText,
              2 + Object.values(RAINBOW_TEXT).length,
            )}
          >
            {RAINBOW_TEXT_WELCOME.row1}
          </AnimatedText>
        </AccentColorProvider>
      </Box>
    );

    return rnbwText.concat(welcomeText);
  }, [loadingRowsText]);

  const consoleLoadingRows = useMemo(
    () =>
      [
        <AnimatedText
          textShadow="12px labelTertiary"
          key={'loading-1'}
          align="left"
          size="15pt"
          weight="bold"
          color="labelTertiary"
          delay={0}
        >
          {loadingRowsText[0]}
        </AnimatedText>,
        <AnimatedText
          textShadow="12px labelTertiary"
          key={'loading-2'}
          align="left"
          size="15pt"
          weight="bold"
          color="labelTertiary"
          delay={
            accessGranted || error ? 0 : getDelayForRow(loadingRowsText, 0)
          }
        >
          {loadingRowsText[1]}
        </AnimatedText>,
        accessGranted ? (
          <AccentColorProvider key={'loading-3'} color="#00D348">
            <AnimatedText
              textShadow="12px accent"
              key={'loading-3'}
              align="left"
              size="15pt"
              weight="bold"
              color="accent"
              delay={
                accessGranted || error ? 0 : getDelayForRow(loadingRowsText, 1)
              }
            >
              {loadingRowsText[2]}
            </AnimatedText>
          </AccentColorProvider>
        ) : undefined,
        accessGranted ? (
          <Box key={`loading-4-`} paddingTop="30px">
            <Stack space="15px">{rainbowText}</Stack>
          </Box>
        ) : undefined,
        error ? (
          <AnimatedText
            textShadow="12px label"
            key={'loading-4'}
            align="left"
            size="15pt"
            weight="bold"
            color="red"
            delay={0}
          >
            {loadingRowsText[loadingRowsText.length - 1]}
          </AnimatedText>
        ) : undefined,
      ]
        .flat()
        .filter(Boolean),
    [accessGranted, error, loadingRowsText, rainbowText],
  );

  const calculatingPointsRowsText = useMemo(
    () =>
      [
        [`> ${i18n.t('points.onboarding.calculating_points')}`, ''],
        [
          `${i18n.t('points.onboarding.rainbow_swaps')}`,
          `${convertAmountToNativeDisplay(
            userOnboardingCategories?.['rainbow-swaps'].data.usd_amount || 0,
            'USD',
          )}`,
        ],
        [
          `${i18n.t('points.onboarding.rainbow_nfts_owned')}`,
          `${userOnboardingCategories?.['nft-collections'].data.owned_collections} of ${userOnboardingCategories?.['nft-collections'].data.total_collections}`,
        ],
        [
          `${i18n.t('points.onboarding.wallet_balance')}`,
          `${convertAmountToNativeDisplay(
            userOnboardingCategories?.['historic-balance'].data.usd_amount || 0,
            'USD',
          )}`,
        ],
        [
          `${i18n.t('points.onboarding.metamask_swaps')}`,
          `${convertAmountToNativeDisplay(
            userOnboardingCategories?.['metamask-swaps'].data.usd_amount || 0,
            'USD',
          )}`,
        ],
        [
          `${i18n.t('points.onboarding.bonus_reward')}`,
          `+ ${userOnboardingCategories?.['bonus'].earnings.total}`,
        ],
        [`> ${i18n.t('points.onboarding.calculation_complete')}`, ''],
        [
          `${i18n.t('points.onboarding.points_earned')}`,
          `${userOnboarding?.earnings.total || 0}`,
        ],
      ].filter(Boolean),
    [userOnboarding?.earnings.total, userOnboardingCategories],
  );

  const calculatingPointsRows = useMemo(
    () =>
      [
        <Box key={'points-1'} paddingBottom="30px">
          <AnimatedText
            textShadow="12px label"
            align="left"
            size="16pt"
            weight="bold"
            color="labelTertiary"
            delay={0}
          >
            {calculatingPointsRowsText[0][0]}
          </AnimatedText>
        </Box>,
        <AccentColorProvider key={'points-2'} color="#00BFC6">
          <Box paddingBottom="15px">
            <Inline alignHorizontal="justify">
              <AnimatedText
                textShadow="12px label"
                align="left"
                size="15pt"
                weight="bold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 1, 0)}
              >
                {calculatingPointsRowsText[1][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px label"
                align="left"
                size="15pt"
                weight="bold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 1, 1)}
                direction="rightToLeft"
              >
                {calculatingPointsRowsText[1][1]}
              </AnimatedText>
            </Inline>
          </Box>
        </AccentColorProvider>,
        <AccentColorProvider key={'points-3'} color="#57EA5F">
          <Box paddingBottom="15px">
            <Inline alignHorizontal="justify">
              <AnimatedText
                textShadow="12px accent"
                align="left"
                size="15pt"
                weight="bold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 2, 0)}
              >
                {calculatingPointsRowsText[2][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px accent"
                align="left"
                size="15pt"
                weight="bold"
                color="accent"
                direction="rightToLeft"
                delay={getDelayForRows(calculatingPointsRowsText, 2, 1)}
              >
                {calculatingPointsRowsText[2][1]}
              </AnimatedText>
            </Inline>
          </Box>
        </AccentColorProvider>,
        <AccentColorProvider key={'points-4'} color="#F5D700">
          <Box paddingBottom="15px">
            <Inline alignHorizontal="justify">
              <AnimatedText
                textShadow="12px accent"
                align="left"
                size="15pt"
                weight="bold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 3, 0)}
              >
                {calculatingPointsRowsText[3][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px accent"
                align="left"
                size="15pt"
                weight="bold"
                color="accent"
                direction="rightToLeft"
                delay={getDelayForRows(calculatingPointsRowsText, 3, 1)}
              >
                {calculatingPointsRowsText[3][1]}
              </AnimatedText>
            </Inline>
          </Box>
        </AccentColorProvider>,
        <AccentColorProvider key={'points-5'} color="#F24527">
          <Box paddingBottom="15px">
            <Inline alignHorizontal="justify">
              <AnimatedText
                textShadow="12px accent"
                align="left"
                size="15pt"
                weight="bold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 4, 0)}
              >
                {calculatingPointsRowsText[4][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px accent"
                align="left"
                size="15pt"
                weight="bold"
                color="accent"
                direction="rightToLeft"
                delay={getDelayForRows(calculatingPointsRowsText, 4, 1)}
              >
                {calculatingPointsRowsText[4][1]}
              </AnimatedText>
            </Inline>
          </Box>
        </AccentColorProvider>,
        <AccentColorProvider key={'points-6'} color="#C54EAB">
          <Box paddingBottom="30px">
            <Inline alignHorizontal="justify">
              <AnimatedText
                textShadow="12px accent"
                align="left"
                size="15pt"
                weight="bold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 5, 0)}
              >
                {calculatingPointsRowsText[5][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px accent"
                align="left"
                size="15pt"
                weight="bold"
                color="accent"
                direction="rightToLeft"
                delay={getDelayForRows(calculatingPointsRowsText, 5, 1)}
              >
                {calculatingPointsRowsText[5][1]}
              </AnimatedText>
            </Inline>
          </Box>
        </AccentColorProvider>,
        <Box key={'points-7'} paddingBottom="15px">
          <AnimatedText
            textShadow="12px label"
            align="left"
            size="16pt"
            weight="bold"
            color="labelTertiary"
            delay={getDelayForRows(calculatingPointsRowsText, 6, 0)}
          >
            {calculatingPointsRowsText[6][0]}
          </AnimatedText>
        </Box>,
        userOnboarding?.earnings.total ? (
          <AccentColorProvider key={'points-8'} color="#FFFFFF">
            <Box paddingBottom="30px">
              <Inline alignHorizontal="justify">
                <AnimatedText
                  textShadow="12px accent"
                  align="left"
                  size="15pt"
                  weight="bold"
                  color="accent"
                  delay={getDelayForRows(calculatingPointsRowsText, 7, 0)}
                >
                  {calculatingPointsRowsText[7][0]}
                </AnimatedText>
                <AnimatedText
                  textShadow="12px accent"
                  align="left"
                  size="15pt"
                  weight="bold"
                  color="accent"
                  direction="rightToLeft"
                  delay={getDelayForRows(calculatingPointsRowsText, 7, 1)}
                >
                  {calculatingPointsRowsText[7][1]}
                </AnimatedText>
              </Inline>
            </Box>
          </AccentColorProvider>
        ) : undefined,
      ].filter(Boolean),
    [calculatingPointsRowsText, userOnboarding],
  );

  return (
    <BottomSheet zIndex={zIndexes.ACTIVITY_DETAILS} show>
      <Navbar leftComponent={<Navbar.CloseButton onClick={backToHome} />} />
      <Box style={{ height: '512px' }} height="full" padding="20px">
        <Rows alignVertical="justify">
          <Row>
            <Stack space="15px">
              <Inline space="4px">
                <Text
                  textShadow="12px label"
                  align="left"
                  size="16pt"
                  weight="bold"
                  color="labelTertiary"
                >
                  {i18n.t('points.onboarding.account')}
                </Text>
                <Text
                  textShadow="12px accent"
                  align="left"
                  size="15pt"
                  weight="bold"
                  color="accent"
                >
                  {displayName}
                </Text>
              </Inline>

              {!debouncedAccessGranted && (
                <AnimatedTextRows
                  customDelay={accessGranted || error ? 0 : undefined}
                  id="animated-loading-rows"
                  rows={consoleLoadingRows}
                  rowsText={loadingRowsText}
                  space="15px"
                />
              )}
              {debouncedAccessGranted && (
                <AnimatedTextRows
                  id="animated-calculating-rows"
                  rowsText={calculatingPointsRowsText.flat()}
                  rows={calculatingPointsRows}
                  space="15px"
                />
              )}
            </Stack>
          </Row>
          <Row height="content">
            <AnimatePresence mode="wait" initial={false}>
              {!accessGranted && (
                <SiginAction
                  data={data}
                  signChallenge={signChallenge}
                  isWaitingForSignature={isWaitingForSignature}
                  validatingSignature={validatingSignature}
                />
              )}
              {showRegisteredCallToAction && <RegistrationAction data={data} />}
            </AnimatePresence>
          </Row>
        </Rows>
      </Box>
    </BottomSheet>
  );
};
