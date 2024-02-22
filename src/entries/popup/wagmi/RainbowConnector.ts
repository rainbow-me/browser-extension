import { getAddress } from '@ethersproject/address';
import {
  ExternalProvider,
  JsonRpcSigner,
  Web3Provider,
} from '@ethersproject/providers';
import { RainbowProvider } from '@rainbow-me/provider';
import { Chain, Connector } from 'wagmi';

import { currentAddressStore, currentChainIdStore } from '~/core/state';

function normalizeChainId(chainId: `0x${string}` | number | bigint) {
  if (typeof chainId === 'string') return Number(BigInt(chainId));
  if (typeof chainId === 'bigint') return Number(chainId);
  return chainId;
}

export class RainbowConnector extends Connector<
  RainbowProvider,
  Record<string, unknown>,
  JsonRpcSigner
> {
  readonly id: string;
  readonly name: string;
  readonly ready = true;

  #provider: RainbowProvider;

  constructor({
    chains,
  }: {
    chains?: Chain[];
  } = {}) {
    super({ chains, options: {} });

    this.id = 'rainbow';
    this.name = 'rainbow';
    this.#provider = new RainbowProvider();
  }

  async connect() {
    const [provider, account, chainId] = await Promise.all([
      this.getProvider(),
      this.getAccount(),
      this.getChainId(),
    ]);

    currentAddressStore.subscribe((state) => {
      if (state.currentAddress) {
        this.onAccountsChanged([state.currentAddress]);
      }
    });

    currentChainIdStore.subscribe((state) => {
      if (state.currentChainId) {
        this.onChainChanged(state.currentChainId);
      }
    });

    return {
      account,
      chain: { id: chainId, unsupported: false },
      provider: new Web3Provider(<ExternalProvider>(<unknown>provider)),
    };
  }

  async disconnect() {
    const provider = await this.getProvider();
    if (!provider?.removeListener) return;

    // TODO: Remove event listeners from `connect`.
  }

  async isAuthorized() {
    return true;
  }

  async getAccount() {
    const currentAddress = currentAddressStore.getState().currentAddress;
    return currentAddress;
  }

  async getChainId() {
    const currentChainId = currentChainIdStore.getState().currentChainId;
    return currentChainId || 1;
  }

  async getProvider() {
    return this.#provider;
  }

  async getSigner({ chainId }: { chainId?: number } = {}) {
    const [provider, account] = await Promise.all([
      this.getProvider(),
      this.getAccount(),
    ]);
    return new Web3Provider(
      <ExternalProvider>(<unknown>provider),
      chainId,
    ).getSigner(account);
  }

  protected onAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) this.emit('disconnect');
    else this.emit('change', { account: getAddress(<string>accounts[0]) });
  };

  protected onChainChanged = (chainId: number | `0x${string}`) => {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit('change', { chain: { id, unsupported } });
  };

  protected onDisconnect = () => {
    this.emit('disconnect');
  };
}
