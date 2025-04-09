import { useCallback, useRef } from 'react';

import { i18n } from '~/core/languages';
import { reportNftAsSpam } from '~/core/network/nfts';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useNftsStore } from '~/core/state/nfts';
import { useSelectedNftStore } from '~/core/state/selectedNft';
import { UniqueAsset } from '~/core/types/nfts';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';

import { triggerToast } from '../components/Toast/Toast';
import { ROUTES } from '../urls';
import { simulateClick } from '../utils/simulateClick';

import useKeyboardAnalytics from './useKeyboardAnalytics';
import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useRainbowNavigate } from './useRainbowNavigate';
import { useWallets } from './useWallets';

export function useNftShortcuts(nft?: UniqueAsset | null) {
  const { currentAddress: address } = useCurrentAddressStore();
  const containerRef = useContainerRef();
  const { selectedNft, setSelectedNft } = useSelectedNftStore();
  const { isWatchingWallet } = useWallets();
  const { trackShortcut } = useKeyboardAnalytics();
  const { hidden } = useNftsStore();
  const toggleHideNFT = useNftsStore((state) => state.toggleHideNFT);
  const navigate = useRainbowNavigate();
  const nftToFocus = nft ?? selectedNft;
  const getNftIsSelected = useCallback(() => !!nftToFocus, [nftToFocus]);
  const downloadLink = useRef<HTMLAnchorElement>(null);
  const nftUniqueId = nftToFocus?.uniqueId || '';

  const hiddenNftsForAddress = hidden[address] || {};
  const displayed = !hiddenNftsForAddress[nftToFocus?.uniqueId || ''];

  const handleCopyId = useCallback(() => {
    if (nftToFocus) {
      simulateClick(containerRef.current);
      navigator.clipboard.writeText(nftToFocus.id);
      triggerToast({
        title: i18n.t('nfts.details.copy_token_id'),
        description: nftToFocus.id,
      });
    }
  }, [containerRef, nftToFocus]);

  const handleDownload = useCallback(() => {
    simulateClick(containerRef.current);
    downloadLink.current?.click();
    const link = document.createElement('a');
    link.setAttribute('download', '');
    link.href = nftToFocus?.image_url || '';
    link.click();
    link.remove();
  }, [containerRef, nftToFocus?.image_url]);

  const handleHideNft = useCallback(() => {
    if (!isWatchingWallet) {
      simulateClick(containerRef.current);
      toggleHideNFT(address, nftUniqueId);
      if (displayed) {
        triggerToast({
          title: i18n.t('nfts.toast.hidden'),
        });
      } else {
        triggerToast({
          title: i18n.t('nfts.toast.unhidden'),
        });
      }
    }
  }, [
    displayed,
    isWatchingWallet,
    containerRef,
    address,
    nftUniqueId,
    toggleHideNFT,
  ]);

  const handleSendNft = useCallback(() => {
    if (nftToFocus && !isWatchingWallet) {
      simulateClick(containerRef.current);
      setSelectedNft(nftToFocus);
      navigate(ROUTES.SEND, { replace: true });
    }
  }, [nftToFocus, isWatchingWallet, containerRef, setSelectedNft, navigate]);

  const handleReportNft = useCallback(() => {
    reportNftAsSpam(nftToFocus!);
    if (displayed) {
      toggleHideNFT(address, nftUniqueId);
    }
    triggerToast({ title: i18n.t('nfts.toast.spam_reported') });
  }, [displayed, nftToFocus, address, nftUniqueId, toggleHideNFT]);

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
      if (e.key === shortcuts.nfts.REPORT_NFT.key) {
        if (nftToFocus && !isWatchingWallet) {
          simulateClick(containerRef.current);
          triggerAlert({
            action: handleReportNft,
            actionText: i18n.t('nfts.report_nft_action_text'),
            text: i18n.t('nfts.report_nft_confirm_description'),
            dismissText: i18n.t('alert.cancel'),
          });
        }
        trackShortcut({
          key: shortcuts.nfts.REPORT_NFT.display,
          type: 'nfts.report',
        });
      }
    },
    [
      nftToFocus,
      isWatchingWallet,
      containerRef,
      handleDownload,
      trackShortcut,
      handleCopyId,
      handleHideNft,
      handleSendNft,
      handleReportNft,
    ],
  );
  useKeyboardShortcut({
    condition: getNftIsSelected,
    handler: handleNftShortcuts,
  });
}
