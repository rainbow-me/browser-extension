import gql from 'graphql-tag';

import { getSdk as getMetadataSdk } from './__generated__/metadata';
import { getFetchRequester } from './utils/getFetchRequester';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { config } = require('./config.js');

export const metadataRequester = getFetchRequester(config.metadata.schema);
export const metadataClient = getMetadataSdk(metadataRequester);
export const requestMetadata = (q: string) =>
  metadataRequester(
    gql`
      ${q}
    `,
  );
