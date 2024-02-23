import { useCallback, useRef } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useNftsStore } from '~/core/state/nfts';
import { useSelectedNftStore } from '~/core/state/selectedNft';
import { UniqueAsset } from '~/core/types/nfts';

import { triggerToast } from '../components/Toast/Toast';
import { ROUTES } from '../urls';

import useKeyboardAnalytics from './useKeyboardAnalytics';
import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useRainbowNavigate } from './useRainbowNavigate';

export function useNftShortcuts(nft?: UniqueAsset | null) {
  const { currentAddress: address } = useCurrentAddressStore();
  const { selectedNft, setSelectedNft } = useSelectedNftStore();
  const { trackShortcut } = useKeyboardAnalytics();
  const { toggleHideNFT } = useNftsStore();
  const navigate = useRainbowNavigate();
  const nftToFocus = nft ?? selectedNft;
  const getNftIsSelected = useCallback(() => !!nftToFocus, [nftToFocus]);
  const downloadLink = useRef<HTMLAnchorElement>(null);

  const handleCopyId = useCallback(() => {
    if (nftToFocus) {
      navigator.clipboard.writeText(nftToFocus.id);
      triggerToast({
        title: i18n.t('nfts.details.copy_token_id'),
        description: nftToFocus.id,
      });
    }
  }, [nftToFocus]);

  const handleDownload = useCallback(() => {
    downloadLink.current?.click();
    const link = document.createElement('a');
    link.setAttribute('download', '');
    link.href = nftToFocus?.image_url || '';
    link.click();
    link.remove();
  }, [nftToFocus?.image_url]);

  const handleHideNft = useCallback(() => {
    toggleHideNFT(address, nftToFocus?.uniqueId || '');
  }, [address, nftToFocus?.uniqueId, toggleHideNFT]);

  const handleSendNft = useCallback(() => {
    if (nft) {
      setSelectedNft(nft);
      navigate(ROUTES.SEND, { replace: true });
    }
  }, [navigate, nft, setSelectedNft]);

  const handleNftShortcuts = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === shortcuts.nfts.DOWNLOAD_NFT.key) {
        handleDownload();
        trackShortcut({
          key: shortcuts.nfts.DOWNLOAD_NFT.display,
          type: 'nfts.download',
        });
      }
      if (e.key === shortcuts.nfts.COPY_NFT_ID.key) {
        handleCopyId();
        trackShortcut({
          key: shortcuts.nfts.COPY_NFT_ID.display,
          type: 'nfts.copyId',
        });
      }
      if (e.key === shortcuts.nfts.HIDE_NFT.key) {
        handleHideNft();
        trackShortcut({
          key: shortcuts.nfts.HIDE_NFT.display,
          type: 'nfts.hide',
        });
      }
      if (e.key === shortcuts.nfts.SEND_NFT.key) {
        handleSendNft();
        trackShortcut({
          key: shortcuts.nfts.SEND_NFT.display,
          type: 'nfts.send',
        });
      }
    },
    [handleCopyId, handleDownload, handleHideNft, handleSendNft, trackShortcut],
  );
  useKeyboardShortcut({
    condition: getNftIsSelected(),
    handler: handleNftShortcuts,
  });
}
