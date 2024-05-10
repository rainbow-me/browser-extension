import React from 'react';
import { Navigate } from 'react-router-dom';

import { usePendingRequestStore } from '~/core/state';
import { WELCOME_URL, goToNewTab } from '~/core/utils/tabs';

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
  console.log('1');
  const { status, updateStatus } = useAuth();
  console.log('2', status);
  const isFullScreen = useIsFullScreen();
  console.log('3', isFullScreen);
  const { pendingRequests } = usePendingRequestStore();
  console.log('4', pendingRequests);

  const [isStatusInitialized, setStatusInitialized] = React.useState(false);
  console.log('5', isStatusInitialized);
  React.useEffect(() => {
    const initializeStatus = async () => {
      console.log('useEffect initializeStatus 1');
      await updateStatus();
      console.log('useEffect initializeStatus 2');
      setStatusInitialized(true);
    };
    initializeStatus();
  }, [updateStatus]);

  if (!isStatusInitialized) {
    return <></>;
  }

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
          goToNewTab({
            url: WELCOME_URL,
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
            goToNewTab({
              url: WELCOME_URL,
            });
          }
          return (
            <Navigate
              to={ROUTES.CREATE_PASSWORD}
              state={{
                pendingRequest: isWelcome() && !!pendingRequests?.[0],
                backTo: ROUTES.WELCOME,
              }}
            />
          );
        }
        return children as JSX.Element;
    }
  }
};
