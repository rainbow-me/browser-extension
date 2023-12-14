import { Address } from '@wagmi/core';
import qs from 'qs';

import { f2cHttp } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';

import { FiatProviderName } from './types';

// ///////////////////////////////////////////////
// Query Types

export type ProviderWidgetUrlArgs = {
  provider: FiatProviderName;
  depositAddress: Address;
  defaultExperience?: 'buy' | 'send';
  redirectUri?: string;
};

// ///////////////////////////////////////////////
// Query Key

const providerWidgetUrlQueryKey = ({
  provider,
  depositAddress,
  redirectUri,
  defaultExperience,
}: ProviderWidgetUrlArgs) =>
  createQueryKey(
    'providerWidgetUrl',
    { provider, depositAddress, defaultExperience, redirectUri },
    { persisterVersion: 1 },
  );

type ProviderWidgetUrlQueryKey = ReturnType<typeof providerWidgetUrlQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export async function providerWidgetUrlQueryFunction({
  queryKey: [{ provider, depositAddress, defaultExperience, redirectUri }],
}: QueryFunctionArgs<typeof providerWidgetUrlQueryKey>) {
  const query = qs.stringify({
    destinationAddress: depositAddress,
    defaultExperience,
    redirectUri,
  });
  return f2cHttp.get<{ url: string }>(
    `/v1/providers/${provider}/create-widget-url?${query}`,
  );
}

type ProviderWidgetUrlResult = QueryFunctionResult<
  typeof providerWidgetUrlQueryFunction
>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchProviderWidgetUrl(
  {
    provider,
    depositAddress,
    defaultExperience,
    redirectUri,
  }: ProviderWidgetUrlArgs,
  config: QueryConfig<
    ProviderWidgetUrlResult,
    Error,
    ProviderWidgetUrlResult,
    ProviderWidgetUrlQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    providerWidgetUrlQueryKey({
      provider,
      depositAddress,
      defaultExperience,
      redirectUri,
    }),
    providerWidgetUrlQueryFunction,
    config,
  );
}
