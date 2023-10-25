import create from 'zustand';

import { createStore } from '../internal/createStore';

interface CustomRPC {
  rpcUrl: string;
  chainId: number;
  name: string;
  symbol: string;
  explorer?: string;
  explorerName?: string;
  active?: boolean;
  nativeAssetAddress?: string;
}
export interface CustomRPCsState {
  customRPCs: Record<string, CustomRPC>;
  setCustomRPC: ({ customRPC }: { customRPC: CustomRPC }) => void;
  removeCustomRPC: ({ rpcUrl }: { rpcUrl: string }) => void;
}

export const customRPCsStore = createStore<CustomRPCsState>(
  (set, get) => ({
    customRPCs: {},
    setCustomRPC: ({ customRPC }) => {
      const { customRPCs } = get();
      set({
        customRPCs: { ...customRPCs, [customRPC.rpcUrl]: customRPC },
      });
    },
    removeCustomRPC: ({ rpcUrl }) => {
      const { customRPCs } = get();
      delete customRPCs[rpcUrl];
      set({
        customRPCs: {
          ...customRPCs,
        },
      });
    },
  }),
  {
    persist: {
      name: 'customRPCs',
      version: 0,
    },
  },
);

export const useCustomRPCsStore = create(customRPCsStore);
