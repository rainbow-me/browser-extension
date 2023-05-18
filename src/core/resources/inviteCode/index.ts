import { betaInviteCodesHttp } from '~/core/network/inviteCode';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';

// ///////////////////////////////////////////////
// Query Types

export type InviteCodeArgs = {
  code: string;
};

// ///////////////////////////////////////////////
// Query Key

const inviteCodeQueryKey = ({ code }: InviteCodeArgs) =>
  createQueryKey('inviteCode', { code }, { persisterVersion: 1 });

type InviteCodeQueryKey = ReturnType<typeof inviteCodeQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export async function inviteCodeQueryFunction({
  queryKey: [{ code }],
}: QueryFunctionArgs<typeof inviteCodeQueryKey>) {
  const { data } = await betaInviteCodesHttp.post(
    `/validate`,
    JSON.stringify({
      inviteCode: code,
    }),
  );
  return data as { valid: boolean };
}

type InviteCodeResult = QueryFunctionResult<typeof inviteCodeQueryFunction>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function postInviteCode(
  { code }: InviteCodeArgs,
  config: QueryConfig<
    InviteCodeResult,
    Error,
    InviteCodeResult,
    InviteCodeQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    inviteCodeQueryKey({ code }),
    inviteCodeQueryFunction,
    config,
  );
}
