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

  async connect() {
    const [provider, account, chainId] = await Promise.all([
      this.getProvider(),
      this.getAccount(),
      this.getChainId(),
    ]);

    // TODO: Hook event listeners up properly, and get them
    // to listen for changes in account/chain from the background
    // script.
    // - when account changes, invoke `this.onAccountsChanged`
    // - when chain changes, invoke `this.onChainChanged`

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

    // TODO: Remove event listeners from `connect`.
  }

  async isAuthorized() {
    return true;
  }

  async getAccount() {
    // TODO: retrive account from background state properly...
    return getAddress(DEFAULT_ACCOUNT);
  }

  async getChainId() {
    // TODO: retrive chain from background state properly...
    return 1;
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
