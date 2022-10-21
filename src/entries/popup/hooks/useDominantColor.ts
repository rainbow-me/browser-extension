import { useQuery } from '@tanstack/react-query';
import makeColorMoreChill from 'make-color-more-chill';
import Vibrant from 'node-vibrant';

export function useDominantColor({ imageUrl }: { imageUrl?: string }) {
  return useQuery(
    ['color', imageUrl],
    async () => {
      if (!imageUrl) return null;
      const color = (await Vibrant.from(imageUrl).getPalette()).Vibrant?.hex;
      if (!color) return null;
      return makeColorMoreChill(color);
    },
    { enabled: !!imageUrl },
  );
}
