import React from 'react';
import { Source } from './utils/source.macro';

export type Docs = {
  name?: string;
  category: 'Contexts' | 'Layout' | 'Tokens';
  description?: JSX.Element | JSX.Element[];
  examples?: Example[];
};

export type Example = {
  enablePlayroom?: boolean;
  enableCodeSnippet?: boolean;
  description?: JSX.Element | JSX.Element[];
  Example?: () => Source<React.ReactElement>;
  examples?: Example[];
  name?: string;
  showFrame?: boolean;
  showThemes?: boolean | 'toggle';
  subTitle?: string;
  wrapper?: (children: React.ReactNode) => React.ReactNode;
};
