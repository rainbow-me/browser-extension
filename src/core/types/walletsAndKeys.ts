// temp types for wallet and key management settings development
export type DummyWallet = {
  address: `0x${string}`;
  ens?: string;
};

export type DummyAccount = {
  type: string;
  imported: boolean;
  wallets: DummyWallet[];
};
