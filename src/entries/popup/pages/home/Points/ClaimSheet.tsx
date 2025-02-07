import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { RapClaimActionParameters } from '~/core/raps/references';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { networkStore } from '~/core/state/networks/networks';
import { ChainId, chainIdToNameMapping } from '~/core/types/chains';
import { GasSpeed } from '~/core/types/gas';
import {
  convertAmountAndPriceToNativeDisplay,
  convertRawAmountToBalance,
} from '~/core/utils/numbers';
import {
  Box,
  Button,
  Inline,
  Inset,
  Row,
  Rows,
  Separator,
  Stack,
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { rowTransparentAccentHighlight } from '~/design-system/styles/rowTransparentAccentHighlight.css';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { useSwapGas } from '~/entries/popup/hooks/useGas';
import { useNativeAsset } from '~/entries/popup/hooks/useNativeAsset';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';
import { RainbowError, logger } from '~/logger';

import * as wallet from '../../../handlers/wallet';

import { ClaimOverview } from './ClaimOverview';
import { invalidatePointsQuery, usePoints } from './usePoints';

export function ClaimSheet() {
  const navigate = useRainbowNavigate();
  const goBack = () => navigate(-1);
  const backToHome = () => {
    navigate(ROUTES.HOME, {
      state: { tab: 'points', skipTransitionOnRoute: ROUTES.HOME },
    });
  };

  const [showClaimOverview, setShowClaimOverview] = useState(false);
  const [showNetworkSelection, setShowNetworkSelection] = useState(true);

  const [selectedChainId, setSelectedChainId] = useState<ChainId>(
    ChainId.optimism,
  );
  const requiresBridge = selectedChainId !== ChainId.optimism;
  const [claimError, setClaimError] = useState<string | undefined>();
  const [bridgeSuccess, setBridgeSuccess] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [initialClaimableAmount, setInitialClaimableAmount] = useState('');
  const [initialClaimableDisplay, setInitialClaimableDisplay] = useState('');

  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data, refetch } = usePoints(address);
  const rewards = data?.user?.rewards;
  const { claimable } = rewards || {};

  const opEth = useNativeAsset({ chainId: ChainId.optimism });
  const ethPrice = opEth?.native?.price?.amount;
  const destinationEth = useNativeAsset({ chainId: selectedChainId });

  const claimableBalance = convertRawAmountToBalance(claimable || '0', {
    decimals: 18,
    symbol: 'ETH',
  });
  const claimablePriceDisplay = convertAmountAndPriceToNativeDisplay(
    claimableBalance.amount,
    ethPrice || '0',
    currency,
  );
  const sellAmount = claimable || '0';

  useSwapGas({
    chainId: ChainId.optimism,
    defaultSpeed: GasSpeed.FAST,
    enabled: true,
  });

  const { mutate: claimRewards, isSuccess: claimSuccess } = useMutation<{
    nonce: number | null;
  }>({
    mutationFn: async () => {
      if (opEth && destinationEth) {
        const actionParams = {
          address,
          toChainId: selectedChainId,
          sellAmount,
          chainId: ChainId.optimism,
          assetToSell: opEth,
          assetToBuy: destinationEth,
          quote: undefined,
        } satisfies RapClaimActionParameters;

        const { nonce: bridgeNonce, errorMessage } = await wallet.executeRap({
          rapActionParameters: actionParams,
          type: 'claimBridge',
        });

        if (errorMessage) {
          if (errorMessage.includes('[CLAIM]')) {
            // Handle claim error. Retry is possible
            setClaimError(i18n.t('points.rewards.claim_failed'));
          } else {
            // Retry is not possible!
            setClaimError(i18n.t('points.rewards.claim_success_bridge_failed'));
          }
          logger.error(new RainbowError('ETH REWARDS CLAIM ERROR'), {
            message: errorMessage,
          });
          return { nonce: null };
        }
        // clear and refresh claim data so available claim UI disappears
        invalidatePointsQuery(address);
        refetch();
        return { nonce: bridgeNonce };
      }
      return { nonce: null };
    },
    onSuccess: async ({ nonce }: { nonce: number | null }) => {
      if (typeof nonce === 'number') {
        setBridgeSuccess(true);
      }
    },
    onError: (error) => {
      setClaimError(error.message);
    },
  });

  const claimFinished = requiresBridge ? bridgeSuccess : claimSuccess;
  const showPreparingClaim = !showSummary;
  const showSuccess = claimFinished && !showSummary && !claimError;

  const handleNetworkSelection = (chain: ChainId) => {
    setShowNetworkSelection(false);
    setShowClaimOverview(true);
    setSelectedChainId(chain);
    setInitialClaimableAmount(claimableBalance.amount);
    setInitialClaimableDisplay(claimablePriceDisplay.display);
    claimRewards();
    analytics.track(event.pointsRewardsClaimSubmitted, {
      claimAmount: Number(claimableBalance.amount),
      claimAmountUSD: Number(claimablePriceDisplay.display.slice(1)),
      networkSelected: chainIdToNameMapping[chain] as
        | 'optimism'
        | 'zora'
        | 'base',
    });
  };

  const baseInfo = {
    chainId: ChainId.base,
  };

  const opInfo = {
    chainId: ChainId.optimism,
  };

  const claimNetworkInfo = [
    config.rewards_bridging_enabled ? baseInfo : opInfo,
    config.rewards_bridging_enabled ? opInfo : baseInfo,
    {
      chainId: ChainId.zora,
    },
  ];

  useEffect(() => {
    if (showSuccess && !showSummary) {
      setTimeout(() => setShowSummary(true), 7000);
    }
  }, [showSuccess, showSummary]);

  return (
    <>
      <ClaimNetworkSelection
        goBack={goBack}
        networkInfo={claimNetworkInfo}
        onSelect={handleNetworkSelection}
        show={showNetworkSelection}
      />
      <ClaimOverview
        claimableAmount={initialClaimableAmount}
        claimableDisplay={initialClaimableDisplay}
        error={claimError}
        goBack={backToHome}
        preparingClaim={showPreparingClaim}
        success={showSuccess}
        show={showClaimOverview}
      />
    </>
  );
}

