import { mainnet } from '@wagmi/chains';
import { getProvider } from '@wagmi/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentCurrencyStore } from '~/core/state';
import { convertRawAmountToNativeDisplay } from '~/core/utils/numbers';
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
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { Input } from '~/design-system/components/Input/Input';

import { AddressOrEns } from '../../components/AddressOrEns/AddressorEns';
import { Navbar } from '../../components/Navbar/Navbar';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { importAccountAtIndex } from '../../handlers/wallet';
import { useDebounce } from '../../hooks/useDebounce';
import { useNativeAssetForNetwork } from '../../hooks/useNativeAssetForNetwork';
import usePrevious from '../../hooks/usePrevious';

import { AccountIndex } from './walletList/AccountIndex';

export const AddByIndexSheet = ({
  show,
  onDone,
  vendor,
}: {
  show: boolean;
  onDone: ({
    address,
    balance,
    index,
  }: {
    address?: Address;
    balance?: string;
    index?: number;
  }) => void;
  vendor: 'Ledger' | 'Trezor';
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const nativeAsset = useNativeAssetForNetwork({ chainId: mainnet.id });
  const inputRef = useRef<HTMLInputElement>(null);
  const prevShow = usePrevious(show);
  const [loading, setLoading] = useState<boolean>(false);
  const [newIndex, setNewIndex] = useState<string>('');
  const [newAccount, setNewAccount] = useState<{
    address: Address;
    balance: string;
  }>();
  const handleAddWallet = useCallback(() => {
    const params = newAccount
      ? {
          address: newAccount?.address as Address,
          balance: newAccount?.balance as string,
          index: Number(newIndex),
        }
      : {};
    onDone(params);
    setTimeout(() => {
      setNewAccount(undefined);
      setNewIndex('');
    }, 1000);
  }, [newAccount, newIndex, onDone]);

  const handleNewIndexChange = useCallback(
    (e: { target: { value: string } }) => {
      if (
        e.target.value.length > 0 &&
        (isNaN(Number(e.target.value)) ||
          Number(e.target.value) < 0 ||
          Number(e.target.value) > 254 ||
          e.target.value === newIndex)
      ) {
        return;
      }
      setNewIndex(e.target.value);
      if (e.target.value === '') {
        setNewAccount(undefined);
      }
    },
    [newIndex],
  );

  const fetchWalletAtIndex = useCallback(() => {
    setLoading(true);
    setTimeout(async () => {
      const newAddress = (await importAccountAtIndex(
        vendor,
        Number(newIndex),
      )) as Address;
      if (newAddress) {
        const provider = getProvider({ chainId: mainnet.id });
        const balance = await provider.getBalance(newAddress);

        const nativeCurrencyAmount = convertRawAmountToNativeDisplay(
          balance.toString() ?? 0,
          nativeAsset?.decimals ?? 18,
          nativeAsset?.price?.value as number,
          currentCurrency,
        ).display;

        setNewAccount({ address: newAddress, balance: nativeCurrencyAmount });
      }
      setLoading(false);
    }, 100);
  }, [
    vendor,
    newIndex,
    nativeAsset?.decimals,
    nativeAsset?.price?.value,
    currentCurrency,
  ]);

  const debouncedNewIndex = useDebounce(newIndex, 1000);

  useEffect(() => {
    show && debouncedNewIndex !== '' && fetchWalletAtIndex();
  }, [debouncedNewIndex, fetchWalletAtIndex, show]);

  useEffect(() => {
    if (prevShow !== show && show) {
      setTimeout(() => {
        inputRef?.current?.focus();
      }, 300);
    }
  }, [prevShow, show]);

  return (
    <BottomSheet background="scrim" show={show}>
      <Navbar
        leftComponent={
          <Navbar.CloseButton
            onClick={() => onDone({})}
            testId="close-add-by-index-modal-button"
          />
        }
      />
      <Box paddingHorizontal="20px" marginTop="-19px">
        <Stack space="24px">
          <Box paddingHorizontal="16px">
            <Stack space="12px">
              <Text align="center" color="label" size="14pt" weight="heavy">
                {i18n.t('hw.add_by_index_title')}
              </Text>
              <Text
                align="center"
                color="labelSecondary"
                size="12pt"
                weight="medium"
              >
                {i18n.t('hw.add_by_index_description')}
              </Text>
            </Stack>
          </Box>

          <Box
            display="block"
            style={{
              margin: 'auto',
              marginTop: '21px',
              marginBottom: '24px',
              width: '102px',
            }}
          >
            <Separator color="separatorTertiary" strokeWeight="1px" />
          </Box>
          <Box>
            <Box background={'fillSecondary'} borderRadius="28px">
              <Box
                padding="16px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Inline space="6px">
                  <Box
                    style={{ width: '53px' }}
                    alignItems="center"
                    justifyContent="center"
                    display="flex"
                  >
                    <Text color="label" size="14pt" weight="heavy">
                      44
                    </Text>
                  </Box>
                  <Box
                    alignItems="center"
                    justifyContent="center"
                    display="flex"
                  >
                    <Text color="labelTertiary" size="14pt" weight="regular">
                      /
                    </Text>
                  </Box>
                  <Box
                    style={{ width: '53px' }}
                    alignItems="center"
                    justifyContent="center"
                    display="flex"
                  >
                    <Text color="label" size="14pt" weight="heavy">
                      61
                    </Text>
                  </Box>
                  <Box
                    alignItems="center"
                    justifyContent="center"
                    display="flex"
                  >
                    <Text color="labelTertiary" size="14pt" weight="regular">
                      /
                    </Text>
                  </Box>
                  <Box
                    style={{ width: '53px' }}
                    alignItems="center"
                    justifyContent="center"
                    display="flex"
                  >
                    <Text color="label" size="14pt" weight="heavy">
                      0
                    </Text>
                  </Box>
                  <Box
                    alignItems="center"
                    justifyContent="center"
                    display="flex"
                  >
                    <Text color="labelTertiary" size="14pt" weight="regular">
                      /
                    </Text>
                  </Box>
                  <Box style={{ width: '53px' }}>
                    <Input
                      value={newIndex}
                      onChange={handleNewIndexChange}
                      height="32px"
                      textAlign="center"
                      tabIndex={1}
                      variant="bordered"
                      style={{ width: '50px' }}
                      innerRef={inputRef}
                      placeholder="0"
                    />
                  </Box>
                </Inline>
              </Box>
              {newAccount && (
                <Box
                  paddingBottom="16px"
                  paddingLeft="16px"
                  paddingRight="16px"
                >
                  <Box
                    display="block"
                    style={{
                      margin: 'auto',
                      marginBottom: '12px',
                      width: '102px',
                    }}
                  >
                    <Separator color="separatorTertiary" strokeWeight="1px" />
                  </Box>
                  <Columns
                    space="8px"
                    alignVertical="center"
                    alignHorizontal="justify"
                  >
                    <Column width="content">
                      <Box height="fit" position="relative">
                        {loading ? (
                          <Box
                            style={{
                              borderRadius: '99px',
                              background:
                                'radial-gradient(887.5% 887.5% at 0% 50%, rgba(245, 248, 255, 0.02) 0%, rgba(245, 248, 255, 0.06) 100%)',
                              width: '36px',
                              height: '36px',
                            }}
                          />
                        ) : (
                          <WalletAvatar
                            address={newAccount.address}
                            size={36}
                            emojiSize="20pt"
                          />
                        )}
                      </Box>
                    </Column>
                    <Column>
                      <Box>
                        <Rows space="8px" alignVertical="center">
                          <Row height="content">
                            {loading ? (
                              <Box
                                style={{
                                  borderRadius: '99px',
                                  background:
                                    'radial-gradient(887.5% 887.5% at 0% 50%, rgba(245, 248, 255, 0.02) 0%, rgba(245, 248, 255, 0.06) 100%)',
                                  width: '88px',
                                  height: '10px',
                                }}
                              />
                            ) : (
                              <Inline space="8px">
                                <AddressOrEns
                                  address={newAccount.address}
                                  size="14pt"
                                  weight="medium"
                                />
                                <AccountIndex index={Number(newIndex)} />
                              </Inline>
                            )}
                          </Row>
                          <Row height="content">
                            {loading ? (
                              <Box
                                style={{
                                  borderRadius: '99px',
                                  background:
                                    'radial-gradient(887.5% 887.5% at 0% 50%, rgba(245, 248, 255, 0.02) 0%, rgba(245, 248, 255, 0.06) 100%)',
                                  width: '62px',
                                  height: '10px',
                                }}
                              />
                            ) : (
                              <Text
                                color="labelTertiary"
                                size="12pt"
                                weight="regular"
                              >
                                {newAccount.balance}
                              </Text>
                            )}
                          </Row>
                        </Rows>
                      </Box>
                    </Column>
                  </Columns>
                </Box>
              )}
            </Box>
            {!newAccount && <Box style={{ height: '64px', width: '100%' }} />}
          </Box>

          <Box width="full" paddingVertical="20px">
            <Button
              symbol="return.left"
              symbolSide="left"
              width="full"
              color={newAccount ? 'accent' : 'labelQuaternary'}
              height="44px"
              variant={newAccount ? 'flat' : 'disabled'}
              disabled={!newAccount}
              onClick={handleAddWallet}
              testId="hw-add-by-index-done"
            >
              {i18n.t('hw.add_wallet')}
            </Button>
          </Box>
        </Stack>
      </Box>
    </BottomSheet>
  );
};
