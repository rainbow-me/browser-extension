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
    customRPCs: {},
    addCustomRPC: ({ customRPC }) => {
      const { customChains } = get();
      const chain =
        customChains[customRPC.chainId] ||
        ({
          rpcs: [],
          activeRpcId: '',
        } satisfies CustomChain);

      chain.rpcs.push(customRPC);
      if (!chain.activeRpcId) {
        chain.activeRpcId = customRPC.rpcUrl;
      }
      set({
        customChains: {
          ...customChains,
          [customRPC.chainId]: chain,
        },
      });
    },
    updateCustomRPC: ({ customRPC }) => {
      const { customChains } = get();
      const chain = customChains[customRPC.chainId];
      const index = chain.rpcs.findIndex(
        (rpc) => rpc.rpcUrl === customRPC.rpcUrl,
      );
      if (index !== -1) {
        chain.rpcs[index] = customRPC;
        set({
          customChains: {
            ...customChains,
            [customRPC.chainId]: chain,
          },
        });
      }
    },
    setActiveRPC: ({ chainId, rpcUrl }) => {
      const { customChains } = get();
      const chain = customChains[chainId];
      if (chain) {
        set({
          customChains: {
            ...customChains,
            [chainId]: {
              ...chain,
              activeRpcId: rpcUrl,
            },
          },
        });
      }
    },
    removeCustomRPC: ({ rpcUrl }) => {
      const { customChains } = get();
      let updatedCustomChains = { ...customChains };
      for (const chainId of Object.keys(customChains)) {
        const chain = customChains[Number(chainId)];
        const index = chain.rpcs.findIndex((rpc) => rpc.rpcUrl === rpcUrl);
        if (index !== -1) {
          chain.rpcs.splice(index, 1);
          // If deleted RPC was active, reset activeRpcId or set to another RPC if available
          if (chain.rpcs.length && chain.activeRpcId === rpcUrl) {
            chain.activeRpcId = chain.rpcs[0]?.rpcUrl || '';
          }
        }
        if (chain.rpcs.length) {
          updatedCustomChains = { ...updatedCustomChains, [chainId]: chain };
        } else {
          delete updatedCustomChains[Number(chainId)];
        }
      }
      set({
        customChains: {
          ...updatedCustomChains,
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
