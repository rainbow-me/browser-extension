import React from 'react';
import { Navigate } from 'react-router-dom';

import { UserStatusResult, useAuth } from './hooks/useAuth';
import { useIsFullScreen } from './hooks/useIsFullScreen';
import { ROUTES } from './urls';

const windowLocationHash = window.location.hash.split('?')?.[0];
const windowLocationOptionalParams = window.location.hash.split('?')?.[1];

const isHome = () => windowLocationHash === '' || windowLocationHash === '#/';
const isWelcome = () => windowLocationHash === '#/welcome';
const isCreatePassword = () => windowLocationHash === '#/create-password';
const isLockScreen = () => windowLocationHash === '#/unlock';
const isConnectAttempt = () =>
  windowLocationOptionalParams === 'connect-attempt';

export const ProtectedRoute = ({
  children,
  allowedStates,
}: {
  children: React.ReactNode;
  allowedStates: UserStatusResult[] | true;
}): JSX.Element => {
  const { status } = useAuth();
  const isFullScreen = useIsFullScreen();

  console.log('--- windowLocationHash', window.location);
  console.log('--- windowLocationHash', windowLocationHash);
  console.log('--- windowLocationOptionalParams', windowLocationOptionalParams);
  console.log(
    '--- isConnectAttempt()',
    isConnectAttempt(),
    window.location.hash.split('?')?.[1],
  );
  if (
    (allowedStates === true && status === 'READY') ||
    (Array.isArray(allowedStates) &&
      allowedStates.includes(status as UserStatusResult))
  ) {
    if (windowLocationHash === '' || windowLocationHash === '#/') {
      return <Navigate to={ROUTES.HOME} />;
    } else {
      return children as JSX.Element;
    }
  } else {
    switch (status) {
      case 'LOCKED':
        return <Navigate to={ROUTES.UNLOCK} />;
      case 'NEW':
        if (!isFullScreen) {
          chrome.tabs.create({
            url: `chrome-extension://${chrome.runtime.id}/popup.html#/welcome`,
          });
        }
        return (
          <Navigate
            to={ROUTES.WELCOME}
            state={{ connectAttempt: isConnectAttempt() }}
          />
        );
      case 'READY':
        return (
          <Navigate
            to={isFullScreen && !isLockScreen() ? ROUTES.READY : ROUTES.HOME}
          />
        );
      default:
        if (
          status === 'NEEDS_PASSWORD' &&
          (isHome() || isWelcome() || isCreatePassword())
        ) {
          return (
            <Navigate
              to={ROUTES.CREATE_PASSWORD}
              state={{ connectAttempt: isConnectAttempt() }}
            />
          );
        }
        return children as JSX.Element;
    }
  }
};
