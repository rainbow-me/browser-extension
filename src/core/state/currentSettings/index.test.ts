import { expect, test } from 'vitest';
import { chain } from 'wagmi';

import { Language } from '~/core/languages';

import {
  currentAddressStore,
  currentChainIdStore,
  currentCurrencyStore,
  currentLanguageStore,
} from '.';

test('should be able to set and change language', async () => {
  const { currentLanguage, setCurrentLanguage } =
    currentLanguageStore.getState();
  expect(currentLanguage).toBe(Language.EN);
  setCurrentLanguage(Language.ES);
  expect(currentLanguageStore.getState().currentLanguage).toBe(Language.ES);
});

test('should be able to set and change address', async () => {
  const { currentAddress, setCurrentAddress } = currentAddressStore.getState();
  expect(currentAddress).toBe('0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4');
  setCurrentAddress('0x123');
  expect(currentAddressStore.getState().currentAddress).toBe('0x123');
});

test('should be able to set and change chainId', async () => {
  const { currentChainId, setCurrentChainId } = currentChainIdStore.getState();
  expect(currentChainId).toBe(1);
  setCurrentChainId(chain.mainnet.id);
  expect(currentChainIdStore.getState().currentChainId).toBe(chain.mainnet.id);
});

test('should be able to set and change currency', async () => {
  const { currentCurrency, setCurrentCurrency } =
    currentCurrencyStore.getState();
  expect(currentCurrency).toBe('USD');
  setCurrentCurrency('EUR');
  expect(currentCurrencyStore.getState().currentCurrency).toBe('EUR');
});
