import React, { ReactNode } from 'react';

export const hasChildren = (children: ReactNode) => {
  return React.Children.toArray(children).some(
    (child) =>
      !!child &&
      typeof child === 'object' &&
      `type` in child &&
      child.type !== null,
  );
};
