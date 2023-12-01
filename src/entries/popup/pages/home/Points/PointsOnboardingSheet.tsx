import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { metadataPostClient } from '~/core/graphql';
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
  CATEGORY_DISPLAY_TYPE,
  CATEGORY_TYPE,
  EXISTING_USER_ERROR,
  INVALID_REFERRAL_CODE_ERROR,
  USER_POINTS_CATEGORY,
  USER_POINTS_ONBOARDING,
} from './references';
import { usePointsChallenge } from './usePointsChallenge';

const getErrorString = (error: string) => {
  switch (error) {
    case EXISTING_USER_ERROR:
      return 'Existing user';
    case INVALID_REFERRAL_CODE_ERROR:
      return 'Invalid referral code';
    default:
      return '';
  }
};

const DUMMY_USER = {
  categories: [
    {
      data: {
        owned_collections: 0,
        total_collections: 0,
        usd_amount: 1,
      },
      type: 'metamask-swaps' as CATEGORY_TYPE,
      display_type: 'USD_AMOUNT' as CATEGORY_DISPLAY_TYPE,
      earnings: { total: 0 },
    },
    {
      data: {
        owned_collections: 0,
        total_collections: 0,
        usd_amount: 1,
      },
      type: 'rainbow-bridges' as CATEGORY_TYPE,
      display_type: 'USD_AMOUNT' as CATEGORY_DISPLAY_TYPE,
      earnings: { total: 0 },
    },
    {
      data: {
        owned_collections: 1,
        total_collections: 10,
        usd_amount: 1,
      },
      type: 'nft-collections' as CATEGORY_TYPE,
      display_type: 'NFT_COLLECTION' as CATEGORY_DISPLAY_TYPE,
      earnings: { total: 0 },
    },
    {
      data: {
        owned_collections: 0,
        total_collections: 0,
        usd_amount: 1,
      },
      type: 'historic-balance' as CATEGORY_TYPE,
      display_type: 'USD_AMOUNT' as CATEGORY_DISPLAY_TYPE,
      earnings: { total: 0 },
    },
    {
      data: {
        owned_collections: 0,
        total_collections: 0,
        usd_amount: 1,
      },
      type: 'bonus' as CATEGORY_TYPE,
      display_type: 'BONUS' as CATEGORY_DISPLAY_TYPE,
      earnings: { total: 1 },
    },
    {
      data: {
        owned_collections: 0,
        total_collections: 0,
        usd_amount: 1,
      },
      type: 'rainbow-swaps' as CATEGORY_TYPE,
      display_type: 'USD_AMOUNT' as CATEGORY_DISPLAY_TYPE,
      earnings: { total: 0 },
    },
  ],
  earnings: { total: 100 },
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
      {'> Authorization required'}
    </Text>,
    <Text
      key={'loading-2'}
      align="left"
      size="14pt"
      weight="semibold"
      color="labelTertiary"
    >
      {'> Sign in with your wallet'}
    </Text>,
    accessGranted ? (
      <Text
        key={'loading-3'}
        align="left"
        size="14pt"
        weight="semibold"
        color="green"
      >
        {'> Access granted'}
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

const consoleCalculatingPointsRows = ({
  userOnboarding,
}: {
  userOnboarding: USER_POINTS_ONBOARDING;
}) => {
  const userCategories = userOnboarding?.categories?.reduce(
    (acc, current) => {
      acc[current.type] = current;
      return acc;
    },
    {} as Record<CATEGORY_TYPE, USER_POINTS_CATEGORY>,
  );
  return [
    <Box key={'points-1'} paddingBottom="30px">
      <Text align="left" size="16pt" weight="semibold" color="labelTertiary">
        {'> Calculating points'}
      </Text>
    </Box>,
    userCategories?.['rainbow-swaps'].data.usd_amount ? (
      <AccentColorProvider key={'points-2'} color="#00BFC6">
        <Box paddingBottom="15px">
          <Inline alignHorizontal="justify">
            <Text align="left" size="14pt" weight="bold" color="accent">
              {'Rainbow Swaps:'}
            </Text>
            <Text align="left" size="14pt" weight="bold" color="accent">
              {convertAmountToNativeDisplayWithThreshold(
                userCategories?.['rainbow-swaps'].data.usd_amount,
                'USD',
              )}
            </Text>
          </Inline>
        </Box>
      </AccentColorProvider>
    ) : undefined,
    userCategories?.['nft-collections'].data.owned_collections ? (
      <AccentColorProvider key={'points-3'} color="#57EA5F">
        <Box paddingBottom="15px">
          <Inline alignHorizontal="justify">
            <Text align="left" size="14pt" weight="semibold" color="accent">
              {'Rainbow NFTs Owned:'}
            </Text>
            <Text align="left" size="14pt" weight="semibold" color="accent">
              {`${userCategories?.['nft-collections'].data.owned_collections} of ${userCategories?.['nft-collections'].data.total_collections}`}
            </Text>
          </Inline>
        </Box>
      </AccentColorProvider>
    ) : undefined,
    userCategories?.['historic-balance'].data.usd_amount ? (
      <AccentColorProvider key={'points-4'} color="#F5D700">
        <Box paddingBottom="15px">
          <Inline alignHorizontal="justify">
            <Text align="left" size="14pt" weight="semibold" color="accent">
              {'Wallet Balance:'}
            </Text>
            <Text align="left" size="14pt" weight="semibold" color="accent">
              {convertAmountToNativeDisplayWithThreshold(
                userCategories?.['historic-balance'].data.usd_amount,
                'USD',
              )}
            </Text>
          </Inline>
        </Box>
      </AccentColorProvider>
    ) : undefined,
    userCategories?.['metamask-swaps'].data.usd_amount ? (
      <AccentColorProvider key={'points-5'} color="#F24527">
        <Box paddingBottom="15px">
          <Inline alignHorizontal="justify">
            <Text align="left" size="14pt" weight="semibold" color="accent">
              {'MetaMask Swaps:'}
            </Text>
            <Text align="left" size="14pt" weight="semibold" color="accent">
              {convertAmountToNativeDisplayWithThreshold(
                userCategories?.['metamask-swaps'].data.usd_amount,
                'USD',
              )}
            </Text>
          </Inline>
        </Box>
      </AccentColorProvider>
    ) : undefined,
    userCategories?.['bonus'].earnings.total ? (
      <AccentColorProvider key={'points-6'} color="#C54EAB">
        <Box paddingBottom="30px">
          <Inline alignHorizontal="justify">
            <Text align="left" size="14pt" weight="semibold" color="accent">
              {'Bonus Reward:'}
            </Text>
            <Text align="left" size="14pt" weight="semibold" color="accent">
              + {userCategories?.['bonus'].earnings.total}
            </Text>
          </Inline>
        </Box>
      </AccentColorProvider>
    ) : undefined,
    <Box key={'points-7'} paddingBottom="15px">
      <Text align="left" size="16pt" weight="semibold" color="labelTertiary">
        {'> Calculation complete'}
      </Text>
    </Box>,
    userOnboarding.earnings.total ? (
      <AccentColorProvider key={'points-8'} color="#FFFFFF">
        <Box paddingBottom="30px">
          <Inline alignHorizontal="justify">
            <Text align="left" size="14pt" weight="semibold" color="accent">
              {'Points Earned:'}
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
    useState<USER_POINTS_ONBOARDING>(DUMMY_USER);
  const debouncedAccessGranted = useDebounce(accessGranted, 1000);

  console.log('--- accessGranted', accessGranted);
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
        console.log('-- valid.onboardPoints?.user', valid.onboardPoints?.user);
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
                  {'Account:'}
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
                    {consoleCalculatingPointsRows({ userOnboarding }).map(
                      (item, i) => (
                        <Box as={motion.div} key={i} variants={itemVariants}>
                          {item}
                        </Box>
                      ),
                    )}
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
                  borderRadius="4px"
                  onClick={signChallenge}
                  color="green"
                  height="36px"
                  variant="stroked"
                >
                  <Text align="center" size="14pt" weight="heavy" color="green">
                    {'Sign In'}
                  </Text>
                  {validatingSignature && <Spinner color="green" />}
                </Button>
              </Box>
            </Row>
          )}
        </Rows>
      </Box>
    </BottomSheet>
  );
};
