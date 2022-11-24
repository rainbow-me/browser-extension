import { AnimatePresence } from 'framer-motion';
import * as React from 'react';
import { matchRoutes, useLocation } from 'react-router-dom';

import { AnimatedRoute } from '~/design-system/components/AnimatedRoute/AnimatedRoute';

import { ConnectedApps } from './pages/ConnectedApps';
import { Home } from './pages/home';
import { Send } from './pages/send';
import { Settings } from './pages/settings';
import { Sign } from './pages/sign';
import { Wallets } from './pages/wallets';

export function Routes() {
  const location = useLocation();
  const routeMatch = matchRoutes(
    [
      {
        path: '/',
        element: (
          <AnimatedRoute direction="base">
            <Home />
          </AnimatedRoute>
        ),
      },
      {
        path: '/connected',
        element: (
          <AnimatedRoute direction="vertical">
            <ConnectedApps />
          </AnimatedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <AnimatedRoute direction="vertical">
            <Settings />
          </AnimatedRoute>
        ),
      },
      {
        path: '/send',
        element: (
          <AnimatedRoute direction="vertical">
            <Send />
          </AnimatedRoute>
        ),
      },
      {
        path: '/sign',
        element: (
          <AnimatedRoute direction="vertical">
            <Sign />
          </AnimatedRoute>
        ),
      },
      {
        path: '/wallets',
        element: (
          <AnimatedRoute direction="horizontal">
            <Wallets />
          </AnimatedRoute>
        ),
      },
    ],
    location.pathname,
  );
  const element = routeMatch?.[0]?.route?.element;
  if (!element) {
    // error UI here probably
    return null;
  }
  return (
    <AnimatePresence mode="popLayout">
      {React.cloneElement(element, {
        key: location.pathname,
      })}
    </AnimatePresence>
  );
}
