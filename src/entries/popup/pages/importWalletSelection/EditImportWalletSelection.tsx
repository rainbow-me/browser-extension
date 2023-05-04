/* eslint-disable no-await-in-loop */
/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';

import { i18n } from '~/core/languages';
import { Bleed, Button, Inline, Symbol, Text } from '~/design-system';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu';
import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { ImportWalletSelectionEdit } from '../../components/ImportWallet/ImportWalletSelectionEdit';
import { Navbar } from '../../components/Navbar/Navbar';
import { ROUTES } from '../../urls';

type SortMethod = 'default' | 'token-balance' | 'last-transaction';
export function EditImportWalletSelection() {
  const [sortMethod, setSortMethod] = useState<SortMethod>('default');
  return (
    <>
      <Navbar
        title={i18n.t('edit_import_wallet_selection.title')}
        background={'surfaceSecondary'}
        leftComponent={
          <Navbar.CloseButton
            maintainLocationState
            backTo={ROUTES.NEW_IMPORT_WALLET_SELECTION}
          />
        }
        rightComponent={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
                    {i18n.t('send.tokens_input.sort')}
                  </Text>
                </Inline>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent marginRight="32px">
              <DropdownMenuRadioGroup
                value={sortMethod}
                onValueChange={(method) => {
                  setSortMethod(method as SortMethod);
                }}
              >
                <DropdownMenuRadioItem value="token" selectedValue={sortMethod}>
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
                      {i18n.t('send.tokens_input.token_balance')}
                    </Text>
                  </Inline>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="chain" selectedValue={sortMethod}>
                  <Inline space="8px" alignVertical="center">
                    <Bleed vertical="4px">
                      <Symbol
                        weight="semibold"
                        symbol="network"
                        size={18}
                        color="label"
                      />
                    </Bleed>

                    <Text size="14pt" weight="semibold" color="label">
                      {i18n.t('send.tokens_input.networks')}
                    </Text>
                  </Inline>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <FullScreenContainer paddingTop={62}>
        <ImportWalletSelectionEdit />
      </FullScreenContainer>
    </>
  );
}
