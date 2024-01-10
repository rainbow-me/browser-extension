import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { PropsWithChildren, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { metadataPostClient } from '~/core/graphql';
import {
  GetPointsOnboardChallengeQuery,
  PointsErrorType,
  PointsOnboardingCategory,
  ValidatePointsSignatureMutation,
} from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { SUPPORTED_MAINNET_CHAINS } from '~/core/references';
import { useCurrentAddressStore } from '~/core/state';
import { KeychainType } from '~/core/types/keychainTypes';
import { formatNumber } from '~/core/utils/formatNumber';
import { convertAmountToNativeDisplay } from '~/core/utils/numbers';
import { goToNewTab } from '~/core/utils/tabs';
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
import { ButtonVariant } from '~/design-system/styles/designTokens';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { Spinner } from '~/entries/popup/components/Spinner/Spinner';
import { useCurrentWalletTypeAndVendor } from '~/entries/popup/hooks/useCurrentWalletType';
import { useDebounce } from '~/entries/popup/hooks/useDebounce';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWalletName } from '~/entries/popup/hooks/useWalletName';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import * as wallet from '../../../handlers/wallet';

import { copyReferralLink } from './PointsDashboard';
import { fetchPointsQuery, seedPointsQueryCache } from './usePoints';
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

const OnboardingButton = ({
  disabled,
  onClick,
  children,
  variant = 'shadow',
  color = 'accent',
}: PropsWithChildren<{
  disabled?: boolean;
  onClick: VoidFunction;
  variant?: ButtonVariant;
  color?: 'accent' | 'labelTertiary';
}>) => {
  return (
    <Box
      as={motion.div}
      variants={fadeVariants}
      transition={{ delay: 2 }}
      initial="initial"
      animate="animate"
      exit="exit"
      width="full"
    >
      <Button
        disabled={disabled}
        width="full"
        borderRadius="12px"
        onClick={onClick}
        color={color}
        height="36px"
        variant={variant}
      >
        <Text
          align="center"
          size="15pt"
          weight="heavy"
          color={color}
          textShadow={`12px ${color}`}
        >
          {children}
        </Text>
      </Button>
    </Box>
  );
};

const noBalanceRowsText = [
  `> ${i18n.t('points.onboarding.balance_required')}`,
  `${i18n.t('points.onboarding.ensure_you_have_a_balance_on')}`,
  ...SUPPORTED_MAINNET_CHAINS.filter(
    (c) => c.nativeCurrency.symbol === 'ETH',
  ).map((c) => `- ${c.name}`),
  `${i18n.t('points.onboarding.or_alternatively_balance_on')}`,
];
const noBalanceRows = [
  <AnimatedText
    textShadow="12px red"
    key={noBalanceRowsText[0]}
    align="left"
    size="14pt mono"
    weight="bold"
    color="red"
    delay={0}
  >
    {noBalanceRowsText[0]}
  </AnimatedText>,
  <AnimatedText
    textShadow="12px labelTertiary"
    key={noBalanceRowsText[1]}
    align="left"
    size="14pt mono"
    weight="bold"
    color="labelTertiary"
  >
    {noBalanceRowsText[1]}
  </AnimatedText>,
  <Stack space="12px" key="chains">
    {...noBalanceRowsText.slice(2, -1).map((text) => (
      <AnimatedText
        textShadow="12px labelTertiary"
        key={text}
        align="left"
        size="14pt mono"
        weight="bold"
        color="labelTertiary"
      >
        {text}
      </AnimatedText>
    ))}
  </Stack>,
  <AnimatedText
    textShadow="12px labelTertiary"
    key={noBalanceRowsText.at(-1)}
    align="left"
    size="14pt mono"
    weight="bold"
    color="labelTertiary"
  >
    {noBalanceRowsText.at(-1)}
  </AnimatedText>,
];

const shareRowsText = [
  `> ${i18n.t('points.onboarding.referral_link_ready')}`,
  `${i18n.t('points.onboarding.share_and_earn')}`,
  `${i18n.t('points.onboarding.plus_percent_of_refers')}`,
];
const shareRows = [
  <AnimatedText
    textShadow="12px labelTertiary"
    key={shareRowsText[0]}
    align="left"
    size="14pt mono"
    weight="bold"
    color="labelTertiary"
    delay={0}
  >
    {shareRowsText[0]}
  </AnimatedText>,
  <AnimatedText
    textShadow="12px accent"
    key={shareRowsText[1]}
    align="left"
    size="14pt mono"
    weight="bold"
    color="accent"
  >
    {shareRowsText[1]}
  </AnimatedText>,
  <AnimatedText
    textShadow="12px accent"
    key={shareRowsText[2]}
    align="left"
    size="14pt mono"
    weight="bold"
    color="accent"
  >
    {shareRowsText[2]}
  </AnimatedText>,
];

