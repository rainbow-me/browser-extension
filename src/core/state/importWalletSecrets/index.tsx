import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface ImportWalletSecretsState {
  setImportWalletSecrets: (token?: string[]) => void;
  importWalletSecrets: string[];
}

export const importWalletSecretsStore = createStore<ImportWalletSecretsState>(
  (set) => ({
    setImportWalletSecrets: (importWalletSecrets?: string[]) => {
      set({ importWalletSecrets });
    },
    importWalletSecrets: [''],
  }),
);

export const useImportWalletSecretsStore = create(importWalletSecretsStore);
