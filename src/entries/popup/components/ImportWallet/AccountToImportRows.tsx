import { formatDistanceStrict } from 'date-fns';
import React from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import {
  Box,
  Column,
  Columns,
  Row,
  Rows,
  Separator,
  Text,
} from '~/design-system';

import { WalletSummary } from '../../hooks/useWalletsSummary';
import { AddressOrEns } from '../AddressOrEns/AddressorEns';
import { Checkbox } from '../Checkbox/Checkbox';
import { WalletAvatar } from '../WalletAvatar/WalletAvatar';

export const AccountToImportRows = ({
  accountsIgnored = [],
  accountsToImport,
  showCheckbox,
  walletsSummary,
  toggleAccount,
}: {
  accountsIgnored?: Address[];
  accountsToImport?: Address[];
  showCheckbox?: boolean;
  walletsSummary: { [key: Address]: WalletSummary };
  toggleAccount?: (address: Address) => void;
}) => {
  return (
    <Rows space="14px" alignVertical="top">
      {accountsToImport?.map((address: Address, index: number) => (
        <Row key={`avatar_${address}`} height="content">
          <Rows>
            <Row>
              <Columns alignVertical="center">
                <Column>
                  <Box onClick={() => toggleAccount?.(address)}>
                    <Columns
                      space="8px"
                      alignHorizontal="left"
                      alignVertical="center"
                    >
                      <Column width="content">
                        <WalletAvatar
                          address={address as Address}
                          size={32}
                          emojiSize={'16pt'}
                        />
                      </Column>
                      <Column>
                        <Rows space="8px">
                          <Row>
                            <AddressOrEns
                              size="14pt"
                              weight="bold"
                              color="label"
                              address={address as Address}
                            />
                          </Row>
                          <Row>
                            <Text
                              color="labelTertiary"
                              size="12pt"
                              weight="semibold"
                            >
                              {i18n.t(
                                'import_wallet_selection.account_summary',
                                {
                                  tokensAmount:
                                    walletsSummary[address].balance.display,
                                  lastTx: formatDistanceStrict(
                                    new Date(),
                                    new Date(
                                      Number(walletsSummary[address].lastTx) *
                                        1000,
                                    ),
                                  ),
                                },
                              )}
                            </Text>
                          </Row>
                        </Rows>
                      </Column>
                    </Columns>
                  </Box>
                </Column>
                {showCheckbox ? (
                  <Column width="content">
                    <Box
                      alignItems="center"
                      justifyContent="flex-end"
                      width="fit"
                      onClick={() => toggleAccount?.(address)}
                    >
                      <Checkbox selected={!accountsIgnored.includes(address)} />
                    </Box>
                  </Column>
                ) : null}
              </Columns>
            </Row>
            <Row>
              <Box width="full" paddingTop="6px">
                {index !== accountsToImport.length - 1 ? (
                  <Separator color="separatorTertiary" strokeWeight="1px" />
                ) : null}
              </Box>
            </Row>
          </Rows>
        </Row>
      ))}
    </Rows>
  );
};
