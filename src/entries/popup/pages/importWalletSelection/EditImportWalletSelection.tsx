import React, { useState } from 'react';

import { i18n } from '~/core/languages';
import {
  Bleed,
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Symbol,
  Text,
} from '~/design-system';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu';
import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { ImportWalletSelectionEdit } from '../../components/ImportWallet/ImportWalletSelectionEdit';
import { Navbar } from '../../components/Navbar/Navbar';
import { ROUTES } from '../../urls';

export type WalletsSortMethod =
  | 'default'
  | 'token-balance'
  | 'last-transaction';

export function EditImportWalletSelection() {
  const [sortMethod, setSortMethod] = useState<WalletsSortMethod>('default');
  return (
    <>
      <Navbar
        title={i18n.t('edit_import_wallet_selection.title')}
        background={'surfaceSecondary'}
        leftComponent={
          <Navbar.CloseButton
            maintainLocationState
            backTo={ROUTES.IMPORT__SELECT}
          />
        }
        rightComponent={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Box>
                <Button
                  color="surfaceSecondaryElevated"
                  height="28px"
                  variant="flat"
                  paddingLeft="8px"
                  paddingRight="12px"
                >
                  <Inline space="4px" alignVertical="center">
                    <Symbol
                      symbol="arrow.up.arrow.down"
                      color="label"
                      weight="semibold"
                      size={14}
                    />
                    <Text size="14pt" weight="semibold" color="label">
                      {i18n.t('edit_import_wallet_selection.sort.title')}
                    </Text>
                  </Inline>
                </Button>
              </Box>
            </DropdownMenuTrigger>

            <DropdownMenuContent sideOffset={1} align="end" marginRight="4px">
              <DropdownMenuRadioGroup
                value={sortMethod}
                onValueChange={(method) => {
                  setSortMethod(method as WalletsSortMethod);
                }}
              >
                <Rows space="4px">
                  <Row>
                    <DropdownMenuRadioItem
                      value="default"
                      selectedValue={sortMethod}
                    >
                      <Inline space="8px" alignVertical="center">
                        <Bleed vertical="4px">
                          <Symbol
                            weight="semibold"
                            symbol="wand.and.stars.inverse"
                            size={18}
                            color="label"
                          />
                        </Bleed>

                        <Text size="14pt" weight="semibold" color="label">
                          {i18n.t('edit_import_wallet_selection.sort.default')}
                        </Text>
                      </Inline>
                    </DropdownMenuRadioItem>
                  </Row>

                  <Row>
                    <DropdownMenuSeparator />
                  </Row>

                  <Row>
                    <Box>
                      <DropdownMenuRadioItem
                        value="token-balance"
                        selectedValue={sortMethod}
                      >
                        <Inline space="8px" alignVertical="center">
                          <Bleed vertical="4px">
                            <Symbol
                              weight="semibold"
                              symbol="record.circle.fill"
                              size={18}
                              color="label"
                            />
                          </Bleed>

                          <Text size="14pt" weight="semibold" color="label">
                            {i18n.t(
                              'edit_import_wallet_selection.sort.token_balance',
                            )}
                          </Text>
                        </Inline>
                      </DropdownMenuRadioItem>

                      <DropdownMenuRadioItem
                        value="last-transaction"
                        selectedValue={sortMethod}
                      >
                        <Inline space="8px" alignVertical="center">
                          <Bleed vertical="4px">
                            <Symbol
                              weight="semibold"
                              symbol="bolt.fill"
                              size={18}
                              color="label"
                            />
                          </Bleed>

                          <Text size="14pt" weight="semibold" color="label">
                            {i18n.t(
                              'edit_import_wallet_selection.sort.last_transaction',
                            )}
                          </Text>
                        </Inline>
                      </DropdownMenuRadioItem>
                    </Box>
                  </Row>
                </Rows>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <FullScreenContainer>
        <ImportWalletSelectionEdit sortMethod={sortMethod} />
      </FullScreenContainer>
    </>
  );
}
