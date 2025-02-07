import { Chain } from 'viem';

import { networkStore } from '~/core/state/networks/networks';
import { oldDefaultRPC } from '~/core/state/networks/utils';
import { ChainId } from '~/core/types/chains';

import { RainbowChain, RainbowChainsState } from '.';

export const getInitialRainbowChains = () => {
  const rainbowChains: Record<number, RainbowChain> = {};
  const supportedChains = networkStore.getState().getSupportedChains(true);
  Object.values(supportedChains).forEach((chain) => {
    rainbowChains[chain.id] = {
      activeRpcUrl: chain.rpcUrls.default.http[0],
      chains: [chain],
    };
  });
  return rainbowChains;
};

export const mergeNewOfficiallySupportedChainsState = (
  state: RainbowChainsState,
  newChains: ChainId[],
) => {
  const officiallySupportedRainbowChains = getInitialRainbowChains();
  for (const chainId of newChains) {
    const officialConfig = officiallySupportedRainbowChains[chainId];
    const stateChain = state.rainbowChains[chainId];
    // if the rpc already exists in the state, merge the chains
    // else add the new rpc config to the state
    if (
      stateChain.chains.length > 0 &&
      !stateChain.chains.find(
        (chain) =>
          chain.rpcUrls.default.http[0] ===
          officialConfig.chains[0].rpcUrls.default.http[0],
      )
    ) {
      state.rainbowChains[chainId].chains = stateChain.chains.concat(
        officialConfig.chains,
      );
    } else {
      state.rainbowChains[chainId] = officialConfig;
    }
  }
  return state;
};

export const removeCustomRPC = ({
  state,
  rpcUrl,
  rainbowChains,
}: {
  state: RainbowChainsState;
  rpcUrl: string;
  rainbowChains: Record<number, RainbowChain>;
}) => {
  const updatedrainbowChains = { ...rainbowChains };

  Object.entries(rainbowChains).forEach(([chainId, rainbowChains]) => {
    const index = rainbowChains.chains.findIndex((chain) =>
      chain.rpcUrls.default.http.includes(rpcUrl),
    );
    if (index !== -1) {
      rainbowChains.chains.splice(index, 1);

      // If deleted RPC was active, reset activeRpcUrl or set to another RPC if available
      if (rainbowChains.activeRpcUrl === rpcUrl) {
        rainbowChains.activeRpcUrl =
          rainbowChains.chains[0]?.rpcUrls.default.http[0] || '';
      }

      // Remove the chain if no RPCs are left
      if (!rainbowChains.chains.length) {
        delete updatedrainbowChains[Number(chainId)];
      } else {
        updatedrainbowChains[Number(chainId)] = rainbowChains;
      }
    }
  });
  state.rainbowChains = updatedrainbowChains;

  return state;
};

export const addCustomRPC = ({
  state,
  chain,
}: {
  state: RainbowChainsState;
  chain: Chain;
}) => {
  const rainbowChains = state.rainbowChains;
  const rainbowChain = rainbowChains[chain.id] || {
    chains: [],
    activeRpcUrl: '',
  };
  rainbowChain.chains.push(chain);
  rainbowChain.activeRpcUrl = chain.rpcUrls.default.http[0];
  state.rainbowChains = { ...rainbowChains, [chain.id]: rainbowChain };
  return state;
};

export const replaceChainsWithInitial = (state: RainbowChainsState) => {
  const initialRainbowChains = getInitialRainbowChains();
  const updatedRainbowChains = { ...state.rainbowChains };

  Object.entries(updatedRainbowChains).forEach(
    ([chainId, currentRainbowChain]) => {
      const rainbowChain = initialRainbowChains[Number(chainId)];

      if (rainbowChain) {
        const oldRpcUrl = oldDefaultRPC[Number(chainId)];
        const newRainbowChain = rainbowChain.chains[0];
        const activeRpcUrl = currentRainbowChain.activeRpcUrl;
        const newRpcUrl = newRainbowChain.rpcUrls.default.http[0];

        // If the new chain's RPC URL is in oldDefaultRPC, replace the chain in chains
        // Otherwise, add the new chain to the chains array
        const existingChainIndex = currentRainbowChain.chains.findIndex(
          (chain) =>
            chain.rpcUrls.default.http[0] === oldDefaultRPC ||
            chain.rpcUrls.default.http[0] === newRpcUrl,
        );

        if (existingChainIndex !== -1) {
          currentRainbowChain.chains[existingChainIndex] = newRainbowChain;
        } else {
          currentRainbowChain.chains.push(newRainbowChain);
        }
        if (activeRpcUrl === oldRpcUrl) {
          currentRainbowChain.activeRpcUrl = newRpcUrl;
        }

        updatedRainbowChains[Number(chainId)] = currentRainbowChain;
      }
    },
  );

  state.rainbowChains = updatedRainbowChains;
  return state;
};
