import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import React from 'react';

import { ParsedSearchAsset } from '~/core/types/assets';
import { Box, Inline, Symbol } from '~/design-system';

import { ChevronRightDouble } from '../../components/ChevroRightDouble';
import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import { ExplainerSheetProps } from '../../components/ExplainerSheet/ExplainerSheet';
import { Spinner } from '../../components/Spinner/Spinner';

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
      buttonLabel: 'Loading',
      buttonIcon: (
        <Box
          width="fit"
          alignItems="center"
          justifyContent="center"
          style={{ margin: 'auto' }}
        >
          <Spinner size={16} color={'label'} />
        </Box>
      ),
      buttonAction: () => null,
    };
  }
  if (!quote || !(quote as QuoteError).error) {
    return {
      buttonLabel: 'Review',
      buttonIcon: (
        <Symbol symbol="doc.text.magnifyingglass" weight="bold" size={16} />
      ),
      buttonAction: () => null,
    };
  }

  const quoteError = quote as QuoteError;

  switch (quoteError.error_code) {
    case 502:
      // insufficient liquidity
      return {
        buttonLabel: 'Insufficient liquidity',
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
            title: 'Insufficient liquidity',
            description: [
              'We couldn’t find quotes for this swap because this pair doesn’t have enough liquidity on exchanges.',
            ],
            footerLinkText: {
              openText: ' Still curious?',
              linkText: 'Read more',
              closeText: 'about AMMs and token liquidity.',
              link: 'https://learn.rainbow.me/protecting-transactions-with-flashbots',
            },
            actionButton: {
              label: 'Got it',
              variant: 'tinted',
              labelColor: 'blue',
              action: hideExplanerSheet,
            },
          }),
      };
    case 504:
      // no route
      return {
        buttonLabel: 'No route found',
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
            title: 'No routes found',
            description: [
              'We couldn’t find a route for this swap. A route may not exist for this swap, or the amount may be too small.',
            ],

            actionButton: {
              label: 'Got it',
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
        buttonLabel: 'No quote available',
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
            title: 'No quote available',
            description: [
              'We couldn’t find quotes for this swap. This could be because there isn’t enough liqudity to swap or because of problems with how the  token is implemented.',
            ],

            actionButton: {
              label: 'Got it',
              variant: 'tinted',
              labelColor: 'blue',
              action: hideExplanerSheet,
            },
          }),
      };
  }
};
