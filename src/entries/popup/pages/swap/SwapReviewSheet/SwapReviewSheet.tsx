import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import React from 'react';

import { ParsedSearchAsset } from '~/core/types/assets';
import { convertRawAmountToBalance } from '~/core/utils/numbers';
import { Bleed, Box, ButtonSymbol, Inline, Stack, Text } from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { ChevronDown } from '~/entries/popup/components/ChevronDown/ChevronDown';

import { SwapAssetCard } from './SwapAssetCard';

const DetailsRow = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box style={{ height: '32px' }}>
      <Inline height="full" alignVertical="center" alignHorizontal="justify">
        {children}
      </Inline>
    </Box>
  );
};

const Label = ({
  label,
  testId,
  onClick,
}: {
  label: string;
  testId: string;
  onClick: () => void;
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
      </Inline>
    </Stack>
  </Box>
);

export type SwapReviewSheetProps = {
  show: boolean;
  assetToSell?: ParsedSearchAsset | null;
  assetToBuy?: ParsedSearchAsset | null;
  quote?: Quote | CrosschainQuote | QuoteError;
};

export const SwapReviewSheet = ({
  show,
  assetToSell,
  assetToBuy,
  quote,
}: SwapReviewSheetProps) => {
  if (!quote || !assetToBuy || !assetToSell || (quote as QuoteError)?.error)
    return null;
  const q = quote as Quote | CrosschainQuote;
  return (
    <BottomSheet show={show}>
      <Box>
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
                assetAmount={q.sellAmount.toString()}
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
                assetAmount={q.buyAmount.toString()}
              />
            </Inline>
          </Box>
          <Box>
            <Stack space="4px">
              <DetailsRow>
                <Text size="14pt" weight="semibold" color="labelSecondary">
                  Minimum received
                </Text>
                <Text size="14pt" weight="semibold" color="labelSecondary">
                  {`${
                    convertRawAmountToBalance(q.buyAmount.toString(), {
                      decimals: assetToBuy?.decimals,
                    }).display
                  } ${assetToBuy.symbol}`}
                </Text>
              </DetailsRow>
              <DetailsRow>
                <Text size="14pt" weight="semibold" color="labelSecondary">
                  Swapping via
                </Text>
                <Text size="14pt" weight="semibold" color="labelSecondary">
                  {`${
                    convertRawAmountToBalance(q.buyAmount.toString(), {
                      decimals: assetToBuy?.decimals,
                    }).display
                  } ${assetToBuy.symbol}`}
                </Text>
              </DetailsRow>
              <DetailsRow>
                <Label
                  label="Included Rainbow fee"
                  testId="swap-review-rnbw-fee"
                  onClick={() => null}
                />
                <Text size="14pt" weight="semibold" color="labelSecondary">
                  {`${
                    convertRawAmountToBalance(q.buyAmount.toString(), {
                      decimals: assetToBuy?.decimals,
                    }).display
                  } ${assetToBuy.symbol}`}
                </Text>
              </DetailsRow>
              <DetailsRow>
                <Label
                  label="Use Flashbots"
                  testId="swap-review-flashbots"
                  onClick={() => null}
                />
                <Text size="14pt" weight="semibold" color="labelSecondary">
                  {`${
                    convertRawAmountToBalance(q.buyAmount.toString(), {
                      decimals: assetToBuy?.decimals,
                    }).display
                  } ${assetToBuy.symbol}`}
                </Text>
              </DetailsRow>
              <DetailsRow>
                <Label
                  label="More details"
                  testId="swap-review-details"
                  onClick={() => null}
                />
                <Text size="14pt" weight="semibold" color="labelSecondary">
                  {`${
                    convertRawAmountToBalance(q.buyAmount.toString(), {
                      decimals: assetToBuy?.decimals,
                    }).display
                  } ${assetToBuy.symbol}`}
                </Text>
              </DetailsRow>
            </Stack>
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack space="24px"></Stack>
      </Box>
    </BottomSheet>
  );
};
