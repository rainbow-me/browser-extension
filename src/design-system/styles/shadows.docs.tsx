import { shadows as boxShadows } from '../components/Box/Box.examples';
import { createDocs } from '../docs/createDocs';

const shadows = createDocs({
  name: 'Shadows',
  category: 'Tokens',
  description: boxShadows.description,
  examples: [...(boxShadows.examples || [])],
});

export default shadows;
