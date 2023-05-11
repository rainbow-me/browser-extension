/* eslint-disable no-await-in-loop */

import { isAddress } from '@ethersproject/address';
import { Address } from '@wagmi/core';
import { motion } from 'framer-motion';
import { ChangeEvent, useCallback, useMemo, useReducer, useState } from 'react';
import { useEnsAddress } from 'wagmi';

import { i18n } from '~/core/languages';
import { setCurrentAddress } from '~/core/state';
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
import { AddressOrEns } from '../AddressOrEns/AddressorEns';
import { Checkbox } from '../Checkbox/Checkbox';
import { Spinner } from '../Spinner/Spinner';
import { WalletAvatar } from '../WalletAvatar/WalletAvatar';

const recommendedTopAccounts: [string, Address][] = [
  ['vitalik.eth', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'],
  ['bored.eth', '0xf56345338Cb4CddaF915ebeF3bfde63E70FE3053'],
  ['cdixon.eth', '0xe11BFCBDd43745d4Aa6f4f18E24aD24f4623af04'],
  ['hublot.eth', '0xDCD589BC5E95Bc6a4A530Cdb14F56A5fEbf6bCe7'],
  ['rainbowwallet.eth', '0x7a3d05c70581bD345fe117c06e45f9669205384f'],
];

function RecommendedWatchWallets({
  onToggle,
  selected,
}: {
  onToggle: (address: Address) => void;
  selected: Record<Address, boolean>;
}) {
  return (
    <>
      <Box paddingVertical="24px" width="full" style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Box width="full">
        <Box paddingLeft="16px" paddingBottom="12px">
          <Text
            size="14pt"
            weight="regular"
            color="labelSecondary"
            align="left"
          >
            {i18n.t('watch_wallet.watch_top_ens_wallets')}
          </Text>
        </Box>
        <Box
          width="full"
          style={{
            overflow: 'auto',
            height: '191px',
          }}
        >
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
              {recommendedTopAccounts.map(([name, address], index) => (
                <Row key={`avatar_${name}`}>
                  <Rows space="6px">
                    <Row>
                      <Box onClick={() => onToggle(address)}>
                        <Columns>
                          <Column>
                            <Inline
                              space="8px"
                              alignHorizontal="left"
                              alignVertical="center"
                            >
                              <WalletAvatar
                                address={address}
                                size={32}
                                emojiSize={'16pt'}
                              />
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
                              <Checkbox
                                selected={!!address && !!selected[address]}
                              />
                            </Box>
                          </Column>
                        </Columns>
                      </Box>
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
      <Box width="full" position="absolute" style={{ bottom: '83px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
    </>
  );
}

const watchedEnsNames = {
  storageKey: 'address saved with name',
  get: () => {
    try {
      return (JSON.parse(
        localStorage.getItem(watchedEnsNames.storageKey) || '',
      ) || {}) as Record<Address, string>;
    } catch {
      return {};
    }
  },
  save: (name: string, address: Address) => {
    const savedWatchedEnses = watchedEnsNames.get();
    savedWatchedEnses[address] = name;
    localStorage.setItem(
      watchedEnsNames.storageKey,
      JSON.stringify(savedWatchedEnses),
    );
  },
};

const getError = (
  address: string,
  input: string,
  allWallets: AddressAndType[],
): { message: string; symbol: SymbolName } | undefined => {
  const tld = input.split('.').at(-1);
  if (tld && tld !== input && !isENSAddressFormat(input))
    return {
      message: `${tld} is not supported`,
      symbol: 'person.crop.circle.badge.xmark',
    };

  if (!isAddress(address))
    return {
      message: 'Invalid address',
      symbol: 'person.crop.circle.badge.xmark',
    };

  if (allWallets.some((w) => address === w.address)) {
    const addedAs = watchedEnsNames.get()[address];
    const msg = addedAs && addedAs !== input ? ` as ${addedAs}` : '';
    return {
      message: `Address already added${msg}`,
      symbol: 'person.crop.circle.badge.checkmark',
    };
  }
};

const useValidateInput = (input: string) => {
  const { data: addressFromEns, isFetching: isFetchingEns } = useEnsAddress({
    name: input,
    enabled: isENSAddressFormat(input),
  });

  const isLoading = isFetchingEns;

  const inputAddress = addressFromEns || input;
  const address = isAddress(inputAddress) ? inputAddress : undefined;

  const { allWallets } = useWallets();

  const debouncedInput = useDebounce(input, 1000);
  const shouldValidate = !isLoading && !!input && debouncedInput === input;
  const error = shouldValidate && getError(inputAddress, input, allWallets);
  const isValid = shouldValidate && !error;

  return {
    ensName: !!addressFromEns && input,
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

  const { address, ensName, isLoading, isValid, error } =
    useValidateInput(input);

  const addressesToImport = useMemo(
    () => [address, ...Object.keys(selectedAddresses)].filter(Boolean),
    [address, selectedAddresses],
  );

  const handleWatchWallet = useCallback(async () => {
    const importedAddresses = await Promise.all(
      addressesToImport.map(wallet.importWithSecret),
    );
    // we save the ens name saved in localstorage to be able to tell
    // if the user try to add the same address with a different name later
    // (already added as foo.eth)
    if (ensName && address) watchedEnsNames.save(ensName, address);
    setCurrentAddress(importedAddresses[0]);
    onFinishImporting?.();
  }, [addressesToImport, ensName, address, onFinishImporting]);

  return (
    <>
      <Box alignItems="center" paddingBottom="10px">
        <Inline
          wrap={false}
          alignVertical="center"
          alignHorizontal="center"
          space="5px"
        >
          <Symbol
            symbol="doc.plaintext"
            size={16}
            color="transparent"
            weight={'bold'}
          />
          <Text size="16pt" weight="bold" color="label" align="center">
            {i18n.t('watch_wallet.title')}
          </Text>
        </Inline>
        <Box padding="16px" paddingTop="10px">
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {i18n.t('watch_wallet.description')}
          </Text>
        </Box>
      </Box>
      <Box width="full" style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Box
        paddingTop="24px"
        width="full"
        style={{
          height: onboarding ? 'undefined' : '375px',
        }}
      >
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
              testId="secret-textarea"
              background="surfaceSecondaryElevated"
              borderRadius="12px"
              borderWidth="1px"
              borderColor={{
                focus: error ? 'orange' : 'accent',
                default: 'separator',
              }}
              width="full"
              padding="12px"
              placeholder={i18n.t('watch_wallet.placeholder')}
              value={input}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleWatchWallet();
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
            <Box position="absolute" marginTop="-24px" paddingLeft="12px">
              {isLoading && (
                <Box width="fit" alignItems="center" justifyContent="center">
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
                    {/* {i18n.t('watch_wallet.invalid_address_or_ens_name')} */}
                  </Text>
                </Inline>
              )}
            </Box>
          </Box>
        </Stack>
      </Box>
      {onboarding && (
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
      )}
      <Box width="full" paddingTop="20px">
        <Button
          emoji="👀"
          height="44px"
          color={isValid ? 'accent' : 'labelQuaternary'}
          variant={isValid ? 'flat' : 'disabled'}
          disabled={!isValid}
          width="full"
          onClick={handleWatchWallet}
          testId="watch-wallets-button"
        >
          {addressesToImport.length > 1
            ? i18n.t('watch_wallet.watch_wallets')
            : i18n.t('watch_wallet.watch_wallet')}
        </Button>
      </Box>
    </>
  );
};
