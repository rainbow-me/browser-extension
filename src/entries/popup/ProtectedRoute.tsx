import React from 'react';
import { Navigate } from 'react-router-dom';

import { usePendingRequestStore } from '~/core/state';

import { UserStatusResult, useAuth } from './hooks/useAuth';
import { useIsFullScreen } from './hooks/useIsFullScreen';
import { ROUTES } from './urls';

const windowLocationHash = window.location.hash;

const isHome = () => windowLocationHash === '' || windowLocationHash === '#/';
const isWelcome = () => windowLocationHash === '#/welcome';
const isCreatePassword = () => windowLocationHash === '#/create-password';
const isLockScreen = () => windowLocationHash === '#/unlock';

export const ProtectedRoute = ({
  children,
  allowedStates,
}: {
  children: React.ReactNode;
  allowedStates: UserStatusResult[] | true;
}): JSX.Element => {
  const { status } = useAuth();
  const isFullScreen = useIsFullScreen();

  const { pendingRequests } = usePendingRequestStore();

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
        return <Navigate to={ROUTES.WELCOME} />;
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
              state={{
                pendingRequest: !!pendingRequests.length,
              }}
            />
          );
        }
        return children as JSX.Element;
    }
  }
};
