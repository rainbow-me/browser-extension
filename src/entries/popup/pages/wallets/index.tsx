import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Address } from 'wagmi';

import { initializeMessenger } from '~/core/messengers';
import { EthereumWalletSeed } from '~/core/utils/ethereum';
import { Box, Text } from '~/design-system';

const messenger = initializeMessenger({ connect: 'background' });

const shortAddress = (address: string) => {
  return `${address?.substring(0, 6)}...${address?.substring(38, 42)}`;
};

export function Wallets() {
  const walletAction = useCallback(async (action: string, payload: unknown) => {
    const { result }: { result: unknown } = await messenger.send(
      'wallet_action',
      {
        action,
        payload,
      },
    );
    return result;
  }, []);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [accounts, setAccounts] = useState<Address[]>([]);
  const [secret, setSecret] = useState<EthereumWalletSeed>('');

  const getAccounts = useCallback(async () => {
    const accounts = (await walletAction('get_accounts', {})) as Address[];
    console.log('got accounts', accounts);
    return accounts;
  }, [walletAction]);

  const updateAccounts = useCallback(async () => {
    const accounts = await getAccounts();
    setAccounts(accounts);
    if (accounts?.length > 0) {
      setSelectedAddress(accounts[0]);
    } else {
      setSelectedAddress(null);
    }
  }, [getAccounts]);

  const createWallet = useCallback(async () => {
    const address = (await walletAction('create', {})) as Address;
    console.log('created wallet with address', address);
    setSelectedAddress(address);
    await updateAccounts();
    return address;
  }, [updateAccounts, walletAction]);

  const importWallet = useCallback(async () => {
    console.log('secret', secret);
    const address = (await walletAction('import', secret)) as Address;
    console.log('imported wallet with address', address);
    setSelectedAddress(address);
    await updateAccounts();
    setSecret('');
    return address;
  }, [secret, updateAccounts, walletAction]);

  const removeAccount = useCallback(
    async (address: Address) => {
      await walletAction('remove', address);
      console.log('removed account', address);
      await updateAccounts();
    },
    [updateAccounts, walletAction],
  );

  const handleSecretChange = useCallback(
    (event: { target: { value: React.SetStateAction<string> } }) => {
      setSecret(event.target.value);
    },
    [setSecret],
  );

  // const addAccount = useCallback(() => {}, []);

  // const sendTransaction = useCallback(() => {}, []);

  // const signMessage = useCallback(() => {}, []);

  // const signTypedData = useCallback(() => {}, []);

  const exportWallet = useCallback(
    async (address: Address) => {
      const seed = (await walletAction('export_wallet', address)) as Address[];
      console.log('export_wallet', seed);
      return seed;
    },
    [walletAction],
  );

  const exportAccount = useCallback(
    async (address: Address) => {
      const pkey = (await walletAction('export_account', address)) as Address[];
      console.log('export_account', pkey);
      return pkey;
    },
    [walletAction],
  );

  const switchAddress = useCallback((address: Address) => {
    setSelectedAddress(address);
  }, []);

  useEffect(() => {
    updateAccounts();
  }, [updateAccounts]);

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
    >
      <Text as="h1" size="20pt" weight="bold">
        Wallets
      </Text>

      <Link to="/">
        <Box
          as="button"
          background="surfaceSecondary"
          padding="16px"
          style={{ borderRadius: 999, width: '100%' }}
        >
          <Text color="labelSecondary" size="14pt" weight="bold">
            Back
          </Text>
        </Box>
      </Link>

      {selectedAddress && (
        <Text as="h1" size="20pt" weight="bold">
          Selected Address: {shortAddress(selectedAddress)}
        </Text>
      )}

      <Box
        as="button"
        background="accent"
        boxShadow="24px accent"
        onClick={createWallet}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="label" size="14pt" weight="bold">
          Create Wallet
        </Text>
      </Box>

      <textarea
        value={secret}
        placeholder={`wallet secret`}
        onChange={handleSecretChange}
      />

      <Box
        as="button"
        background="accent"
        boxShadow="24px accent"
        onClick={importWallet}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="label" size="14pt" weight="bold">
          Import Wallet
        </Text>
      </Box>

      {/* <Box
        as="button"
        background="accent"
        boxShadow="24px accent"
        onClick={addAccount}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="label" size="14pt" weight="bold">
          Add new account
        </Text>
      </Box> */}

      {accounts.map((address) => (
        <Text as="h4" size="14pt" weight="bold" key={address}>
          {shortAddress(address)}{' '}
          <button onClick={() => switchAddress(address)}>select</button>
          <button onClick={() => exportWallet(address)}>seed</button>
          <button onClick={() => exportAccount(address)}>pkey</button>
          <button onClick={() => removeAccount(address)}>delete</button>
        </Text>
      ))}
    </Box>
  );
}
