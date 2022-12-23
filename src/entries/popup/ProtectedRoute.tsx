import React from 'react';
import { Navigate } from 'react-router-dom';

import { UserStatusResult, useAuth } from './hooks/useAuth';
import { ROUTES } from './urls';

export const ProtectedRoute = ({
  children,
  allowedStates,
}: {
  children: React.ReactNode;
  allowedStates: UserStatusResult[] | true;
}): JSX.Element => {
  const { status } = useAuth();
  if (
    (allowedStates === true && status === 'READY') ||
    (Array.isArray(allowedStates) &&
      allowedStates.includes(status as UserStatusResult))
  ) {
    if (window.location.hash === '') {
      return <Navigate to={ROUTES.HOME} />;
    } else {
      console.log('rendering children without redirects');
      return children as JSX.Element;
    }
  } else {
    switch (status) {
      case 'LOCKED':
        console.log('locked user, redirecting to CREATE_PASSWORD');
        return <Navigate to={ROUTES.UNLOCK} />;
        break;
      case 'NEEDS_PASSWORD':
        console.log('needs password, redirecting!');
        return <Navigate to={ROUTES.CREATE_PASSWORD} />;
        break;
      case 'NEW':
        console.log('new user, redirecting to welcome');
        return <Navigate to={ROUTES.WELCOME} />;
        break;
      case 'READY':
        console.log('user ready and unlocked!');
        return <Navigate to={ROUTES.HOME} />;
        break;
      default:
        return <></>;
    }
  }
};
