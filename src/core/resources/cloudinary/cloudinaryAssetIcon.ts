import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { ChainId } from '~/core/types/chains';
import { chainNameFromChainId, isL2Chain } from '~/core/utils/chains';

// ///////////////////////////////////////////////
// Query Types

export type CloudinaryAssetIconArgs = {
  url: string;
};

// ///////////////////////////////////////////////
// Query Key

const cloudinaryAssetIconQueryKey = ({ url }: CloudinaryAssetIconArgs) =>
  createQueryKey('cloudinaryAssetIcon', { url }, { persisterVersion: 1 });

type CloudinaryAssetIconQueryKey = ReturnType<
  typeof cloudinaryAssetIconQueryKey
>;

// ///////////////////////////////////////////////
// Query Function

async function cloudinaryAssetIconQueryFunction({
  queryKey: [{ url }],
}: QueryFunctionArgs<typeof cloudinaryAssetIconQueryKey>) {
  if (url === '') return null;
  const res = await fetch(url);
  if (res.status < 400) {
    return URL.createObjectURL(await res.blob());
  }
  return null;
}

type CloudinaryAssetIconResult = QueryFunctionResult<
  typeof cloudinaryAssetIconQueryFunction
>;

// ///////////////////////////////////////////////
// Query Hook

function getCloudinaryUrl({
  address,
  chainId,
  mainnetAddress,
}: {
  address?: Address;
  chainId: ChainId;
  mainnetAddress?: Address;
}) {
  const chainName = chainNameFromChainId(chainId);
  if (!address && !mainnetAddress) return '';
  return `https://rainbowme-res.cloudinary.com/image/upload/assets/${
    !mainnetAddress && isL2Chain(chainName) ? chainName : 'ethereum'
  }/${mainnetAddress ?? address}.png`;
}

export function useCloudinaryAssetIcon(
  {
    address,
    chainId,
    mainnetAddress,
  }: {
    address: Address;
    chainId: ChainId;
    mainnetAddress?: Address;
  },
  config: QueryConfig<
    CloudinaryAssetIconResult,
    Error,
    CloudinaryAssetIconResult,
    CloudinaryAssetIconQueryKey
  > = {},
) {
  const url = getCloudinaryUrl({ address, chainId, mainnetAddress });
  return useQuery(
    cloudinaryAssetIconQueryKey({ url }),
    cloudinaryAssetIconQueryFunction,
    {
      ...config,
    },
  );
}
