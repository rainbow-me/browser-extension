import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

import {
  ParsedAsset,
  ParsedSearchAsset,
  ParsedUserAsset,
} from '~/core/types/assets';
import { SearchAsset } from '~/core/types/search';

export const useVirtualizedAssets = ({
  assets,
  size,
}: {
  assets?:
    | ParsedAsset[]
    | ParsedUserAsset[]
    | ParsedSearchAsset[]
    | SearchAsset[];
  size?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const assetsRowVirtualizer = useVirtualizer({
    count: assets?.length || 0,
    getScrollElement: () => containerRef.current,
    estimateSize: () => (size ? size : 52),
    overscan: 20,
  });
  return {
    containerRef,
    assetsRowVirtualizer,
  };
};
