/* eslint-disable no-await-in-loop */
import { fetchEnsAddress } from '@wagmi/core';
import { isAddress } from 'ethers/lib/utils';
import { motion } from 'framer-motion';
import React, { useCallback, useState } from 'react';
import { Address } from 'wagmi';

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

import { AddressOrEns } from '../../components/AddressOrEns/AddressorEns';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { Spinner } from '../../components/Spinner/Spinner';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function WatchWallet() {
  const navigate = useRainbowNavigate();
  const [isValid, setIsValid] = useState(false);
  const [address, setAddress] = useState('');
  const [additionalAccounts, setAdditionalAccounts] = useState<string[]>([]);
  const { setCurrentAddress } = useCurrentAddressStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const accountsToWatch = [
    'vitalik.eth',
    'bored.eth',
    'cdixon.eth',
    'hublot.eth',
    'rainbowwallet.eth',
  ];

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
    const allAccounts = [address, ...additionalAccounts];
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

    setTimeout(() => {
      navigate(ROUTES.CREATE_PASSWORD);
    }, 1200);
  }, [isLoading, address, additionalAccounts, setCurrentAddress, navigate]);

  return (
    <FullScreenContainer>
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
      {isLoading ? (
        <Box
          alignItems="center"
          justifyContent="center"
          width="full"
          paddingTop="80px"
        >
          <Text
            size="14pt"
            weight="regular"
            color="labelSecondary"
            align="center"
          >
            {i18n.t('watch_wallet.loading')}
          </Text>
          <br />
          <br />
          <br />
          <Box
            width="fit"
            alignItems="center"
            justifyContent="center"
            style={{ margin: 'auto' }}
          >
            <Spinner size={32} />
          </Box>
        </Box>
      ) : (
        <>
          <Box paddingTop="24px" width="full">
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
                  value={address}
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
                ></Box>
                {error && (
                  <Box position="absolute" marginTop="-24px" paddingLeft="12px">
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
                  {accountsToWatch.map((address: Address | string, index) => (
                    <Row key={`avatar_${address}`}>
                      <Rows space="6px">
                        <Row>
                          <Columns>
                            <Column>
                              <Box onClick={() => toggleAccount(address)}>
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
                  ))}
                </Rows>
              </Box>
            </Box>
          </Box>
          <Box width="full" position="absolute" style={{ bottom: '83px' }}>
            <Separator color="separatorTertiary" strokeWeight="1px" />
          </Box>
          <Box width="full" paddingTop="20px">
            <Button
              symbol="arrow.uturn.down.circle.fill"
              symbolSide="left"
              color={isValid ? 'accent' : 'labelQuaternary'}
              height="44px"
              variant={isValid ? 'flat' : 'disabled'}
              width="full"
              onClick={handleWatchWallet}
              testId="watch-wallets-button"
            >
              {additionalAccounts.length + (address.length > 0 ? 1 : 0) > 1
                ? i18n.t('watch_wallet.watch_wallets')
                : i18n.t('watch_wallet.watch_wallet')}
            </Button>
          </Box>
        </>
      )}
    </FullScreenContainer>
  );
}
