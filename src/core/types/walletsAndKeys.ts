// temp types for wallet and key management settings development
export type DummyAccount = {
  address: `0x${string}`;
  ens?: string;
  privateKey: string;
};

export type DummyWallet = {
  type: string;
  imported: boolean;
  privateKey?: string;
  seedPhrase?: string;
  accounts: DummyAccount[];
};
