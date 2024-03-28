import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { type Address } from 'viem';
import { fetchEnsAddress } from 'wagmi/actions';
import { useAccount, useEnsName } from 'wagmi';

import { useCurrentAddressStore } from '~/core/state';
import { WalletAction } from '~/core/types/walletActions';
import { EthereumWalletSeed, isENSAddressFormat } from '~/core/utils/ethereum';
import { Box, Separator, Text } from '~/design-system';

import * as wallet from '../../handlers/wallet';

const shortAddress = (address: string) => {
  return `${address?.substring(0, 6)}…${address?.substring(38, 42)}`;
};

function PasswordForm({
  title,
  action,
  onSubmit,
  onPasswordChanged,
}: {
  title: string;
  action: WalletAction;
  onSubmit: () => void;
  onPasswordChanged: (pwd: string) => void;
}) {
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const handlePasswordChange = useCallback(
    (event: { target: { value: React.SetStateAction<string> } }) => {
      setPassword(event.target.value);
      onPasswordChanged(event.target.value as string);
    },
    [onPasswordChanged],
  );

  const handleSubmitPassword = useCallback(async () => {
    let result: boolean;
    if (action === 'update_password') {
      result = await wallet.updatePassword('', password);
    } else {
      result = await wallet.unlock(password);
    }
    if (action === 'unlock' && !result) {
      setErrorMsg('Incorrect password');
    } else {
      setErrorMsg('');
    }
    onSubmit();
  }, [onSubmit, action, password]);

  return (
    <Fragment>
      <Text color="label" size="16pt" weight="bold">
        {title}
      </Text>
      <input
        id="wallet-password-input"
        type="password"
        value={password}
        placeholder={action === 'update_password' ? 'New password' : 'Password'}
        onChange={handlePasswordChange}
        style={{ borderRadius: 999, padding: '10px', fontSize: '11pt' }}
      />
      <Box
        as="button"
        background="accent"
        boxShadow="24px accent"
        onClick={handleSubmitPassword}
        padding="16px"
        style={{ borderRadius: 999 }}
        id="wallet-password-submit"
      >
        <Text color="label" size="14pt" weight="bold">
          {action === 'update_password' ? 'Set Password' : 'Unlock'}
        </Text>
      </Box>

      {errorMsg && (
        <Text color="red" size="14pt" weight="bold">
          {errorMsg}
        </Text>
      )}
    </Fragment>
  );
}

const CreateWallet = ({ onCreateWallet }: { onCreateWallet: () => void }) => {
  return (
    <Fragment>
      <Text as="p" size="16pt" weight="bold" align="center">
        Create a new wallet with a randomly generated seed phrase
      </Text>
      <Box
        as="button"
        background="accent"
        boxShadow="24px accent"
        onClick={onCreateWallet}
        padding="16px"
        style={{ borderRadius: 999 }}
        id="wallet-create-button"
      >
        <Text color="label" size="14pt" weight="bold">
          Create Wallet
        </Text>
      </Box>
    </Fragment>
  );
};
const AddAccount = ({ onAddAccount }: { onAddAccount: () => void }) => {
  return (
    <Fragment>
      <Text as="p" size="16pt" weight="bold" align="center">
        Adds a new account on the currently selected wallet
      </Text>
      <Box
        as="button"
        background="accent"
        boxShadow="24px accent"
        onClick={onAddAccount}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="label" size="14pt" weight="bold">
          Add Account
        </Text>
      </Box>
      <Separator />
    </Fragment>
  );
};
const Lock = ({ onLock }: { onLock: () => void }) => {
  return (
    <Fragment>
      <Text as="p" size="16pt" weight="bold" align="center">
        Lock the app so it requires a password to unlock it.
      </Text>
      <Box
        as="button"
        background="accent"
        boxShadow="24px accent"
        onClick={onLock}
        padding="16px"
        style={{ borderRadius: 999 }}
        id="wallet-lock-button"
      >
        <Text color="label" size="14pt" weight="bold">
          🔒 Lock
        </Text>
      </Box>
      <Separator />
    </Fragment>
  );
};
const Wipe = ({ onWipe }: { onWipe: () => void }) => {
  return (
    <Fragment>
      <Text as="p" size="16pt" weight="bold" align="center">
        Wipe everything from the app. This will delete all wallets and accounts.
      </Text>
      <Box
        as="button"
        background="accent"
        boxShadow="24px accent"
        onClick={onWipe}
        padding="16px"
        style={{ borderRadius: 999 }}
        id="wallet-wipe-button"
      >
        <Text color="label" size="14pt" weight="bold">
          🗑️ Wipe
        </Text>
      </Box>
    </Fragment>
  );
};

const ImportWallet = ({
  secret,
  onSecretChange,
  onImportWallet,
}: {
  secret: string;
  onSecretChange: (event: {
    target: { value: React.SetStateAction<string> };
  }) => void;
  onImportWallet: () => void;
}) => {
  return (
    <Fragment>
      <Text as="p" size="16pt" weight="bold" align="center">
        Import a wallet from private key, seed phrase, address or ENS name
      </Text>
      <Box>
        <textarea
          style={{
            width: '100%',
            borderRadius: 10,
            padding: '10px',
            fontSize: '11pt',
            boxSizing: 'border-box',
          }}
          value={secret}
          placeholder={`Your private key, seed phrase, address or ENS name`}
          onChange={onSecretChange}
        />
      </Box>
      <Box
        as="button"
        background="accent"
        boxShadow="24px accent"
        onClick={onImportWallet}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="label" size="14pt" weight="bold">
          Import Wallet
        </Text>
      </Box>
    </Fragment>
  );
};

