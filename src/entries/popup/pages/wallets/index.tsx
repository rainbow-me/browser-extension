import { motion } from 'framer-motion';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Address } from 'wagmi';

import { initializeMessenger } from '~/core/messengers';
import { EthereumWalletSeed } from '~/core/utils/ethereum';
import { Box, Column, Columns, Separator, Text } from '~/design-system';

const messenger = initializeMessenger({ connect: 'background' });

const walletAction = async (action: string, payload: unknown) => {
  const { result }: { result: unknown } = await messenger.send(
    'wallet_action',
    {
      action,
      payload,
    },
  );
  return result;
};

const shortAddress = (address: string) => {
  return `${address?.substring(0, 6)}...${address?.substring(38, 42)}`;
};

function PasswordForm({
  title,
  action,
  onSubmit,
}: {
  title: string;
  action: string;
  onSubmit: () => void;
}) {
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const handlePasswordChange = useCallback(
    (event: { target: { value: React.SetStateAction<string> } }) => {
      setPassword(event.target.value);
    },
    [setPassword],
  );

  const unlock = useCallback(async () => {
    const result = await walletAction(action, password);
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
        type="password"
        value={password}
        placeholder={action === 'set_password' ? 'New password' : 'Password'}
        onChange={handlePasswordChange}
        style={{ borderRadius: 999, padding: '10px', fontSize: '11pt' }}
      />
      <Box
        as="button"
        background="accent"
        boxShadow="24px accent"
        onClick={unlock}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="label" size="14pt" weight="bold">
          {action === 'set_password' ? 'Set Password' : 'Unlock'}
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
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [accounts, setAccounts] = useState<Address[]>([]);
  const [secret, setSecret] = useState<EthereumWalletSeed>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(true);

  const getAccounts = useCallback(async () => {
    const accounts = (await walletAction('get_accounts', {})) as Address[];
    console.log('got accounts', accounts);
    return accounts;
  }, []);

  const updateState = useCallback(async () => {
    const accounts = await getAccounts();
    setAccounts(accounts);
    if (accounts?.length > 0) {
      setSelectedAddress(accounts[0]);
    } else {
      setSelectedAddress(null);
    }

    const { unlocked, hasVault } = (await walletAction('status', {})) as {
      unlocked: boolean;
      hasVault: boolean;
    };
    console.log('got status: ', { unlocked, hasVault });
    setIsUnlocked(unlocked);
    setIsNewUser(!hasVault);
  }, [getAccounts]);

  const createWallet = useCallback(async () => {
    const address = (await walletAction('create', {})) as Address;
    console.log('created wallet with address', address);
    setSelectedAddress(address);
    await updateState();
    return address;
  }, [updateState]);

  const importWallet = useCallback(async () => {
    console.log('secret', secret);
    const address = (await walletAction('import', secret)) as Address;
    console.log('imported wallet with address', address);
    setSelectedAddress(address);
    await updateState();
    setSecret('');
    return address;
  }, [secret, updateState]);

  const removeAccount = useCallback(
    async (address: Address) => {
      await walletAction('remove', address);
      console.log('removed account', address);
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
    await walletAction('lock', {});
    await updateState();
    console.log('locked');
  }, [updateState]);

  const wipe = useCallback(async () => {
    await walletAction('wipe', {});
    await updateState();
    console.log('wiped');
  }, [updateState]);

  const addAccount = useCallback(async () => {
    const silbing = accounts[0];
    const address = (await walletAction('add', silbing)) as Address;
    console.log('add account with address', address);
    setSelectedAddress(address);
    await updateState();
    return address;
  }, [accounts, updateState]);

  const exportWallet = useCallback(async (address: Address) => {
    const seed = (await walletAction('export_wallet', address)) as Address[];
    console.log('export_wallet', seed);
    return seed;
  }, []);

  const exportAccount = useCallback(async (address: Address) => {
    const pkey = (await walletAction('export_account', address)) as Address[];
    console.log('export_account', pkey);
    return pkey;
  }, []);

  const switchAddress = useCallback((address: Address) => {
    setSelectedAddress(address);
  }, []);

  useEffect(() => {
    updateState();
  }, [updateState]);

  // const sendTransaction = useCallback(() => {}, []);

  // const signMessage = useCallback(() => {}, []);

  // const signTypedData = useCallback(() => {}, []);

  const LoggedIn = () => (
    <Fragment>
      {selectedAddress && (
        <Fragment>
          <Text as="h1" size="16pt" weight="bold" align="center">
            {' '}
            Selected Address:
          </Text>
          <Text as="h1" size="20pt" weight="bold" align="center">
            {' '}
            {shortAddress(selectedAddress)}
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

      <ImportWallet
        secret={secret}
        onSecretChange={handleSecretChange}
        onImportWallet={importWallet}
      />

      <Separator />

      {selectedAddress && <AddAccount onAddAccount={addAccount} />}

      {isUnlocked && <Lock onLock={lock} />}

      {isUnlocked && <Wipe onWipe={wipe} />}
    </Fragment>
  );

  const content = isUnlocked ? (
    <LoggedIn />
  ) : (
    <PasswordForm
      title={isNewUser ? 'Set a password to protect your wallet' : 'Login'}
      action={isNewUser ? 'set_password' : 'unlock'}
      onSubmit={updateState}
    />
  );

  return (
    <Box
      as={motion.div}
      display="flex"
      flexDirection="column"
      gap="24px"
      padding="20px"
      initial={{ opacity: 0, x: window.innerWidth }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: window.innerWidth }}
      transition={{ type: 'tween', duration: 0.2 }}
      style={{ overflow: 'auto' }}
    >
      <Columns space="12px">
        <Column width="1/3">
          <Link to="/">
            <Box as="button" style={{ borderRadius: 999, width: '100%' }}>
              <Text
                color="labelSecondary"
                size="14pt"
                weight="bold"
                align="left"
              >
                Back
              </Text>
            </Box>
          </Link>
        </Column>
        <Column width="1/3">
          <Text as="h1" size="20pt" weight="bold">
            Wallets
          </Text>
        </Column>
      </Columns>
      {content}
    </Box>
  );
}
