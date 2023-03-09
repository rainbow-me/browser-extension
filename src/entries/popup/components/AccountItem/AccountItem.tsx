import React from 'react';
import { Address, useBalance } from 'wagmi';

import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { convertAmountAndPriceToNativeDisplay } from '~/core/utils/numbers';
import { Box, Inline, Row, Rows, Symbol, Text } from '~/design-system';
import { rowTransparentAccentHighlight } from '~/design-system/styles/rowTransparentAccentHighlight.css';

import { useNativeAssetForNetwork } from '../../hooks/useNativeAssetForNetwork';
import { useWalletName } from '../../hooks/useWalletName';
import { Asterisks } from '../Asterisks/Asterisks';
import { MenuItem } from '../Menu/MenuItem';
import { WalletAvatar } from '../WalletAvatar/WalletAvatar';

const { innerWidth: windowWidth } = window;
const TITLE_MAX_WIDTH = windowWidth - 200;

export enum LabelOption {
  address = 'address',
  balance = 'balance',
}

export default function AccountItem({
  account,
  rightComponent,
  onClick,
  labelType,
  isSelected,
  rowHighlight,
}: {
  account: Address;
  rightComponent?: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  labelType?: LabelOption;
  searchTerm?: string;
  rowHighlight?: boolean;
}) {
  const { displayName, showAddress } = useWalletName({ address: account });
  const { data: balance } = useBalance({ addressOrName: account });
  const nativeAsset = useNativeAssetForNetwork({ chainId: ChainId.mainnet });
  const { currentCurrency } = useCurrentCurrencyStore();
  const { hideAssetBalances } = useHideAssetBalancesStore();

  const nativeDisplay = convertAmountAndPriceToNativeDisplay(
    balance?.formatted || 0,
    nativeAsset?.native?.price?.amount || 0,
    currentCurrency,
  );

  let labelComponent = null;
  if (labelType === LabelOption.address) {
    labelComponent = showAddress ? (
      <MenuItem.Label text={truncateAddress(account)} />
    ) : null;
  } else if (labelType === LabelOption.balance) {
    labelComponent = hideAssetBalances ? (
      <Inline alignVertical="center">
        <Text color="labelTertiary" size="12pt" weight="medium">
          {supportedCurrencies[currentCurrency]?.symbol}
        </Text>
        <Asterisks color="labelTertiary" size={10} />
      </Inline>
    ) : (
      <MenuItem.Label text={`${nativeDisplay?.display}`} />
    );
  }

  return (
    <Box
      className={rowHighlight ? rowTransparentAccentHighlight : undefined}
      onClick={onClick}
      key={account}
      paddingHorizontal="12px"
      paddingVertical="8px"
      borderRadius="12px"
    >
      <Inline alignHorizontal="justify" alignVertical="center">
        <Inline space="8px" alignHorizontal="left">
          <Box height="fit" position="relative">
            {isSelected && (
              <Box
                style={{
                  width: 20,
                  height: 20,
                  zIndex: 1,
                  bottom: -4,
                  left: -4,
                }}
                position="absolute"
                padding="3px"
                borderRadius="round"
                background="surfacePrimaryElevated"
                alignItems="center"
                justifyContent="center"
              >
                <Symbol
                  symbol="checkmark.circle.fill"
                  color="accent"
                  weight="bold"
                  size={14}
                />
              </Box>
            )}
            <WalletAvatar address={account} size={36} emojiSize="20pt" />
          </Box>
          <Box>
            <Rows space="8px" alignVertical="center">
              <Row height="content">
                <MenuItem.Title
                  maxWidth={TITLE_MAX_WIDTH}
                  text={displayName || ''}
                />
              </Row>
              <Row height="content">{labelComponent}</Row>
            </Rows>
          </Box>
        </Inline>

        <Box>{rightComponent}</Box>
      </Inline>
    </Box>
  );
}
