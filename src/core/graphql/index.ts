import { getSdk as getEnsSdk } from './__generated__/ens';
import { getSdk as getMetadataSdk } from './__generated__/metadata';
import { getFetchRequester } from './utils/getFetchRequester';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { config } = require('./config.js');

export const ensRequester = getFetchRequester(config.ens.schema);
export const ensClient = getEnsSdk(ensRequester);

const metadataRequester = getFetchRequester(config.metadata.schema);
export const metadataClient = getMetadataSdk(metadataRequester);

// POST requests bypass CDN caching
const metadataPostRequester = getFetchRequester({
  ...config.metadata.schema,
  method: 'POST',
});
export const metadataPostClient = getMetadataSdk(metadataPostRequester);
