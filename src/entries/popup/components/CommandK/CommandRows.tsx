import clsx from 'clsx';
import { motion } from 'framer-motion';
import React, { ReactElement } from 'react';

import { i18n } from '~/core/languages';
import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { KeychainType } from '~/core/types/keychainTypes';
import {
  Box,
  Column,
  Columns,
  Inline,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { transitions } from '~/design-system/styles/designTokens';

import { Asterisks } from '../Asterisks/Asterisks';
import { CoinIcon, NFTIcon } from '../CoinIcon/CoinIcon';
import { MenuItem } from '../Menu/MenuItem';
import { WalletAvatar } from '../WalletAvatar/WalletAvatar';

import {
  commandKRowHoverStyle,
  commandKRowHoverStyleDark,
  commandKRowSelectedStyle,
  commandKRowSelectedStyleDark,
} from './CommandKStyles.css';
import {
  ContactSearchItem,
  ENSOrAddressSearchItem,
  NFTSearchItem,
  SearchItem,
  SearchItemType,
  ShortcutSearchItem,
  TokenSearchItem,
  WalletSearchItem,
} from './SearchItems';

export const COMMAND_ROW_HEIGHT = 40;

type CommandRowProps = {
  LeftComponent: ReactElement;
  NameAccessory?: ReactElement | null;
  RightComponent?: ReactElement | null;
  command: SearchItem;
  description?: string;
  handleExecuteCommand: (command: SearchItem, e?: KeyboardEvent) => void;
  name?: string;
  selected: boolean;
};

export const CommandRow = ({
  LeftComponent,
  NameAccessory,
  RightComponent,
  command,
  description,
  handleExecuteCommand,
  name,
  selected,
}: CommandRowProps) => {
  const { currentTheme } = useCurrentThemeStore();
  const handleClick = React.useCallback(() => {
    handleExecuteCommand(command);
  }, [handleExecuteCommand, command]);

  return (
    <Box
      as={motion.div}
      style={{
        height: COMMAND_ROW_HEIGHT,
        marginLeft: 8,
        marginRight: 8,
        willChange: 'transform',
      }}
      transition={transitions.bounce}
      whileTap={{ scale: 0.97 }}
    >
      <Box
        aria-label={command.name}
        borderRadius="12px"
        className={clsx({
          [commandKRowSelectedStyleDark]: selected && currentTheme === 'dark',
          [commandKRowSelectedStyle]: selected && currentTheme !== 'dark',
          [commandKRowHoverStyleDark]: !selected && currentTheme === 'dark',
          [commandKRowHoverStyle]: !selected && currentTheme !== 'dark',
        })}
        id={command.id}
        onClick={handleClick}
        padding="10px"
        role="option"
      >
        <Columns alignVertical="center" space="8px">
          <Column width="content">
            <Box
              alignItems="center"
              display="flex"
              justifyContent="center"
              style={{ height: 20, width: 20 }}
            >
              {LeftComponent}
            </Box>
          </Column>
          <Column>
            <Box
              paddingRight={!selected && !RightComponent ? '20px' : undefined}
            >
              <Inline alignVertical="center" space="8px" wrap={false}>
                <Inline alignVertical="bottom" space="8px" wrap={false}>
                  <TextOverflow
                    color="label"
                    size="14pt"
                    weight="semibold"
                    testId={`command-name-${name || command.name}`}
                  >
                    {name || command.name}
                  </TextOverflow>
                  {description && (
                    <Box display="flex" style={{ height: 8 }}>
                      <Text
                        color="labelQuaternary"
                        size="12pt"
                        weight="semibold"
                      >
                        {description}
                      </Text>
                    </Box>
                  )}
                </Inline>
                {NameAccessory}
              </Inline>
            </Box>
          </Column>
          <Column width="content">
            <Inline space="6px" wrap={false}>
              {RightComponent}
            </Inline>
          </Column>
        </Columns>
      </Box>
    </Box>
  );
};

type NFTRowProps = {
  command: NFTSearchItem;
  handleExecuteCommand: (command: SearchItem, e?: KeyboardEvent) => void;
  selected: boolean;
};

export const NFTRow = ({
  command,
  handleExecuteCommand,
  selected,
}: NFTRowProps) => {
  const _NftIcon = React.useMemo(
    () => <NFTIcon asset={command.nft} size={20} badge={false} />,
    [command.nft],
  );

  const NFTBadge = React.useMemo(() => {
    const tokenId = parseInt(command.nft?.id);
    const hasTokenId = !isNaN(tokenId) && tokenId < 999999999;
    return (
      <Box
        alignItems="center"
        borderColor="separatorSecondary"
        borderRadius="7px"
        borderWidth="1px"
        display="flex"
        paddingHorizontal="4px"
        style={{
          height: 20,
          whiteSpace: 'nowrap',
        }}
      >
        <Text
          align="center"
          color="labelQuaternary"
          size="12pt"
          weight="semibold"
        >
          {hasTokenId ? `#${tokenId}` : 'NFT'}
        </Text>
      </Box>
    );
  }, [command.nft]);

  return (
    <CommandRow
      command={command}
      handleExecuteCommand={handleExecuteCommand}
      name={command.name}
      selected={selected}
      LeftComponent={_NftIcon}
      RightComponent={NFTBadge}
    />
  );
};

type ShortcutRowProps = {
  command: ShortcutSearchItem;
  handleExecuteCommand: (command: SearchItem, e?: KeyboardEvent) => void;
  selected: boolean;
};

export const ShortcutRow = ({
  command,
  handleExecuteCommand,
  selected,
}: ShortcutRowProps) => {
  const isAddAsWatchedWalletRow =
    command.address && command.id === 'watchUnownedWallet';
  const isSwitchToWalletRow =
    command.address && command.id === 'switchToWallet';
  const isContactWalletRow = command.address && command.id === 'contactWallet';
  const isViewTokenRow = command.asset && command.id === 'viewToken';

  const LeftComponent = React.useMemo(() => {
    if (isAddAsWatchedWalletRow || isSwitchToWalletRow || isContactWalletRow) {
      return (
        <WalletAvatar
          addressOrName={command.address || ''}
          boxShadow="12px accent"
          emojiPaddingTop="1px"
          emojiSize="10pt"
          size={20}
        />
      );
    } else if (isViewTokenRow) {
      return (
        <CoinIcon
          asset={command.asset}
          badgePositionBottom={1.5}
          badgePositionLeft={-4}
          badgeSize="10"
          size={20}
        />
      );
    } else if (command.textIcon) {
      return <MenuItem.TextIcon icon={command.textIcon} />;
    } else {
      return (
        <Symbol
          weight="semibold"
          size={command.symbolSize ?? 15}
          symbol={command.symbol}
          color="label"
        />
      );
    }
  }, [
    command.address,
    command.asset,
    command.symbol,
    command.symbolSize,
    command.textIcon,
    isAddAsWatchedWalletRow,
    isSwitchToWalletRow,
    isContactWalletRow,
    isViewTokenRow,
  ]);

  const shouldShowWalletName =
    command.selectedWallet &&
    (command.id === 'myTokens' ||
      command.id === 'myNFTs' ||
      command.id === 'myQRCode');

  return (
    <CommandRow
      command={command}
      description={shouldShowWalletName ? command.selectedWallet : undefined}
      handleExecuteCommand={handleExecuteCommand}
      selected={selected}
      LeftComponent={LeftComponent}
    />
  );
};

type TokenRowProps = {
  command: TokenSearchItem;
  handleExecuteCommand: (command: SearchItem, e?: KeyboardEvent) => void;
  selected: boolean;
};

export const TokenRow = ({
  command,
  handleExecuteCommand,
  selected,
}: TokenRowProps) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const { hideAssetBalances } = useHideAssetBalancesStore();

  const TokenIcon = React.useMemo(
    () => (
      <CoinIcon
        asset={command.asset}
        badgePositionBottom={1.5}
        badgePositionLeft={-4}
        badgeSize="10"
        size={20}
      />
    ),
    [command.asset],
  );

  const TokenBalanceBadge = React.useMemo(() => {
    const hasValue = command.price && command.price?.value > 0;
    return (
      <Box
        alignItems="center"
        borderColor="separatorSecondary"
        borderRadius="7px"
        borderWidth="1px"
        display="flex"
        paddingHorizontal="4px"
        style={{
          height: 20,
          opacity: hasValue || hideAssetBalances ? '1' : '0.625',
          whiteSpace: 'nowrap',
        }}
      >
        {hideAssetBalances ? (
          <Inline>
            <Text
              align="center"
              color="labelQuaternary"
              size="12pt"
              weight="semibold"
            >
              {supportedCurrencies[currentCurrency].symbol}
            </Text>
            <Asterisks color="labelQuaternary" size={8} />
          </Inline>
        ) : (
          <Text
            align="center"
            color="labelQuaternary"
            size="12pt"
            weight="semibold"
          >
            {hasValue
              ? command.nativeTokenBalance
              : i18n.t('command_k.command_rows.no_value')}
          </Text>
        )}
      </Box>
    );
  }, [
    command.nativeTokenBalance,
    command.price,
    currentCurrency,
    hideAssetBalances,
  ]);

  return (
    <CommandRow
      command={command}
      handleExecuteCommand={handleExecuteCommand}
      name={command.name}
      selected={selected}
      LeftComponent={TokenIcon}
      RightComponent={TokenBalanceBadge}
    />
  );
};

