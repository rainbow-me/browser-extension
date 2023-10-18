# Transports

> Adapted from the [Cross-script Messaging section](https://www.notion.so/rainbowdotme/Browser-Extension-4c6de766d4404cc89555f44e3dd4dccb#a0cf10fa28e542b2aad845dcf837efce) of the tech spec.

## What is a transport?

A Transport uses a Messenger internally to create a strongly typed & scoped API.

## Example usage

`inpage.ts`
```tsx
import { providerRequestTransport } from '~/core/transports';

window.ethereum = class RainbowInjectedProvider {
  async request({ method, params }) {
    const { result } = await providerRequestTransport.send({ method, params });
    return result;
  }
}
```

`background.ts`
```tsx
import { providerRequestTransport } from '~/core/transports';

providerRequestTransport.reply(async ({ method, params }) => {
	let result = null;
	switch (method) {
    case 'eth_chainId':
			result = '0x1';
			break;
		case 'eth_requestAccounts':
			result = ['0x123']
			break;
		default:
			// ...
  }
	return { result } 
})
```