import { isAddress } from 'ethers/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import React, {
  InputHTMLAttributes,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Address, useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { truncateAddress } from '~/core/utils/address';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import {
  DEFAULT_ACCOUNT,
  DEFAULT_ACCOUNT_2,
} from '~/entries/background/handlers/handleProviderRequest';

import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { useBackgroundAccounts } from '../../hooks/useBackgroundAccounts';

import { InputWrapper } from './InputWrapper';

const WalletsList = ({
  contacts,
  wallets,
  watchedWallets,
  onClickWallet,
}: {
  contacts: Address[];
  wallets: Address[];
  watchedWallets: Address[];
  onClickWallet: (address: Address) => void;
}) => {
  return (
    <Stack space="16px">
      {!!contacts.length && (
        <Stack space="16px">
          <Inline alignVertical="center" space="4px">
            <Symbol
              symbol="person.crop.circle.fill"
              weight="semibold"
              color="labelTertiary"
              size={14}
            />
            <Text size="14pt" weight="semibold" color="labelTertiary">
              {i18n.t('send.wallets_list.contacts')}
            </Text>
          </Inline>
          {contacts.map((wallet) => (
            <WalletRow onClick={onClickWallet} key={wallet} wallet={wallet} />
          ))}
        </Stack>
      )}

      {!!wallets.length && (
        <Stack space="16px">
          <Inline alignVertical="center" space="4px">
            <Symbol
              symbol="lock.square.stack.fill"
              weight="semibold"
              color="labelTertiary"
              size={14}
            />
            <Text size="14pt" weight="semibold" color="labelTertiary">
              {i18n.t('send.wallets_list.my_wallets')}
            </Text>
          </Inline>
          {wallets.map((wallet) => (
            <WalletRow onClick={onClickWallet} key={wallet} wallet={wallet} />
          ))}
        </Stack>
      )}

      {!!watchedWallets.length && (
        <Stack space="16px">
          <Inline alignVertical="center" space="4px">
            <Symbol
              symbol="eyes.inverse"
              weight="semibold"
              color="labelTertiary"
              size={14}
            />
            <Text size="14pt" weight="semibold" color="labelTertiary">
              {i18n.t('send.wallets_list.watched_wallets')}
            </Text>
          </Inline>

          {watchedWallets.map((wallet) => (
            <WalletRow onClick={onClickWallet} key={wallet} wallet={wallet} />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

const WalletRow = ({
  wallet,
  onClick,
}: {
  wallet: Address;
  onClick: (address: Address) => void;
}) => {
  const { data: ensName } = useEnsName({
    address: wallet,
  });
  return (
    <Box key={wallet} onClick={() => onClick(wallet)}>
      <Inline alignVertical="center" space="8px">
        <WalletAvatar size={36} address={wallet} emojiSize="20pt" />
        <Stack space="8px">
          <Text weight="semibold" size="14pt" color="label">
            {ensName ?? truncateAddress(wallet)}
          </Text>
          {ensName && (
            <Text weight="semibold" size="12pt" color="labelTertiary">
              {truncateAddress(wallet)}
            </Text>
          )}
        </Stack>
      </Inline>
    </Box>
  );
};
export const ToAddressInput = ({
  toAddressOrName,
  toEnsName,
  toAddress,
  handleToAddressChange,
  clearToAddress,
  setToAddressOrName,
}: {
  toAddressOrName: string;
  toEnsName?: string;
  toAddress: Address;
  handleToAddressChange: InputHTMLAttributes<HTMLInputElement>['onChange'];
  clearToAddress: () => void;
  setToAddressOrName: (adrressOrName: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const onDropdownAction = useCallback(
    () => setDropdownVisible((dropdownVisible) => !dropdownVisible),
    [],
  );

  const inputVisible = useMemo(
    () => (!toAddressOrName || !toEnsName) && !isAddress(toAddressOrName),
    [toAddressOrName, toEnsName],
  );

  const { accounts } = useBackgroundAccounts();
  const watchedWallets: Address[] = [
    DEFAULT_ACCOUNT as Address,
    DEFAULT_ACCOUNT_2 as Address,
  ];
  const contacts = [DEFAULT_ACCOUNT as Address];

  return (
    <>
      <InputWrapper
        leftComponent={
          <Box background="fillSecondary" borderRadius="18px">
            <WalletAvatar address={toAddress} size={36} emojiSize="20pt" />
          </Box>
        }
        centerComponent={
          <AnimatePresence initial={false} mode="wait">
            {inputVisible && (
              <Box
                as={motion.div}
                key="input"
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
              >
                <Input
                  value={toAddressOrName}
                  placeholder={i18n.t('send.input_to_address_placeholder')}
                  onChange={handleToAddressChange}
                  height="32px"
                  variant="transparent"
                  style={{ paddingLeft: 0, paddingRight: 0 }}
                  innerRef={inputRef}
                />
              </Box>
            )}
            {!inputVisible && (
              <Box
                as={motion.div}
                key="wallet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Stack space="8px">
                  <Text weight="semibold" size="14pt" color="label">
                    {toEnsName || truncateAddress(toAddress)}
                  </Text>
                  {toEnsName && (
                    <Text weight="semibold" size="12pt" color="labelTertiary">
                      {truncateAddress(toAddress)}
                    </Text>
                  )}
                </Stack>
              </Box>
            )}
          </AnimatePresence>
        }
        showActionClose={!!toAddress}
        onActionClose={clearToAddress}
        dropdownComponent={
          <WalletsList
            contacts={contacts}
            wallets={accounts}
            watchedWallets={watchedWallets}
            onClickWallet={(address) => {
              setToAddressOrName(address);
              onDropdownAction();
            }}
          />
        }
        dropdownVisible={dropdownVisible}
        onDropdownAction={onDropdownAction}
      />
    </>
  );
};
