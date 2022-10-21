import { keychainManager } from '.';

export async function keychainDemo() {
  // Create a new keychain and vault
  console.log('creating new hd keychain and vault...');
  await keychainManager.addNewKeychain('HdKeychain', {});
  let accounts = await keychainManager.getAccounts();
  console.log('Accounts', accounts);

  const hdCreatedKeychain = await keychainManager.getKeychain(accounts[0]);
  console.log('adding account to hd keychain');
  await keychainManager.addNewAccount(hdCreatedKeychain);

  accounts = await keychainManager.getAccounts();
  console.log('Accounts should be 1', accounts);

  console.log('exporting private key for account 1...');
  const privateKey = await keychainManager.exportAccount(accounts[1]);
  console.log('private key of account 1', privateKey);

  console.log('removing account from hd keychain...');
  await keychainManager.removeAccount(accounts[1]);

  console.log('exporting seedPhrase for account 0...');
  const seedPhrase = await keychainManager.exportKeychain(accounts[0]);
  console.log('Seed phrase', seedPhrase);
  accounts = await keychainManager.getAccounts();
  console.log('Accounts should be 1', accounts);

  console.log('importing keychain...');
  await keychainManager.importKeychain({ type: 'KeyPairKeychain', privateKey });
  accounts = await keychainManager.getAccounts();
  console.log('Accounts should be 2', accounts);

  console.log('removing account', accounts[1]);
  await keychainManager.removeAccount(accounts[1]);

  console.log(
    'keychainManager should have 1  HDKeychain only',
    keychainManager.state.keychains,
  );

  accounts = await keychainManager.getAccounts();
  console.log('Accounts shoud be 1', accounts);

  console.log('removing account', accounts[0]);

  await keychainManager.removeAccount(accounts[0]);

  accounts = await keychainManager.getAccounts();
  console.log('Accounts should be 0', accounts);

  await keychainManager.importKeychain({
    type: 'HdKeychain',
    mnemonic: seedPhrase,
  });

  accounts = await keychainManager.getAccounts();
  console.log('Accounts shoud be 1', accounts);

  console.log(
    'keychainManager should have 1  HDKeychain only',
    keychainManager.state.keychains,
  );

  const signer = await keychainManager.getSigner(accounts[0]);

  console.log('signer for ', accounts[0], signer);
}
