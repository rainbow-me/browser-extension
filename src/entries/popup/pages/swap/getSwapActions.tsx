import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import React from 'react';

import { i18n } from '~/core/languages';
import { ParsedSearchAsset } from '~/core/types/assets';
import {
  getCrossChainTimeEstimate,
  getQuoteServiceTime,
} from '~/core/utils/swaps';
import { Bleed, Box, Inline, Symbol } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';
import {
  BackgroundColor,
  ButtonColor,
  TextColor,
} from '~/design-system/styles/designTokens';

import { ChevronRightDouble } from '../../components/ChevronRightDouble';
import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import { ExplainerSheetProps } from '../../components/ExplainerSheet/ExplainerSheet';
import { Spinner } from '../../components/Spinner/Spinner';

export interface SwapTimeEstimate {
  isLongWait: boolean;
  timeEstimate?: number;
  timeEstimateDisplay: string;
}

interface GetSwapActionsProps {
  quote?: Quote | CrosschainQuote | QuoteError;
  isLoading: boolean;
  assetToSell?: ParsedSearchAsset | null;
  assetToSellValue?: string;
  assetToBuy?: ParsedSearchAsset | null;
  enoughAssetsForSwap?: boolean;
  validationButtonLabel: string;
  hideExplainerSheet: () => void;
  showExplainerSheet: (params: ExplainerSheetProps) => void;
  showSwapReviewSheet: () => void;
  t: typeof i18n.t;
}

interface SwapActions {
  buttonColor: BackgroundColor | ButtonColor | TextColor;
  buttonLabelColor: TextStyles['color'];
  buttonDisabled: boolean;
  buttonLabel: string;
  buttonIcon: React.ReactElement | null;
  status: 'loading' | 'ready' | 'error';
  timeEstimate?: SwapTimeEstimate | null;
  buttonAction: () => void;
}

