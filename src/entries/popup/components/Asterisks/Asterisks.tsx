import React from 'react';

import { Inline } from '~/design-system';
import { Symbol, SymbolProps } from '~/design-system/components/Symbol/Symbol';

const Asterisks = ({
  color,
  size,
}: {
  color: SymbolProps['color'];
  size: SymbolProps['size'];
}) => (
  <Inline>
    {Array(4)
      .fill(0)
      .map((_, i) => (
        <Symbol
          symbol={'asterisk'}
          weight={'bold'}
          size={size}
          color={color}
          key={i}
        />
      ))}
  </Inline>
);
export { Asterisks };
