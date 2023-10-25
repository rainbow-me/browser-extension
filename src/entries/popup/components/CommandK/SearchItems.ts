import { Address } from 'wagmi';

import { ParsedUserAsset, ZerionAssetPrice } from '~/core/types/assets';
import { SymbolName } from '~/design-system/styles/designTokens';

import { CommandKPage } from './pageConfig';

export enum SearchItemType {
  ENSOrAddressResult,
  Shortcut,
  Token,
  Wallet,
}

export interface BaseSearchItem {
  action?: () => void;
  actionLabel?: string;
  actionPage?: CommandKPage;
  asset?: ParsedUserAsset;
  description?: string;
  downrank?: boolean;
  hidden?: boolean;
  hideForWatchedWallets?: boolean;
  hideFromMainSearch?: boolean;
  id?: string;
  name: string;
  page?: CommandKPage;
  searchTags?: string[];
  selectedWallet?: Address | string;
  shortcut?: { display: string; key: string; modifier?: string };
  shouldRemainOnActiveRoute?: boolean;
  to?: string;
  toPage?: CommandKPage;
  type: SearchItemType;
}

export interface ENSOrAddressSearchItem extends BaseSearchItem {
  address: Address;
  ensName?: string | null;
  truncatedName?: string;
  type: SearchItemType.ENSOrAddressResult;
}

export interface ShortcutSearchItem extends BaseSearchItem {
  address?: Address;
  hideWhenFullScreen?: boolean;
  symbol: SymbolName;
  textIcon?: string;
  symbolSize?: number;
  type: SearchItemType.Shortcut;
}

export interface TokenSearchItem extends BaseSearchItem {
  asset: ParsedUserAsset;
  price: ZerionAssetPrice | undefined;
  tokenBalanceAmount: string;
  tokenBalanceDisplay: string;
  tokenSymbol: string;
  nativeTokenBalance: string;
  selectedWalletAddress: Address;
  type: SearchItemType.Token;
}

export interface WalletSearchItem extends BaseSearchItem {
  address: Address;
  ensName?: string | null;
  hardwareWalletType?: string;
  truncatedName?: string;
  type: SearchItemType.Wallet;
  walletName?: string;
  walletType: string;
}

export type SearchItem =
  | ENSOrAddressSearchItem
  | ShortcutSearchItem
  | TokenSearchItem
  | WalletSearchItem;
