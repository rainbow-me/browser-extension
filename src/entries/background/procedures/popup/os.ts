import { implement } from '@orpc/server';

import { popupRouterContract } from '../../contracts/popup';

interface PopupContext {
  sender: chrome.runtime.MessageSender | undefined;
}

export const popupOs = implement(popupRouterContract).$context<PopupContext>();
