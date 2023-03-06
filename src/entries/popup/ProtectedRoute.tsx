import React from 'react';
import { Navigate } from 'react-router-dom';

import { usePendingRequestStore } from '~/core/state';

import { UserStatusResult, useAuth } from './hooks/useAuth';
import { useIsFullScreen } from './hooks/useIsFullScreen';
import { ROUTES } from './urls';

const isHome = () =>
  window.location.hash === '' || window.location.hash === '#/';
const isWelcome = () => window.location.hash === '#/welcome';
const isCreatePassword = () => window.location.hash === '#/create-password';
const isLockScreen = () => window.location.hash === '#/unlock';
const isReadyScreen = () => window.location.hash === '#/ready';

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

  // we don't want to move from ready screen when we reach it
  if (isReadyScreen()) {
    return children as JSX.Element;
  } else if (
    (allowedStates === true && status === 'READY') ||
    (Array.isArray(allowedStates) &&
      allowedStates.includes(status as UserStatusResult))
  ) {
    if (window.location.hash === '' || window.location.hash === '#/') {
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
        if (status === 'NEEDS_PASSWORD' && (isHome() || isCreatePassword())) {
          if (!isFullScreen) {
            chrome.tabs.create({
              url: `chrome-extension://${chrome.runtime.id}/popup.html#/welcome`,
            });
          }
          return (
            <Navigate
              to={ROUTES.CREATE_PASSWORD}
              state={{ pendingRequest: isWelcome() && !!pendingRequests?.[0] }}
            />
          );
        }
        return children as JSX.Element;
    }
  }
};
