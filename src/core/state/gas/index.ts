import create from 'zustand';

import {
  GasFeeLegacyParams,
  GasFeeLegacyParamsBySpeed,
  GasFeeParams,
  GasFeeParamsBySpeed,
  GasSpeed,
} from '~/core/types/gas';

import { createStore } from '../internal/createStore';

export interface GasStore {
  selectedGas: GasFeeParams | GasFeeLegacyParams;
  gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed;
  customGasModified: boolean;
  currentBaseFee: string;
  setCustomSpeed: (speed: GasFeeParams) => void;
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
  setCurrentBaseFee: (currrentBaseFee: string) => void;
}

export const gasStore = createStore<GasStore>(
  (set, get) => ({
    selectedGas: {} as GasFeeParams | GasFeeLegacyParams,
    gasFeeParamsBySpeed: {} as GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed,
    customGasModified: false,
    currentBaseFee: '',
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
    setCustomSpeed: (speed: GasFeeParams) => {
      const { gasFeeParamsBySpeed } = get();
      set({
        gasFeeParamsBySpeed: {
          ...gasFeeParamsBySpeed,
          [GasSpeed.CUSTOM]: speed,
        } as GasFeeParamsBySpeed,
        customGasModified: true,
      });
    },
    clearCustomGasModified: () => {
      set({ customGasModified: false });
    },
    setCurrentBaseFee: (currentBaseFee: string) => {
      set({ currentBaseFee });
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
