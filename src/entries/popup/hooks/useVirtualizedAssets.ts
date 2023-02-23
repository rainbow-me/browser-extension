import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

import { ParsedAddressAsset } from '~/core/types/assets';

export const useVirtualizedAssets = ({
  assets,
}: {
  assets: ParsedAddressAsset[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const assetsRowVirtualizer = useVirtualizer({
    count: assets?.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 52,
    overscan: 20,
  });
  return {
    containerRef,
    assetsRowVirtualizer,
  };
};
