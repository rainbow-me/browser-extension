import { createDocs } from '../../docs/createDocs';

import { basic, colors, sizes, weights } from './Symbol.examples';

const symbol = createDocs({
  name: 'Symbol',
  category: 'Components',
  examples: [basic, sizes, weights, colors],
});

export default symbol;
