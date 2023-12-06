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
  EXISTING_USER_ERROR,
  INVALID_REFERRAL_CODE_ERROR,
  USER_POINTS_CATEGORY,
  USER_POINTS_ONBOARDING,
} from './references';
import { usePointsChallenge } from './usePointsChallenge';

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.5 } },
  exit: { opacity: 0, transition: { delay: 0.5 } },
};

const getErrorString = (error: string) => {
  switch (error) {
    case EXISTING_USER_ERROR:
      return i18n.t('points.error.existing_user');
    case INVALID_REFERRAL_CODE_ERROR:
      return i18n.t('points.error.invalid_referral_code');
    default:
      return '';
  }
};

const consoleLoadingRows = ({
  accessGranted,
  error,
}: {
  accessGranted: boolean;
  error?: string | null;
}) => {
  return [
    <Text
      key={'loading-1'}
      align="left"
      size="14pt"
      weight="semibold"
      color="labelTertiary"
    >
      {`> ${i18n.t('points.onboarding.authorization_required')}`}
    </Text>,
    <Text
      key={'loading-2'}
      align="left"
      size="14pt"
      weight="semibold"
      color="labelTertiary"
    >
      {`> ${i18n.t('points.onboarding.sign_in_with_your_wallet')}`}
    </Text>,
    accessGranted ? (
      <Text
        key={'loading-3'}
        align="left"
        size="14pt"
        weight="semibold"
        color="green"
      >
        {`> ${i18n.t('points.onboarding.access_granted')}`}
      </Text>
    ) : undefined,
    error ? (
      <Text
        key={'loading-4'}
        align="left"
        size="14pt"
        weight="semibold"
        color="red"
      >
        {`> ${getErrorString(error)}`}
      </Text>
    ) : undefined,
  ].filter(Boolean);
};

