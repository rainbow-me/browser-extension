import { borderRadius } from '../components/Box/Box.examples';
import { createDocs } from '../docs/createDocs';

const radii = createDocs({
  name: 'Radii',
  category: 'Tokens',
  description: borderRadius.description,
  examples: [
    {
      Example: borderRadius.Example,
    },
  ],
});

export default radii;
