import { createDocs } from '../../docs/createDocs';

import { basic, colors, weights } from './Separator.examples';

const separator = createDocs({
  name: 'Separator',
  category: 'Components',
  examples: [basic, colors, weights],
});

// eslint-disable-next-line import/no-default-export
export default separator;
