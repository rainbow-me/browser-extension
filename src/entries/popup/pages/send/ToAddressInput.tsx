import { isAddress } from 'ethers/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import React, {
  InputHTMLAttributes,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Address, useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { truncateAddress } from '~/core/utils/address';
import { Box, Inline, Inset, Stack, Symbol, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import {
  DEFAULT_ACCOUNT,
  DEFAULT_ACCOUNT_2,
} from '~/entries/background/handlers/handleProviderRequest';

import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { useBackgroundAccounts } from '../../hooks/useBackgroundAccounts';

import { InputWrapper } from './InputWrapper';
import {
  addressToInputHighlightWrapperStyleDark,
  addressToInputHighlightWrapperStyleLight,
} from './ToAddressInpnut.css';

function RowHighlightWrapper({ children }: { children: ReactNode }) {
  const { currentTheme } = useCurrentThemeStore();
  return (
    <Inset>
      <Box
        borderRadius="12px"
        className={
          currentTheme === 'dark'
            ? addressToInputHighlightWrapperStyleDark
            : addressToInputHighlightWrapperStyleLight
        }
      >
        {children}
      </Box>
    </Inset>
  );
}

const WalletSection = ({
  title,
  wallets,
  onClickWallet,
}: {
  title: string;
  wallets: Address[];
  onClickWallet: (address: Address) => void;
}) => {
  return wallets.length ? (
    <Stack>
      <Box paddingBottom="8px">
        <Inline alignVertical="center" space="4px">
          <Symbol
            symbol="lock.square.stack.fill"
            weight="semibold"
            color="labelTertiary"
            size={14}
          />
          <Text size="14pt" weight="semibold" color="labelTertiary">
            {title}
          </Text>
        </Inline>
      </Box>

      {wallets.map((wallet, i) => (
        <RowHighlightWrapper key={i}>
          <WalletRow onClick={onClickWallet} key={wallet} wallet={wallet} />
        </RowHighlightWrapper>
      ))}
    </Stack>
  ) : null;
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
    <Box key={wallet} onClick={() => onClick(wallet)} paddingVertical="8px">
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

  const selectWalletAndCloseDropdown = useCallback(
    (address: Address) => {
      setToAddressOrName(address);
      onDropdownAction();
    },
    [onDropdownAction, setToAddressOrName],
  );

  const { accounts } = useBackgroundAccounts();
  // TODO watched wallets and contacts still don't exist
  const watchedWallets: Address[] = [
    DEFAULT_ACCOUNT as Address,
    DEFAULT_ACCOUNT_2 as Address,
    DEFAULT_ACCOUNT as Address,
    DEFAULT_ACCOUNT_2 as Address,
  ];
  const contacts: Address[] = [
    DEFAULT_ACCOUNT as Address,
    DEFAULT_ACCOUNT_2 as Address,
    DEFAULT_ACCOUNT as Address,
    DEFAULT_ACCOUNT_2 as Address,
  ];
  return (
    <>
      <InputWrapper
        leftComponent={
          <Box borderRadius="18px">
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
          <Stack space="16px">
            <WalletSection
              title={i18n.t('send.wallets_list.contacts')}
              wallets={contacts}
              onClickWallet={selectWalletAndCloseDropdown}
            />
            <WalletSection
              title={i18n.t('send.wallets_list.my_wallets')}
              wallets={accounts}
              onClickWallet={selectWalletAndCloseDropdown}
            />
            <WalletSection
              title={i18n.t('send.wallets_list.watched_wallets')}
              wallets={watchedWallets}
              onClickWallet={selectWalletAndCloseDropdown}
            />
          </Stack>
        }
        dropdownVisible={dropdownVisible}
        onDropdownAction={onDropdownAction}
      />
    </>
  );
};
