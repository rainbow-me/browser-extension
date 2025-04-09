import { useQuery } from '@tanstack/react-query';
import makeColorMoreChill from 'make-color-more-chill';
import Vibrant from 'node-vibrant/lib/bundle';

import { useColorCacheStore } from '~/core/state';

export const fetchDominantColor = async ({
  imageUrl,
}: {
  imageUrl?: string | null;
}) => {
  const { colorCache, setColorCache } = useColorCacheStore.getState();
  if (!imageUrl) return null;
  if (colorCache[imageUrl]) {
    return colorCache[imageUrl];
  }
  const color = (await Vibrant.from(imageUrl).getPalette()).Vibrant?.hex;
  const chillColor = color ? makeColorMoreChill(color) : null;
  setColorCache(imageUrl, chillColor);

  return chillColor;
};
export function useDominantColor({ imageUrl }: { imageUrl?: string }) {
  const colorCache = useColorCacheStore((state) => state.colorCache);
  return useQuery({
    queryKey: ['color', imageUrl],
    queryFn: async () => fetchDominantColor({ imageUrl }),
    enabled: !!imageUrl,
    initialData: () => {
      return imageUrl ? colorCache[imageUrl] : undefined;
    },
  });
}
