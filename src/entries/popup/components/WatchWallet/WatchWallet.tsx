/* eslint-disable no-await-in-loop */

import { isAddress } from '@ethersproject/address';
import { QueryOptions, useQueries } from '@tanstack/react-query';
import {
  Address,
  FetchEnsAddressArgs,
  FetchEnsAddressResult,
  fetchEnsAddress,
} from '@wagmi/core';
import { motion } from 'framer-motion';
import React, {
  ChangeEvent,
  memo,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { useEnsAddress } from 'wagmi';

import { i18n } from '~/core/languages';
import { setCurrentAddress } from '~/core/state';
import { ChainId } from '~/core/types/chains';
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
import { textStyles } from '~/design-system/styles/core.css';
import {
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

const accountsToWatch = [
  'vitalik.eth',
  'bored.eth',
  'cdixon.eth',
  'hublot.eth',
  'rainbowwallet.eth',
];

const RecommendedWatchWallets = memo(function RecommendedWatchWallets({
  onToggle,
  selected,
}: {
  onToggle: (address: Address) => void;
  selected: Record<Address, boolean>;
}) {
  const addresses = useEnsAddresses({ names: accountsToWatch, chainId: 1 });
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
              {addresses.map(({ data: address }, index) => (
                <Row key={`avatar_${address}`}>
                  <Rows space="6px">
                    <Row>
                      <Box onClick={() => !!address && onToggle(address)}>
                        <Columns>
                          <Column>
                            <Inline
                              space="8px"
                              alignHorizontal="left"
                              alignVertical="center"
                            >
                              <WalletAvatar
                                address={address as Address}
                                size={32}
                                emojiSize={'16pt'}
                              />
                              <Box justifyContent="flex-start" width="fit">
                                <AddressOrEns
                                  size="14pt"
                                  weight="bold"
                                  color="label"
                                  address={address || accountsToWatch[index]}
                                />
                              </Box>
                            </Inline>
                          </Column>
                          <Column width="content">
                            <Box
                              alignItems="center"
                              justifyContent="flex-end"
                              width="fit"
                              // onClick={() => toggleAccount(address)}
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

                    {index !== accountsToWatch.length - 1 && (
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
});

const createEnsNameQuery = ({
  chainId,
  name,
}: FetchEnsAddressArgs): QueryOptions<FetchEnsAddressResult> => ({
  queryFn: () => fetchEnsAddress({ chainId, name }),
  queryKey: [{ entity: 'ensAddress', chainId, name }],
});

const useEnsAddresses = ({
  names,
  chainId,
}: {
  chainId: ChainId;
  names: string[];
}) =>
  useQueries({
    queries: names.map((name) => createEnsNameQuery({ chainId, name })),
  });

const getErrorMessage = (
  inputAddress: string,
  allWallets: AddressAndType[],
) => {
  if (!isAddress(inputAddress)) return 'Invalid address';
  if (allWallets.some((w) => inputAddress === w.address))
    return 'Address already added';
};

const useValidateInput = (input: string) => {
  const { data: addressFromEns, isFetching: isFetchingEns } = useEnsAddress({
    name: input,
    enabled: isENSAddressFormat(input),
  });

  const isLoading = isFetchingEns;

  const debouncedInput = useDebounce(input, 1000);

  const inputAddress = addressFromEns || input;
  const address = isAddress(inputAddress) ? inputAddress : undefined;

  const { allWallets } = useWallets();
  const errorMessage = getErrorMessage(inputAddress, allWallets);

  if (isLoading || !debouncedInput.length || debouncedInput !== input)
    return { isError: true, isLoading, address };

  return {
    address,
    isError: !isLoading && !!errorMessage,
    isLoading,
    errorMessage,
  };
};

export const WatchWallet = ({
  onboarding = true,
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

  const { address, isError, isLoading, errorMessage } = useValidateInput(input);

  const addressesToImport = useMemo(
    () => ({
      ...selectedAddresses,
      ...(address && { [address]: true }),
    }),
    [address, selectedAddresses],
  );

  const handleWatchWallet = useCallback(async () => {
    const importedAddresses = await Promise.all(
      Object.keys(addressesToImport).map(wallet.importWithSecret),
    );
    setCurrentAddress(importedAddresses[0]);
    onFinishImporting?.();
  }, [addressesToImport, onFinishImporting]);

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
              borderColor="buttonStroke"
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
              {isError && !!errorMessage && (
                <Inline space="4px" alignVertical="center">
                  <Symbol
                    symbol={'exclamationmark.triangle.fill'}
                    size={11}
                    color={'orange'}
                    weight={'bold'}
                  />
                  <Text size="11pt" weight="regular" color={'orange'}>
                    {errorMessage}
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
          color={!isError ? 'accent' : 'labelQuaternary'}
          variant={!isError ? 'flat' : 'disabled'}
          disabled={isError}
          width="full"
          onClick={handleWatchWallet}
          testId="watch-wallets-button"
        >
          {Object.keys(addressesToImport).length > 1
            ? i18n.t('watch_wallet.watch_wallets')
            : i18n.t('watch_wallet.watch_wallet')}
        </Button>
      </Box>
    </>
  );
};
