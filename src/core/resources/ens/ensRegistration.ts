import { useQuery } from '@tanstack/react-query';
import uts46 from 'idna-uts46-hx';
import { keccak256, stringToBytes } from 'viem';

import { ensClient } from '~/core/graphql';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';

const ENS_DOMAIN = '.eth';

function normalizeENS(name: string) {
  try {
    return uts46.toUnicode(name, { useStd3ASCII: true });
  } catch (err) {
    return name;
  }
}

function decodeLabelhash(hash: string) {
  if (!(hash.startsWith('[') && hash.endsWith(']'))) {
    throw Error(
      'Expected encoded labelhash to start and end with square brackets',
    );
  }

  if (hash.length !== 66) {
    throw Error('Expected encoded labelhash to have a length of 66');
  }

  return `${hash.slice(1, -1)}`;
}

function isEncodedLabelhash(hash: string) {
  return hash.startsWith('[') && hash.endsWith(']') && hash.length === 66;
}

function labelhash(unnormalisedLabelOrLabelhash: string) {
  if (unnormalisedLabelOrLabelhash === '[root]') {
    return '';
  }
  return isEncodedLabelhash(unnormalisedLabelOrLabelhash)
    ? '0x' + decodeLabelhash(unnormalisedLabelOrLabelhash)
    : keccak256(stringToBytes(normalizeENS(unnormalisedLabelOrLabelhash)));
}

const fetchRegistration = async (ensName: string) => {
  const response = await ensClient.getRegistration({
    id: labelhash(ensName.replace(ENS_DOMAIN, '')),
  });
  const data = response.registration;

  return {
    registration: {
      expiryDate: data?.expiryDate as string | undefined,
      registrationDate: data?.registrationDate as string | undefined,
    },
  };
};

// ///////////////////////////////////////////////
// Query Types

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type EnsRegistrationArgs = {
  name: string;
};

// ///////////////////////////////////////////////
// Query Key

const ensRegistrationQueryKey = ({ name }: EnsRegistrationArgs) =>
  createQueryKey('ensRegistration', { name }, { persisterVersion: 1 });

type EnsRegistrationQueryKey = ReturnType<typeof ensRegistrationQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function ensRegistrationQueryFunction({
  queryKey: [{ name }],
}: QueryFunctionArgs<typeof ensRegistrationQueryKey>) {
  const registration = fetchRegistration(name);
  return registration;
}

type EnsRegistrationResult = QueryFunctionResult<
  typeof ensRegistrationQueryFunction
>;

// ///////////////////////////////////////////////
// Query Hook

export function useEnsRegistration(
  { name }: EnsRegistrationArgs,
  config: QueryConfig<
    EnsRegistrationResult,
    Error,
    EnsRegistrationResult,
    EnsRegistrationQueryKey
  > = {},
) {
  return useQuery({
    queryKey: ensRegistrationQueryKey({ name }),
    queryFn: ensRegistrationQueryFunction,
    ...config,
  });
}
