// eslint-disable-next-line no-undef
module.exports = {
  extends: ['rainbow', 'plugin:prettier/recommended'],
  plugins: ['boundaries'],
  root: true,
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
  },
  settings: {
    'boundaries/elements': [
      {
        type: 'entry-popup',
        pattern: 'src/entries/popup/**',
      },
      {
        type: 'entry-content',
        pattern: 'src/entries/content/**',
      },
      {
        type: 'entry-inpage',
        pattern: 'src/entries/inpage/**',
      },
      {
        // Should more specifically use background-messenger-wallet instead, etc.
        type: 'entry-background',
        pattern: 'src/entries/background/**',
      },
      {
        // Legacy background messenger handlers that will be deprecated
        type: 'background-handlers',
        pattern: 'src/entries/background/handlers/**',
      },
      {
        // Legacy popup messenger handlers that will be deprecated
        type: 'popup-handlers',
        pattern: 'src/entries/popup/handlers/**',
      },
      {
        // Specific messenger for the keychain and wallet interactions
        type: 'background-messenger-wallet',
        pattern: [
          'src/entries/background/contracts/popup/wallet/**',
          'src/entries/background/procedures/popup/wallet/**',
        ],
      },
      {
        // Specific messenger for dapp session and request lifecycle
        // Wagmi and Rainbow toggle procedures will be deprecated
        type: 'background-messenger-dapp-session',
        pattern: ['src/entries/background/procedures/popup/state/**'],
      },
      {
        type: 'core-keychain',
        pattern: 'src/core/keychain/**',
      },
      {
        type: 'core-state',
        pattern: 'src/core/state/**',
      },
      {
        type: 'logger',
        pattern: 'src/logger/**',
      },
    ],
  },
  rules: {
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          {
            // Allowing type imports from background for every entrypoint
            importKind: 'type',
            from: ['entry-popup', 'entry-content', 'entry-inpage'],
            allow: [
              'entry-background',
              'background-handlers',
              'background-messenger-wallet',
              'background-messenger-dapp-session',
            ],
          },
          {
            // Popup can access background entry point for messaging
            from: ['entry-popup'],
            allow: ['entry-background'],
          },
          {
            // Only background components are allowed to interact with keychain
            // background-handlers will be deprecated
            from: [
              'entry-background',
              'background-handlers',
              'background-messenger-wallet',
            ],
            allow: ['core-keychain'],
          },
          {
            // Only popup and background are allowed to interact with stores.
            from: [
              'entry-popup',
              'entry-background',
              'popup-handlers',
              'background-handlers',
              'background-messenger-wallet',
              'background-messenger-dapp-session',
            ],
            allow: ['core-state'],
          },
          {
            // Keychain uses stores.
            from: ['core-keychain'],
            allow: ['core-state'],
          },
          {
            // Logger can only be used by entry points (except inpage)
            from: [
              'entry-popup',
              'entry-content',
              'entry-background',
              'popup-handlers',
              'background-handlers',
              'background-messenger-dapp-session',
              'core-state',
              'core-keychain',
            ],
            allow: ['logger'],
          },
        ],
      },
    ],
    'no-nested-ternary': 'off',
    'import/no-default-export': 'off',
    'react/react-in-jsx-scope': 'off',
    // Disable problematic import rules that trigger babel-module resolver, will be catched by typescript
    'import/no-unresolved': 'off',
    'import/order': [
      'warn',
      {
        alphabetize: {
          order: 'asc',
        },
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        pathGroups: [
          {
            group: 'internal',
            pattern: '~/**',
          },
        ],
      },
    ],
    'sort-imports': [
      'warn',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      },
    ],
    'prettier/prettier': ['warn', require('./.prettierrc.js')],
    // Prevent direct vault storage writes outside of _setVaultInStorage
    'no-restricted-syntax': [
      'error',
      {
        // Catch LocalStorage.set('vault', ...)
        selector:
          "CallExpression[callee.object.name='LocalStorage'][callee.property.name='set'] Literal[value='vault']:first-child",
        message:
          "Direct LocalStorage.set('vault', ...) calls are not allowed. Use the centralized _setVaultInStorage method instead to ensure proper safeguards.",
      },
      {
        // Catch chrome.storage.local.set({ vault: ... }) - specifically targets chrome.storage.local.set
        selector:
          "CallExpression[callee.object.object.object.name='chrome'][callee.object.object.property.name='storage'][callee.object.property.name='local'][callee.property.name='set'] > ObjectExpression > Property[key.name='vault']",
        message:
          'Direct chrome.storage.local.set({ vault: ... }) calls are not allowed. Use the centralized _setVaultInStorage method instead to ensure proper safeguards.',
      },
      {
        // Catch chrome.storage.local.set({ 'vault': ... }) or chrome.storage.local.set({ "vault": ... })
        selector:
          "CallExpression[callee.object.object.object.name='chrome'][callee.object.object.property.name='storage'][callee.object.property.name='local'][callee.property.name='set'] > ObjectExpression > Property[key.value='vault']",
        message:
          'Direct chrome.storage.local.set({ "vault": ... }) calls are not allowed. Use the centralized _setVaultInStorage method instead to ensure proper safeguards.',
      },
      {
        // Catch chrome.storage.sync.set({ vault: ... }) - specifically targets chrome.storage.sync.set
        selector:
          "CallExpression[callee.object.object.object.name='chrome'][callee.object.object.property.name='storage'][callee.object.property.name='sync'][callee.property.name='set'] > ObjectExpression > Property[key.name='vault']",
        message:
          'Direct chrome.storage.sync.set({ vault: ... }) calls are not allowed. Use the centralized _setVaultInStorage method instead to ensure proper safeguards.',
      },
      {
        // Catch chrome.storage.sync.set({ 'vault': ... }) or chrome.storage.sync.set({ "vault": ... })
        selector:
          "CallExpression[callee.object.object.object.name='chrome'][callee.object.object.property.name='storage'][callee.object.property.name='sync'][callee.property.name='set'] > ObjectExpression > Property[key.value='vault']",
        message:
          'Direct chrome.storage.sync.set({ "vault": ... }) calls are not allowed. Use the centralized _setVaultInStorage method instead to ensure proper safeguards.',
      },
    ],
  },
};
