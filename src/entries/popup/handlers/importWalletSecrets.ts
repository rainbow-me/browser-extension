import { SessionStorage } from '~/core/storage';
import { RainbowError, logger } from '~/logger';

export const getImportWalletSecrets = async () => {
  try {
    const result = await SessionStorage.get('importWalletSecrets');
    return (result as string[]) || [''];
  } catch (e) {
    logger.error(
      new RainbowError('Error while getting import wallet secrets', {
        cause: e,
      }),
    );
    return [''];
  }
};

export const setImportWalletSecrets = async (importWalletSecrets: string[]) => {
  try {
    await SessionStorage.set('importWalletSecrets', importWalletSecrets);
  } catch (e) {
    logger.error(
      new RainbowError('Error while setting import wallet secrets', {
        cause: e,
      }),
    );
  }
};

export const removeImportWalletSecrets = async () => {
  try {
    await SessionStorage.remove('importWalletSecrets');
  } catch (e) {
    logger.error(
      new RainbowError('Error while removing import wallet secrets', {
        cause: e,
      }),
    );
  }
};
