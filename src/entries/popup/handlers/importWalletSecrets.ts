export const getImportWalletSecrets = async () => {
  try {
    const result = await chrome.storage.session.get('importWalletSecrets');
    return (result['importWalletSecrets'] as string[]) || [''];
  } catch (e) {
    console.log('Error while getting import wallet secrets: ', e);
    return [''];
  }
};

export const setImportWalletSecrets = async (importWalletSecrets: string[]) => {
  try {
    await chrome.storage.session.set({
      importWalletSecrets,
    });
  } catch (e) {
    console.log('Error while setting import wallet secrets: ', e);
  }
};

export const removeImportWalletSecrets = async () => {
  try {
    await chrome.storage.session.remove('importWalletSecrets');
  } catch (e) {
    console.log('Error while removing import wallet secrets: ', e);
  }
};
