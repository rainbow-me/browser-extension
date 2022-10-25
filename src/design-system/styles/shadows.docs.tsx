import { shadows as boxShadows } from '../components/Box/Box.examples';
import { Docs } from '../docs/types';

const shadows: Docs = {
  name: 'Shadows',
  category: 'Tokens',
  description: boxShadows.description,
  examples: [...(boxShadows.examples || [])],
};

// eslint-disable-next-line import/no-default-export
export default shadows;
