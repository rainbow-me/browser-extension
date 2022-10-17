import * as React from 'react';
import { createHashRouter } from 'react-router-dom';

import { Index } from './pages';

export const routes = createHashRouter([{ path: '/', element: <Index /> }]);