const doneRowsText = [
  `> ${i18n.t('points.onboarding.registration_complete')}`,
  `${i18n.t('points.onboarding.all_set')}`,
  `${i18n.t('points.onboarding.keep_earning_by')}`,
  `${i18n.t('points.onboarding.the_more_you_use')}`,
];
const doneRows = [
  <AccentColorProvider key={doneRowsText[0]} color="#00EE45">
    <AnimatedText
      textShadow="12px accent"
      align="left"
      size="14pt mono"
      weight="bold"
      color="accent"
      delay={0}
    >
      {doneRowsText[0]}
    </AnimatedText>
  </AccentColorProvider>,
  <AnimatedText
    textShadow="12px labelTertiary"
    key={doneRowsText[1]}
    align="left"
    size="14pt mono"
    weight="semibold"
    color="labelTertiary"
  >
    {doneRowsText[1]}
  </AnimatedText>,
  <AnimatedText
    textShadow="12px labelTertiary"
    key={doneRowsText[2]}
    align="left"
    size="14pt mono"
    weight="semibold"
    color="labelTertiary"
  >
    {doneRowsText[2]}
  </AnimatedText>,
  <AnimatedText
    textShadow="12px labelTertiary"
    key={doneRowsText[3]}
    align="left"
    size="14pt mono"
    weight="semibold"
    color="labelTertiary"
  >
    {doneRowsText[4]}
  </AnimatedText>,
];

