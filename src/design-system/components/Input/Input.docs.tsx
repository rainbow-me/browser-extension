import React from 'react';

import { createDocs } from '../../docs/createDocs';

import { basic, heights } from './Input.examples';

const input = createDocs({
  name: 'Input',
  category: 'Components',
  examples: [basic, heights],
});

export default input;
