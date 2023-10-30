import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface CustomRPC {
  rpcUrl: string;
  chainId: number;
  name: string;
  symbol: string;
  explorer?: string;
  active?: boolean;
}

export interface CustomChain {
  activeRpcId: string;
  rpcs: CustomRPC[];
}

export interface CustomRPCsState {
  customChains: Record<number, CustomChain>;
  addCustomRPC: ({ customRPC }: { customRPC: CustomRPC }) => void;
  updateCustomRPC: ({ customRPC }: { customRPC: CustomRPC }) => void;
  setActiveRPC: ({
    rpcUrl,
    chainId,
  }: {
    rpcUrl: string;
    chainId: number;
  }) => void;
  removeCustomRPC: ({ rpcUrl }: { rpcUrl: string }) => void;
}

export const customRPCsStore = createStore<CustomRPCsState>(
  (set, get) => ({
    customChains: {},
    addCustomRPC: ({ customRPC }) => {
      const customChains = get().customChains;
      const chain = customChains[customRPC.chainId] || {
        rpcs: [],
        activeRpcId: '',
      };
      chain.rpcs.push(customRPC);
      if (!chain.activeRpcId) chain.activeRpcId = customRPC.rpcUrl;
      set({ customChains: { ...customChains, [customRPC.chainId]: chain } });
    },
    updateCustomRPC: ({ customRPC }) => {
      const customChains = get().customChains;
      const chain = customChains[customRPC.chainId];
      const index = chain?.rpcs.findIndex(
        (rpc) => rpc.rpcUrl === customRPC.rpcUrl,
      );
      if (index !== -1) {
        chain.rpcs[index] = customRPC;
        set({ customChains: { ...customChains, [customRPC.chainId]: chain } });
      }
    },
    setActiveRPC: ({ rpcUrl, chainId }) => {
      const customChains = get().customChains;
      const chain = customChains[chainId];
      if (chain) {
        chain.activeRpcId = rpcUrl;
        set({ customChains: { ...customChains, [chainId]: chain } });
      }
    },

    removeCustomRPC: ({ rpcUrl }) => {
      const customChains = get().customChains;
      const updatedCustomChains = { ...customChains };

      Object.entries(customChains).forEach(([chainId, chain]) => {
        const index = chain.rpcs.findIndex((rpc) => rpc.rpcUrl === rpcUrl);
        if (index !== -1) {
          chain.rpcs.splice(index, 1);

          // If deleted RPC was active, reset activeRpcId or set to another RPC if available
          if (chain.activeRpcId === rpcUrl) {
            chain.activeRpcId = chain.rpcs[0]?.rpcUrl || '';
          }

          // Remove the chain if no RPCs are left
          if (!chain.rpcs.length) {
            delete updatedCustomChains[Number(chainId)];
          } else {
            updatedCustomChains[Number(chainId)] = chain;
          }
        }
      });

      set({ customChains: updatedCustomChains });
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
