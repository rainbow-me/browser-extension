import { createDocs } from '../../docs/createDocs';

import { basic, colors, sizes } from './ButtonSymbol.examples';

const buttonSymbol = createDocs({
  name: 'ButtonSymbol',
  category: 'Components',
  examples: [basic, colors, sizes],
});

export default buttonSymbol;
