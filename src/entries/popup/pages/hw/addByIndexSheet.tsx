import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Address } from 'viem';

import { getHDPathForVendorAndType } from '~/core/keychain/hdPath';
import { i18n } from '~/core/languages';
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
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { Input } from '~/design-system/components/Input/Input';
import { Lens } from '~/design-system/components/Lens/Lens';
import { TextStyles } from '~/design-system/styles/core.css';
import { SymbolName } from '~/design-system/styles/designTokens';

import { AddressOrEns } from '../../components/AddressOrEns/AddressorEns';
import { MenuItem } from '../../components/Menu/MenuItem';
import { Navbar } from '../../components/Navbar/Navbar';
import { SwitchMenu } from '../../components/SwitchMenu/SwitchMenu';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { importAccountAtIndex } from '../../handlers/wallet';
import { useDebounce } from '../../hooks/useDebounce';
import usePrevious from '../../hooks/usePrevious';
import { useWalletsSummary } from '../../hooks/useWalletsSummary';

import { AccountIndex } from './walletList/AccountIndex';

export type PathOptions = 'live' | 'legacy';

export interface PathData {
  symbol: SymbolName;
  label: string;
  color: TextStyles['color'];
}

export const pathOptions: { [key in PathOptions]: PathData } = {
  live: {
    symbol: '123.rectangle.fill',
    label: 'Ledger Live',
    color: 'label',
  },
  legacy: {
    symbol: 'clock.arrow.2.circlepath',
    label: 'Legacy',
    color: 'label',
  },
};

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
    hdPath,
  }: {
    address?: Address;
    balance?: string;
    index?: number;
    hdPath?: string;
  }) => void;
  vendor: 'Ledger' | 'Trezor';
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const prevShow = usePrevious(show);
  const [pathDropdownOpen, setPathDropdownOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [newIndex, setNewIndex] = useState<string>('');
  const [currentPath, setCurrentPath] = useState('live' as PathOptions);
  const [newAccount, setNewAccount] = useState<{
    address: Address;
  }>();

  const { walletsSummary } = useWalletsSummary({
    addresses: [newAccount?.address as Address] || [],
  });

  const handleAddWallet = useCallback(() => {
    const hdPath = getHDPathForVendorAndType(
      Number(newIndex),
      vendor,
      currentPath === 'legacy' ? 'legacy' : undefined,
    );
    const params =
      newAccount && walletsSummary
        ? {
            address: newAccount.address as Address,
            balance: walletsSummary[newAccount?.address].balance.display,
            index: Number(newIndex),
            hdPath,
          }
        : {};
    onDone(params);
    setTimeout(() => {
      setNewAccount(undefined);
      setNewIndex('');
    }, 1000);
  }, [currentPath, newAccount, newIndex, onDone, vendor, walletsSummary]);

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
        currentPath,
      )) as Address;
      if (newAddress) {
        setNewAccount({ address: newAddress });
      }
      setTimeout(() => setLoading(false), 1000);
    }, 100);
  }, [vendor, newIndex, currentPath]);

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

  const onClose = useCallback(() => {
    onDone({});
    setTimeout(() => {
      setNewAccount(undefined);
      setNewIndex('');
    }, 1000);
  }, [onDone]);

  return (
    <BottomSheet background="scrim" show={show}>
      <Navbar
        leftComponent={
          <Navbar.CloseButton
            onClick={onClose}
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
                {vendor === 'Ledger' ? (
                  <Inline space="6px">
                    <Lens
                      style={{
                        borderRadius: 12,
                      }}
                      onClick={() => setPathDropdownOpen(true)}
                      onKeyDown={() => setPathDropdownOpen(true)}
                    >
                      <Box
                        style={{ width: '193px', height: '32px' }}
                        alignItems="center"
                        justifyContent="flex-start"
                        display="flex"
                        background="fillSecondary"
                        borderRadius="12px"
                        borderColor="separatorSecondary"
                      >
                        <SwitchMenu
                          align="center"
                          onClose={() => setPathDropdownOpen(false)}
                          open={pathDropdownOpen}
                          sideOffset={-5}
                          renderMenuTrigger={
                            <MenuItem
                              tabIndex={-1}
                              hasChevronDownOnly
                              leftComponent={
                                <Symbol
                                  symbol={pathOptions[currentPath].symbol}
                                  color={pathOptions[currentPath].color}
                                  size={18}
                                  weight="medium"
                                />
                              }
                              rightComponent={<Box />}
                              titleComponent={
                                <Box display="flex" style={{ width: '110px' }}>
                                  <MenuItem.Title
                                    text={pathOptions[currentPath].label}
                                  />
                                </Box>
                              }
                            />
                          }
                          menuItemIndicator={
                            <Symbol
                              symbol="checkmark"
                              color="label"
                              size={12}
                              weight="semibold"
                            />
                          }
                          renderMenuItem={(option, i) => {
                            const { label, symbol, color } =
                              pathOptions[option as PathOptions];

                            return (
                              <Box id={`switch-option-item-${i}`}>
                                <Inline space="8px" alignVertical="center">
                                  <Inline alignVertical="center" space="8px">
                                    <Symbol
                                      size={14}
                                      symbol={symbol}
                                      color={color}
                                      weight="semibold"
                                    />
                                  </Inline>
                                  <Text weight="regular" size="14pt">
                                    {label}
                                  </Text>
                                </Inline>
                              </Box>
                            );
                          }}
                          menuItems={Object.keys(pathOptions)}
                          selectedValue={currentPath}
                          onValueChange={(value) => {
                            setCurrentPath(value as PathOptions);
                          }}
                        />
                      </Box>
                    </Lens>
                    <Box style={{ width: '53px', paddingLeft: '2px' }}>
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
                ) : (
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
                        60
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
                )}
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
                            addressOrName={newAccount.address}
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
                                {
                                  walletsSummary[newAccount?.address].balance
                                    .display
                                }
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
              enterCta
            >
              {i18n.t('hw.add_wallet')}
            </Button>
          </Box>
        </Stack>
      </Box>
    </BottomSheet>
  );
};
