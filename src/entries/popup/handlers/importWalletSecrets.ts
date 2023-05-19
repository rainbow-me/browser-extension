export const getImportWalletSecrets = async () => {
  try {
    const result = await chrome.storage.session.get('importWalletSecrets');
    console.log('result: ', result);
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
