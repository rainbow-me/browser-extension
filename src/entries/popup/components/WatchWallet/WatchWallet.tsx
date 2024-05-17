import { isAddress } from '@ethersproject/address';
import { motion } from 'framer-motion';
import { ChangeEvent, useCallback, useMemo, useReducer, useState } from 'react';
import { Address } from 'viem';
import { useEnsAddress } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useSavedEnsNames } from '~/core/state/savedEnsNames';
import { isENSAddressFormat } from '~/core/utils/ethereum';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { placeholderStyle } from '~/design-system/components/Input/Input.css';
import { accentColorAsHsl, textStyles } from '~/design-system/styles/core.css';
import {
  SymbolName,
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import * as wallet from '../../handlers/wallet';
import { useDebounce } from '../../hooks/useDebounce';
import { AddressAndType, useWallets } from '../../hooks/useWallets';
import { RenameWalletPrompt } from '../../pages/walletSwitcher/renameWalletPrompt';
import { AddressOrEns } from '../AddressOrEns/AddressorEns';
import { Checkbox } from '../Checkbox/Checkbox';
import { Spinner } from '../Spinner/Spinner';
import { WalletAvatar } from '../WalletAvatar/WalletAvatar';

const recommendedTopAccounts = [
  'vitalik.eth',
  'skillet.eth',
  'worm.eth',
  'nickbytes.eth',
  'gami.eth',
  'maaria.eth',
  'cdixon.eth',
  'nick.eth',
  'sassal.eth',
  'shaq.eth',
  'simona.eth',
  'sohrab.eth',
  'sadaf.eth',
  'nnnnicholas.eth',
  'dom.eth',
  'poap.eth',
  'dwr.eth',
  'jacob.eth',
  'callil.eth',
  'johnpalmer.eth',
  'shl0ms.eth',
  'gremplin.eth',
  'chrismartz.eth',
] // shuffle the list
  .map((value) => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value);

function RecommendedAccountRow({
  name,
  onToggle,
  selected,
}: {
  name: string;
  onToggle: (address: Address) => void;
  selected: Record<Address, boolean>;
}) {
  const { data: address } = useEnsAddress({ name });
  return (
    <Box onClick={() => address && onToggle(address)}>
      <Columns>
        <Column>
          <Inline space="8px" alignHorizontal="left" alignVertical="center">
            <WalletAvatar addressOrName={name} size={32} emojiSize={'16pt'} />
            <Box justifyContent="flex-start" width="fit">
              <AddressOrEns
                size="14pt"
                weight="bold"
                color="label"
                address={name}
              />
            </Box>
          </Inline>
        </Column>
        <Column width="content">
          <Box
            alignItems="center"
            justifyContent="flex-end"
            width="fit"
            paddingTop="6px"
          >
            <Checkbox selected={!!address && !!selected[address]} />
          </Box>
        </Column>
      </Columns>
    </Box>
  );
}

function RecommendedWatchWallets({
  onToggle,
  selected,
}: {
  onToggle: (address: Address) => void;
  selected: Record<Address, boolean>;
}) {
  return (
    <Box width="full">
      <Box paddingLeft="16px" paddingBottom="12px">
        <Text size="14pt" weight="regular" color="labelSecondary" align="left">
          {i18n.t('watch_wallet.watch_top_ens_wallets')}
        </Text>
      </Box>
      <Box width="full" style={{ overflow: 'auto', height: '191px' }}>
        <Box
          background="surfaceSecondaryElevated"
          borderRadius="16px"
          padding="16px"
          borderColor={'separatorSecondary'}
          borderWidth={'1px'}
          width="full"
          position="relative"
        >
          <Rows space="6px">
            {recommendedTopAccounts.map((name, index) => (
              <Row key={`avatar_${name}`}>
                <Rows space="6px">
                  <Row>
                    <RecommendedAccountRow
                      name={name}
                      onToggle={onToggle}
                      selected={selected}
                    />
                  </Row>

                  {index !== recommendedTopAccounts.length - 1 && (
                    <Row>
                      <Box width="full">
                        <Separator
                          color="separatorTertiary"
                          strokeWeight="1px"
                        />
                      </Box>
                    </Row>
                  )}
                </Rows>
              </Row>
            ))}
          </Rows>
        </Box>
      </Box>
    </Box>
  );
}

const getError = (
  address: Address,
  input: string,
  allWallets: AddressAndType[],
  savedNames: Record<Address, string>,
): { message: string; symbol: SymbolName } | undefined => {
  const tld = input.split('.').at(-1);
  if (tld && tld !== input && !isENSAddressFormat(input))
    return {
      message: i18n.t('watch_wallet.unsupported_tld', { tld }),
      symbol: 'person.crop.circle.badge.xmark',
    };

  if (!isAddress(address))
    return {
      message: i18n.t('watch_wallet.invalid_address'),
      symbol: 'person.crop.circle.badge.xmark',
    };

  if (allWallets.some((w) => address === w.address)) {
    const addedAs = savedNames[address];

    return {
      message:
        addedAs && addedAs !== input
          ? i18n.t('watch_wallet.address_already_added_as', { addedAs })
          : i18n.t('watch_wallet.address_already_added'),

      symbol: 'person.crop.circle.badge.checkmark',
    };
  }
};

export const useValidateInput = (input: string) => {
  const isInputEns = isENSAddressFormat(input);

  const { data: addressFromEns, isFetching: isFetchingEns } = useEnsAddress({
    name: input,
    query: {
      enabled: isInputEns,
    },
  });
  const savedNames = useSavedEnsNames.use.savedNames();

  const isLoading = isFetchingEns;

  const inputAddress = (addressFromEns || input) as Address;
  const address = isAddress(inputAddress) ? inputAddress : undefined;

  const { allWallets } = useWallets();

  const debouncedInput = useDebounce(input, 1000);
  const shouldValidate =
    !isLoading &&
    !!input &&
    (!!address || !!addressFromEns || debouncedInput === input);
  const error =
    shouldValidate && getError(inputAddress, input, allWallets, savedNames);
  const isValid = shouldValidate && !error;

  return {
    ensName: !!addressFromEns && input,
    isInputEns,
    address,
    isLoading,
    isValid,
    error,
  };
};

export const WatchWallet = ({
  onboarding = false,
  onFinishImporting,
}: {
  onboarding?: boolean;
  onFinishImporting: () => void;
}) => {
  const [selectedAddresses, setSelectedAddresses] = useState<
    Record<Address, boolean>
  >({});
  const [input, onInputChange] = useReducer(
    (_: string, e: ChangeEvent<HTMLTextAreaElement>) => e.target.value,
    '',
  );

  const {
    address,
    ensName,
    isLoading,
    isValid: inputIsValid,
    error,
  } = useValidateInput(input.trim());

  const addressesToImport = useMemo(
    () => [address, ...Object.keys(selectedAddresses)].filter(Boolean),
    [address, selectedAddresses],
  );

  const setCurrentAddress = useCurrentAddressStore.use.setCurrentAddress();
  const save = useSavedEnsNames.use.save();

  const [renameAccount, setRenameAccount] = useState<Address>();

  const isValid = input
    ? inputIsValid && !isLoading
    : !!addressesToImport.length;

  const handleWatchWallet = useCallback(async () => {
    const importedAddresses = await Promise.all(
      addressesToImport.map(wallet.importWithSecret),
    );
    if (importedAddresses.length) {
      // we save the ens name saved in localstorage to be able to tell
      // if the user try to add the same address with a different name later
      // (already added as foo.eth)
      if (ensName && address) {
        save(ensName, address);
      }
      setCurrentAddress(importedAddresses[0]);
      if (!onboarding && !ensName) setRenameAccount(address);
      else onFinishImporting?.();
    }
  }, [
    addressesToImport,
    ensName,
    address,
    setCurrentAddress,
    onboarding,
    onFinishImporting,
    save,
  ]);

  return (
    <>
      <RenameWalletPrompt
        account={renameAccount}
        onClose={() => {
          setRenameAccount(undefined);
          onFinishImporting?.();
        }}
      />
      <Rows alignVertical="justify">
        <Row height="content">
          <Stack space="24px" alignHorizontal="center">
            <Stack space="12px">
              <Text size="16pt" weight="bold" color="label" align="center">
                {i18n.t('watch_wallet.title')}
              </Text>
              <Box paddingHorizontal="14px">
                <Text
                  size="12pt"
                  weight="regular"
                  color="labelTertiary"
                  align="center"
                >
                  {i18n.t('watch_wallet.description')}
                </Text>
              </Box>
            </Stack>

            <Box alignItems="center" width="full" style={{ width: '106px' }}>
              <Separator color="separatorTertiary" strokeWeight="1px" />
            </Box>

            <Box width="full">
              <Stack space="24px" alignHorizontal="center">
                <Box width="full">
                  <Stack space="10px">
                    <Box
                      as={motion.div}
                      whileTap={{ scale: transformScales['0.96'] }}
                      transition={transitions.bounce}
                      height="full"
                      width="full"
                      key={`address_1`}
                      position="relative"
                    >
                      <Box
                        as="textarea"
                        testId="secret-text-area-watch"
                        background="surfaceSecondaryElevated"
                        borderRadius="12px"
                        borderWidth="1px"
                        borderColor={{
                          focus: error ? 'orange' : 'accent',
                          default: 'buttonStroke',
                        }}
                        width="full"
                        padding="12px"
                        placeholder={i18n.t('watch_wallet.placeholder')}
                        value={input}
                        onKeyDown={(e) => {
                          if (isValid && e.key === 'Enter') handleWatchWallet();
                        }}
                        tabIndex={1}
                        autoFocus
                        spellCheck={false}
                        onChange={onInputChange}
                        className={[
                          placeholderStyle,
                          textStyles({
                            color: 'label',
                            fontSize: '14pt',
                            fontWeight: 'regular',
                            fontFamily: 'rounded',
                          }),
                        ]}
                        style={{
                          caretColor: accentColorAsHsl,
                          transition: 'border-color 200ms',
                          height: '96px',
                          resize: 'none',
                        }}
                      />
                      <Box
                        position="absolute"
                        marginTop="-24px"
                        paddingLeft="12px"
                      >
                        {isLoading && (
                          <Box
                            width="fit"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Spinner size={11} color="labelTertiary" />
                          </Box>
                        )}
                        {error && (
                          <Inline space="4px" alignVertical="center">
                            <Symbol
                              symbol={error.symbol}
                              size={11}
                              color={'orange'}
                              weight={'bold'}
                            />
                            <Text size="11pt" weight="regular" color={'orange'}>
                              {error.message}
                            </Text>
                          </Inline>
                        )}
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>
            {onboarding && (
              <>
                <Box width="full" style={{ width: '106px' }}>
                  <Separator color="separatorTertiary" strokeWeight="1px" />
                </Box>
                <RecommendedWatchWallets
                  selected={selectedAddresses}
                  onToggle={(address) =>
                    setSelectedAddresses((all) => {
                      if (all[address]) delete all[address];
                      else all[address] = true;
                      return { ...all };
                    })
                  }
                />
              </>
            )}
          </Stack>
        </Row>
        <Row height="content">
          <Box width="full" paddingVertical="20px">
            <Button
              symbol="eyes.inverse"
              symbolSide="left"
              height="44px"
              color={isValid ? 'accent' : 'labelQuaternary'}
              variant={isValid ? 'flat' : 'disabled'}
              disabled={!isValid}
              width="full"
              onClick={handleWatchWallet}
              testId={`watch-wallets-button${isValid ? '-ready' : ''}`}
              tabIndex={onboarding ? 0 : 2}
            >
              {addressesToImport.length > 1
                ? i18n.t('watch_wallet.watch_wallets')
                : i18n.t('watch_wallet.watch_wallet')}
            </Button>
          </Box>
        </Row>
      </Rows>
    </>
  );
};
