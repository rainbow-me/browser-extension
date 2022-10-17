import * as React from 'react';
import { createMemoryRouter } from 'react-router-dom';

import { Index } from './pages';

export const routes = createMemoryRouter([{ path: '/', element: <Index /> }]);
