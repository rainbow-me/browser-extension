export type DummyWallet = {
  address: `0x${string}`;
  ens?: string;
};

export type DummyAccount = {
  type: string;
  imported: boolean;
  wallets: DummyWallet[];
};
