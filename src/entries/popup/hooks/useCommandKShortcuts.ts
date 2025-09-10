import React from 'react';

import { shortcuts } from '~/core/references/shortcuts';

import { useCommandKStatus } from '../components/CommandK/useCommandKStatus';
import { ROUTES } from '../urls';
import {
  inputIsFocused,
  modalIsActive,
  radixIsActive,
} from '../utils/activeElement';

import { useKeyboardShortcut } from './useKeyboardShortcut';

// Disable ⌘K access on the following routes
const restrictedRoutes = [
  ROUTES.WELCOME,
  ROUTES.CREATE_PASSWORD,
  ROUTES.READY,
  ROUTES.UNLOCK,
  ROUTES.APPROVE_APP_REQUEST,
  ROUTES.SIGN,
].map((route) => `#${route}`);

const closeRadixMenu = new KeyboardEvent('keydown', {
  key: shortcuts.global.CLOSE.key,
});

export function useCommandKShortcuts() {
  const {
    closeCommandK,
    isCommandKVisible,
    openCommandK,
    setLastActiveElement,
  } = useCommandKStatus();

  const currentLocation = window.location.hash;
  const disableOnCurrentRoute = restrictedRoutes.some(
    (route) => route === currentLocation,
  );

  const getCommandKTriggerIsActive = React.useCallback(() => {
    if (isCommandKVisible) {
      return true;
    }
    return !disableOnCurrentRoute && !modalIsActive();
  }, [disableOnCurrentRoute, isCommandKVisible]);

  const handleCommandKShortcutPress = React.useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();

      if (!isCommandKVisible) {
        if (inputIsFocused()) {
          setLastActiveElement(document.activeElement as HTMLElement);
        }
        if (radixIsActive()) {
          document.dispatchEvent(closeRadixMenu);
        }
        openCommandK();
      } else {
        closeCommandK();
      }
    },
    [isCommandKVisible, openCommandK, closeCommandK, setLastActiveElement],
  );

  React.useEffect(() => {
    if (disableOnCurrentRoute && isCommandKVisible) {
      closeCommandK();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableOnCurrentRoute, isCommandKVisible]);

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.COMMAND_K.key) {
        handleCommandKShortcutPress(e);
      }
    },
    condition: getCommandKTriggerIsActive,
    enableWithinCommandK: true,
    modifierKey: 'command',
  });

  // Allow opening ⌘K with K alone if an input is not focused
  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.COMMAND_K.key && !inputIsFocused()) {
        handleCommandKShortcutPress(e);
      }
    },
    condition: getCommandKTriggerIsActive,
  });
}
