import { isAddress } from '@ethersproject/address';
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
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { truncateAddress } from '~/core/utils/address';
import {
  Bleed,
  Box,
  Inline,
  Inset,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { SymbolName } from '~/design-system/styles/designTokens';

import {
  DropdownInputWrapper,
  dropdownContainerVariant,
  dropdownItemVariant,
} from '../../components/DropdownInputWrapper/DropdownInputWrapper';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { useAllFilteredWallets } from '../../hooks/send/useAllFilteredWallets';
import { useWalletInfo } from '../../hooks/useWalletInfo';

import { InputActionButon } from './InputActionButton';
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
  section,
}: {
  title: string;
  wallets: Address[];
  onClickWallet: (address: Address) => void;
  symbol: SymbolName;
  section: 'contacts' | 'my_wallets' | 'watching';
}) => {
  return wallets.length ? (
    <Stack space="8px">
      <Box as={motion.div} variants={dropdownItemVariant}>
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

      <Box>
        {wallets.map((wallet, i) => (
          <Bleed horizontal="12px" key={i}>
            <RowHighlightWrapper key={i}>
              <Inset horizontal="12px" key={i}>
                <WalletRow
                  onClick={onClickWallet}
                  key={wallet}
                  section={section}
                  wallet={wallet}
                />
              </Inset>
            </RowHighlightWrapper>
          </Bleed>
        ))}
      </Box>
    </Stack>
  ) : null;
};

const WalletRow = ({
  wallet,
  onClick,
  section,
}: {
  wallet: Address;
  onClick: (address: Address) => void;
  section: 'contacts' | 'my_wallets' | 'watching';
}) => {
  const { displayName, contactName, isNameDefined } = useWalletInfo({
    address: wallet,
  });
  const name = useMemo(
    () => (section === 'contacts' ? contactName : displayName),
    [section, contactName, displayName],
  );

  return (
    <Box
      as={motion.div}
      variants={dropdownItemVariant}
      key={wallet}
      onClick={() => onClick(wallet)}
      paddingVertical="8px"
    >
      <Inline alignVertical="center" space="8px">
        <WalletAvatar size={36} address={wallet} emojiSize="20pt" />
        <Stack space="8px">
          <TextOverflow
            maxWidth={(2 * windowWidth) / 3}
            weight="semibold"
            size="14pt"
            color="label"
          >
            {name}
          </TextOverflow>

          {isNameDefined && (
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
    <>
      {walletsExist && (
        <Box
          as={motion.div}
          key="input"
          exit={{ opacity: 0 }}
          paddingHorizontal="19px"
          variants={dropdownContainerVariant}
          initial="hidden"
          animate="show"
        >
          <Stack space="16px">
            <WalletSection
              symbol="lock.square.stack.fill"
              title={i18n.t('send.wallets_list.my_wallets')}
              wallets={wallets}
              onClickWallet={selectWalletAndCloseDropdown}
              section="my_wallets"
            />
            <WalletSection
              symbol="person.crop.circle.fill"
              title={i18n.t('send.wallets_list.contacts')}
              wallets={contacts as Address[]}
              onClickWallet={selectWalletAndCloseDropdown}
              section="contacts"
            />
            <WalletSection
              symbol="eyes.inverse"
              title={i18n.t('send.wallets_list.watched_wallets')}
              wallets={watchedWallets}
              onClickWallet={selectWalletAndCloseDropdown}
              section="watching"
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
    </>
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
  validateToAddress,
}: {
  toAddressOrName: string;
  toEnsName?: string;
  toAddress: Address;
  handleToAddressChange: InputHTMLAttributes<HTMLInputElement>['onChange'];
  clearToAddress: () => void;
  setToAddressOrName: (adrressOrName: string) => void;
  onDropdownOpen: (open: boolean) => void;
  validateToAddress: (address?: Address) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const onDropdownAction = useCallback(() => {
    onDropdownOpen(!dropdownVisible);
    setDropdownVisible(!dropdownVisible);
    dropdownVisible ? inputRef?.current?.blur() : inputRef?.current?.focus();
  }, [dropdownVisible, onDropdownOpen]);

  const openDropdown = useCallback(() => {
    onDropdownOpen(true);
    setDropdownVisible(true);
    inputRef?.current?.focus();
  }, [onDropdownOpen]);

  const closeDropdown = useCallback(() => {
    onDropdownOpen(false);
    setDropdownVisible(false);
  }, [onDropdownOpen]);

  const inputVisible = useMemo(
    () =>
      ((!toAddressOrName || !toEnsName) && !isAddress(toAddressOrName)) ||
      !isAddress(toAddress),
    [toAddress, toAddressOrName, toEnsName],
  );

  const selectWalletAndCloseDropdown = useCallback(
    (address: Address) => {
      setToAddressOrName(address);
      onDropdownAction();
      validateToAddress(address);
    },
    [onDropdownAction, validateToAddress, setToAddressOrName],
  );

  const onInputClick = useCallback(() => {
    if (!dropdownVisible) {
      openDropdown();
    }
  }, [dropdownVisible, openDropdown]);

  const onActionClose = useCallback(() => {
    clearToAddress();
    setTimeout(() => inputRef?.current?.focus(), 500);
  }, [clearToAddress]);

  useEffect(() => {
    if (!inputVisible) {
      closeDropdown();
      validateToAddress();
    }
  }, [closeDropdown, inputVisible, validateToAddress]);

  const { displayName, isNameDefined } = useWalletInfo({ address: toAddress });
  const { wallets, watchedWallets, contacts } = useAllFilteredWallets({
    filter: toAddressOrName,
  });

  useEffect(() => {
    openDropdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <DropdownInputWrapper
        zIndex={2}
        dropdownHeight={452}
        testId={'to-address-input'}
        leftComponent={
          <Box borderRadius="18px">
            <WalletAvatar address={toAddress} size={36} emojiSize="20pt" />
          </Box>
        }
        centerComponent={
          <Box as={motion.div} layout>
            <Stack space="8px">
              <Box
                as={motion.div}
                key="input"
                onClick={onInputClick}
                layout="position"
              >
                <AnimatePresence>
                  {inputVisible ? (
                    <Box as={motion.div} layout="position">
                      <Input
                        testId="to-address-input"
                        value={toAddressOrName}
                        placeholder={i18n.t(
                          'send.input_to_address_placeholder',
                        )}
                        onChange={handleToAddressChange}
                        height="32px"
                        variant="transparent"
                        style={{ paddingLeft: 0, paddingRight: 0 }}
                        innerRef={inputRef}
                      />
                    </Box>
                  ) : (
                    <Box as={motion.div} layout="position">
                      <TextOverflow
                        maxWidth={windowWidth / 2}
                        weight="semibold"
                        size="14pt"
                        color="label"
                        testId="to-address-input-display"
                      >
                        {displayName}
                      </TextOverflow>
                    </Box>
                  )}
                </AnimatePresence>
              </Box>
              <AnimatePresence>
                {!inputVisible && isNameDefined && (
                  <Box as={motion.div} key="wallet" layout="position">
                    <Text weight="semibold" size="12pt" color="labelTertiary">
                      {truncateAddress(toAddress)}
                    </Text>
                  </Box>
                )}
              </AnimatePresence>
            </Stack>
          </Box>
        }
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
        rightComponent={
          <InputActionButon
            showClose={!!toAddress}
            onClose={onActionClose}
            dropdownVisible={dropdownVisible}
            testId={`input-wrapper-close-to-address-input`}
          />
        }
      />
    </>
  );
};
