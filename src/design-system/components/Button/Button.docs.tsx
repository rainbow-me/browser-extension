import { createDocs } from '../../docs/createDocs';

import {
  basic,
  colors,
  emojis,
  sizes,
  symbols,
  widths,
} from './Button.examples';

const button = createDocs({
  name: 'Button',
  category: 'Components',
  examples: [basic, colors, sizes, widths, emojis, symbols],
});

export default button;
