import { createDocs } from '../../docs/createDocs';

import { basic, colors, weights } from './Separator.examples';

const separator = createDocs({
  name: 'Separator',
  category: 'Components',
  examples: [basic, colors, weights],
});

export default separator;
