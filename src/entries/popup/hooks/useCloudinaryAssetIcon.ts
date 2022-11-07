import { useCallback, useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { ChainName } from '~/core/types/chains';
import { isL2Chain } from '~/core/utils/chains';

const imagesCache: { [key: string]: string } = {};
export function useCloudinaryAssetIcon({
  address,
  chain,
  mainnetAddress,
}: {
  address: Address;
  chain: ChainName;
  mainnetAddress?: Address;
}) {
  const [image, setImage] = useState<string>();
  const url = getCloudinaryUrl({ address, chain, mainnetAddress });
  const fetchImage = useCallback(async () => {
    if (!address?.length) return;
    if (imagesCache[url]) {
      setImage(imagesCache[url]);
    } else {
      const res = await fetch(url);
      if (res.status < 400) {
        const imgUrl = URL.createObjectURL(await res.blob());
        //  eslint-disable-next-line require-atomic-updates
        imagesCache[url] = imgUrl;
        setImage(imgUrl);
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
  chain,
  mainnetAddress,
}: {
  address?: Address;
  chain: ChainName;
  mainnetAddress?: Address;
}) {
  if (!address && !mainnetAddress) return '';
  return `https://rainbowme-res.cloudinary.com/image/upload/assets/${
    !mainnetAddress && isL2Chain(chain) ? chain : 'ethereum'
  }/${mainnetAddress ?? address}.png`;
}
