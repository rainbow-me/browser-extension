import { formatDistanceToNowStrict } from 'date-fns';
import { useCallback } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import {
  Box,
  Column,
  Columns,
  Separator,
  Stack,
  TextOverflow,
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
  const onClick = useCallback(
    (address: Address) => toggleAccount?.(address),
    [toggleAccount],
  );

  const handleKeyDown = useCallback(
    (address: Address) => (e: React.KeyboardEvent<Element>) => {
      if (e.key === 'Enter') {
        onClick(address);
      }
    },
    [onClick],
  );

  return (
    <Stack
      space="6px"
      separator={
        <Box width="full">
          <Separator color="separatorTertiary" strokeWeight="1px" />
        </Box>
      }
    >
      {accountsToImport?.map((address) => (
        <Box
          onClick={() => onClick(address)}
          onKeyDown={handleKeyDown(address)}
          key={`avatar_${address}`}
          tabIndex={0}
        >
          <Columns alignVertical="center" space="16px">
            <Column>
              <Columns
                space="8px"
                alignHorizontal="left"
                alignVertical="center"
              >
                <Column width="content">
                  <WalletAvatar
                    address={address}
                    size={36}
                    emojiSize={'16pt'}
                  />
                </Column>
                <Column>
                  <Stack space="8px">
                    <AddressOrEns
                      size="14pt"
                      weight="bold"
                      color="label"
                      address={address}
                    />
                    <TextOverflow
                      color="labelTertiary"
                      size="12pt"
                      weight="semibold"
                    >
                      {i18n.t(
                        'import_wallet_selection.account_summary_tokens',
                        {
                          tokensAmount: walletsSummary[address].balance.display,
                        },
                      )}
                      {walletsSummary[address].lastTx
                        ? ` ‧ ${i18n.t(
                            'import_wallet_selection.account_summary_last_tx',
                            {
                              lastTx: formatDistanceToNowStrict(
                                Number(walletsSummary[address].lastTx) * 1000,
                              ),
                            },
                          )}`
                        : ''}
                    </TextOverflow>
                  </Stack>
                </Column>
              </Columns>
            </Column>
            {showCheckbox && (
              <Column width="content">
                <Box alignItems="center" justifyContent="flex-end" width="fit">
                  <Checkbox selected={!accountsIgnored.includes(address)} />
                </Box>
              </Column>
            )}
          </Columns>
        </Box>
      ))}
    </Stack>
  );
};
