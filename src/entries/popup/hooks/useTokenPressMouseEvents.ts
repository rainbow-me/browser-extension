import { MouseEvent, useCallback, useState } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { usePinnedAssetStore } from '~/core/state/pinnedAssets';
import { ParsedUserAsset } from '~/core/types/assets';

import { usePress } from './usePress';

interface TokenPressMouseEventHookArgs {
  token: ParsedUserAsset;
  onClick: () => void;
}

export const useTokenPressMouseEvents = ({
  token,
  onClick,
}: TokenPressMouseEventHookArgs) => {
  const [ready, setReady] = useState(false);
  const { togglePinAsset } = usePinnedAssetStore();
  const { currentAddress: address } = useCurrentAddressStore();

  const onPressed = useCallback(() => {
    togglePinAsset(address, token.uniqueId);
  }, [token.uniqueId, address, togglePinAsset]);

  const { pressed, startPress, endPress } = usePress(onPressed);

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) {
      if (!ready) setReady(true);
      startPress();
    }
  };

  const onMouseUp = () => {
    if (ready) {
      setReady(false);
      if (!pressed) {
        endPress();
        onClick();
      }
    }
  };

  const onMouseLeave = () => {
    if (ready) {
      setReady(false);
      if (!pressed) {
        endPress();
      }
    }
  };

  return { onMouseDown, onMouseUp, onMouseLeave };
};
