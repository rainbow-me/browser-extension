import create from 'zustand';

import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';

import { createStore } from '../internal/createStore';

export interface GasStore {
  selectedGas: GasFeeParams | GasFeeLegacyParams;
  setSelectedGas: ({
    selectedGas,
  }: {
    selectedGas: GasFeeParams | GasFeeLegacyParams;
  }) => GasFeeParams | GasFeeLegacyParams;
}

export const gasStore = createStore<GasStore>(
  (set) => ({
    selectedGas: {} as GasFeeParams | GasFeeLegacyParams,
    setSelectedGas: ({ selectedGas }) => {
      set({
        selectedGas,
      });
      return selectedGas;
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
