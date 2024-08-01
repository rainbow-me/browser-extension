import { DocumentNode } from 'graphql';
import { resolveRequestDocument } from 'graphql-request';
import {
  RainbowFetchRequestOpts,
  rainbowFetch,
} from '~/core/network/internal/rainbowFetch';

import { buildGetQueryParams } from './buildGetQueryParams';

const allowedOperations = ['mutation', 'query'];

type Options = Pick<RainbowFetchRequestOpts, 'timeout' | 'headers'>;

type Config = {
  url: string;
  method?: string;
};

export function getFetchRequester(config: Config) {
  const { url, method = 'POST' } = config;

  return async function requester<
    TResponse = unknown,
    TVariables = Record<string, unknown>,
  >(
    node: DocumentNode,
    variables?: TVariables,
    options?: Options,
  ): Promise<TResponse> {
    const definitions = node.definitions.filter(
      (definition) =>
        definition.kind === 'OperationDefinition' &&
        allowedOperations.includes(definition.operation),
    );

    if (definitions.length !== 1) {
      throw new Error('Node must contain a single query or mutation');
    }

    const { query, operationName } = resolveRequestDocument(node);
    let requestUrl: string = url;
    const requestOptions: RainbowFetchRequestOpts = {
      ...options,
      method,
    };
    if (method === 'GET') {
      const queryStringExtension = buildGetQueryParams({
        query,
        operationName,
        variables,
      });
      requestUrl = `${url}?${queryStringExtension}`;
    } else {
      requestOptions.body = JSON.stringify({
        query,
        variables,
        operationName,
      });
    }

    // the graph ens subgraph rejects requests with an Authorization header
    if (config.url.includes('rainbow.me')) {
      requestOptions.headers = {
        Authorization: `Bearer ${process.env.RAINBOW_METADATA_API_TOKEN}`,
      };
    }

    const { data } = await rainbowFetch<{ data: TResponse }>(
      requestUrl,
      requestOptions,
    );

    return data.data;
  };
}
