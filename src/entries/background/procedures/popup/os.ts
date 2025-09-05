import { implement } from '@orpc/server';

import { walletContract } from '../../contracts/popup';

interface PopupContext {
  sender: chrome.runtime.MessageSender | undefined;
}

export const walletOs = implement(walletContract).$context<PopupContext>();
