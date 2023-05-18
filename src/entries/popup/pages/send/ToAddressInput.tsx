import { isAddress } from '@ethersproject/address';
import { AnimatePresence, motion } from 'framer-motion';
import React, {
  InputHTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useWalletOrderStore } from '~/core/state/walletOrder';
import { truncateAddress } from '~/core/utils/address';
import {
  Bleed,
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Lens } from '~/design-system/components/Lens/Lens';
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

import { InputActionButton } from './InputActionButton';
import {
  addressToInputHighlightWrapperStyleDark,
  addressToInputHighlightWrapperStyleLight,
} from './ToAddressInput.css';

const RowHighlightWrapper = ({ children }: { children: ReactNode }) => {
  const { currentTheme } = useCurrentThemeStore();
  return (
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
            <Lens borderRadius="12px" onKeyDown={() => onClickWallet(wallet)}>
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
            </Lens>
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
  const name = section === 'contacts' ? contactName : displayName;

  return (
    <Box
      as={motion.div}
      variants={dropdownItemVariant}
      key={wallet}
      onClick={() => onClick(wallet)}
      paddingVertical="8px"
    >
      <Columns alignVertical="center" space="8px">
        <Column width="content">
          <WalletAvatar size={36} address={wallet} emojiSize="20pt" />
        </Column>
        <Column>
          <Stack space="8px">
            <TextOverflow weight="semibold" size="14pt" color="label">
              {name}
            </TextOverflow>

            {isNameDefined && (
              <Text weight="semibold" size="12pt" color="labelTertiary">
                {truncateAddress(wallet)}
              </Text>
            )}
          </Stack>
        </Column>
      </Columns>
    </Box>
  );
};

const sortWallets = (order: Address[], wallets: Address[]) =>
  order
    .map((orderAddress) => wallets.find((address) => address === orderAddress))
    .filter(Boolean);

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
  const { walletOrder } = useWalletOrderStore();
  const sortedWallets = useMemo(
    () => sortWallets(walletOrder, wallets),
    [wallets, walletOrder],
  );
  const sortedWatchedWallets = useMemo(
    () => sortWallets(walletOrder, watchedWallets),
    [watchedWallets, walletOrder],
  );
  const walletsExist = useMemo(
    () => sortedWallets.length + contacts.length + watchedWallets.length > 0,
    [contacts.length, sortedWallets.length, watchedWallets.length],
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
              wallets={sortedWallets}
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
              wallets={sortedWatchedWallets}
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

interface InputRefAPI {
  blur: () => void;
  focus: () => void;
}

interface ToAddressProps {
  toAddressOrName: string;
  toEnsName?: string;
  toAddress: Address;
  handleToAddressChange: InputHTMLAttributes<HTMLInputElement>['onChange'];
  clearToAddress: () => void;
  setToAddressOrName: (adrressOrName: string) => void;
  onDropdownOpen: (open: boolean) => void;
  validateToAddress: (address?: Address) => void;
}

export const ToAddressInput = React.forwardRef<InputRefAPI, ToAddressProps>(
  (props, forwardedRef) => {
    const {
      toAddressOrName,
      toEnsName,
      toAddress,
      handleToAddressChange,
      clearToAddress,
      setToAddressOrName,
      onDropdownOpen,
      validateToAddress,
    } = props;
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(forwardedRef, () => ({
      blur: () => closeDropdown(),
      focus: () => openDropdown(),
    }));

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

    const inputVisible =
      ((!toAddressOrName || !toEnsName) && !isAddress(toAddressOrName)) ||
      !isAddress(toAddress);

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
      onDropdownAction();
      clearToAddress();
      setTimeout(() => inputRef?.current?.focus(), 500);
    }, [clearToAddress, onDropdownAction]);

    useEffect(() => {
      if (!inputVisible) {
        closeDropdown();
        validateToAddress();
      }
    }, [closeDropdown, inputVisible, validateToAddress]);

    const { displayName, isNameDefined } = useWalletInfo({
      address: toAddress,
    });
    const { wallets, watchedWallets, contacts } = useAllFilteredWallets({
      filter: toAddressOrName,
    });

    useEffect(() => {
      setTimeout(() => {
        openDropdown();
      }, 200);
    }, [openDropdown]);

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
                      <Box
                        as={motion.div}
                        layout="position"
                        onClick={onDropdownAction}
                      >
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
                          tabIndex={0}
                        />
                      </Box>
                    ) : (
                      <Box as={motion.div} layout="position">
                        <TextOverflow
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
          rightComponent={
            <InputActionButton
              showClose={!!toAddress}
              onClose={onActionClose}
              onDropdownAction={onDropdownAction}
              dropdownVisible={dropdownVisible}
              testId={`input-wrapper-close-to-address-input`}
            />
          }
        />
      </>
    );
  },
);

ToAddressInput.displayName = 'ToAddressInput';
