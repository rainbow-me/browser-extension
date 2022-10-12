import { Persister } from '@tanstack/react-query-persist-client';
import { configureChains, chain, createClient } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const { provider, webSocketProvider } = configureChains(
  [chain.mainnet],
  [alchemyProvider(), publicProvider()],
);

export function createWagmiClient({
  persister,
}: { persister?: Persister } = {}) {
  return createClient({
    persister,
    provider,
    webSocketProvider,
  });
}
