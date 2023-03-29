import { getSdk as getMetadataSdk } from './__generated__/metadata';
import { getFetchRequester } from './utils/getFetchRequester';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { config } = require('./config.js');

export const metadataClient = getMetadataSdk(
  getFetchRequester(config.metadata.schema),
);