export const getSwapActions = ({
  quote,
  isLoading,
  assetToSell,
  assetToBuy,
  enoughAssetsForSwap,
  validationButtonLabel,
  hideExplainerSheet,
  showExplainerSheet,
  showSwapReviewSheet,
  t,
}: GetSwapActionsProps): SwapActions => {
  if (isLoading) {
    return {
      buttonColor: 'surfaceSecondary',
      buttonLabelColor: 'labelQuaternary',
      buttonDisabled: true,
      buttonLabel: t('swap.actions.loading'),
      buttonIcon: (
        <Box
          width="fit"
          alignItems="center"
          justifyContent="center"
          style={{ margin: 'auto' }}
        >
          <Spinner size={16} color="labelQuaternary" />
        </Box>
      ),
      buttonAction: () => null,
      status: 'loading',
    };
  }

  if (!quote) {
    return {
      buttonColor: 'surfaceSecondary',
      buttonDisabled: true,
      buttonLabel: t('swap.actions.enter_an_amount'),
      buttonLabelColor: 'labelQuaternary',
      buttonIcon: null,
      buttonAction: () => null,
      status: 'error',
    };
  }

  if (!(quote as QuoteError).error) {
    const serviceTime = getQuoteServiceTime({
      quote: quote as CrosschainQuote,
    });
    const timeEstimate = serviceTime
      ? getCrossChainTimeEstimate({
          serviceTime,
        })
      : null;

    return {
      buttonColor: enoughAssetsForSwap ? 'accent' : 'fillSecondary',
      buttonDisabled: !enoughAssetsForSwap,
      buttonLabel: enoughAssetsForSwap
        ? t('swap.actions.review')
        : validationButtonLabel,
      buttonLabelColor: 'label',
      buttonIcon: enoughAssetsForSwap ? (
        <Symbol symbol="doc.text.magnifyingglass" weight="bold" size={16} />
      ) : null,
      buttonAction: timeEstimate?.isLongWait
        ? () =>
            showExplainerSheet({
              show: true,
              header: {
                icon: (
                  <Box>
                    <Box>
                      <CoinIcon asset={assetToSell} size={40} />
                    </Box>
                    <Box width="full">
                      <Inline alignHorizontal="right">
                        <Bleed right="10px" top="19px">
                          <Symbol
                            symbol="exclamationmark.triangle.fill"
                            size={20}
                            color="orange"
                            weight="bold"
                          />
                        </Bleed>
                      </Inline>
                    </Box>
                  </Box>
                ),
              },
              title: t('swap.explainers.long_wait.title'),
              description: [t('swap.explainers.long_wait.description')],
              actionButton: {
                label: t('swap.explainers.long_wait.action_label'),
                variant: 'tinted',
                labelColor: 'blue',
                action: () => {
                  hideExplainerSheet();
                  showSwapReviewSheet();
                },
              },
              testId: 'swap-long-wait',
            })
        : () => {
            showSwapReviewSheet();
          },
      timeEstimate,
      status: 'ready',
    };
  }

  switch ((quote as QuoteError).error_code) {
    case 502:
      // insufficient liquidity
      return {
        buttonColor: 'fillSecondary',
        buttonDisabled: false,
        buttonLabel: t('swap.actions.insufficient_liquidity'),
        buttonLabelColor: 'label',
        buttonIcon: (
          <Symbol
            symbol="exclamationmark.circle.fill"
            weight="bold"
            size={16}
          />
        ),
        buttonAction: () =>
          showExplainerSheet({
            show: true,
            header: { emoji: '🏦' },
            title: t('swap.explainers.insufficient_liquidity.title'),
            description: [
              t('swap.explainers.insufficient_liquidity.description'),
            ],
            footerLinkText: {
              openText: t(
                'explainers.insufficient_liquidity.footer_text.open_text',
              ),
              linkText: t(
                'explainers.insufficient_liquidity.footer_text.link_text',
              ),
              closeText: t(
                'explainers.insufficient_liquidity.footer_text.close_text',
              ),
              link: 'https://learn.rainbow.me/a-beginners-guide-to-liquidity-providing',
            },
            actionButton: {
              label: t('swap.explainers.insufficient_liquidity.action_label'),
              variant: 'tinted',
              labelColor: 'blue',
              action: hideExplainerSheet,
            },
            testId: 'swap-liquidity',
          }),
        status: 'ready',
      };
    case 503:
      // fee on transfer
      return {
        buttonColor: 'fillSecondary',
        buttonDisabled: false,
        buttonLabel: t('swap.actions.fee_on_transfer_token'),
        buttonLabelColor: 'label',
        buttonIcon: (
          <Symbol
            symbol="exclamationmark.circle.fill"
            weight="bold"
            size={16}
          />
        ),
        buttonAction: () =>
          showExplainerSheet({
            show: true,
            header: { icon: <CoinIcon asset={assetToSell} size={32} /> },

            title: t('swap.explainers.fee_on_transfer_token.title'),
            description: [
              t('swap.explainers.fee_on_transfer_token.description', {
                tokenName: assetToSell?.name,
              }),
            ],
            footerLinkText: {
              openText: t(
                'swap.explainers.fee_on_transfer_token.footer_text.open_text',
              ),
              linkText: t(
                'swap.explainers.fee_on_transfer_token.footer_text.link_text',
              ),
              closeText: t(
                'swap.explainers.fee_on_transfer_token.footer_text.close_text',
              ),
              link: 'https://support.rainbow.me/en/articles/8324868-fee-on-transfer-tokens',
            },
            actionButton: {
              label: t('swap.explainers.fee_on_transfer_token.action_label'),
              variant: 'tinted',
              labelColor: 'blue',
              action: hideExplainerSheet,
            },
            testId: 'fee-on-transfer',
          }),
        status: 'ready',
      };

    case 504:
      // no route
      return {
        buttonColor: 'fillSecondary',
        buttonDisabled: false,
        buttonLabel: t('swap.actions.no_route'),
        buttonLabelColor: 'label',
        buttonIcon: (
          <Symbol
            symbol="exclamationmark.circle.fill"
            weight="bold"
            size={16}
          />
        ),
        buttonAction: () =>
          showExplainerSheet({
            show: true,
            header: {
              icon: (
                <Inline space="8px" alignVertical="center">
                  <Box>
                    <CoinIcon asset={assetToSell} size={40} />
                  </Box>
                  <ChevronRightDouble
                    colorLeft="separatorSecondary"
                    colorRight="separator"
                  />
                  <Box>
                    <CoinIcon asset={assetToBuy} size={40} />
                  </Box>
                </Inline>
              ),
            },
            title: t('swap.explainers.no_route.title'),
            description: [t('swap.explainers.no_route.description')],
            actionButton: {
              label: t('swap.explainers.no_route.action_label'),
              variant: 'tinted',
              labelColor: 'blue',
              action: hideExplainerSheet,
            },
            testId: 'swap-no-route',
          }),
        status: 'error',
      };
    case 501:
    default:
      // no quote available
      return {
        buttonColor: 'fillSecondary',
        buttonDisabled: false,
        buttonLabel: t('swap.actions.no_quote'),
        buttonLabelColor: 'label',
        buttonIcon: (
          <Symbol
            symbol="exclamationmark.circle.fill"
            weight="bold"
            size={16}
          />
        ),
        buttonAction: () =>
          showExplainerSheet({
            show: true,
            header: { emoji: '🚧' },
            title: t('swap.explainers.no_quote.title'),
            description: [t('swap.explainers.no_quote.description')],

            actionButton: {
              label: t('swap.explainers.no_quote.action_label'),
              variant: 'tinted',
              labelColor: 'blue',
              action: hideExplainerSheet,
            },
            testId: 'swap-no-quote',
          }),
        status: 'error',
      };
  }
};
