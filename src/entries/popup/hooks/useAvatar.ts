import { useENSAvatar } from '~/core/resources/metadata/ensAvatar';

import { emojiAvatarForAddress } from '../utils/emojiAvatarForAddress';

import { useDominantColor } from './useDominantColor';

export function useAvatar({ address }: { address?: string }) {
  const { data: ensAvatar, isFetched: avatarIsFetched } = useENSAvatar({
    addressOrName: address,
  });

  const { data: dominantColor, isError: dominantColorIsError } =
    useDominantColor({
      imageUrl: ensAvatar ?? undefined,
    });

  const { color: emojiColor, emoji } = emojiAvatarForAddress(address);

  const avatarAvailable = ensAvatar && !dominantColorIsError;
  const avatar = avatarIsFetched
    ? {
        color: avatarAvailable ? dominantColor || undefined : emojiColor,
        imageUrl: avatarAvailable ? ensAvatar : undefined,
        emoji,
      }
    : undefined;

  return {
    avatar,
    isFetched: avatarIsFetched,
  };
}
