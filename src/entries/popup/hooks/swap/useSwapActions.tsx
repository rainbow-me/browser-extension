import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import React from 'react';

import { i18n } from '~/core/languages';
import { ParsedSearchAsset } from '~/core/types/assets';
import { Bleed, Box, Inline, Symbol } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';
import {
  BackgroundColor,
  ButtonColor,
  TextColor,
} from '~/design-system/styles/designTokens';

import { ChevronRightDouble } from '../../components/ChevroRightDouble';
import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import { ExplainerSheetProps } from '../../components/ExplainerSheet/ExplainerSheet';
import { Spinner } from '../../components/Spinner/Spinner';

export const getCrossChainTimeEstimate = ({
  serviceTime,
}: {
  serviceTime?: number;
}): {
  isLongWait: boolean;
  timeEstimate?: number;
  timeEstimateDisplay: string;
} => {
  let isLongWait = false;
  let timeEstimateDisplay;
  const timeEstimate = serviceTime;

  const minutes = Math.floor(timeEstimate || 0 / 60);
  const hours = Math.floor(minutes / 60);

  if (hours >= 1) {
    isLongWait = true;
    timeEstimateDisplay = `>${hours} ${i18n.t(
      `time.hours.long.${hours === 1 ? 'singular' : 'plural'}`,
    )}`;
  } else if (minutes >= 1) {
    timeEstimateDisplay = `~${minutes} ${i18n.t(
      `time.minutes.short.${minutes === 1 ? 'singular' : 'plural'}`,
    )}`;
  } else {
    timeEstimateDisplay = `~${timeEstimate} ${i18n.t(
      `time.seconds.short.${timeEstimate === 1 ? 'singular' : 'plural'}`,
    )}`;
  }

  return {
    isLongWait,
    timeEstimate,
    timeEstimateDisplay,
  };
};

interface UseSwapErrorProps {
  quote?: Quote | CrosschainQuote | QuoteError;
  isLoading: boolean;
  assetToSell?: ParsedSearchAsset | null;
  assetToBuy?: ParsedSearchAsset | null;
  hideExplanerSheet: () => void;
  showExplainerSheet: (params: ExplainerSheetProps) => void;
}

export const useSwapActions = ({
  quote,
  isLoading,
  assetToSell,
  assetToBuy,
  hideExplanerSheet,
  showExplainerSheet,
}: UseSwapErrorProps) => {
  if (isLoading) {
    return {
      buttonColor: 'surfaceSecondary' as
        | BackgroundColor
        | ButtonColor
        | TextColor,
      buttonLabelColor: 'labelQuaternary' as TextStyles['color'],
      buttonDisabled: true,
      buttonLabel: i18n.t('swap.actions.loading'),
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
    };
  }

  if (!quote) {
    return {
      buttonColor: 'surfaceSecondary' as
        | BackgroundColor
        | ButtonColor
        | TextColor,
      buttonDisabled: true,
      buttonLabel: i18n.t('swap.actions.enter_an_amount'),
      buttonLabelColor: 'labelQuaternary' as TextStyles['color'],
      buttonIcon: null,
      buttonAction: () => null,
    };
  }

  if (!(quote as QuoteError).error) {
    const serviceTime =
      (quote as CrosschainQuote)?.routes?.[0]?.serviceTime || 0;
    const timeEstimate = serviceTime
      ? getCrossChainTimeEstimate({ serviceTime })
      : null;

    return {
      buttonColor: 'accent' as BackgroundColor | ButtonColor | TextColor,
      buttonDisabled: false,
      buttonLabel: i18n.t('swap.actions.review'),
      buttonLabelColor: 'label' as TextStyles['color'],
      buttonIcon: (
        <Symbol symbol="doc.text.magnifyingglass" weight="bold" size={16} />
      ),
      buttonAction: () =>
        timeEstimate?.isLongWait
          ? showExplainerSheet({
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
              title: i18n.t('swap.explainers.long_wait.title'),
              description: [i18n.t('swap.explainers.long_wait.description')],
              actionButton: {
                label: i18n.t('swap.explainers.long_wait.action_label'),
                variant: 'tinted',
                labelColor: 'blue',
                action: hideExplanerSheet,
              },
            })
          : null,
      timeEstimate,
    };
  }

  switch ((quote as QuoteError).error_code) {
    case 502:
      // insufficient liquidity
      return {
        buttonColor: 'fillSecondary' as
          | BackgroundColor
          | ButtonColor
          | TextColor,
        buttonDisabled: false,
        buttonLabel: i18n.t('swap.actions.insufficient_liquidity'),
        buttonLabelColor: 'label' as TextStyles['color'],
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
            title: i18n.t('swap.explainers.insufficient_liquidity.title'),
            description: [
              i18n.t('swap.explainers.insufficient_liquidity.description'),
            ],
            footerLinkText: {
              openText: i18n.t(
                'swap.explainers.insufficient_liquidity.footer_text.open_text',
              ),
              linkText: i18n.t(
                'swap.explainers.insufficient_liquidity.footer_text.link_text',
              ),
              closeText: i18n.t(
                'swap.explainers.insufficient_liquidity.footer_text.close_text',
              ),
              link: 'https://learn.rainbow.me/a-beginners-guide-to-liquidity-providing',
            },
            actionButton: {
              label: i18n.t(
                'swap.explainers.insufficient_liquidity.action_label',
              ),
              variant: 'tinted',
              labelColor: 'blue',
              action: hideExplanerSheet,
            },
          }),
      };
    case 504:
      // no route
      return {
        buttonColor: 'fillSecondary' as
          | BackgroundColor
          | ButtonColor
          | TextColor,
        buttonDisabled: false,
        buttonLabel: i18n.t('swap.actions.no_route'),
        buttonLabelColor: 'label' as TextStyles['color'],
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
            title: i18n.t('swap.explainers.no_route.title'),
            description: [i18n.t('swap.explainers.no_route.title')],
            actionButton: {
              label: i18n.t('swap.explainers.no_route.title'),
              variant: 'tinted',
              labelColor: 'blue',
              action: hideExplanerSheet,
            },
          }),
      };
    case 501:
    default:
      // no quote available
      return {
        buttonColor: 'fillSecondary' as
          | BackgroundColor
          | ButtonColor
          | TextColor,
        buttonDisabled: false,
        buttonLabel: i18n.t('swap.actions.insufficient_liquidityno_quote'),
        buttonLabelColor: 'label' as TextStyles['color'],
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
            title: i18n.t('swap.explainers.no_quote.title'),
            description: [i18n.t('swap.explainers.no_quote.title')],

            actionButton: {
              label: i18n.t('swap.explainers.no_quote.title'),
              variant: 'tinted',
              labelColor: 'blue',
              action: hideExplanerSheet,
            },
          }),
      };
  }
};
