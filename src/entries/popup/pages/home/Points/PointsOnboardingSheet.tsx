import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { metadataPostClient } from '~/core/graphql';
import { i18n } from '~/core/languages';
import {
  selectUserAssetsBalance,
  selectorFilterByUserChains,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import {
  convertAmountToNativeDisplayWithThreshold,
  isZero,
} from '~/core/utils/numbers';
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
import {
  accentColorAsHsl,
  transparentAccentColorAsHsl20,
  transparentAccentColorAsHsl60,
} from '~/design-system/styles/core.css';
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
  const debouncedAccessGranted = useDebounce(accessGranted, 3000);

  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data: totalAssetsBalance } = useUserAssets(
    { address: currentAddress, currency },
    {
      select: (data) =>
        selectorFilterByUserChains<string>({
          data,
          selector: selectUserAssetsBalance,
        }),
    },
  );

  const registrationAction =
    totalAssetsBalance && isZero(totalAssetsBalance) ? 'buy' : 'swap';

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
    6000,
  );

  const { data } = usePointsChallenge({
    address: currentAddress,
    referralCode: state.referralCode,
  });

  const backToHome = () =>
    navigate(ROUTES.HOME, {
      state: { skipTransitionOnRoute: ROUTES.HOME },
    });

  const goToBuy = () => {
    backToHome();
    navigate(ROUTES.BUY);
  };

  const goToSwap = () => {
    backToHome();
    navigate(ROUTES.SWAP);
  };

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
        `> ${i18n.t('points.onboarding.access_granted')}`,
        `> ${getErrorString(error)}`,
      ].filter(Boolean),
    [error],
  );

  const consoleLoadingRows = useMemo(
    () =>
      [
        <AnimatedText
          textShadow="12px label text"
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
          textShadow="12px label text"
          key={'loading-2'}
          align="left"
          size="14pt"
          weight="semibold"
          color="labelTertiary"
          delay={
            accessGranted || error ? 0 : getDelayForRow(loadingRowsText, 0)
          }
        >
          {loadingRowsText[1]}
        </AnimatedText>,
        accessGranted ? (
          <AnimatedText
            textShadow="12px label text"
            key={'loading-3'}
            align="left"
            size="14pt"
            weight="semibold"
            color="green"
            delay={
              accessGranted || error ? 0 : getDelayForRow(loadingRowsText, 1)
            }
          >
            {loadingRowsText[2]}
          </AnimatedText>
        ) : undefined,
        error ? (
          <AnimatedText
            textShadow="12px label text"
            key={'loading-4'}
            align="left"
            size="14pt"
            weight="semibold"
            color="red"
            delay={0}
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
        [
          `${i18n.t('points.onboarding.points_earned')}`,
          `${userOnboarding?.earnings.total || 0}`,
        ],
      ].filter(Boolean),
    [userOnboarding?.earnings.total, userOnboardingCategories],
  );

  const registeringPointsRowsText = useMemo(
    () => [
      [`> ${i18n.t('points.onboarding.registration_complete')}`, ''],
      [
        `${i18n.t('points.onboarding.bonus_points')}`,
        `${userOnboardingCategories?.['bonus'].earnings.total}`,
      ],
      [
        i18n.t(
          `points.onboarding.${
            registrationAction === 'swap'
              ? 'claim_description_swap'
              : 'claim_description_buy'
          }`,
        ),
        '',
      ],
    ],
    [registrationAction, userOnboardingCategories],
  );
  const registeringPointsRows = useMemo(
    () => [
      <AccentColorProvider key={'points-1'} color="#00D348">
        <Box paddingBottom="30px">
          <AnimatedText
            textShadow="12px accent text"
            align="left"
            size="16pt"
            weight="semibold"
            color="accent"
            delay={0}
          >
            {registeringPointsRowsText[0][0]}
          </AnimatedText>
        </Box>
      </AccentColorProvider>,
      <AccentColorProvider key={'points-2'} color="#C54EAB">
        <Box paddingBottom="30px">
          <Inline alignHorizontal="justify">
            <AnimatedText
              textShadow="12px accent text"
              align="left"
              size="14pt"
              weight="semibold"
              color="accent"
              delay={getDelayForRows(registeringPointsRowsText, 1, 0)}
            >
              {registeringPointsRowsText[1][0]}
            </AnimatedText>
            <AnimatedText
              textShadow="12px accent text"
              align="left"
              size="14pt"
              weight="semibold"
              color="accent"
              direction="rightToLeft"
              delay={getDelayForRows(registeringPointsRowsText, 1, 1)}
            >
              {registeringPointsRowsText[1][1]}
            </AnimatedText>
          </Inline>
        </Box>
      </AccentColorProvider>,
      <AnimatedText
        textShadow="12px label text"
        key={'points-2'}
        align="left"
        size="14pt"
        weight="semibold"
        color="labelTertiary"
        customTypingSpeed={0.05}
        delay={getDelayForRows(registeringPointsRowsText, 2, 0)}
      >
        {registeringPointsRowsText[2][0]}
      </AnimatedText>,
    ],
    [registeringPointsRowsText],
  );

  const calculatingPointsRows = useMemo(
    () =>
      [
        <Box key={'points-1'} paddingBottom="30px">
          <AnimatedText
            textShadow="12px label text"
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
                textShadow="12px label text"
                align="left"
                size="14pt"
                weight="bold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 1, 0)}
              >
                {calculatingPointsRowsText[1][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px label text"
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
                textShadow="12px accent text"
                align="left"
                size="14pt"
                weight="semibold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 2, 0)}
              >
                {calculatingPointsRowsText[2][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px accent text"
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
                textShadow="12px accent text"
                align="left"
                size="14pt"
                weight="semibold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 3, 0)}
              >
                {calculatingPointsRowsText[3][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px accent text"
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
                textShadow="12px accent text"
                align="left"
                size="14pt"
                weight="semibold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 4, 0)}
              >
                {calculatingPointsRowsText[4][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px accent text"
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
                textShadow="12px accent text"
                align="left"
                size="14pt"
                weight="semibold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 5, 0)}
              >
                {calculatingPointsRowsText[5][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px accent text"
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
            textShadow="12px label text"
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
                  textShadow="12px accent text"
                  align="left"
                  size="14pt"
                  weight="semibold"
                  color="accent"
                  delay={getDelayForRows(calculatingPointsRowsText, 7, 0)}
                >
                  {calculatingPointsRowsText[7][0]}
                </AnimatedText>
                <AnimatedText
                  textShadow="12px accent text"
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
                  textShadow="12px label text"
                  align="left"
                  size="16pt"
                  weight="semibold"
                  color="labelTertiary"
                >
                  {i18n.t('points.onboarding.account')}
                </Text>
                <Text
                  textShadow="12px accent text"
                  align="left"
                  size="14pt"
                  weight="semibold"
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
                  rowsText={(userHasEarnings
                    ? calculatingPointsRowsText
                    : registeringPointsRowsText
                  ).flat()}
                  rows={
                    userHasEarnings
                      ? calculatingPointsRows
                      : registeringPointsRows
                  }
                  space="15px"
                />
              )}
            </Stack>
          </Row>
          {!debouncedAccessGranted && (
            <Row height="content">
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
                    textShadow="12px accent text"
                    align="center"
                    size="14pt"
                    weight="heavy"
                    color="accent"
                  >
                    {i18n.t('points.onboarding.sign_in')}
                  </Text>
                  {validatingSignature && (
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
                    onClick={registrationAction === 'swap' ? goToSwap : goToBuy}
                    color="accent"
                    height="36px"
                    variant="shadow"
                  >
                    <Inline
                      alignHorizontal="center"
                      alignVertical="center"
                      space="4px"
                    >
                      <Box
                        style={{
                          boxShadow: `0px 0px 12px 0px ${transparentAccentColorAsHsl60}`,
                        }}
                        borderRadius="10px"
                        background="transparent"
                      >
                        <Symbol
                          size={18}
                          color="accent"
                          weight="medium"
                          symbol="plus.circle.fill"
                        />
                      </Box>
                      <Text
                        align="center"
                        size="14pt"
                        weight="heavy"
                        color="accent"
                        textShadow="12px accent text"
                      >
                        {i18n.t(
                          `points.onboarding.${
                            registrationAction === 'swap'
                              ? 'try_swap'
                              : 'get_eth'
                          }`,
                        )}
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
