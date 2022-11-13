import { AnimatePresence } from 'framer-motion';
import * as React from 'react';
import { Routes as RRRoutes, Route, useLocation } from 'react-router-dom';

import { ConnectedApps } from './pages/ConnectedApps';
import { Home } from './pages/home';
import { Settings } from './pages/settings';
import { Wallets } from './pages/wallets';

export function Routes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <RRRoutes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="settings" element={<Settings />} />
        <Route path="wallets" element={<Wallets />} />
        <Route path="connected" element={<ConnectedApps />} />
      </RRRoutes>
    </AnimatePresence>
  );
}
