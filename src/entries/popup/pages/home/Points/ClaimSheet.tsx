import { AddressZero } from '@ethersproject/constants';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { metadataPostClient } from '~/core/graphql';
import {
  ClaimUserRewardsMutation,
  PointsErrorType,
} from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { QuoteTypeMap, RapActionParameters } from '~/core/raps/references';
import { chainsLabel } from '~/core/references/chains';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
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
import { useSwapQuote, useSwapSlippage } from '~/entries/popup/hooks/swap';
import { useSwapGas } from '~/entries/popup/hooks/useGas';
import { useNativeAssetForNetwork } from '~/entries/popup/hooks/useNativeAssetForNetwork';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import * as wallet from '../../../handlers/wallet';

import { ClaimOverview } from './ClaimOverview';
import { CLAIM_MOCK_DATA } from './references';
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
  const [claimError, setClaimError] = useState<PointsErrorType>();
  const [bridgeError, setBridgeError] = useState<string>();
  const [bridgeSuccess, setBridgeSuccess] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data, refetch } = usePoints(address);
  const rewards = data?.user?.rewards;
  const { claimable } = rewards || {};

  const opEth = useNativeAssetForNetwork({ chainId: ChainId.optimism });
  const baseEth = useNativeAssetForNetwork({ chainId: ChainId.base });
  const zoraEth = useNativeAssetForNetwork({ chainId: ChainId.zora });
  const ethPrice = opEth?.native?.price?.amount;
  const destinationEth = useNativeAssetForNetwork({ chainId: selectedChainId });

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

  const { data: swapSlippage } = useSwapSlippage(
    {
      chainId: ChainId.optimism,
      toChainId: selectedChainId,
      sellTokenAddress: AddressZero,
      buyTokenAddress: AddressZero,
      sellAmount,
      buyAmount: '',
    },
    {
      enabled: requiresBridge,
    },
  );
  const slippage = swapSlippage?.slippagePercent || 2;
  const { data: baseQuote } = useSwapQuote({
    assetToSell: opEth || null,
    assetToBuy: baseEth || null,
    assetToSellValue: '0',
    slippage,
    independentField: 'sellField',
    source: 'auto',
    isClaim: true,
  });
  const { data: zoraQuote } = useSwapQuote({
    assetToSell: opEth || null,
    assetToBuy: zoraEth || null,
    assetToSellValue: '0',
    slippage,
    independentField: 'sellField',
    source: 'auto',
    isClaim: true,
  });
  const { gasFeeParamsBySpeed: baseGasFeeParamsBySpeed } = useSwapGas({
    chainId: ChainId.optimism,
    defaultSpeed: GasSpeed.URGENT,
    quote: baseQuote,
    assetToSell: opEth,
    assetToBuy: baseEth,
    enabled: true,
    persist: false,
  });
  const { gasFeeParamsBySpeed: zoraGasFeeParamsBySpeed } = useSwapGas({
    chainId: ChainId.optimism,
    defaultSpeed: GasSpeed.URGENT,
    quote: zoraQuote,
    assetToSell: opEth,
    assetToBuy: zoraEth,
    enabled: true,
  });

  const claimNetworkInfo = [
    { chainId: ChainId.optimism, fee: 'Free to Claim' },
    {
      chainId: ChainId.base,
      fee: baseGasFeeParamsBySpeed?.urgent?.gasFee?.display,
    },
    {
      chainId: ChainId.zora,
      fee: zoraGasFeeParamsBySpeed?.urgent?.gasFee?.display,
    },
  ];

  const { mutate: claimRewards, isSuccess: claimSuccess } = useMutation<
    ClaimUserRewardsMutation['claimUserRewards']
  >({
    mutationFn: async () => {
      const response =
        process.env.IS_TESTING === 'true'
          ? CLAIM_MOCK_DATA
          : await metadataPostClient.claimUserRewards({ address });
      const claimInfo = response?.claimUserRewards;

      if (claimInfo?.error) {
        setClaimError(claimInfo?.error.type);
      }

      // clear and refresh claim data so available claim UI disappears
      invalidatePointsQuery(address);
      refetch();

      return claimInfo;
    },
    onSuccess: async (d) => {
      // if the selected network is not optimism, we kick off the bridge flow here
      if (requiresBridge && d?.txHash && opEth && destinationEth) {
        const actionParams: RapActionParameters = {
          sellAmount,
          chainId: ChainId.optimism,
          assetToSell: opEth,
          assetToBuy: destinationEth,
          quote: baseQuote as QuoteTypeMap['crosschainSwap'],
          flashbots: false,
          claimHash: d?.txHash,
        };
        const { errorMessage, nonce: bridgeNonce } = await wallet.executeRap({
          rapActionParameters: actionParams,
          type: 'crosschainSwap',
        });

        if (errorMessage) {
          setBridgeError(errorMessage);
        }

        if (typeof bridgeNonce === 'number') {
          setBridgeSuccess(true);
        }
      }
    },
  });

  const claimFinished = requiresBridge ? bridgeSuccess : claimSuccess;
  const showPreparingClaim = !showSummary;
  const showSuccess =
    claimFinished && !showSummary && !claimError && !bridgeError;

  const handleNetworkSelection = (chain: ChainId) => {
    setShowNetworkSelection(false);
    setShowClaimOverview(true);
    setSelectedChainId(chain);
    setTimeout(() => claimRewards(), 500);
  };

  useEffect(() => {
    if (showSuccess && !showSummary) {
      setTimeout(() => setShowSummary(true), 5000);
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
        claimableAmount={claimableBalance.amount}
        claimableDisplay={claimablePriceDisplay.display}
        error={claimError || bridgeError}
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
                <ClaimSheetRow
                  chain={info.chainId}
                  display={info.fee || ''}
                  onSelect={onSelect}
                />
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
  display,
  onSelect,
}: {
  chain: ChainId;
  display: string;
  onSelect: (chainId: ChainId) => void;
}) {
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
        onClick={() => onSelect(chain)}
      >
        <Inset horizontal="8px">
          <Box display="flex" justifyContent="space-between">
            <Inline space="12px">
              <ChainBadge chainId={chain} size="32" />
              <Stack gap="10px">
                <Text
                  size="16pt"
                  color="label"
                  textShadow="16px label"
                  weight="heavy"
                >
                  {chainsLabel[chain]}
                </Text>
                <Text size="12pt" color="labelQuaternary" weight="bold">
                  {display}
                </Text>
              </Stack>
            </Inline>
          </Box>
        </Inset>
      </Box>
    </Inset>
  );
}
