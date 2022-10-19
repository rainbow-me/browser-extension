import React from 'react';

import { Docs as DocsType } from '../../docs/types';
import { Text } from '../Text/Text';
import { Box } from './Box';

const docs: DocsType = {
  meta: { name: 'Box', category: 'Content' },
  description: (
    <>
      <Text size="17pt" weight="semibold">
        Renders an individual `div` element with quick access to the standard
        padding and negative margin scales, as well as other common layout
        properties. Ideally you&apos;re not supposed to need this component much
        unless you&apos;re building a design system component.
      </Text>
    </>
  ),
  examples: [
    {
      name: 'basic',
      Example: () => <Box />,
    },
  ],
};

export default docs;