export function ClaimNetworkSelection({
  goBack,
  networkInfo,
  onSelect,
  show,
}: {
  goBack: () => void;
  networkInfo: { chainId: ChainId; fee?: string }[];
  onSelect: (chain: ChainId) => void;
  show: boolean;
}) {
  return (
    <BottomSheet
      show={show}
      onClickOutside={goBack}
      zIndex={zIndexes.BOTTOM_SHEET}
    >
      <Box paddingTop="24px" paddingBottom="12px" isModal>
        <Box paddingBottom="16px">
          <Text
            weight="heavy"
            size="20pt"
            color="accent"
            textShadow="16px accent"
            align="center"
          >
            {i18n.t('points.rewards.choose_claim_network')}
          </Text>
        </Box>
        <Stack gap="10px">
          <Separator color="separatorTertiary" />
          <Rows>
            {networkInfo.map((info) => (
              <Row key={info.chainId}>
                <ClaimSheetRow chain={info.chainId} onSelect={onSelect} />
              </Row>
            ))}
          </Rows>
        </Stack>
        <Box
          paddingHorizontal="20px"
          paddingTop="24px"
          paddingBottom="10px"
          background="surfacePrimaryElevated"
        >
          <Button
            color="fillTertiary"
            onClick={goBack}
            width="full"
            borderRadius="12px"
            height="44px"
            variant="transparentShadow"
            tabIndex={0}
            paddingHorizontal="20px"
          >
            <Text
              size="16pt"
              weight="bold"
              textShadow="16px label"
              color="labelTertiary"
            >
              {i18n.t('close')}
            </Text>
          </Button>
        </Box>
      </Box>
    </BottomSheet>
  );
}

function ClaimSheetRow({
  chain,
  onSelect,
}: {
  chain: ChainId;
  onSelect: (chainId: ChainId) => void;
}) {
  const chainsLabel = networkStore((state) => state.getNetworksLabel());
  const disableBridging =
    chain !== ChainId.optimism &&
    !config.rewards_bridging_enabled &&
    process.env.IS_TESTING !== 'true';
  return (
    <Inset horizontal="8px">
      <Box
        paddingVertical="10px"
        className={rowTransparentAccentHighlight}
        borderRadius="12px"
        as={motion.div}
        whileTap={{ scale: 0.98 }}
        whileFocus={{ scale: 1.02 }}
        whileHover={{ scale: 1.02 }}
        paddingHorizontal="8px"
        onClick={() => {
          if (!disableBridging) {
            onSelect(chain);
          }
        }}
      >
        <Inset horizontal="8px">
          <Box display="flex" justifyContent="space-between">
            <Inline space="12px" alignVertical="center">
              <ChainBadge chainId={chain} size="32" />
              <Text
                size="16pt"
                color="label"
                textShadow="16px label"
                weight="heavy"
              >
                {chainsLabel[chain]}
              </Text>
            </Inline>
            {disableBridging && (
              <Inline alignVertical="center">
                <Box
                  display="flex"
                  alignItems="center"
                  borderRadius="5px"
                  padding="7px"
                  borderWidth="1px"
                  borderColor="labelQuaternary"
                  height="fit"
                >
                  <Text color="labelQuaternary" size="12pt" weight="bold">
                    {i18n.t('points.rewards.coming_soon')}
                  </Text>
                </Box>
              </Inline>
            )}
          </Box>
        </Inset>
      </Box>
    </Inset>
  );
}
