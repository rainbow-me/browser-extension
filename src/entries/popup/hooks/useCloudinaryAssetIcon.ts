import { useCallback, useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { ChainId } from '~/core/types/chains';
import { chainNameFromChainId, isL2Chain } from '~/core/utils/chains';

const imagesCache: { [key: string]: string } = {};
export function useCloudinaryAssetIcon({
  address,
  chainId,
  mainnetAddress,
}: {
  address: Address;
  chainId: ChainId;
  mainnetAddress?: Address;
}) {
  const [image, setImage] = useState<string>();
  const url = getCloudinaryUrl({ address, chainId, mainnetAddress });
  const fetchImage = useCallback(async () => {
    if (!address?.length) return;
    if (imagesCache[url]) {
      setImage(imagesCache[url]);
    } else {
      try {
        // building URLs in this manner clutters the console with 401s when the URL doesn't exist in Cloudinary
        // not sure how to reduce noise
        const res = await fetch(url);
        if (res.status < 400) {
          const imgUrl = URL.createObjectURL(await res.blob());
          //  eslint-disable-next-line require-atomic-updates
          imagesCache[url] = imgUrl;
          setImage(imgUrl);
        }
      } catch (e) {
        // might make sense to throw when we encounter certain status codes
        // then set placeholder URLS in cache here to prevent rerequesting
        return;
      }
    }
  }, [address, url]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  return image;
}

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
