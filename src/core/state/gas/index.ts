import create from 'zustand';

import {
  GasFeeLegacyParams,
  GasFeeLegacyParamsBySpeed,
  GasFeeParams,
  GasFeeParamsBySpeed,
  GasSpeed,
} from '~/core/types/gas';
import { gweiToWei } from '~/core/utils/ethereum';
import { parseGasFeeParam } from '~/core/utils/gas';

import { createStore } from '../internal/createStore';

export interface GasStore {
  selectedGas: GasFeeParams | GasFeeLegacyParams;
  gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed;
  customGasModified: boolean;
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
  setCustomMaxBaseFee: (maxBaseFee: string) => void;
  setCustomMinerTip: (minerTip: string) => void;
}

export const gasStore = createStore<GasStore>(
  (set, get) => ({
    selectedGas: {} as GasFeeParams | GasFeeLegacyParams,
    gasFeeParamsBySpeed: {} as GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed,
    customGasModified: false,
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
    setCustomMaxBaseFee: (maxBaseFee) => {
      const { gasFeeParamsBySpeed } = get();
      const customSpeed = gasFeeParamsBySpeed.custom as GasFeeParams;
      (customSpeed as GasFeeParams).maxBaseFee = parseGasFeeParam({
        wei: maxBaseFee ? gweiToWei(maxBaseFee) : '0',
      });
      set({
        gasFeeParamsBySpeed: {
          ...gasFeeParamsBySpeed,
          [GasSpeed.CUSTOM]: customSpeed,
        } as GasFeeParamsBySpeed,
        customGasModified: true,
      });
    },
    setCustomMinerTip: (minerTip) => {
      const { gasFeeParamsBySpeed } = get();
      const customSpeed = gasFeeParamsBySpeed.custom as GasFeeParams;
      customSpeed.maxPriorityFeePerGas = parseGasFeeParam({
        wei: minerTip ? gweiToWei(minerTip) : '0',
      });
      set({
        gasFeeParamsBySpeed: {
          ...gasFeeParamsBySpeed,
          [GasSpeed.CUSTOM]: customSpeed,
        } as GasFeeParamsBySpeed,
        customGasModified: true,
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
