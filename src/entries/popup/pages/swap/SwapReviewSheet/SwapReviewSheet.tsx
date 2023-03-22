import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import React, { useCallback, useState } from 'react';

import { ETH_ADDRESS } from '~/core/references';
import { ParsedSearchAsset } from '~/core/types/assets';
import { truncateAddress } from '~/core/utils/address';
import {
  Bleed,
  Box,
  Button,
  ButtonSymbol,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { AccentColorProviderWrapper } from '~/design-system/components/Box/ColorContext';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { ChevronDown } from '~/entries/popup/components/ChevronDown/ChevronDown';
import { useSwapReviewDetails } from '~/entries/popup/hooks/swap/useSwapReviewDetails';

import { SwapAssetCard } from './SwapAssetCard';
import { SwapRoutes } from './SwapRoutes';
import { SwapViewContractDropdown } from './SwapViewContractDropdown';

const DetailsRow = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box style={{ height: '32px' }}>
      <Inline height="full" alignVertical="center" alignHorizontal="justify">
        {children}
      </Inline>
    </Box>
  );
};

const CarrouselButton = ({
  textArray,
  symbol,
}: {
  textArray: string[];
  symbol?: SymbolProps['symbol'];
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const goToNextText = useCallback(() => {
    setCurrentTextIndex((currentTextIndex) =>
      currentTextIndex + 1 < textArray.length ? currentTextIndex + 1 : 0,
    );
  }, [textArray.length]);

  return (
    <ButtonOverflow>
      <Box onClick={goToNextText}>
        <Inline space="4px" alignHorizontal="center" alignVertical="center">
          <Text size="14pt" weight="semibold" color="label">
            {textArray[currentTextIndex]}
          </Text>
          {symbol && (
            <Symbol
              symbol={symbol}
              weight="semibold"
              color="labelQuaternary"
              size={12}
            />
          )}
        </Inline>
      </Box>
    </ButtonOverflow>
  );
};

const Label = ({
  label,
  testId,
  infoButton = false,
  onClick = () => null,
}: {
  label: string;
  testId: string;
  infoButton?: boolean;
  onClick?: () => void;
}) => (
  <Box>
    <Stack space="8px">
      <Inline space="4px" alignVertical="center">
        <Box>
          <Text
            align="left"
            color="labelSecondary"
            size="14pt"
            weight="semibold"
          >
            {label}
          </Text>
        </Box>
        {infoButton && (
          <Box key="swap-settings-warning-icon">
            <Bleed vertical="6px" horizontal="6px">
              <ButtonSymbol
                symbol="info.circle.fill"
                color="labelQuaternary"
                height="28px"
                variant="tinted"
                onClick={onClick}
                testId={testId}
              />
            </Bleed>
          </Box>
        )}
      </Inline>
    </Stack>
  </Box>
);

export type SwapReviewSheetProps = {
  show: boolean;
  assetToSell?: ParsedSearchAsset | null;
  assetToBuy?: ParsedSearchAsset | null;
  quote?: Quote | CrosschainQuote | QuoteError;
  flashbotsEnabled: boolean;
  hideSwapReview: () => void;
};

export const SwapReviewSheet = ({
  show,
  assetToSell,
  assetToBuy,
  quote,
  flashbotsEnabled,
  hideSwapReview,
}: SwapReviewSheetProps) => {
  if (!quote || !assetToBuy || !assetToSell || (quote as QuoteError)?.error)
    return null;
  return (
    <SwapReviewSheetWithQuote
      show={show}
      assetToSell={assetToSell}
      assetToBuy={assetToBuy}
      quote={quote as Quote | CrosschainQuote}
      flashbotsEnabled={flashbotsEnabled}
      hideSwapReview={hideSwapReview}
    />
  );
};

type SwapReviewSheetWithQuoteProps = {
  show: boolean;
  assetToSell: ParsedSearchAsset;
  assetToBuy: ParsedSearchAsset;
  quote: Quote | CrosschainQuote;
  flashbotsEnabled: boolean;
  hideSwapReview: () => void;
};

const SwapReviewSheetWithQuote = ({
  show,
  assetToSell,
  assetToBuy,
  quote,
  flashbotsEnabled,
  hideSwapReview,
}: SwapReviewSheetWithQuoteProps) => {
  const { minimumReceived, swappingRoute, includedFee, exchangeRate } =
    useSwapReviewDetails({ quote, assetToBuy, assetToSell });

  console.log('assetToSell.address', assetToSell.address);
  console.log('assetToBuy.address', assetToBuy.address);

  return (
    <BottomSheet show={show}>
      <Box background="surfacePrimaryElevatedSecondary">
        <Stack space="12px">
          <Box style={{ height: '64px' }}>
            <Box paddingVertical="27px">
              <Inline alignHorizontal="center" alignVertical="center">
                <Text color="label" size="14pt" weight="bold">
                  Review & Swap
                </Text>
              </Inline>
            </Box>
          </Box>
          <Box>
            <Inline
              space="10px"
              alignVertical="center"
              alignHorizontal="center"
            >
              <SwapAssetCard
                asset={assetToSell}
                assetAmount={quote.sellAmount.toString()}
              />
              <Box
                boxShadow="12px surfaceSecondaryElevated"
                background="surfaceSecondaryElevated"
                borderRadius="32px"
                borderWidth={'1px'}
                borderColor="buttonStroke"
                style={{
                  width: 32,
                  height: 32,
                  zIndex: 10,
                  position: 'absolute',
                  left: '0 auto',
                }}
              >
                <Inline
                  height="full"
                  alignHorizontal="center"
                  alignVertical="center"
                >
                  <Inline alignHorizontal="center">
                    <Box style={{ rotate: '-90deg' }} marginRight="-6px">
                      <ChevronDown color="labelTertiary" />
                    </Box>
                    <Box style={{ rotate: '-90deg' }} marginLeft="-6px">
                      <ChevronDown color="labelQuaternary" />
                    </Box>
                  </Inline>
                </Inline>
              </Box>

              <SwapAssetCard
                asset={assetToBuy}
                assetAmount={quote.buyAmount.toString()}
              />
            </Inline>
          </Box>
          <Box paddingHorizontal="20px">
            <Stack space="4px">
              <DetailsRow>
                <Label
                  label="Minimum received"
                  testId="swap-review-swapping-route"
                />
                <Text size="14pt" weight="semibold" color="label">
                  {minimumReceived}
                </Text>
              </DetailsRow>
              <DetailsRow>
                <Label
                  label="Swapping via"
                  testId="swap-review-swapping-route"
                />
                {!!swappingRoute && <SwapRoutes protocols={swappingRoute} />}
              </DetailsRow>
              <DetailsRow>
                <Label
                  label="Included Rainbow fee"
                  testId="swap-review-rnbw-fee"
                  infoButton
                />
                <CarrouselButton textArray={includedFee} />
              </DetailsRow>
              {flashbotsEnabled && (
                <DetailsRow>
                  <Label
                    label="Use Flashbots"
                    testId="swap-review-flashbots"
                    infoButton
                  />
                  <Inline
                    space="4px"
                    alignHorizontal="center"
                    alignVertical="center"
                  >
                    <Text size="14pt" weight="semibold" color="label">
                      On
                    </Text>
                    <Symbol
                      symbol="checkmark.shield.fill"
                      weight="semibold"
                      color="green"
                      size={12}
                    />
                  </Inline>
                </DetailsRow>
              )}
              <DetailsRow>
                <Label
                  label="Exchange rate"
                  testId="swap-review-exchange-rate"
                />
                <CarrouselButton
                  symbol="arrow.2.squarepath"
                  textArray={exchangeRate}
                />
              </DetailsRow>
              {assetToSell.address !== ETH_ADDRESS && (
                <DetailsRow>
                  <Label
                    label={`${assetToSell.symbol} contract`}
                    testId="swap-review-asset-to-sell-contract"
                  />

                  <SwapViewContractDropdown
                    address={assetToSell.address}
                    chainId={assetToSell.chainId}
                  >
                    <Text size="14pt" weight="semibold" color="label">
                      {truncateAddress(assetToSell.address)}
                    </Text>
                  </SwapViewContractDropdown>
                </DetailsRow>
              )}
              {assetToBuy.address !== ETH_ADDRESS && (
                <DetailsRow>
                  <Label
                    label={`${assetToBuy.symbol} contract`}
                    testId="swap-review-asset-to-buy-contract"
                  />
                  <SwapViewContractDropdown
                    address={assetToBuy.address}
                    chainId={assetToBuy.chainId}
                  >
                    <Text size="14pt" weight="semibold" color="label">
                      {truncateAddress(assetToBuy.address)}
                    </Text>
                  </SwapViewContractDropdown>
                </DetailsRow>
              )}
              <DetailsRow>
                <Label label="More details" testId="swap-review-details" />
                <ButtonSymbol
                  symbol="chevron.down.circle"
                  symbolSize={12}
                  color="labelQuaternary"
                  height="24px"
                  variant="tinted"
                  onClick={() => null}
                  testId={'swap-review-details-button'}
                />
              </DetailsRow>
            </Stack>
          </Box>
        </Stack>
      </Box>
      <Box background="surfacePrimaryElevated" padding="20px">
        <Separator strokeWeight="1px" color="separatorSecondary" />
        <AccentColorProviderWrapper
          color={assetToBuy.colors.primary || assetToBuy.colors.fallback}
        >
          <Stack alignHorizontal="center" space="8px">
            <Button
              onClick={() => null}
              height="44px"
              variant="flat"
              color={'accent'}
              width="full"
            >
              <Text color="label" size="16pt" weight="bold">
                {`Swap ${assetToSell.symbol} to ${assetToBuy.symbol}`}
              </Text>
            </Button>

            <Button
              color={'labelSecondary'}
              height="44px"
              width="fit"
              onClick={hideSwapReview}
              variant={'transparent'}
            >
              {'Go back'}
            </Button>
          </Stack>
        </AccentColorProviderWrapper>
      </Box>
    </BottomSheet>
  );
};
