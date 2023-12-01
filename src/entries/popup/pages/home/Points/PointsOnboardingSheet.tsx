import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { metadataPostClient } from '~/core/graphql';
import { useCurrentAddressStore } from '~/core/state';
import { Box, Button, Inline, Row, Rows, Stack, Text } from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { Spinner } from '~/entries/popup/components/Spinner/Spinner';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWalletName } from '~/entries/popup/hooks/useWalletName';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import * as wallet from '../../../handlers/wallet';

import { EXISTING_USER_ERROR, INVALID_REFERRAL_CODE_ERROR } from './references';
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

export const PointsOnboardingSheet = () => {
  const navigate = useRainbowNavigate();
  const { currentAddress } = useCurrentAddressStore();
  const { displayName } = useWalletName({ address: currentAddress });
  const { state } = useLocation();
  const [validatingSignature, setValidatingSignature] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [error, setError] = useState<null | string>();

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
        if (valid.onboardPoints?.error === null) {
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

              <Text
                align="left"
                size="14pt"
                weight="semibold"
                color="labelTertiary"
              >
                {'> Authorization required'}
              </Text>
              <Text
                align="left"
                size="14pt"
                weight="semibold"
                color="labelTertiary"
              >
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
                {validatingSignature && <Spinner color="accent" />}
              </Button>
            </Box>
          </Row>
        </Rows>
      </Box>
    </BottomSheet>
  );
};
