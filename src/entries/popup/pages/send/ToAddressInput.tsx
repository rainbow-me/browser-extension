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
import { SymbolName } from '~/design-system/styles/designTokens';

import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { useAllFilteredWallets } from '../../hooks/send/useAllFilteredWallets';
import { useContact } from '../../hooks/useContacts';

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
  symbol,
}: {
  title: string;
  wallets: Address[];
  onClickWallet: (address: Address) => void;
  symbol: SymbolName;
}) => {
  return wallets.length ? (
    <Stack>
      <Box paddingHorizontal="20px" paddingBottom="8px">
        <Inline alignVertical="center" space="4px">
          <Symbol
            symbol={symbol}
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
        <Inset horizontal="8px" key={i}>
          <RowHighlightWrapper key={i}>
            <Inset horizontal="12px" key={i}>
              <WalletRow onClick={onClickWallet} key={wallet} wallet={wallet} />
            </Inset>
          </RowHighlightWrapper>
        </Inset>
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
  const contact = useContact({ address: wallet });
  return (
    <Box key={wallet} onClick={() => onClick(wallet)} paddingVertical="8px">
      <Inline alignVertical="center" space="8px">
        <WalletAvatar size={36} address={wallet} emojiSize="20pt" />
        <Stack space="8px">
          <Text weight="semibold" size="14pt" color="label">
            {contact?.display || truncateAddress(wallet)}
          </Text>
          {(contact?.display || ensName) && (
            <Text weight="semibold" size="12pt" color="labelTertiary">
              {truncateAddress(wallet)}
            </Text>
          )}
        </Stack>
      </Inline>
    </Box>
  );
};

const DropdownWalletList = ({
  wallets,
  contacts,
  watchedWallets,
  selectWalletAndCloseDropdown,
}: {
  wallets: Address[];
  contacts: Address[];
  watchedWallets: Address[];
  selectWalletAndCloseDropdown: (address: Address) => void;
}) => {
  const walletsExist =
    wallets.length + contacts.length + watchedWallets.length > 0;

  return (
    <AnimatePresence initial={false}>
      {walletsExist && (
        <Box
          as={motion.div}
          key="input"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Stack space="16px">
            <WalletSection
              symbol="lock.square.stack.fill"
              title={i18n.t('send.wallets_list.my_wallets')}
              wallets={wallets}
              onClickWallet={selectWalletAndCloseDropdown}
            />
            <WalletSection
              symbol="person.crop.circle.fill"
              title={i18n.t('send.wallets_list.contacts')}
              wallets={contacts as Address[]}
              onClickWallet={selectWalletAndCloseDropdown}
            />
            <WalletSection
              symbol="eyes.inverse"
              title={i18n.t('send.wallets_list.watched_wallets')}
              wallets={watchedWallets}
              onClickWallet={selectWalletAndCloseDropdown}
            />
          </Stack>
        </Box>
      )}
      {!walletsExist && (
        <Box
          as={motion.div}
          key="input"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          alignItems="center"
          style={{ paddingTop: 169 }}
        >
          <Stack space="16px">
            <Inline alignHorizontal="center">
              <Symbol
                color="labelQuaternary"
                weight="semibold"
                symbol="magnifyingglass.circle.fill"
                size={26}
              />
            </Inline>

            <Text
              color="labelQuaternary"
              size="20pt"
              weight="semibold"
              align="center"
            >
              No results
            </Text>
          </Stack>
        </Box>
      )}
    </AnimatePresence>
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

  const toAddressContact = useContact({ address: toAddress });
  const { wallets, watchedWallets, contacts } = useAllFilteredWallets({
    filter: toAddressOrName,
  });

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
                    {toAddressContact?.display || truncateAddress(toAddress)}
                  </Text>
                  {toAddressContact?.display && (
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
          <DropdownWalletList
            wallets={wallets}
            watchedWallets={watchedWallets}
            contacts={contacts}
            selectWalletAndCloseDropdown={selectWalletAndCloseDropdown}
          />
        }
        dropdownVisible={dropdownVisible}
        onDropdownAction={onDropdownAction}
      />
    </>
  );
};
