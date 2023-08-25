import { i18n } from '~/core/languages';

import { SearchItem, SearchItemType } from './SearchItems';

interface Page {
  listTitle: string | ((command: SearchItem) => string);
  searchPlaceholder: string;
  emptyLabel?: string;
}

export const PAGES: { [KEY: string]: Page } = {
  HOME: {
    listTitle: i18n.t('command_k.pages.home.section_title'),
    searchPlaceholder: i18n.t('command_k.pages.home.search_placeholder'),
  },
  ADD_WALLET: {
    listTitle: i18n.t('command_k.pages.add_wallet.section_title'),
    searchPlaceholder: i18n.t('command_k.pages.add_wallet.search_placeholder'),
  },
  MY_TOKENS: {
    emptyLabel: i18n.t('command_k.pages.my_tokens.empty_label'),
    listTitle: (command: SearchItem) =>
      command.selectedWallet
        ? command.selectedWallet
        : i18n.t('command_k.pages.my_tokens.section_title'),
    searchPlaceholder: i18n.t('command_k.pages.my_tokens.search_placeholder'),
  },
  MY_WALLETS: {
    listTitle: i18n.t('command_k.pages.my_wallets.section_title'),
    searchPlaceholder: i18n.t('command_k.pages.my_wallets.search_placeholder'),
  },
  TOKEN_DETAIL: {
    listTitle: (command: SearchItem) =>
      command.type === SearchItemType.Token
        ? command.name
        : i18n.t('command_k.pages.my_tokens.section_title'),
    searchPlaceholder: i18n.t(
      'command_k.pages.token_detail.search_placeholder',
    ),
  },
  UNOWNED_WALLET_DETAIL: {
    listTitle: (command: SearchItem) => command.name,
    searchPlaceholder: i18n.t(
      'command_k.pages.wallet_detail.search_placeholder',
    ),
  },
  WALLET_DETAIL: {
    listTitle: (command: SearchItem) => command.name,
    searchPlaceholder: i18n.t(
      'command_k.pages.wallet_detail.search_placeholder',
    ),
  },
};

export type CommandKPage = typeof PAGES[keyof typeof PAGES];
