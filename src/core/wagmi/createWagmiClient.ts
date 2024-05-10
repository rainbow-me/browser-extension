import { Chain, Transport } from 'viem';
import { createConfig, http } from 'wagmi';

// import { proxyRpcEndpoint } from '../providers';
// import { queryClient } from '../react-query';
import { SUPPORTED_CHAINS, getDefaultRPC } from '../references';
import { ChainId, chainHardhat, chainHardhatOptimism } from '../types/chains';
import { findRainbowChainForChainId } from '../utils/chains';

const IS_TESTING = process.env.IS_TESTING === 'true';

// const noopStorage = {
//   getItem: () => '',
//   setItem: () => null,
//   removeItem: () => null,
// };

export const getOriginalRpcEndpoint = (chain: Chain) => {
  // overrides have preference
  const userAddedNetwork = findRainbowChainForChainId(chain.id);
  if (userAddedNetwork) {
    return { http: userAddedNetwork.rpcUrls.default.http[0] };
  }
  if (chain.id === ChainId.hardhat || chain.id === ChainId.hardhatOptimism) {
    return { http: chain.rpcUrls.default.http[0] };
  }

  return getDefaultRPC(chain.id);
};

const supportedChains = IS_TESTING
  ? SUPPORTED_CHAINS.concat(chainHardhat, chainHardhatOptimism)
  : SUPPORTED_CHAINS;

const chains = supportedChains.map((chain) => {
  const rpcUrl = getOriginalRpcEndpoint(chain)?.http;
  return {
    ...chain,
    rpcUrls: {
      default: {
        http: [rpcUrl],
      },
      public: {
        http: [rpcUrl],
      },
    },
  } as Chain;
}) as [Chain, ...Chain[]];

const transports = chains.reduce(
  (acc: Record<number, Transport>, chain: Chain) => {
    acc[chain.id] = http(getOriginalRpcEndpoint(chain)?.http);
    return acc;
  },
  {},
);

export const wagmiConfig = createConfig({
  chains,
  transports,
});

// export const configureChainsForWagmiClient = (
//   chains: Chain[],
//   useProxy?: boolean,
// ) =>
//   configureChains(chains, [
//     jsonRpcProvider({
//       rpc: (chain) => {
//         const originalRpcEndpoint = getOriginalRpcEndpoint(chain);
//         if (originalRpcEndpoint) {
//           return {
//             http: useProxy
//               ? proxyRpcEndpoint(originalRpcEndpoint.http, chain.id)
//               : originalRpcEndpoint.http,
//           };
//         }
//         return null;
//       },
//     }),
//   ]);

// const asyncStoragePersister = createAsyncStoragePersister({
//   key: 'rainbow.wagmi',
//   storage: {
//     getItem: LocalStorage.get,
//     setItem: LocalStorage.set,
//     removeItem: LocalStorage.remove,
//   },
// });

// const storage = createStorage({ storage: LocalStorage });

// export function createWagmiClient({
//   autoConnect,
//   connectors,
//   persist,
//   rainbowChains = supportedChains,
//   useProxy,
// }: {
//   autoConnect?: CreateClientConfig['autoConnect'];
//   connectors?: (opts: { chains: Chain[] }) => CreateClientConfig['connectors'];
//   persist?: boolean;
//   rainbowChains?: Chain[];
//   useProxy?: boolean;
// } = {}) {
//   const { chains, provider, webSocketProvider } = configureChainsForWagmiClient(
//     rainbowChains,
//     useProxy,
//   );

//   return createClient({
//     autoConnect,
//     connectors: connectors
//       ? connectors({
//           chains,
//         })
//       : undefined,
//     persister: persist ? asyncStoragePersister : undefined,
//     provider,
//     // Passing `undefined` will use wagmi's default storage (window.localStorage).
//     // If `persist` is falsy, we want to pass through a noopStorage.
//     storage: persist ? undefined : createStorage({ storage: noopStorage }),
//     // queryClient,
//     webSocketProvider,
//   });
// }
