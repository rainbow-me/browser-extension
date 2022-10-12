import * as React from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { WagmiConfig } from 'wagmi';
import { Index } from './pages';
import { createWagmiClient } from '~/core/wagmi';
import { persistOptions, queryClient } from '~/core/react-query';

const wagmiClient = createWagmiClient({ persist: true });

export function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      <WagmiConfig client={wagmiClient}>
        <Index />
      </WagmiConfig>
    </PersistQueryClientProvider>
  );
}