export const PointsOnboardingSheet = () => {
  const navigate = useRainbowNavigate();
  const { currentAddress } = useCurrentAddressStore();
  const { displayName } = useWalletName({ address: currentAddress });
  const { state } = useLocation();

  const { data } = usePointsChallenge({
    address: currentAddress,
    referralCode: state?.referralCode,
  });

  const backToHome = () => {
    if (!!error && error !== PointsErrorType.ExistingUser) {
      // if some unexpected error happened that stopped the user from onboarding,
      // and was not "existing user" error, then we should try to refetch its points query
      // sometimes it goes thru but the server returns something weird
      // and when the user try onboarding again it errors with "existing user"
      fetchPointsQuery(currentAddress);
    }
    navigate(ROUTES.HOME, {
      state: { tab: 'points', skipTransitionOnRoute: ROUTES.HOME },
    });
  };

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
      if (onboardPoints?.error?.type === PointsErrorType.NoBalance)
        setStep('no balance');
      if (!onboardPoints) throw 'validatePointsSignature: Unexpected error'; // sometimes the server just returns null, like when the signature is invalid
      if (onboardPoints.error) throw onboardPoints.error.type;
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
        <Box key={`loading-${i}`} paddingLeft="4px">
          <AnimatedText
            align="left"
            size="14pt mono"
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
      <AccentColorProvider color="#fff" key={`loading-welcome`}>
        <AnimatedText
          textShadow="12px accent"
          align="center"
          size="14pt mono"
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
          size="14pt mono"
          weight="semibold"
          color="labelTertiary"
          delay={0}
        >
          {loadingRowsText[0]}
        </AnimatedText>,
        <AnimatedText
          textShadow="12px labelTertiary"
          key={'loading-2'}
          align="left"
          size="14pt mono"
          weight="semibold"
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
              size="14pt mono"
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
            size="14pt mono"
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
            size="14pt mono"
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
                size="14pt mono"
                weight="bold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 1, 0)}
              >
                {calculatingPointsRowsText[1][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px label"
                align="left"
                size="14pt mono"
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
                size="14pt mono"
                weight="bold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 2, 0)}
              >
                {calculatingPointsRowsText[2][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px accent"
                align="left"
                size="14pt mono"
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
                size="14pt mono"
                weight="bold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 3, 0)}
              >
                {calculatingPointsRowsText[3][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px accent"
                align="left"
                size="14pt mono"
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
                size="14pt mono"
                weight="bold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 4, 0)}
              >
                {calculatingPointsRowsText[4][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px accent"
                align="left"
                size="14pt mono"
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
                size="14pt mono"
                weight="bold"
                color="accent"
                delay={getDelayForRows(calculatingPointsRowsText, 5, 0)}
              >
                {calculatingPointsRowsText[5][0]}
              </AnimatedText>
              <AnimatedText
                textShadow="12px accent"
                align="left"
                size="14pt mono"
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
            size="14pt mono"
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
                  size="14pt mono"
                  weight="bold"
                  color="accent"
                  delay={getDelayForRows(calculatingPointsRowsText, 7, 0)}
                >
                  {calculatingPointsRowsText[7][0]}
                </AnimatedText>
                <AnimatedText
                  textShadow="12px accent"
                  align="left"
                  size="14pt mono"
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

  const [step, setStep] = useState<
    'welcome' | 'calculating' | 'share' | 'done' | 'no balance'
  >('welcome');

  if (debouncedAccessGranted && step === 'welcome') setStep('calculating');

  const onShare = () => {
    if (!validSignatureResponse || !userOnboarding) return;
    setStep('done');
    metadataPostClient.redeemCodeForPoints({
      address: currentAddress,
      redemptionCode: 'TWITTERSHARED',
    });
    const referralCode = validSignatureResponse.user.referralCode;
    const metamaskBonus =
      userOnboarding.categories?.find((c) => c.type === 'metamask-swaps')
        ?.earnings.total || 0;

    const tweet = i18n.t(
      metamaskBonus
        ? 'points.onboarding.share_tweet_with_metamask_bonus'
        : 'points.onboarding.share_tweet',
      {
        points: formatNumber(userOnboarding.earnings.total - metamaskBonus, {
          maximumSignificantDigits: 6,
        }),
        metamaskBonus: formatNumber(metamaskBonus, {
          maximumSignificantDigits: 6,
        }),
        referralCode,
      },
    );
    goToNewTab({
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`,
    });
    copyReferralLink(referralCode);
  };

  return (
    <BottomSheet zIndex={zIndexes.ACTIVITY_DETAILS} show>
      <Navbar leftComponent={<Navbar.CloseButton onClick={backToHome} />} />
      <Box style={{ height: '512px' }} height="full" padding="20px">
        <Rows alignVertical="justify">
          <Row>
            <Stack space="15px">
              <Inline space="4px" alignVertical="center" wrap={false}>
                <Text
                  textShadow="12px labelTertiary"
                  align="left"
                  size="14pt mono"
                  weight="semibold"
                  color="labelTertiary"
                  fontFamily="mono"
                >
                  {i18n.t('points.onboarding.account')}
                </Text>
                <Text
                  textShadow="12px accent"
                  align="left"
                  size="14pt mono"
                  weight="bold"
                  color="accent"
                  fontFamily="mono"
                >
                  {displayName}
                </Text>
              </Inline>

              {step === 'welcome' && (
                <AnimatedTextRows
                  customDelay={accessGranted || error ? 0 : undefined}
                  id="animated-loading-rows"
                  rows={consoleLoadingRows}
                  rowsText={loadingRowsText}
                  space="15px"
                />
              )}
              {step === 'calculating' && (
                <AnimatedTextRows
                  id="animated-calculating-rows"
                  rowsText={calculatingPointsRowsText.flat()}
                  rows={calculatingPointsRows}
                  space="15px"
                />
              )}
              {step === 'share' && (
                <AnimatedTextRows
                  id="animated-share-rows"
                  rows={shareRows}
                  rowsText={shareRowsText}
                  space="44px"
                />
              )}
              {step === 'done' && (
                <AnimatedTextRows
                  id="animated-done-rows"
                  rows={doneRows}
                  rowsText={doneRowsText}
                  space="35px"
                />
              )}
              {step === 'no balance' && (
                <AnimatedTextRows
                  id="animated-no balance-rows"
                  rows={noBalanceRows}
                  rowsText={noBalanceRowsText}
                  space="35px"
                />
              )}
            </Stack>
          </Row>
          <Row height="content">
            <AnimatePresence mode="wait" initial={false}>
              {step === 'welcome' && !accessGranted && (
                <SiginAction
                  data={data}
                  signChallenge={signChallenge}
                  isWaitingForSignature={isWaitingForSignature}
                  validatingSignature={validatingSignature}
                />
              )}
              {step === 'calculating' && (
                <OnboardingButton onClick={() => setStep('share')}>
                  {i18n.t('common_actions.continue')}
                </OnboardingButton>
              )}
              {step === 'share' && (
                <Inline space="15px" wrap={false}>
                  <OnboardingButton
                    onClick={() => setStep('done')}
                    color="labelTertiary"
                    variant="stroked"
                  >
                    {i18n.t('skip')}
                  </OnboardingButton>
                  <OnboardingButton onClick={onShare}>
                    {i18n.t('points.onboarding.share')}
                  </OnboardingButton>
                </Inline>
              )}
              {step === 'done' && (
                <OnboardingButton onClick={backToHome}>
                  {i18n.t('done')}
                </OnboardingButton>
              )}
              {step === 'no balance' && (
                <OnboardingButton
                  onClick={() =>
                    navigate(ROUTES.BUY, { state: { backTo: ROUTES.HOME } })
                  }
                >
                  {i18n.t('points.onboarding.fund_my_wallet')}
                </OnboardingButton>
              )}
            </AnimatePresence>
          </Row>
        </Rows>
      </Box>
    </BottomSheet>
  );
};
