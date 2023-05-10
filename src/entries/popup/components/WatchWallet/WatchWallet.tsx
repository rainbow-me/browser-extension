/* eslint-disable no-await-in-loop */

import { isAddress } from '@ethersproject/address';
import { Address, fetchEnsAddress } from '@wagmi/core';
import { motion } from 'framer-motion';
import React, { KeyboardEvent, useCallback, useMemo, useState } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
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

const WatchWallet = ({
  onboarding = false,
  onFinishImporting,
}: {
  onboarding?: boolean;
  onFinishImporting: () => void;
}) => {
  const [isValid, setIsValid] = useState(false);
  const [address, setAddress] = useState('');
  const [additionalAccounts, setAdditionalAccounts] = useState<string[]>([]);
  const { setCurrentAddress } = useCurrentAddressStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const toggleAccount = useCallback(
    (address: string) => {
      if (isLoading) return;
      if (additionalAccounts.includes(address)) {
        setAdditionalAccounts(
          additionalAccounts.filter((a: string) => a !== address),
        );
      } else {
        setAdditionalAccounts([...additionalAccounts, address]);
      }
    },
    [additionalAccounts, isLoading],
  );

  const updateValidity = useCallback((address: string) => {
    setIsValid(isAddress(address) || isENSAddressFormat(address));
  }, []);

  const handleAddressChange = useCallback(
    (e: { target: { value: string } }) => {
      const newAddress = e.target.value;
      updateValidity(newAddress);
      setAddress(newAddress);
      setError(false);
    },
    [updateValidity],
  );

  const handleWatchWallet = useCallback(async () => {
    if (isLoading) return;
    if (address === '' && additionalAccounts.length == 0) return;
    let defaultAccountChosen = false;
    const allAccounts = address
      ? [address, ...additionalAccounts]
      : additionalAccounts;
    for (let i = 0; i < allAccounts.length; i++) {
      let addressToImport = allAccounts[i];
      if (isENSAddressFormat(addressToImport)) {
        try {
          addressToImport = (await fetchEnsAddress({
            name: addressToImport,
          })) as Address;
          if (!addressToImport) {
            setError(true);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          setError(true);
          setIsLoading(false);
          return;
        }
      } else if (!isAddress(addressToImport)) {
        setError(true);
        setIsLoading(false);
        return;
      }
      if (i === 0) {
        setIsLoading(true);
      }
      const importedAddress = (await wallet.importWithSecret(
        addressToImport,
      )) as Address;
      // Select the first wallet
      if (!defaultAccountChosen) {
        defaultAccountChosen = true;
        setCurrentAddress(importedAddress);
      }
    }
    onFinishImporting?.();
  }, [
    isLoading,
    address,
    additionalAccounts,
    onFinishImporting,
    setCurrentAddress,
  ]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleWatchWallet();
      }
    },
    [handleWatchWallet],
  );

  const readyToWatchWallet = useMemo(() => {
    if (address === '' && additionalAccounts.length) return true;
    return isValid;
  }, [additionalAccounts.length, address, isValid]);

  return (
    <>
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

        {isLoading ? (
          <Box
            alignItems="center"
            justifyContent="center"
            width="full"
            paddingTop="80px"
          >
            <Stack space="20px">
              <Text
                size="14pt"
                weight="regular"
                color="labelSecondary"
                align="center"
              >
                {i18n.t('watch_wallet.loading')}
              </Text>

              <Box
                width="fit"
                alignItems="center"
                justifyContent="center"
                style={{ margin: 'auto' }}
              >
                <Spinner size={32} />
              </Box>
            </Stack>
          </Box>
        ) : (
          <Box width="full">
            <Stack space="24px" alignHorizontal="center">
              <Box
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
                        default: 'buttonStroke',
                        focus: 'accent',
                      }}
                      width="full"
                      padding="12px"
                      placeholder={i18n.t('watch_wallet.placeholder')}
                      value={address}
                      onKeyDown={handleKeyDown}
                      tabIndex={1}
                      autoFocus
                      onChange={handleAddressChange}
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
                    {error && (
                      <Box
                        position="absolute"
                        marginTop="-24px"
                        paddingLeft="12px"
                      >
                        <Inline space="4px" alignVertical="center">
                          <Symbol
                            symbol={'exclamationmark.triangle.fill'}
                            size={11}
                            color={'orange'}
                            weight={'bold'}
                          />
                          <Text size="11pt" weight="regular" color={'orange'}>
                            {i18n.t('watch_wallet.invalid_address_or_ens_name')}
                          </Text>
                        </Inline>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Box>

              {onboarding && (
                <>
                  <Box width="full" style={{ width: '106px' }}>
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
                      style={{
                        overflow: 'auto',
                        height: '191px',
                        width: '100%',
                      }}
                    >
                      <Box
                        background="surfaceSecondaryElevated"
                        borderRadius="16px"
                        padding="16px"
                        borderColor={'separatorSecondary'}
                        borderWidth={'1px'}
                        width="full"
                        style={{
                          width: '100%',
                        }}
                      >
                        <Rows space="6px">
                          {accountsToWatch.map(
                            (address: Address | string, index) => (
                              <Row key={`avatar_${address}`}>
                                <Rows space="6px">
                                  <Row>
                                    <Columns>
                                      <Column>
                                        <Box
                                          onClick={() => toggleAccount(address)}
                                        >
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
                                            <Box
                                              justifyContent="flex-start"
                                              width="fit"
                                            >
                                              <AddressOrEns
                                                size="14pt"
                                                weight="bold"
                                                color="label"
                                                address={address as Address}
                                              />
                                            </Box>
                                          </Inline>
                                        </Box>
                                      </Column>
                                      <Column width="content">
                                        <Box
                                          alignItems="center"
                                          justifyContent="flex-end"
                                          width="fit"
                                          onClick={() => toggleAccount(address)}
                                          paddingTop="6px"
                                        >
                                          <Checkbox
                                            selected={additionalAccounts.includes(
                                              address,
                                            )}
                                          />
                                        </Box>
                                      </Column>
                                    </Columns>
                                  </Row>

                                  {index !== accountsToWatch.length - 1 ? (
                                    <Row>
                                      <Box width="full">
                                        <Separator
                                          color="separatorTertiary"
                                          strokeWeight="1px"
                                        />
                                      </Box>
                                    </Row>
                                  ) : null}
                                </Rows>
                              </Row>
                            ),
                          )}
                        </Rows>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </Stack>
          </Box>
        )}
      </Stack>
      {isLoading ? null : (
        <Box width="full" paddingVertical="20px">
          <Button
            symbol="eyes.inverse"
            symbolSide="left"
            color={readyToWatchWallet ? 'accent' : 'labelQuaternary'}
            height="44px"
            variant={readyToWatchWallet ? 'flat' : 'disabled'}
            width="full"
            onClick={handleWatchWallet}
            testId="watch-wallets-button"
          >
            {additionalAccounts.length + (address.length > 0 ? 1 : 0) > 1
              ? i18n.t('watch_wallet.watch_wallets')
              : i18n.t('watch_wallet.watch_wallet')}
          </Button>
        </Box>
      )}
    </>
  );
};

export { WatchWallet };
