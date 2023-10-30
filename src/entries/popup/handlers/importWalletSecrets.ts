import { SessionStorage } from '~/core/storage';

export const getImportWalletSecrets = async () => {
  try {
    const result = await SessionStorage.get('importWalletSecrets');
    return (result['importWalletSecrets'] as string[]) || [''];
  } catch (e) {
    console.log('Error while getting import wallet secrets: ', e);
    return [''];
  }
};

export const setImportWalletSecrets = async (importWalletSecrets: string[]) => {
  try {
    await SessionStorage.set('importWalletSecrets', importWalletSecrets);
  } catch (e) {
    console.log('Error while setting import wallet secrets: ', e);
  }
};

export const removeImportWalletSecrets = async () => {
  try {
    await SessionStorage.remove('importWalletSecrets');
  } catch (e) {
    console.log('Error while removing import wallet secrets: ', e);
  }
};
