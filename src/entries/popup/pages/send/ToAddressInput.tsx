import { isAddress } from 'ethers/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import React, {
  InputHTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
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
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { SymbolName } from '~/design-system/styles/designTokens';

import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { useAllFilteredWallets } from '../../hooks/send/useAllFilteredWallets';
import { useContact } from '../../hooks/useContacts';

import { InputWrapper } from './InputWrapper';
import {
  addressToInputHighlightWrapperStyleDark,
  addressToInputHighlightWrapperStyleLight,
} from './ToAddressInpnut.css';

const { innerWidth: windowWidth } = window;

const RowHighlightWrapper = ({ children }: { children: ReactNode }) => {
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
};

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
          <TextOverflow
            maxWidth={(2 * windowWidth) / 3}
            weight="semibold"
            size="14pt"
            color="label"
          >
            {contact?.display || truncateAddress(wallet)}
          </TextOverflow>

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

const DropdownWalletsList = ({
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
  const walletsExist = useMemo(
    () => wallets.length + contacts.length + watchedWallets.length > 0,
    [contacts.length, wallets.length, watchedWallets.length],
  );

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
              {i18n.t('send.wallets_list.no_results')}
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
  onDropdownOpen,
}: {
  toAddressOrName: string;
  toEnsName?: string;
  toAddress: Address;
  handleToAddressChange: InputHTMLAttributes<HTMLInputElement>['onChange'];
  clearToAddress: () => void;
  setToAddressOrName: (adrressOrName: string) => void;
  onDropdownOpen: (open: boolean) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const onDropdownAction = useCallback(() => {
    onDropdownOpen(!dropdownVisible);
    setDropdownVisible(!dropdownVisible);
  }, [dropdownVisible, onDropdownOpen]);

  const openDropdown = useCallback(() => {
    onDropdownOpen(true);
    setDropdownVisible(true);
  }, [onDropdownOpen]);

  const closeDropdown = useCallback(() => {
    onDropdownOpen(false);
    setDropdownVisible(false);
  }, [onDropdownOpen]);

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

  const onInputClick = useCallback(() => {
    if (!dropdownVisible) {
      openDropdown();
    }
  }, [dropdownVisible, openDropdown]);

  useEffect(() => {
    if (!inputVisible) {
      closeDropdown();
    }
  }, [closeDropdown, inputVisible]);

  const toAddressContact = useContact({ address: toAddress });
  const { wallets, watchedWallets, contacts } = useAllFilteredWallets({
    filter: toAddressOrName,
  });

  return (
    <>
      <InputWrapper
        zIndex={2}
        dropdownHeight={452}
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
                onClick={onInputClick}
              >
                <Input
                  testId="to-address-input"
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
                  <TextOverflow
                    maxWidth={windowWidth / 2}
                    weight="semibold"
                    size="14pt"
                    color="label"
                    testId="to-address-input-display"
                  >
                    {toAddressContact?.display || truncateAddress(toAddress)}
                  </TextOverflow>
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
          <DropdownWalletsList
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
