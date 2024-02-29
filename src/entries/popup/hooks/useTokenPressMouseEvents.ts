import { MouseEvent, useCallback, useState } from 'react';

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
  const { uniqueIds, addPinnedAsset, removedPinnedAsset } =
    usePinnedAssetStore();

  const onPressed = useCallback(() => {
    const pinned = uniqueIds.some((id) => id === token.uniqueId);

    if (pinned) {
      removedPinnedAsset({ uniqueId: token.uniqueId });
      return;
    }

    addPinnedAsset({ uniqueId: token.uniqueId });
  }, [addPinnedAsset, removedPinnedAsset, token.uniqueId, uniqueIds]);

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

  return { onMouseDown, onMouseUp };
};