type WalletRowProps = {
  command: WalletSearchItem | ENSOrAddressSearchItem | ContactSearchItem;
  handleExecuteCommand: (command: SearchItem, e?: KeyboardEvent) => void;
  selected: boolean;
};

export const WalletRow = ({
  command,
  handleExecuteCommand,
  selected,
}: WalletRowProps) => {
  const address = React.useMemo(() => {
    return command.address;
  }, [command.address]);

  const isWalletSearchItem = command.type === SearchItemType.Wallet;
  const isContactSearchItem = command.type === SearchItemType.Contact;
  const hardwareWalletType = isWalletSearchItem && command.hardwareWalletType;
  const walletType = isWalletSearchItem && command.walletType;
  const walletLabel = isContactSearchItem && command.label;

  const description = React.useMemo(() => {
    if (!isWalletSearchItem && !isContactSearchItem) {
      return undefined;
    } else if (walletLabel) {
      return i18n.t(`command_k.labels.${walletLabel}`);
    } else if (walletType === KeychainType.ReadOnlyKeychain) {
      return i18n.t('wallet_switcher.watching');
    } else if (
      walletType === KeychainType.HardwareWalletKeychain &&
      hardwareWalletType
    ) {
      return i18n.t(`wallet_switcher.${hardwareWalletType.toLowerCase()}`);
    }
    return undefined;
  }, [
    isWalletSearchItem,
    isContactSearchItem,
    walletLabel,
    walletType,
    hardwareWalletType,
  ]);

  const Avatar = React.useMemo(
    () => (
      <WalletAvatar
        addressOrName={address}
        boxShadow="12px accent"
        emojiPaddingTop="1px"
        emojiSize="10pt"
        size={20}
      />
    ),
    [address],
  );

  return (
    <CommandRow
      command={command}
      description={description}
      handleExecuteCommand={handleExecuteCommand}
      name={command.truncatedName}
      selected={selected}
      LeftComponent={Avatar}
    />
  );
};
