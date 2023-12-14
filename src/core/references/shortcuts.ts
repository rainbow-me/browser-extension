import { ModifierKey } from '~/entries/popup/hooks/useKeyboardShortcut';

export type Shortcut = {
  display: string;
  key: string;
  modifier?: ModifierKey;
};

export const shortcuts = {
  activity: {
    CANCEL_TRANSACTION: {
      display: 'Del',
      key: 'Backspace',
    },
    COPY_TRANSACTION: {
      display: 'C',
      key: 'c',
    },
    SPEED_UP_TRANSACTION: {
      display: 'S',
      key: 's',
    },
    VIEW_TRANSACTION: {
      display: 'V',
      key: 'v',
    },
    REFRESH_TRANSACTIONS: {
      display: 'R',
      key: 'r',
    },
  },
  contact_menu: {
    COPY_CONTACT_ADDRESS: {
      display: 'C',
      key: 'c',
    },
    EDIT_CONTACT: {
      display: 'E',
      key: 'e',
    },
  },
  connect: {
    CANCEL: {
      display: 'Esc',
      key: 'Escape',
    },
    OPEN_WALLET_SWITCHER: {
      display: 'W',
      key: 'w',
    },
  },
  global: {
    BACK: {
      display: '\u2190',
      key: 'ArrowLeft',
    },
    CLOSE: {
      display: 'Esc',
      key: 'Escape',
    },
    DOWN: {
      display: '\u2193',
      key: 'ArrowDown',
    },
    FORWARD: {
      display: '\u2192',
      key: 'ArrowRight',
    },
    OPEN_GAS_MENU: {
      display: 'G',
      key: 'g',
    },
    SELECT: {
      display: 'Enter',
      key: 'Enter',
    },
    OPEN_CONTEXT_MENU: {
      display: 'Space',
      key: ' ',
    },
    OPEN_CUSTOM_GAS_MENU: {
      display: 'C',
      key: 'c',
    },
    TAB: {
      display: 'Tab',
      key: 'Tab',
    },
    UP: {
      display: '\u2191',
      key: 'ArrowUp',
    },
    COMMAND_K: {
      display: 'K',
      key: 'k',
    },
  },
  home: {
    BUY: {
      display: 'B',
      key: 'b',
    },
    COPY_ADDRESS: {
      display: 'C',
      key: 'c',
    },
    GO_TO_CONNECTED_APPS: {
      display: 'A',
      key: 'a',
    },
    GO_TO_SEND: {
      display: 'S',
      key: 's',
    },
    GO_TO_SETTINGS: {
      display: ',',
      key: ',',
    },
    GO_TO_SWAP: {
      display: 'X',
      key: 'x',
    },
    GO_TO_PROFILE: {
      display: 'P',
      key: 'p',
    },
    GO_TO_QR: {
      display: 'Q',
      key: 'q',
    },
    GO_TO_WALLETS: {
      display: 'W',
      key: 'w',
    },
    LOCK: {
      display: 'L',
      key: 'l',
    },
    TESTNET_MODE: {
      display: 'T',
      key: 't',
    },
    OPEN_MORE_MENU: {
      display: '.',
      key: '.',
    },
    OPEN_APP_CONNECTION_MENU: {
      display: 'N',
      key: 'n',
    },
    DISCONNECT_APP: {
      display: 'D',
      key: 'd',
    },
    SWITCH_NETWORK: {
      display: 'N',
      key: 'n',
    },
    SWITCH_WALLETS: {
      display: 'W',
      key: 'w',
    },
    NFT_DISPLAY_MODE_GROUPED: {
      display: '1',
      key: '1',
    },
    NFT_DISPLAY_MODE_COLLECTION: {
      display: '2',
      key: '2',
    },
    NFT_SORT_RECENT: {
      display: '1',
      key: '1',
    },
    NFT_SORT_ABC: {
      display: '2',
      key: '2',
    },
  },
  wallets: {
    CHOOSE_WALLET_GROUP_NEW: {
      display: 'N',
      key: 'n',
    },
  },
  send: {
    FOCUS_ASSET: {
      display: '\u2193',
      key: 'ArrowDown',
      modifier: 'altKey',
    },
    FOCUS_TO_ADDRESS: {
      display: '\u2191',
      key: 'ArrowUp',
      modifier: 'altKey',
    },
    OPEN_CONTACT_MENU: {
      display: '.',
      key: '.',
    },
    SET_MAX_AMOUNT: {
      display: 'M',
      key: 'm',
    },
    SWITCH_CURRENCY_LABEL: {
      display: 'F',
      key: 'f',
    },
  },
  swap: {
    FLIP_ASSETS: {
      display: 'F',
      key: 'f',
    },
    FOCUS_ASSET_TO_BUY: {
      display: '\u2193',
      key: 'ArrowDown',
      modifier: 'altKey',
    },
    FOCUS_ASSET_TO_SELL: {
      display: '\u2191',
      key: 'ArrowUp',
      modifier: 'altKey',
    },
    SET_MAX_AMOUNT: {
      display: 'M',
      key: 'm',
    },
    OPEN_NETWORK_MENU: {
      display: 'N',
      key: 'n',
    },
  },
  tokens: {
    SWAP_ASSET: {
      display: 'X',
      key: 'x',
    },
    SEND_ASSET: {
      display: 'S',
      key: 's',
    },
    BRIDGE_ASSET: {
      display: 'B',
      key: 'b',
    },
    VIEW_ASSET: {
      display: 'V',
      key: 'v',
    },
    REFRESH_TOKENS: {
      display: 'R',
      key: 'r',
    },
  },
  transaction_request: {
    CANCEL: {
      display: 'Esc',
      key: 'Escape',
    },
    ACCEPT: {
      display: '\u23CE',
      key: 'Enter',
      modifier: 'command',
    },
  },
  wallet_switcher: {
    SEARCH: {
      display: '/',
      key: '/',
    },
  },
} satisfies Record<string, Record<string, Shortcut>>;

export const getModifierKeyDisplay = (modifier: ModifierKey) => {
  const isMac = navigator.userAgent.includes('Mac');
  return {
    ctrlKey: isMac ? '\u2318' : 'Ctrl',
    command: isMac ? '\u2318' : 'Ctrl',
    altKey: 'Alt',
    shiftKey: '\u21E7',
  }[modifier];
};
