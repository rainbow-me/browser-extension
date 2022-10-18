import * as React from 'react';
import { test } from 'vitest';
import { render } from '@testing-library/react';
import { App } from './App';

test('renders the app', () => {
  render(<App />);
});
