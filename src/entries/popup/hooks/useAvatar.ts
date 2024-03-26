import { useQuery } from '@tanstack/react-query';

import { resolveEnsAvatar } from '~/core/resources/metadata/ensAvatar';
import {
  WalletAvatar,
  useWalletAvatarStore,
  walletAvatarStore,
} from '~/core/state/walletAvatar';

import { emojiAvatarForAddress } from '../utils/emojiAvatarForAddress';

import { fetchDominantColor } from './useDominantColor';

const fetchWalletAvatar = async ({
  addressOrName,
  avatarUrl,
}: {
  addressOrName: string;
  avatarUrl?: string | null;
}): Promise<WalletAvatar> => {
  const { setWalletAvatar } = walletAvatarStore.getState();
  console.log('===fetchWalletAvatar');
  const ensAvatar =
    avatarUrl === null
      ? null
      : avatarUrl || (await resolveEnsAvatar({ addressOrName }));
  let correctEnsAvatar = true;
  let dominantColor = null;
  try {
    dominantColor = await fetchDominantColor({ imageUrl: ensAvatar });
  } catch (e) {
    correctEnsAvatar = false;
  }
  const { color: emojiColor, emoji } = emojiAvatarForAddress(addressOrName);
  const avatar = {
    color: correctEnsAvatar ? dominantColor || emojiColor : emojiColor,
    imageUrl: correctEnsAvatar ? ensAvatar || undefined : undefined,
    emoji,
  };
  setWalletAvatar({ addressOrName, walletAvatar: avatar });
  return avatar;
};

export function useAvatar({
  addressOrName,
  avatarUrl,
}: {
  addressOrName?: string;
  avatarUrl?: string | null;
}) {
  const { walletAvatar } = useWalletAvatarStore();

  return useQuery(
    ['walletAvatar', addressOrName],
    async () =>
      addressOrName
        ? fetchWalletAvatar({ addressOrName, avatarUrl })
        : undefined,
    {
      enabled: !!addressOrName,
      staleTime: 1 * 60 * 1_000, // 1 min
      initialData: () => {
        return addressOrName && walletAvatar
          ? walletAvatar[addressOrName]
          : undefined;
      },
    },
  );
}
