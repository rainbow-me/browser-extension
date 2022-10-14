import { providers } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { Chain, Connector } from 'wagmi';

import { ChainIdHex, RainbowProvider } from '~/core/providers';
import { DEFAULT_ACCOUNT } from '~/entries/background/handlers/handleProviderRequest';

function normalizeChainId(chainId: ChainIdHex | number | bigint) {
  if (typeof chainId === 'string') return Number(BigInt(chainId));
  if (typeof chainId === 'bigint') return Number(chainId);
  return chainId;
}

export class RainbowConnector extends Connector<
  RainbowProvider,
  Record<string, unknown>,
  providers.JsonRpcSigner
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

  async connect({ chainId = this.chains[0].id } = {}) {
    const [provider, account] = await Promise.all([
      this.getProvider(),
      this.getAccount(),
    ]);

    // TODO: Hook event listeners up properly, and get them
    // to listen for changes in account/chain from the background
    // script.
    provider.on('accountsChanged', this.onAccountsChanged);
    provider.on('chainChanged', this.onChainChanged);
    provider.on('disconnect', this.onDisconnect);

    return {
      account,
      chain: { id: chainId, unsupported: false },
      provider: new providers.Web3Provider(
        <providers.ExternalProvider>provider,
      ),
    };
  }

  async disconnect() {
    const provider = await this.getProvider();
    if (!provider?.removeListener) return;

    provider.removeListener('accountsChanged', this.onAccountsChanged);
    provider.removeListener('chainChanged', this.onChainChanged);
    provider.removeListener('disconnect', this.onDisconnect);
  }

  async isAuthorized() {
    return true;
  }

  async getAccount() {
    // TODO: retrive account from background state properly...
    return getAddress(DEFAULT_ACCOUNT);
  }

  async getChainId() {
    const provider = await this.getProvider();
    return normalizeChainId(provider.chainId);
  }

  async getProvider() {
    return this.#provider;
  }

  async getSigner({ chainId }: { chainId?: number } = {}) {
    const [provider, account] = await Promise.all([
      this.getProvider(),
      this.getAccount(),
    ]);
    return new providers.Web3Provider(
      <providers.ExternalProvider>provider,
      chainId,
    ).getSigner(account);
  }

  protected onAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) this.emit('disconnect');
    else this.emit('change', { account: getAddress(<string>accounts[0]) });
  };

  protected onChainChanged = (chainId: number | ChainIdHex) => {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit('change', { chain: { id, unsupported } });
  };

  protected onDisconnect = () => {
    this.emit('disconnect');
  };
}