const calculatingPointsRows = ({
  userOnboarding,
  userOnboardingCategories,
}: {
  userOnboarding?: USER_POINTS_ONBOARDING;
  userOnboardingCategories?: Record<CATEGORY_TYPE, USER_POINTS_CATEGORY>;
}) => {
  if (!userOnboarding || !userOnboardingCategories) return null;

  return [
    <Box key={'points-1'} paddingBottom="30px">
      <Text align="left" size="16pt" weight="semibold" color="labelTertiary">
        {`> ${i18n.t('points.onboarding.calculating_points')}`}
      </Text>
    </Box>,
    <AccentColorProvider key={'points-2'} color="#00BFC6">
      <Box paddingBottom="15px">
        <Inline alignHorizontal="justify">
          <Text align="left" size="14pt" weight="bold" color="accent">
            {`${i18n.t('points.onboarding.rainbow_swaps')}`}
          </Text>
          <Text align="left" size="14pt" weight="bold" color="accent">
            {convertAmountToNativeDisplayWithThreshold(
              userOnboardingCategories?.['rainbow-swaps'].data.usd_amount,
              'USD',
            )}
          </Text>
        </Inline>
      </Box>
    </AccentColorProvider>,
    <AccentColorProvider key={'points-3'} color="#57EA5F">
      <Box paddingBottom="15px">
        <Inline alignHorizontal="justify">
          <Text align="left" size="14pt" weight="semibold" color="accent">
            {`${i18n.t('points.onboarding.rainbow_nfts_owned')}`}
          </Text>
          <Text align="left" size="14pt" weight="semibold" color="accent">
            {`${userOnboardingCategories?.['nft-collections'].data.owned_collections} of ${userOnboardingCategories?.['nft-collections'].data.total_collections}`}
          </Text>
        </Inline>
      </Box>
    </AccentColorProvider>,
    <AccentColorProvider key={'points-4'} color="#F5D700">
      <Box paddingBottom="15px">
        <Inline alignHorizontal="justify">
          <Text align="left" size="14pt" weight="semibold" color="accent">
            {`${i18n.t('points.onboarding.wallet_balance')}`}
          </Text>
          <Text align="left" size="14pt" weight="semibold" color="accent">
            {convertAmountToNativeDisplayWithThreshold(
              userOnboardingCategories?.['historic-balance'].data.usd_amount,
              'USD',
            )}
          </Text>
        </Inline>
      </Box>
    </AccentColorProvider>,
    <AccentColorProvider key={'points-5'} color="#F24527">
      <Box paddingBottom="15px">
        <Inline alignHorizontal="justify">
          <Text align="left" size="14pt" weight="semibold" color="accent">
            {`${i18n.t('points.onboarding.metamask_swaps')}`}
          </Text>
          <Text align="left" size="14pt" weight="semibold" color="accent">
            {convertAmountToNativeDisplayWithThreshold(
              userOnboardingCategories?.['metamask-swaps'].data.usd_amount,
              'USD',
            )}
          </Text>
        </Inline>
      </Box>
    </AccentColorProvider>,
    <AccentColorProvider key={'points-6'} color="#C54EAB">
      <Box paddingBottom="30px">
        <Inline alignHorizontal="justify">
          <Text align="left" size="14pt" weight="semibold" color="accent">
            {`${i18n.t('points.onboarding.bonus_reward')}`}
          </Text>
          <Text align="left" size="14pt" weight="semibold" color="accent">
            + {userOnboardingCategories?.['bonus'].earnings.total}
          </Text>
        </Inline>
      </Box>
    </AccentColorProvider>,
    <Box key={'points-7'} paddingBottom="15px">
      <Text align="left" size="16pt" weight="semibold" color="labelTertiary">
        {`> ${i18n.t('points.onboarding.calculation_complete')}`}
      </Text>
    </Box>,
    userOnboarding.earnings.total ? (
      <AccentColorProvider key={'points-8'} color="#FFFFFF">
        <Box paddingBottom="30px">
          <Inline alignHorizontal="justify">
            <Text align="left" size="14pt" weight="semibold" color="accent">
              {`> ${i18n.t('points.onboarding.points_earned')}`}
            </Text>
            <Text align="left" size="14pt" weight="semibold" color="accent">
              {userOnboarding.earnings.total}
            </Text>
          </Inline>
        </Box>
      </AccentColorProvider>
    ) : undefined,
  ].filter(Boolean);
};

const registeringPointsRows = ({
  userOnboardingCategories,
}: {
  userOnboardingCategories?: Record<CATEGORY_TYPE, USER_POINTS_CATEGORY>;
}) => {
  if (!userOnboardingCategories) return null;

  return [
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
            {userOnboardingCategories['bonus'].earnings.total}
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
  ];
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 1, // Delay before starting to animate children
      staggerChildren: 1, // Delay between each child animation
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
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

  return (
    <BottomSheet zIndex={zIndexes.ACTIVITY_DETAILS} show>
      <Navbar leftComponent={<Navbar.BackButton onClick={backToHome} />} />
      <Box style={{ height: '400px' }} height="full" padding="20px">
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
                <Box
                  as={motion.div}
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <Stack space="15px">
                    {consoleLoadingRows({ accessGranted, error }).map(
                      (item, i) => (
                        <Box as={motion.div} key={i} variants={itemVariants}>
                          {item}
                        </Box>
                      ),
                    )}
                  </Stack>
                </Box>
              )}
              {debouncedAccessGranted && (
                <Box
                  as={motion.div}
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <Stack space="15px">
                    {(userHasEarnings
                      ? calculatingPointsRows({
                          userOnboarding,
                          userOnboardingCategories,
                        })
                      : registeringPointsRows({ userOnboardingCategories })
                    )?.map((item, i) => (
                      <Box as={motion.div} key={i} variants={itemVariants}>
                        {item}
                      </Box>
                    ))}
                  </Stack>
                </Box>
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
