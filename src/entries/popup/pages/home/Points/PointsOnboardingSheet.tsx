import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { metadataPostClient } from '~/core/graphql';
import { useCurrentAddressStore } from '~/core/state';
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

const ConsoleLoading = ({
  accessGranted,
  error,
}: {
  accessGranted: boolean;
  error?: string | null;
}) => {
  return (
    <Box>
      <Stack space="8px">
        <Text align="left" size="14pt" weight="semibold" color="labelTertiary">
          {'> Authorization required'}
        </Text>
        <Text align="left" size="14pt" weight="semibold" color="labelTertiary">
          {'> Sign in with your wallet'}
        </Text>
        {accessGranted && (
          <Text align="left" size="14pt" weight="semibold" color="green">
            {'> Access granted'}
          </Text>
        )}
        {error && (
          <Text align="left" size="14pt" weight="semibold" color="red">
            {`> ${getErrorString(error)}`}
          </Text>
        )}
      </Stack>
    </Box>
  );
};

const ConsoleCalculatingPoints = ({
  userOnboarding,
}: {
  userOnboarding: USER_POINTS_ONBOARDING;
}) => {
  const userCategories = userOnboarding.categories.reduce(
    (acc, current) => {
      acc[current.type] = current;
      return acc;
    },
    {} as Record<CATEGORY_TYPE, USER_POINTS_CATEGORY>,
  );
  return (
    <Box>
      <Stack space="15px">
        <Text align="left" size="16pt" weight="semibold" color="labelTertiary">
          {'> Calculating points'}
        </Text>

        {userCategories['rainbow-swaps'].data.usd_amount && (
          <AccentColorProvider color="#00BFC6">
            <Inline alignHorizontal="justify">
              <Text align="left" size="14pt" weight="bold" color="accent">
                {'Rainbow Swaps:'}
              </Text>
              <Text align="left" size="14pt" weight="bold" color="accent">
                {userCategories['rainbow-swaps'].data.usd_amount}
              </Text>
            </Inline>
          </AccentColorProvider>
        )}
        {userCategories['nft-collections'].data.owned_collections && (
          <AccentColorProvider color="#57EA5F">
            <Inline alignHorizontal="justify">
              <Text align="left" size="14pt" weight="semibold" color="accent">
                {'Rainbow NFTs Owned:'}
              </Text>
              <Text align="left" size="14pt" weight="semibold" color="accent">
                {`${userCategories['nft-collections'].data.owned_collections} of ${userCategories['nft-collections'].data.total_collections}`}
              </Text>
            </Inline>
          </AccentColorProvider>
        )}
        {userCategories['historic-balance'].data.usd_amount && (
          <AccentColorProvider color="#F5D700">
            <Inline alignHorizontal="justify">
              <Text align="left" size="14pt" weight="semibold" color="accent">
                {'Wallet Balance:'}
              </Text>
              <Text align="left" size="14pt" weight="semibold" color="accent">
                {userCategories['historic-balance'].data.usd_amount}
              </Text>
            </Inline>
          </AccentColorProvider>
        )}
        {userCategories['metamask-swaps'].data.usd_amount && (
          <AccentColorProvider color="#F24527">
            <Inline alignHorizontal="justify">
              <Text align="left" size="14pt" weight="semibold" color="accent">
                {'MetaMask Swaps:'}
              </Text>
              <Text align="left" size="14pt" weight="semibold" color="accent">
                {userCategories['metamask-swaps'].data.usd_amount}
              </Text>
            </Inline>
          </AccentColorProvider>
        )}
        {userCategories['bonus'].earnings.total && (
          <AccentColorProvider color="#C54EAB">
            <Inline alignHorizontal="justify">
              <Text align="left" size="14pt" weight="semibold" color="accent">
                {'Bonus Reward:'}
              </Text>
              <Text align="left" size="14pt" weight="semibold" color="accent">
                {userCategories['bonus'].earnings.total}
              </Text>
            </Inline>
          </AccentColorProvider>
        )}
      </Stack>
    </Box>
  );
};

export const PointsOnboardingSheet = () => {
  const navigate = useRainbowNavigate();
  const { currentAddress } = useCurrentAddressStore();
  const { displayName } = useWalletName({ address: currentAddress });
  const { state } = useLocation();
  const [validatingSignature, setValidatingSignature] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [error, setError] = useState<null | string>();
  const [userOnboardingInfo, setUserOnboardingInfo] =
    useState<USER_POINTS_ONBOARDING>(DUMMY_USER);

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
        if (valid.onboardPoints?.user) {
          setUserOnboardingInfo(
            valid.onboardPoints.user.onboarding as USER_POINTS_ONBOARDING,
          );
          setAccessGranted(true);
        } else if (valid.onboardPoints?.error) {
          const error = valid.onboardPoints.error.type;
          setError(error);
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
            <Stack space="8px">
              <Inline space="4px">
                <Text
                  align="left"
                  size="14pt"
                  weight="semibold"
                  color="labelTertiary"
                >
                  {'Account: '}
                </Text>
                <Text align="left" size="14pt" weight="semibold" color="accent">
                  {displayName}
                </Text>
              </Inline>
              {!accessGranted ? (
                <ConsoleLoading error={error} accessGranted={accessGranted} />
              ) : (
                <ConsoleCalculatingPoints userOnboarding={userOnboardingInfo} />
              )}
            </Stack>
          </Row>
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
        </Rows>
      </Box>
    </BottomSheet>
  );
};
