import { emojiAvatarForAddress } from '../utils/emojiAvatarForAddress';

import { useDominantColor } from './useDominantColor';
import { useENSAvatar } from './useENSAvatar';

export function useAvatar({ address }: { address?: string }) {
  const { data: ensAvatar, isFetched } = useENSAvatar({
    addressOrName: address,
  });

  const { data: dominantColor } = useDominantColor({
    imageUrl: ensAvatar ?? undefined,
  });

  const { color: emojiColor, emoji } = emojiAvatarForAddress(address);

  const avatar = isFetched
    ? {
        color: ensAvatar ? dominantColor || undefined : emojiColor,
        imageUrl: ensAvatar || undefined,
        emoji,
      }
    : undefined;

  return {
    avatar,
    isFetched,
  };
}
