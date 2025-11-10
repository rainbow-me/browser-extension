import { createBaseStore } from '@storesjs/stores';

import {
  GasFeeLegacyParams,
  GasFeeLegacyParamsBySpeed,
  GasFeeParams,
  GasFeeParamsBySpeed,
  GasSpeed,
} from '~/core/types/gas';

import { createExtensionStoreOptions } from '../_internal';

export interface GasStore {
  selectedGas: GasFeeParams | GasFeeLegacyParams;
  gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed;
  customGasModified: boolean;
  setCustomSpeed: (speed: GasFeeParams) => void;
  setCustomLegacySpeed: (speed: GasFeeLegacyParams) => void;
  setSelectedGas: ({
    selectedGas,
  }: {
    selectedGas: GasFeeParams | GasFeeLegacyParams;
  }) => void;
  setGasFeeParamsBySpeed: ({
    gasFeeParamsBySpeed,
  }: {
    gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed;
  }) => void;
  clearCustomGasModified: () => void;
}

export const useGasStore = createBaseStore<GasStore>(
  (set) => ({
    selectedGas: {} as GasFeeParams | GasFeeLegacyParams,
    gasFeeParamsBySpeed: {} as GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed,
    customGasModified: false,
    setSelectedGas: ({ selectedGas }) => set({ selectedGas }),
    setGasFeeParamsBySpeed: ({ gasFeeParamsBySpeed }) =>
      set({ gasFeeParamsBySpeed }),
    setCustomSpeed: (speed: GasFeeParams) =>
      set((state) => ({
        gasFeeParamsBySpeed: {
          ...state.gasFeeParamsBySpeed,
          [GasSpeed.CUSTOM]: speed,
        } as GasFeeParamsBySpeed,
        customGasModified: true,
      })),
    setCustomLegacySpeed: (speed: GasFeeLegacyParams) =>
      set((state) => ({
        gasFeeParamsBySpeed: {
          ...state.gasFeeParamsBySpeed,
          [GasSpeed.CUSTOM]: speed,
        } as GasFeeLegacyParamsBySpeed,
        customGasModified: true,
      })),
    clearCustomGasModified: () => {
      set({ customGasModified: false });
    },
  }),
  createExtensionStoreOptions({
    storageKey: 'gas',
    version: 0,
  }),
);
