import { getConnectorClient } from '@wagmi/core';
import { providers } from 'ethers';
import type { Account, Chain, Client, Transport } from 'viem';

import { wagmiConfig } from './createWagmiClient';

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Action to convert a Viem Client to an ethers.js Signer. */
export async function getEthersSigner({ chainId }: { chainId?: number } = {}) {
  const client = await getConnectorClient(wagmiConfig, { chainId });
  return clientToSigner(client);
}
