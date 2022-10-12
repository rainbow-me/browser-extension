import { Persister } from '@tanstack/react-query-persist-client';
import { configureChains, chain, createClient } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowConnector } from './RainbowConnector';

const { chains, provider, webSocketProvider } = configureChains(
  [chain.mainnet],
  [alchemyProvider(), publicProvider()],
);

export function createWagmiClient({
  persister,
}: { persister?: Persister } = {}) {
  return createClient({
    autoConnect: true,
    connectors: [new RainbowConnector({ chains })],
    persister,
    provider,
    webSocketProvider,
  });
}
