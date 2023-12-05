import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { metadataPostClient } from '~/core/graphql';
import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { convertAmountToNativeDisplayWithThreshold } from '~/core/utils/numbers';
import {
  AccentColorProvider,
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { AnimatedText } from '~/design-system/components/AnimatedText/AnimatedText';
import { AnimatedTextRows } from '~/design-system/components/AnimatedText/AnimatedTextRows';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { Spinner } from '~/entries/popup/components/Spinner/Spinner';
import { useDebounce } from '~/entries/popup/hooks/useDebounce';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWalletName } from '~/entries/popup/hooks/useWalletName';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import * as wallet from '../../../handlers/wallet';

import {
  CATEGORY_TYPE,
  USER_POINTS_CATEGORY,
  USER_POINTS_ONBOARDING,
} from './references';
import { usePointsChallenge } from './usePointsChallenge';
import { getDelayForRow, getDelayForRows, getErrorString } from './utils';

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.5 } },
  exit: { opacity: 0, transition: { delay: 0.5 } },
};

export const PointsOnboardingSheet = () => {
  const navigate = useRainbowNavigate();
  const { currentAddress } = useCurrentAddressStore();
  const { displayName } = useWalletName({ address: currentAddress });
  const { state } = useLocation();
  const [validatingSignature, setValidatingSignature] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [error, setError] = useState<null | string>();
  const [userOnboarding, setUserOnboarding] =
    useState<USER_POINTS_ONBOARDING>();
  const debouncedAccessGranted = useDebounce(accessGranted, 1000);

  const userOnboardingCategories = useMemo(() => {
    const userCategories = userOnboarding?.categories?.reduce(
      (acc, current) => {
        acc[current.type] = current;
        return acc;
      },
      {} as Record<CATEGORY_TYPE, USER_POINTS_CATEGORY>,
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
    4000,
  );

  const { data } = usePointsChallenge({
    address: currentAddress,
    referralCode: state.referralCode,
  });

  const backToHome = () =>
    navigate(ROUTES.HOME, {
      state: { skipTransitionOnRoute: ROUTES.HOME },
    });

  const signChallenge = useCallback(async () => {
    if (data?.pointsOnboardChallenge) {
      setValidatingSignature(true);
      try {
        const signature = await wallet.personalSign(
          data?.pointsOnboardChallenge,
          currentAddress,
        );
        const valid = await metadataPostClient.validatePointsSignature({
          address: currentAddress,
          signature,
          referral: state.referralCode,
        });
        if (valid.onboardPoints?.error) {
          const error = valid.onboardPoints.error.type;
          setError(error);
        } else if (valid.onboardPoints?.user) {
          setUserOnboarding(
            valid.onboardPoints.user.onboarding as USER_POINTS_ONBOARDING,
          );
          setAccessGranted(true);
        }
      } catch (e) {
        //
      } finally {
        setValidatingSignature(false);
      }
    }
  }, [currentAddress, data?.pointsOnboardChallenge, state.referralCode]);

  const loadingRowsText = useMemo(
    () =>
      [
        `> ${i18n.t('points.onboarding.authorization_required')}`,
        `> ${i18n.t('points.onboarding.sign_in_with_your_wallet')}`,
        `> ${i18n.t('points.onboarding.sign_in_with_your_wallet')}`,
        `> ${i18n.t('points.onboarding.access_granted')}`,
        accessGranted
          ? `> ${i18n.t('points.onboarding.access_granted')}`
          : null,
        error ? `> ${getErrorString(error)}` : null,
      ].filter(Boolean),
    [accessGranted, error],
  );

  const consoleLoadingRows = useMemo(
    () =>
      [
        <AnimatedText
          key={'loading-1'}
          align="left"
          size="14pt"
          weight="semibold"
          color="labelTertiary"
          delay={0}
        >
          {loadingRowsText[0]}
        </AnimatedText>,
        <AnimatedText
          key={'loading-2'}
          align="left"
          size="14pt"
          weight="semibold"
          color="labelTertiary"
          delay={getDelayForRow(loadingRowsText, 0)}
        >
          {loadingRowsText[1]}
        </AnimatedText>,
        accessGranted ? (
          <AnimatedText
            key={'loading-3'}
            align="left"
            size="14pt"
            weight="semibold"
            color="green"
            delay={getDelayForRow(loadingRowsText, 1)}
          >
            {loadingRowsText[2]}
          </AnimatedText>
        ) : undefined,
        error ? (
          <AnimatedText
            key={'loading-4'}
            align="left"
            size="14pt"
            weight="semibold"
            color="red"
            delay={getDelayForRow(loadingRowsText, 2)}
          >
            {loadingRowsText[3]}
          </AnimatedText>
        ) : undefined,
      ].filter(Boolean),
    [accessGranted, error, loadingRowsText],
  );

  const calculatingPointsRowsText = useMemo(
    () =>
      [
        [`> ${i18n.t('points.onboarding.calculating_points')}`, ''],
        [
          `${i18n.t('points.onboarding.rainbow_swaps')}`,
          `${convertAmountToNativeDisplayWithThreshold(
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
          `${convertAmountToNativeDisplayWithThreshold(
            userOnboardingCategories?.['historic-balance'].data.usd_amount || 0,
            'USD',
          )}`,
        ],
        [
          `${i18n.t('points.onboarding.metamask_swaps')}`,
          `${convertAmountToNativeDisplayWithThreshold(
            userOnboardingCategories?.['metamask-swaps'].data.usd_amount || 0,
            'USD',
          )}`,
        ],
        [
          `${i18n.t('points.onboarding.bonus_reward')}`,
          `+ ${userOnboardingCategories?.['bonus'].earnings.total}`,
        ],
        [`> ${i18n.t('points.onboarding.calculation_complete')}`, ''],
        userOnboarding?.earnings.total
          ? [
              `${i18n.t('points.onboarding.points_earned')}`,
              `${userOnboarding?.earnings.total}`,
            ]
          : null,
      ].filter(Boolean),
    [userOnboarding?.earnings.total, userOnboardingCategories],
  );

  const registeringPointsRows = useMemo(
    () => [
      <AccentColorProvider key={'points-1'} color="green">
        <Box paddingBottom="30px">
          <Text align="left" size="16pt" weight="semibold" color="accent">
            {`> ${i18n.t('points.onboarding.registration_complete')}`}
          </Text>
        </Box>
      </AccentColorProvider>,
      <AccentColorProvider key={'points-2'} color="#C54EAB">
        <Box paddingBottom="30px">
          <Inline alignHorizontal="justify">
            <Text align="left" size="14pt" weight="semibold" color="accent">
              {i18n.t('points.onboarding.bonus_points')}
            </Text>
            <Text align="left" size="14pt" weight="semibold" color="accent">
              {userOnboardingCategories?.['bonus'].earnings.total}
            </Text>
          </Inline>
        </Box>
      </AccentColorProvider>,
      <Text
        key={'points-2'}
        align="left"
        size="14pt"
        weight="semibold"
        color="labelTertiary"
      >
        {i18n.t('points.onboarding.claim_description')}
      </Text>,
    ],
    [userOnboardingCategories],
  );

  const calculatingPointsRows = useMemo(
    () =>
      [
        <Box key={'points-1'} paddingBottom="30px">
          <AnimatedText
            align="left"
            size="16pt"
            weight="semibold"
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
                align="left"
                size="14pt"
                weight="bold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 1, 0)}
              >
                {calculatingPointsRowsText[1][0]}
              </AnimatedText>
              <AnimatedText
                align="left"
                size="14pt"
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
                align="left"
                size="14pt"
                weight="semibold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 2, 0)}
              >
                {calculatingPointsRowsText[2][0]}
              </AnimatedText>
              <AnimatedText
                align="left"
                size="14pt"
                weight="semibold"
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
                align="left"
                size="14pt"
                weight="semibold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 3, 0)}
              >
                {calculatingPointsRowsText[3][0]}
              </AnimatedText>
              <AnimatedText
                align="left"
                size="14pt"
                weight="semibold"
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
                align="left"
                size="14pt"
                weight="semibold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 4, 0)}
              >
                {calculatingPointsRowsText[4][0]}
              </AnimatedText>
              <AnimatedText
                align="left"
                size="14pt"
                weight="semibold"
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
                align="left"
                size="14pt"
                weight="semibold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 5, 0)}
              >
                {calculatingPointsRowsText[5][0]}
              </AnimatedText>
              <AnimatedText
                align="left"
                size="14pt"
                weight="semibold"
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
            align="left"
            size="16pt"
            weight="semibold"
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
                  align="left"
                  size="14pt"
                  weight="semibold"
                  color="accent"
                  delay={getDelayForRows(calculatingPointsRowsText, 7, 0)}
                >
                  {calculatingPointsRowsText[7][0]}
                </AnimatedText>
                <AnimatedText
                  align="left"
                  size="14pt"
                  weight="semibold"
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
      <Navbar leftComponent={<Navbar.BackButton onClick={backToHome} />} />
      <Box style={{ height: '500px' }} height="full" padding="20px">
        <Rows alignVertical="justify">
          <Row>
            <Stack space="15px">
              <Inline space="4px">
                <Text
                  align="left"
                  size="16pt"
                  weight="semibold"
                  color="labelTertiary"
                >
                  {i18n.t('points.onboarding.account')}
                </Text>
                <Text align="left" size="14pt" weight="semibold" color="accent">
                  {displayName}
                </Text>
              </Inline>

              {!debouncedAccessGranted && (
                <AnimatedTextRows
                  id="animated-loading-rows"
                  rows={consoleLoadingRows}
                  rowsText={loadingRowsText}
                />
              )}
              {debouncedAccessGranted && (
                <AnimatedTextRows
                  id="animated-calculating-rows"
                  rowsText={calculatingPointsRowsText.flat()}
                  rows={
                    userHasEarnings
                      ? calculatingPointsRows?.filter(Boolean)
                      : registeringPointsRows
                  }
                />
              )}
            </Stack>
          </Row>
          {!debouncedAccessGranted && (
            <Row height="content">
              <Box>
                <Button
                  disabled={!data?.pointsOnboardChallenge}
                  width="full"
                  borderRadius="12px"
                  onClick={signChallenge}
                  color="green"
                  height="36px"
                  variant="stroked"
                >
                  <Text align="center" size="14pt" weight="heavy" color="green">
                    {i18n.t('points.onboarding.sign_in')}
                  </Text>
                  {validatingSignature && <Spinner color="green" />}
                </Button>
              </Box>
            </Row>
          )}
          <Row height="content">
            <AnimatePresence mode="wait" initial={false}>
              {showRegisteredCallToAction && (
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
                    onClick={signChallenge}
                    color="accent"
                    height="36px"
                    variant="stroked"
                  >
                    <Inline
                      alignHorizontal="center"
                      alignVertical="center"
                      space="4px"
                    >
                      <Symbol
                        size={18}
                        color="accent"
                        weight="medium"
                        symbol="plus.circle.fill"
                      />
                      <Text
                        align="center"
                        size="14pt"
                        weight="heavy"
                        color="accent"
                      >
                        {i18n.t('points.onboarding.get_eth')}
                      </Text>
                    </Inline>
                  </Button>
                </Box>
              )}
            </AnimatePresence>
          </Row>
        </Rows>
      </Box>
    </BottomSheet>
  );
};
