import { Address } from 'wagmi';

import { ParsedUserAsset, ZerionAssetPrice } from '~/core/types/assets';
import { UniqueAsset } from '~/core/types/nfts';
import { SearchAsset } from '~/core/types/search';
import { SymbolName } from '~/design-system/styles/designTokens';

import { CommandKPage } from './pageConfig';

export enum SearchItemType {
  ENSOrAddressResult,
  NFT,
  Shortcut,
  Token,
  Wallet,
  Contact,
  UnownedToken,
}

export interface BaseSearchItem {
  action?: () => void;
  actionLabel?: () => string;
  actionPage?: CommandKPage;
  asset?: ParsedUserAsset | SearchAsset;
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

export interface NFTSearchItem extends BaseSearchItem {
  nft: UniqueAsset;
  selectedWalletAddress: Address;
  type: SearchItemType.NFT;
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
  address: string;
  asset: ParsedUserAsset;
  price: ZerionAssetPrice | undefined;
  tokenBalanceAmount: string;
  tokenBalanceDisplay: string;
  tokenSymbol: string;
  nativeTokenBalance: string;
  selectedWalletAddress: Address;
  type: SearchItemType.Token;
}

export interface UnownedTokenSearchItem extends BaseSearchItem {
  address: string;
  tokenSymbol: string;
  type: SearchItemType.UnownedToken;
}

export interface WalletSearchItem extends BaseSearchItem {
  address: Address;
  ensName?: string | null;
  hardwareWalletType?: string;
  truncatedName?: string;
  type: SearchItemType.Wallet;
  walletName?: string;
  walletType?: string;
}

export interface ContactSearchItem extends BaseSearchItem {
  address: Address;
  ensName?: string | null;
  truncatedName?: string;
  walletName?: string;
  type: SearchItemType.Contact;
  label?: string;
}

export type SearchItem =
  | ENSOrAddressSearchItem
  | NFTSearchItem
  | ShortcutSearchItem
  | TokenSearchItem
  | UnownedTokenSearchItem
  | WalletSearchItem
  | ContactSearchItem;