const WalletList = ({
  accounts,
  onSwitchAddress,
  onExportWallet,
  onExportAccount,
  onRemoveAccount,
}: {
  accounts: Address[];
  onSwitchAddress: (address: Address) => void;
  onExportWallet: (address: Address) => void;
  onExportAccount: (address: Address) => void;
  onRemoveAccount: (address: Address) => void;
}) => {
  if (accounts.length === 0) {
    return (
      <Text weight="bold" size="16pt" align="center">
        👀 No wallets 👀
      </Text>
    );
  }

  return (
    <Fragment>
      <Text as="p" size="16pt" weight="bold" align="center">
        List of Wallets
      </Text>
      {accounts.map((address) => (
        <Text as="h4" size="14pt" weight="bold" key={address}>
          {shortAddress(address)}{' '}
          <button onClick={() => onSwitchAddress(address)}>select</button>
          <button onClick={() => onExportWallet(address)}>seed</button>
          <button onClick={() => onExportAccount(address)}>pkey</button>
          <button onClick={() => onRemoveAccount(address)}>delete</button>
        </Text>
      ))}
      <Separator />
    </Fragment>
  );
};

export function Wallets() {
  const [accounts, setAccounts] = useState<Address[]>([]);
  const [secret, setSecret] = useState<EthereumWalletSeed>('');
  const [password, setPassword] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(true);
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { setCurrentAddress } = useCurrentAddressStore();

  const updatePassword = useCallback((pwd: string) => {
    setPassword(pwd);
  }, []);

  const updateState = useCallback(async () => {
    const accounts = await wallet.getAccounts();
    setAccounts(accounts);
    if (accounts.length > 0 && !accounts.includes(address as Address)) {
      setCurrentAddress(accounts[0]);
    }
    const { unlocked, hasVault } = await wallet.getStatus();
    setIsUnlocked(unlocked);
    setIsNewUser(!hasVault);
  }, [address, setCurrentAddress]);

  const createWallet = useCallback(async () => {
    const address = await wallet.create();
    setCurrentAddress(address);
    await updateState();
    return address;
  }, [setCurrentAddress, updateState]);

  const importWallet = useCallback(async () => {
    let seed = secret;
    if (isENSAddressFormat(secret)) {
      try {
        seed = (await fetchEnsAddress({ name: secret })) as Address;
      } catch (e) {
        console.log('error', e);
        alert('Invalid ENS name');
        return;
      }
    }

    const address = (await wallet.importWithSecret(seed)) as Address;
    setCurrentAddress(address);
    await updateState();
    setSecret('');
    return address;
  }, [secret, setCurrentAddress, updateState]);

  const removeAccount = useCallback(
    async (address: Address) => {
      await wallet.remove(address);
      await updateState();
    },
    [updateState],
  );

  const handleSecretChange = useCallback(
    (event: { target: { value: React.SetStateAction<string> } }) => {
      setSecret(event?.target?.value);
    },
    [setSecret],
  );

  const lock = useCallback(async () => {
    await wallet.lock();
    await updateState();
  }, [updateState]);

  const wipe = useCallback(async () => {
    await wallet.wipe();
    await updateState();
  }, [updateState]);

  const addAccount = useCallback(async () => {
    const sibling = accounts[0];
    const address = await wallet.add(sibling);
    setCurrentAddress(address);
    await updateState();
    return address;
  }, [accounts, setCurrentAddress, updateState]);

  const exportWallet = useCallback(
    async (address: Address) => {
      const pwd = password || prompt('Enter password');
      const seed = await wallet.exportWallet(address, pwd as string);
      return seed;
    },
    [password],
  );

  const exportAccount = useCallback(
    async (address: Address) => {
      const pwd = password || prompt('Enter password');

      const pkey = await wallet.exportAccount(address, pwd as string);
      return pkey;
    },
    [password],
  );

  const switchAddress = useCallback(
    (_address: Address) => {
      setCurrentAddress(_address);
    },
    [setCurrentAddress],
  );

  useEffect(() => {
    updateState();
  }, [updateState]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="24px"
      padding="20px"
      style={{ overflow: 'auto' }}
      testId={'wallet-address-or-ens'}
    >
      {isUnlocked ? (
        <Fragment>
          {address && (
            <Fragment>
              <Text as="h1" size="16pt" weight="bold" align="center">
                {' '}
                Selected Address:
              </Text>
              <Text as="h1" size="20pt" weight="bold" align="center">
                {' '}
                {ensName || shortAddress(address)}
              </Text>
            </Fragment>
          )}
          <Separator />

          <WalletList
            accounts={accounts}
            onSwitchAddress={switchAddress}
            onExportWallet={exportWallet}
            onExportAccount={exportAccount}
            onRemoveAccount={removeAccount}
          />

          <CreateWallet onCreateWallet={createWallet} />

          <Separator />

          {address && <AddAccount onAddAccount={addAccount} />}

          <ImportWallet
            secret={secret}
            onSecretChange={handleSecretChange}
            onImportWallet={importWallet}
          />

          <Separator />

          {isUnlocked && <Lock onLock={lock} />}

          {isUnlocked && <Wipe onWipe={wipe} />}

          <Separator />
        </Fragment>
      ) : (
        <PasswordForm
          title={isNewUser ? 'Set a password to protect your wallet' : 'Login'}
          action={isNewUser ? 'update_password' : 'unlock'}
          onPasswordChanged={updatePassword}
          onSubmit={updateState}
        />
      )}
    </Box>
  );
}
