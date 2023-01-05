import React from 'react';
import { Navigate } from 'react-router-dom';

import { UserStatusResult, useAuth } from './hooks/useAuth';
import { useIsFullScreen } from './hooks/useIsFullScreen';
import { ROUTES } from './urls';

const isHome = () =>
  window.location.hash === '' || window.location.hash === '#/';
const isWelcome = () => window.location.hash === '#/welcome';
const isCreatePassword = () => window.location.hash === '#/create-password';

export const ProtectedRoute = ({
  children,
  allowedStates,
}: {
  children: React.ReactNode;
  allowedStates: UserStatusResult[] | true;
}): JSX.Element => {
  const { status } = useAuth();
  const isFullScreen = useIsFullScreen();
  if (
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
        break;
      case 'NEW':
        if (!isFullScreen) {
          chrome.tabs.create({
            url: `chrome-extension://${chrome.runtime.id}/popup.html#/welcome`,
          });
        }
        return <Navigate to={ROUTES.WELCOME} />;
        break;
      case 'READY':
        return <Navigate to={isFullScreen ? ROUTES.READY : ROUTES.HOME} />;
        break;
      default:
        if (
          status === 'NEEDS_PASSWORD' &&
          (isHome() || isWelcome() || isCreatePassword())
        ) {
          return <Navigate to={ROUTES.CREATE_PASSWORD} />;
        }
        return children as JSX.Element;
    }
  }
};
