import { Chain } from 'viem';

import { SUPPORTED_CHAINS } from '~/core/references/chains';
import {
  ChainId,
  chainHardhat,
  chainHardhatOptimism,
} from '~/core/types/chains';

import { RainbowChain, RainbowChainsState } from '.';

const IS_TESTING = process.env.IS_TESTING === 'true';

export const RAINBOW_CHAINS_SUPPORTED = IS_TESTING
  ? SUPPORTED_CHAINS.concat(chainHardhat, chainHardhatOptimism)
  : SUPPORTED_CHAINS;

export const getInitialRainbowChains = () => {
  const rainbowChains: Record<number, RainbowChain> = {};
  RAINBOW_CHAINS_SUPPORTED.forEach((chain) => {
    const rpcUrl = chain.rpcUrls.default.http[0];
    const rnbwChain = {
      ...chain,
      rpcUrls: {
        default: { http: [rpcUrl] },
        public: { http: [rpcUrl] },
      },
    };
    rainbowChains[chain.id] = {
      activeRpcUrl: rpcUrl,
      chains: [rnbwChain],
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
