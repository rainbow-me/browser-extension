/* eslint-disable no-await-in-loop */
/* eslint-disable no-nested-ternary */
import { Address, chain, getProvider } from '@wagmi/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { convertRawAmountToNativeDisplay } from '~/core/utils/numbers';
import {
  Bleed,
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
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';

import { AddressOrEns } from '../../components/AddressOrEns/AddressorEns';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { Spinner } from '../../components/Spinner/Spinner';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import * as wallet from '../../handlers/wallet';
import { useNativeAssetForNetwork } from '../../hooks/useNativeAssetForNetwork';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import { AddByIndexSheet } from './addByIndexSheet';

type Vendor = 'Ledger' | 'Trezor';

export const AccountIndex = ({ index }: { index: number }) => {
  return (
    <Box
      borderRadius="8px"
      borderWidth="2px"
      borderColor={'separatorSecondary'}
      padding={'6px'}
    >
      <Text size="11pt" weight="bold" color={'labelTertiary'} align="center">
        # {index}
      </Text>
    </Box>
  );
};

const WalletListHW = () => {
  const [showAddByIndexSheet, setShowAddByIndexSheet] =
    useState<boolean>(false);
  const navigate = useRainbowNavigate();
  const { currentCurrency } = useCurrentCurrencyStore();
  const nativeAsset = useNativeAssetForNetwork({ chainId: chain.mainnet.id });

  const { state } = useLocation();
  const [accountsIgnored, setAccountsIgnored] = useState<Address[]>([]);
  const [balances, setBalances] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setCurrentAddress } = useCurrentAddressStore();

  const [accountsToImport, setAccountsToImport] = useState(
    state.accountsToImport,
  );

  const newDevice = useMemo(
    () => !!balances.length && balances.every((b) => !parseFloat(b)),
    [balances],
  );

  useEffect(() => {
    const fetchBalances = async () => {
      const provider = getProvider({ chainId: chain.mainnet.id });
      const _balances = await Promise.all(
        accountsToImport.map(async (account: { address: string }) => {
          const balance = await provider.getBalance(account.address);
          const nativeCurrencyAmount = convertRawAmountToNativeDisplay(
            balance.toString() ?? 0,
            nativeAsset?.decimals ?? 18,
            nativeAsset?.price?.value as number,
            currentCurrency,
          ).display;
          return nativeCurrencyAmount;
        }),
      );
      setBalances(_balances);
    };
    if (accountsToImport.length > 0) {
      fetchBalances();
    }
  }, [
    accountsToImport,
    currentCurrency,
    nativeAsset?.decimals,
    nativeAsset?.price?.value,
  ]);

  const selectedAccounts = useMemo(
    () => accountsToImport?.length - accountsIgnored.length,
    [accountsIgnored, accountsToImport.length],
  );

  const handleAddWallets = useCallback(async () => {
    if (isLoading) return;
    if (selectedAccounts === 0) return;
    setIsLoading(true);
    let defaultAccountChosen = false;
    // Import all the secrets
    const filteredAccounts = accountsToImport.filter(
      (account: { address: Address }) =>
        !accountsIgnored.includes(account.address),
    );

    const address = (await wallet.importAccountsFromHW(
      filteredAccounts,
      state.accountsEnabled,
      state.deviceId,
      state.vendor as Vendor,
    )) as Address;
    // Select the first wallet
    if (!defaultAccountChosen && !accountsIgnored.includes(address)) {
      defaultAccountChosen = true;
      setCurrentAddress(address);
    }

    navigate(ROUTES.HW_SUCCESS, {
      state: {
        accounts: filteredAccounts.map(
          (account: { address: Address }) => account.address,
        ),
      },
    });
  }, [
    isLoading,
    selectedAccounts,
    accountsToImport,
    state.deviceId,
    state.accountsEnabled,
    state.vendor,
    accountsIgnored,
    navigate,
    setCurrentAddress,
  ]);

  const toggleAccount = useCallback(
    (address: Address) => {
      if (isLoading) return;
      if (accountsIgnored.includes(address)) {
        setAccountsIgnored(accountsIgnored.filter((a) => a !== address));
      } else {
        setAccountsIgnored([...accountsIgnored, address]);
      }
    },
    [accountsIgnored, isLoading],
  );

  const handleCloseAddByIndexSheet = useCallback(
    ({
      address,
      index,
      balance,
    }: {
      address?: Address;
      balance?: string;
      index?: number;
    } = {}) => {
      if (address && index) {
        const newAccountsToImport = [...accountsToImport];
        newAccountsToImport.unshift({
          address: address as Address,
          index: index as number,
        });
        balances.unshift(balance as string);
        setAccountsToImport(newAccountsToImport);
      }
      setShowAddByIndexSheet(false);
    },
    [accountsToImport, balances],
  );

  return (
    <>
      <FullScreenContainer>
        <Box style={{ height: 535 }} height="full">
          <Rows alignVertical="justify">
            <Row height="content">
              {isLoading ? (
                <Box
                  paddingTop="80px"
                  alignItems="center"
                  justifyContent="center"
                  width="full"
                >
                  <Stack space="20px">
                    <Text
                      size="14pt"
                      weight="regular"
                      color="labelSecondary"
                      align="center"
                    >
                      {selectedAccounts === 1
                        ? i18n.t(
                            'edit_import_wallet_selection.importing_your_wallet',
                          )
                        : i18n.t(
                            'edit_import_wallet_selection.importing_your_wallets',
                          )}
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
                <Stack space="24px" alignHorizontal="center">
                  <Box paddingHorizontal="28px">
                    <Stack space="12px">
                      <Text
                        size="16pt"
                        weight="bold"
                        color="label"
                        align="center"
                      >
                        {i18n.t('hw.connect_wallets_title')}
                      </Text>
                      <Box>
                        <Text
                          size="12pt"
                          weight="regular"
                          color="labelTertiary"
                          align="center"
                        >
                          {accountsToImport?.length > 1
                            ? i18n.t('hw.connect_wallets_found')
                            : i18n.t('hw.connect_wallets_not_found')}
                        </Text>
                      </Box>
                    </Stack>
                  </Box>
                  <Box
                    width="full"
                    alignItems="center"
                    style={{ width: '106px' }}
                  >
                    <Separator color="separatorTertiary" strokeWeight="1px" />
                  </Box>
                  <Box width="full">
                    <Stack space="24px">
                      <Stack space="12px">
                        {!newDevice && (
                          <Box paddingHorizontal="16px">
                            <Columns alignHorizontal="justify">
                              <Column>
                                <Text
                                  size="14pt"
                                  weight="regular"
                                  color="labelSecondary"
                                  align="left"
                                >
                                  {i18n.t('hw.wallets_found', {
                                    count: selectedAccounts,
                                  })}
                                </Text>
                              </Column>
                              <Column>
                                <ButtonOverflow>
                                  <Box
                                    onClick={() => {
                                      setShowAddByIndexSheet(true);
                                    }}
                                  >
                                    <Inline
                                      alignHorizontal="right"
                                      alignVertical="center"
                                      space="4px"
                                    >
                                      <Symbol
                                        color={'labelSecondary'}
                                        size={12}
                                        symbol={'plus.circle.fill'}
                                        weight="regular"
                                      />
                                      <Text
                                        size="14pt"
                                        weight="regular"
                                        color="labelSecondary"
                                        align="right"
                                      >
                                        {i18n.t('hw.add_by_index')}
                                      </Text>
                                    </Inline>
                                  </Box>
                                </ButtonOverflow>
                              </Column>
                            </Columns>
                          </Box>
                        )}

                        <Box
                          width="full"
                          style={{
                            overflow: 'auto',
                          }}
                        >
                          <Box
                            background="surfaceSecondaryElevated"
                            borderRadius="16px"
                            padding="16px"
                            borderColor={'separatorSecondary'}
                            borderWidth={'1px'}
                            width="full"
                          >
                            <Stack
                              space="6px"
                              separator={
                                <Separator
                                  color="separatorTertiary"
                                  strokeWeight="1px"
                                />
                              }
                            >
                              {accountsToImport.map(
                                ({
                                  address,
                                  index,
                                }: {
                                  address: Address;
                                  index: number;
                                }) => (
                                  <Box width="full" key={`avatar_${address}`}>
                                    <Columns alignVertical="center">
                                      <Column>
                                        <Box
                                          onClick={() => toggleAccount(address)}
                                          justifyContent="flex-end"
                                          width="fit"
                                        >
                                          <Inline
                                            space="8px"
                                            alignHorizontal="left"
                                            alignVertical="center"
                                          >
                                            <WalletAvatar
                                              address={address as Address}
                                              size={36}
                                              emojiSize={'16pt'}
                                            />
                                            <Box
                                              justifyContent="flex-start"
                                              width="fit"
                                            >
                                              <Stack space="8px">
                                                <Inline
                                                  space="8px"
                                                  alignVertical="center"
                                                >
                                                  <AddressOrEns
                                                    size="14pt"
                                                    weight="bold"
                                                    color="label"
                                                    address={address as Address}
                                                  />
                                                  <Bleed vertical="8px">
                                                    <AccountIndex
                                                      index={index}
                                                    />
                                                  </Bleed>
                                                </Inline>
                                                <Box style={{ height: 9 }}>
                                                  <Text
                                                    color="labelTertiary"
                                                    size="12pt"
                                                    weight="regular"
                                                  >
                                                    {
                                                      balances?.[
                                                        index as number
                                                      ] as string
                                                    }
                                                  </Text>
                                                </Box>
                                              </Stack>
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
                                        >
                                          <Checkbox
                                            selected={
                                              !accountsIgnored.includes(address)
                                            }
                                          />
                                        </Box>
                                      </Column>
                                    </Columns>
                                  </Box>
                                ),
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      </Stack>
                      {newDevice && balances.length <= 6 && (
                        <Inline alignHorizontal="center">
                          <Button
                            color="surfaceSecondaryElevated"
                            height="28px"
                            variant="flat"
                            onClick={() => {
                              setShowAddByIndexSheet(true);
                            }}
                          >
                            <Inline space="4px" alignVertical="center">
                              <Symbol
                                color="label"
                                size={12}
                                symbol={'plus.circle.fill'}
                                weight="regular"
                              />
                              <Text
                                size="14pt"
                                weight="regular"
                                color="label"
                                align="center"
                              >
                                {i18n.t('hw.add_by_index')}
                              </Text>
                            </Inline>
                          </Button>
                        </Inline>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              )}
            </Row>

            {!isLoading && (
              <Row height="content">
                <Box width="full" paddingVertical="20px">
                  <Button
                    symbol="arrow.uturn.down.circle.fill"
                    symbolSide="left"
                    color={selectedAccounts > 0 ? 'accent' : 'labelQuaternary'}
                    variant={selectedAccounts > 0 ? 'flat' : 'disabled'}
                    height="44px"
                    width="full"
                    onClick={handleAddWallets}
                    disabled={selectedAccounts === 0}
                  >
                    {selectedAccounts > 1
                      ? i18n.t('hw.connect_n_wallets', {
                          count: selectedAccounts,
                        })
                      : i18n.t('hw.connect_wallet')}
                  </Button>
                </Box>
              </Row>
            )}
          </Rows>
        </Box>
      </FullScreenContainer>
      <AddByIndexSheet
        show={showAddByIndexSheet}
        vendor={state.vendor as 'Ledger' | 'Trezor'}
        onDone={handleCloseAddByIndexSheet}
      />
    </>
  );
};

export { WalletListHW };
