import { Address } from 'wagmi';
import create from 'zustand';

import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isNativePopup } from '~/core/utils/tabs';
import { IndependentField } from '~/entries/popup/hooks/swap/useSwapInputs';

import { createStore } from '../internal/createStore';

type SendAddress = Address | 'eth' | '';

interface PopupInstance {
  sendAddress: Address | string | null;
  sendAmount: string | null;
  sendField: 'asset' | 'native';
  sendTokenAddressAndChain: { address: SendAddress; chainId: ChainId } | null;
  swapAmount: string | null;
  swapField: IndependentField | null;
  swapTokenToBuy: ParsedSearchAsset | null;
  swapTokenToSell: ParsedSearchAsset | null;
}

const DEFAULT_POPUP_INSTANCE_VALUES: PopupInstance = {
  sendAddress: null,
  sendAmount: null,
  sendField: 'asset',
  sendTokenAddressAndChain: null,
  swapAmount: null,
  swapField: null,
  swapTokenToBuy: null,
  swapTokenToSell: null,
};

export interface PopupInstanceStore extends PopupInstance {
  resetValues: () => void;
  resetSwapValues: () => void;
  resetSendValues: () => void;
  saveSendAddress: ({ address }: { address: Address | string }) => void;
  saveSendAmount: ({ amount }: { amount: string }) => void;
  saveSendField: ({ field }: { field: 'asset' | 'native' }) => void;
  saveSendTokenAddressAndChain: ({
    address,
    chainId,
  }: {
    address: SendAddress;
    chainId: ChainId;
  }) => void;
  saveSwapAmount: ({ amount }: { amount: string }) => void;
  saveSwapField: ({ field }: { field: IndependentField }) => void;
  saveSwapTokenToBuy: ({ token }: { token: ParsedSearchAsset | null }) => void;
  saveSwapTokenToSell: ({ token }: { token: ParsedSearchAsset | null }) => void;
  setupPort: () => void;
}

export const popupInstanceStore = createStore<PopupInstanceStore>(
  (set) => ({
    ...DEFAULT_POPUP_INSTANCE_VALUES,
    resetValues: popupInstanceHandlerFactory(() =>
      set(DEFAULT_POPUP_INSTANCE_VALUES),
    ),
    resetSwapValues: popupInstanceHandlerFactory(() =>
      set({
        swapAmount: null,
        swapField: null,
        swapTokenToBuy: null,
        swapTokenToSell: null,
      }),
    ),
    resetSendValues: popupInstanceHandlerFactory(() =>
      set({
        sendAddress: null,
        sendAmount: null,
        sendField: 'asset',
        sendTokenAddressAndChain: null,
      }),
    ),
    saveSendAddress: popupInstanceHandlerFactory(({ address }) => {
      set({ sendAddress: address });
    }),
    saveSendAmount: popupInstanceHandlerFactory(({ amount }) => {
      set({ sendAmount: amount });
    }),
    saveSendField: popupInstanceHandlerFactory(({ field }) => {
      set({ sendField: field });
    }),
    saveSendTokenAddressAndChain: popupInstanceHandlerFactory(
      ({ address, chainId }) => {
        set({ sendTokenAddressAndChain: { address, chainId } });
      },
    ),
    saveSwapAmount: popupInstanceHandlerFactory(({ amount }) => {
      set({ swapAmount: amount });
    }),
    saveSwapField: popupInstanceHandlerFactory(({ field }) => {
      set({ swapField: field });
    }),
    saveSwapTokenToBuy: popupInstanceHandlerFactory(({ token }) => {
      set({ swapTokenToBuy: token });
    }),
    saveSwapTokenToSell: popupInstanceHandlerFactory(({ token }) => {
      set({ swapTokenToSell: token });
    }),
    setupPort: popupInstanceHandlerFactory(() => {
      chrome.runtime.connect({ name: 'popup' });
    }),
  }),
  {
    persist: {
      name: 'popupInstance',
      version: 0,
    },
  },
);

export const usePopupInstanceStore = create(popupInstanceStore);

// creates handlers that only work in popup context and passes through callback types
function popupInstanceHandlerFactory<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  THandler extends (...args: any) => any,
>(handler: THandler) {
  type handlerParams = Parameters<typeof handler>;
  return async (
    ...args: handlerParams
  ): Promise<void | ReturnType<THandler>> => {
    const isPopup = await isNativePopup();
    if (isPopup) {
      return handler(...(<[]>args));
    }
  };
}
