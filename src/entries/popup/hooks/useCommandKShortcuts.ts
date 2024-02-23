import React, { useCallback } from 'react';

import { shortcuts } from '~/core/references/shortcuts';

import { useCommandKStatus } from '../components/CommandK/useCommandKStatus';
import { ROUTES } from '../urls';
import { getInputIsFocused, radixIsActive } from '../utils/activeElement';

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
    return !disableOnCurrentRoute;
  }, [disableOnCurrentRoute]);

  const handleCommandKShortcutPress = React.useCallback(
    (e: KeyboardEvent) => {
      if (!isCommandKVisible) {
        e.preventDefault();
        if (getInputIsFocused()) {
          setLastActiveElement(document.activeElement as HTMLElement);
        }
        if (radixIsActive()) {
          document.dispatchEvent(closeRadixMenu);
        }
        openCommandK();
      } else {
        e.preventDefault();
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

  const commandKShortcutPressHandler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.COMMAND_K.key) {
        handleCommandKShortcutPress(e);
      }
    },
    [handleCommandKShortcutPress],
  );
  useKeyboardShortcut({
    handler: commandKShortcutPressHandler,
    condition: getCommandKTriggerIsActive(),
    enableWithinCommandK: true,
    modifierKey: 'command',
  });

  const noCommandShortcutHandler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.COMMAND_K.key && !getInputIsFocused()) {
        handleCommandKShortcutPress(e);
      }
    },
    [handleCommandKShortcutPress],
  );
  // Allow opening ⌘K with K alone if an input is not focused
  useKeyboardShortcut({
    handler: noCommandShortcutHandler,
    condition: getCommandKTriggerIsActive(),
  });
}
