import { initializeMessenger } from '~/core/messengers';
import { prefetchDappMetadata } from '~/core/resources/metadata/dapp';

const bridgeMessenger = initializeMessenger({ connect: 'inpage' });

export const handlePrefetchDappMetadata = () => {
  bridgeMessenger.reply(
    'rainbow_prefetchDappMetadata',
    async (href: string) => {
      prefetchDappMetadata({ url: href });
    },
  );
};
