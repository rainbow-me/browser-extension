import gql from 'graphql-tag';

import { RainbowFetchRequestOpts } from '../network/internal/rainbowFetch';

import { getSdk as getEnsSdk } from './__generated__/ens';
import { getSdk as getMetadataSdk } from './__generated__/metadata';
import { getSdk as getMetadataStagingSdk } from './__generated__/metadataStaging';
import { getFetchRequester } from './utils/getFetchRequester';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { config } = require('./config.js');

export const ensRequester = getFetchRequester(config.ens.schema);
export const ensClient = getEnsSdk(ensRequester);

export const metadataRequester = getFetchRequester(config.metadata.schema);
export const metadataClient = getMetadataSdk(metadataRequester);

export const metadataStagingRequester = getFetchRequester(
  config.metadataStaging.schema,
);
export const metadataStagingClient = getMetadataStagingSdk(
  metadataStagingRequester,
);

export const requestMetadata = (
  q: string,
  options?: Pick<RainbowFetchRequestOpts, 'timeout' | 'headers'>,
) =>
  metadataRequester(
    gql`
      ${q}
    `,
    options || {},
  );

// POST requests bypass CDN caching
export const metadataPostRequester = getFetchRequester({
  ...config.metadata.schema,
  method: 'POST',
});
export const metadataPostClient = getMetadataSdk(metadataPostRequester);
