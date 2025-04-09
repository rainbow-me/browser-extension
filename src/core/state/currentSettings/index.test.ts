import { expect, test } from 'vitest';

import { Language } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { DEFAULT_ACCOUNT } from '~/core/utils/defaults';

import {
  useCurrentAddressStore,
  useCurrentChainIdStore,
  useCurrentCurrencyStore,
  useCurrentLanguageStore,
} from '.';

test('should be able to set and change language', async () => {
  const { currentLanguage, setCurrentLanguage } =
    useCurrentLanguageStore.getState();
  expect(currentLanguage).toBe(Language.EN_US);
  await setCurrentLanguage(Language.ES_419);
  expect(useCurrentLanguageStore.getState().currentLanguage).toBe(
    Language.ES_419,
  );
});

test('should be able to set and change address', async () => {
  const { setCurrentAddress } = useCurrentAddressStore.getState();
  setCurrentAddress(DEFAULT_ACCOUNT);
  const { currentAddress } = useCurrentAddressStore.getState();
  expect(currentAddress).toBe('0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4');
  setCurrentAddress('0x123');
  expect(useCurrentAddressStore.getState().currentAddress).toBe('0x123');
});

test('should be able to set and change chainId', async () => {
  const { currentChainId, setCurrentChainId } =
    useCurrentChainIdStore.getState();
  expect(currentChainId).toBe(1);
  setCurrentChainId(ChainId.mainnet);
  expect(useCurrentChainIdStore.getState().currentChainId).toBe(
    ChainId.mainnet,
  );
});

test('should be able to set and change currency', async () => {
  const { currentCurrency, setCurrentCurrency } =
    useCurrentCurrencyStore.getState();
  expect(currentCurrency).toBe('USD');
  setCurrentCurrency('EUR');
  expect(useCurrentCurrencyStore.getState().currentCurrency).toBe('EUR');
});
