import * as React from 'react';
import { Route, Routes as RRRoutes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { Index } from './pages';
import { Settings } from './pages/settings';

export function Routes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <RRRoutes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="settings" element={<Settings />} />
      </RRRoutes>
    </AnimatePresence>
  );
}
