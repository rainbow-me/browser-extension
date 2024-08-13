import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { i18n } from '~/core/languages';
import { QuoteTypeMap } from '~/core/raps/references';
import { useFlashbotsEnabledStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { useSwapAssetsToRefreshStore } from '~/core/state/swapAssetsToRefresh';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isSameAssetInDiffChains } from '~/core/utils/assets';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import playSound from '~/entries/popup/utils/playSound';
import { RainbowError, logger } from '~/logger';

import * as wallet from '../../handlers/wallet';

export const onSwap = async ({
  assetToSell,
  assetToBuy,
  quote,
  degenMode,
}: {
  assetToSell: ParsedSearchAsset | undefined | null;
  assetToBuy: ParsedSearchAsset | undefined | null;
  quote: Quote | CrosschainQuote | QuoteError;
  degenMode: boolean;
}): Promise<boolean> => {
  if (!assetToSell || !assetToBuy || !quote || 'error' in quote) {
    return false;
  }

  const type =
    assetToSell.chainId !== assetToBuy.chainId ? 'crosschainSwap' : 'swap';
  const q = quote as QuoteTypeMap[typeof type];

  const flashbots =
    assetToSell.chainId === ChainId.mainnet &&
    useFlashbotsEnabledStore.getState().swapFlashbotsEnabled;

  const isConnectedToHardhat =
    useConnectedToHardhatStore.getState().connectedToHardhat;
  const chainId = isConnectedToHardhat ? ChainId.hardhat : assetToSell.chainId;

  const { errorMessage, nonce } = await wallet.executeRap<typeof type>({
    rapActionParameters: {
      sellAmount: q.sellAmount?.toString(),
      buyAmount: q.buyAmount?.toString(),
      chainId,
      assetToSell: assetToSell,
      assetToBuy: assetToBuy,
      quote: q,
      flashbots,
    },
    type,
  });

  if (errorMessage) {
    if (errorMessage !== 'handled') {
      logger.error(new RainbowError('swap: error executing swap'), {
        message: errorMessage,
      });
      triggerAlert({
        text: i18n.t('errors.executing_swap'),
        description: errorMessage.split('[')[0],
      });
    }

    return false;
  }

  usePopupInstanceStore.getState().resetSwapValues();
  useSwapAssetsToRefreshStore
    .getState()
    .setSwapAssetsToRefresh({ nonce, assetToBuy, assetToSell });

  const isBridge = isSameAssetInDiffChains(assetToSell, assetToBuy);

  analytics.track(isBridge ? event.bridgeSubmitted : event.swapSubmitted, {
    inputAssetSymbol: assetToSell.symbol,
    inputAssetName: assetToSell.name,
    inputAssetAddress: assetToSell.address,
    inputAssetChainId: assetToSell.chainId,
    inputAssetAmount: q.sellAmount as number,
    outputAssetSymbol: assetToBuy.symbol,
    outputAssetName: assetToBuy.name,
    outputAssetAddress: assetToBuy.address,
    outputAssetChainId: assetToBuy.chainId,
    outputAssetAmount: q.buyAmount as number,
    mainnetAddress:
      assetToBuy?.chainId === ChainId.mainnet ? 'address' : 'mainnetAddress',
    flashbots,
    tradeAmountUSD: q.tradeAmountUSD,
    crosschain: assetToSell.chainId !== assetToBuy.chainId,
    degenMode,
  });

  playSound('SendSound');

  return true;
};
