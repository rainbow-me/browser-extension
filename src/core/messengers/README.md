# Messengers

> Adapted from the [Cross-script Messaging section](https://www.notion.so/rainbowdotme/Browser-Extension-4c6de766d4404cc89555f44e3dd4dccb#a0cf10fa28e542b2aad845dcf837efce) of the tech spec.

## What is a messenger?

A **Messenger** abstracts the native messaging APIs (such as: `window.postMessage` & `chrome.runtime.sendMessage`) to make them asynchronous and create a unified API.

- There are three main types of messengers:
  - `windowMessenger`: A messenger that abstracts that `window` messaging API `window.postMessage` / `window.addEventListener('message')`.
  - `extensionMessenger`: A messenger that abstracts the chrome runtime messaging API (`chrome.runtime.sendMessage` / `chrome.runtime.onMessage`).
  - `tabMessenger`: A messenger that abstracts the chrome tab messaging API (`chrome.tabs.sendMessage` / `chrome.runtime.onMessage`).
  - `bridgeMessenger`: A messenger to bridge between scripts that do not have a direct/scoped messenger.

## Getting started

Luckily, you don't have to waste time figuring out which messenger you should use as we provide you with an `initializeMessenger` function which will provide you with a messenger based on the script you want to connect to.

`popup.ts`

```tsx
import { initializeMessenger } from '~/core/messengers';

// We want to initialize a connection with the background script.
// Internally provides an `extensionMessenger`.
const messenger = initializeMessenger({ connect: 'background' });

async function example() {
  const result = await messenger.send('ping', { foo: 'bar' });
  console.log(result); // "pong and bar"
}
```

`background.ts`

```tsx
import { initializeMessenger } from '~/core/messengers';

// We want to initialize a connection with the popup script.
// Internally provides an `extensionMessenger`.
const messenger = initializeMessenger({ connect: 'popup' });

messenger.reply('ping', (args) => {
  return `pong and ${args.foo}`;
});
```

## Messenger compatibility

You probably don't need to worry much about this table as we have the `initializeMessenger` function, but it's here to reference anyway.

| From / To      | Popup                | Background           | Content Script    | Inpage            |
| -------------- | -------------------- | -------------------- | ----------------- | ----------------- |
| Popup          | -                    | `extensionMessenger` | `tabMessenger`    | `bridgeMessenger` |
| Background     | `extensionMessenger` | -                    | `tabMessenger`    | `bridgeMessenger` |
| Content Script | `tabMessenger`       | `tabMessenger`       | -                 | `windowMessenger` |
| Inpage         | `bridgeMessenger`    | `bridgeMessenger`    | `windowMessenger` | -                 |

## API

### available

Whether or not the messenger is available in the current script type.

Example: `extensionMessenger.available` will be falsy on the "inpage" script type as `chrome.runtime.id` is undefined.

### name

The name of the messenger.

Example: `extensionMessenger.name === "extensionMessenger"`

### send

Sends a message to the `reply` handler. The `reply` handler resides in another script type.

#### Arguments

**topic**

A scoped topic that the `reply` will listen for.

**payload**

The payload to send to the `reply` handler.

**options (optional)**

- **`id`** (optional): Identify & scope the request via an ID.

#### Example

`inpage.ts`

```tsx
import { extensionMessenger } from '~/core/messengers';

const response = await bridgeMessenger.send(
  'providerRequest',
  { id, method, payload },
  { id },
);
```

### reply

Replies to a message sent via `send`.

> Note: you can also use `reply` as an event handler too.

#### Arguments

**topic**

A scoped topic that was sent from `send`.

**callback**

- **`payload`**: The payload sent from `send`.
- **`meta.sender`**: The sender of the message.
- **`meta.topic`**: The topic provided.
- **`meta.id`**: An optional scoped identifier.

#### Example

`background.ts`

```tsx
import { extensionMessenger } from '~/core/messengers';

const response = await bridgeMessenger.reply(
  'providerRequest',
  ({ id, method, params }, meta) => {
    // handle provider request
  },
);
```

## FAQ

### Why do we have `extensionMessenger` and `tabMessenger`

While sending messages [using `chrome.runtime.sendMessage`](https://developer.chrome.com/docs/extensions/reference/runtime/#method-sendMessage) works fine from the content script (on a browser tab) to the background script (where it is handled via `chrome.runtime.onMessage.addListener`), unfortunately, [we can't send messages if we reverse the direction](https://developer.chrome.com/docs/extensions/reference/runtime/#method-sendMessage) (background to content script).

This is because we can only send messages to the content script by **targeting a browser tab**. This is achieved via [`chrome.tabs.sendMessage` with a provided tab ID](https://developer.chrome.com/docs/extensions/reference/tabs/#method-sendMessage).

Currently, `extensionMessenger` is an abstraction over "global" chrome messaging `chrome.runtime.sendMessage`, while `tabMessenger` is an abstraction over `chrome.tabs.sendMessage`. They both work very similarly internally, however the main difference is that `tabMessenger` also queries for the current active browser tab before it sends off the message.
