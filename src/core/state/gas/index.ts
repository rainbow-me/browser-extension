import create from 'zustand';

import {
  GasFeeLegacyParams,
  GasFeeLegacyParamsBySpeed,
  GasFeeParams,
  GasFeeParamsBySpeed,
} from '~/core/types/gas';

import { createStore } from '../internal/createStore';

export interface GasStore {
  selectedGas: GasFeeParams | GasFeeLegacyParams;
  gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed;
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
}

export const gasStore = createStore<GasStore>(
  (set) => ({
    selectedGas: {} as GasFeeParams | GasFeeLegacyParams,
    gasFeeParamsBySpeed: {} as GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed,
    setSelectedGas: ({ selectedGas }) => {
      set({
        selectedGas,
      });
    },
    setGasFeeParamsBySpeed: ({ gasFeeParamsBySpeed }) => {
      set({
        gasFeeParamsBySpeed,
      });
    },
  }),
  {
    persist: {
      name: 'gas',
      version: 0,
    },
  },
);

export const useGasStore = create(gasStore);
