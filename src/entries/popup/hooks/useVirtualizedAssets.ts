import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

import { ParsedAddressAsset, ParsedAsset } from '~/core/types/assets';
import { SearchAsset } from '~/core/types/search';

export const useVirtualizedAssets = ({
  assets,
  size,
}: {
  assets?: ParsedAsset[] | ParsedAddressAsset[] | SearchAsset[];
  size?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const assetsRowVirtualizer = useVirtualizer({
    count: assets?.length || 0,
    getScrollElement: () => containerRef.current,
    estimateSize: () => size || 52,
    overscan: 20,
  });
  return {
    containerRef,
    assetsRowVirtualizer,
  };
};
