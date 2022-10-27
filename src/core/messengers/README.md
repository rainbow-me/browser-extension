# Messengers

> Adapted from the [Cross-script Messaging section](https://www.notion.so/rainbowdotme/Browser-Extension-4c6de766d4404cc89555f44e3dd4dccb#a0cf10fa28e542b2aad845dcf837efce) of the tech spec.

## What is a messenger?

A **Messenger** abstracts the native messaging APIs (such as: `window.postMessage` & `chrome.runtime.sendMessage`) to make them asynchronous and create a unified API.

- There are three main types of messengers:
  - `windowMessenger`: A messenger that abstracts that `window` messaging API `window.postMessage` / `window.addEventListener('message')`.
  - `extensionMessenger`: A messenger that abstracts the chrome runtime messaging API (`chrome.runtime.sendMessage` / `chrome.runtime.onMessage`).
  - `bridgeMessenger`: A messenger to bridge between scripts that do not have a direct/scoped messenger.

## Example usage

`popup.ts`
```tsx
import { extensionMessenger } from '~/core/messengers';

async function example() {
	const result = await extensionMessenger.send('ping', { foo: 'bar' });
	console.log(result) // "pong and bar"
}
```

`background.ts`
```tsx
import { extensionMessenger } from '~/core/messengers';

extensionMessenger.reply('ping', args => {
  return `pong and ${args.foo}`;
})
```

> Note: `extensionMessenger`, `windowMessenger` & `bridgeMessenger` share the same APIs.

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

const response = await bridgeMessenger.send('providerRequest', { id, method, payload }, { id })
```

### reply

Replies to a message sent via `send`.

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

const response = await bridgeMessenger.reply('providerRequest', ({ id, method, params }, meta) => {
  // handle provider request
})
```