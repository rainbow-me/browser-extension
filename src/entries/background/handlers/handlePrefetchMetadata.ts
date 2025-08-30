import { initializeMessenger } from '~/core/messengers';
import { prefetchDappMetadata } from '~/core/resources/metadata/dapp';

const bridgeMessenger = initializeMessenger({ connect: 'inpage' });

// This handler needs to stay, as it's triggered from the shared @rainbow/provider package
export const handlePrefetchDappMetadata = () => {
  bridgeMessenger.reply(
    'rainbow_prefetchDappMetadata',
    async (href: string) => {
      prefetchDappMetadata({ url: href });
    },
  );
};
